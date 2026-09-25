// src/lib/live-chat-repository.ts
import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  rowToChatMessage,
  rowToChatSession,
  visitorChannelName,
} from "@/lib/live-chat/types";
import type {
  ChatMessage,
  ChatMessageKind,
  ChatMessageRow,
  ChatSender,
  ChatSession,
  ChatSessionRow,
} from "@/lib/live-chat/types";
import type { StartChatInput } from "@/lib/live-chat/schema";

const SESSIONS = "chat_sessions";
const MESSAGES = "chat_messages";

export class ChatSessionNotFoundError extends Error {
  constructor(id: string) {
    super(`Chat session ${id} not found.`);
    this.name = "ChatSessionNotFoundError";
  }
}

export class ChatQueryNotAllowedError extends Error {
  constructor(id: string) {
    super(`Chat session ${id} can't take an offline query.`);
    this.name = "ChatQueryNotAllowedError";
  }
}

export class ChatSessionClosedError extends Error {
  constructor(id: string) {
    super(`Chat session ${id} is closed.`);
    this.name = "ChatSessionClosedError";
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

async function fetchSessionRow(id: string): Promise<ChatSessionRow | null> {
  if (!isUuid(id)) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase.from(SESSIONS).select("*").eq("id", id).maybeSingle();

  if (error) throw new Error(`Failed to fetch chat session ${id}: ${error.message}`);
  return data as ChatSessionRow | null;
}

async function requireOpenSession(id: string): Promise<ChatSessionRow> {
  const row = await fetchSessionRow(id);
  if (!row) throw new ChatSessionNotFoundError(id);
  if (row.status === "closed") throw new ChatSessionClosedError(id);
  return row;
}

async function updateSession(id: string, patch: Partial<ChatSessionRow>): Promise<ChatSession> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from(SESSIONS).update(patch).eq("id", id).select("*").single();

  if (error) throw new Error(`Failed to update chat session ${id}: ${error.message}`);
  return rowToChatSession(data as ChatSessionRow);
}

async function insertMessage(
  sessionId: string,
  sender: ChatSender,
  body: string,
  kind: ChatMessageKind = "message"
): Promise<ChatMessage> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(MESSAGES)
    .insert({ session_id: sessionId, sender, body, kind })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to save chat message: ${error.message}`);

  const message = rowToChatMessage(data as ChatMessageRow);

  const { error: touchError } = await supabase
    .from(SESSIONS)
    .update({ last_message_at: message.createdAt })
    .eq("id", sessionId);

  if (touchError) throw new Error(`Failed to update chat session ${sessionId}: ${touchError.message}`);

  return message;
}

/**
 * Pings the visitor's Realtime broadcast channel so their widget refetches
 * immediately. Best-effort: the widget also polls, so a failed ping only
 * delays delivery by a few seconds.
 */
export async function notifyVisitor(sessionId: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    const channel = supabase.channel(visitorChannelName(sessionId));
    await channel.httpSend("update", { at: Date.now() });
    await supabase.removeChannel(channel);
  } catch (error) {
    console.error("Failed to broadcast live chat update:", error);
  }
}

export const liveChatRepository = {
  async createSession(
    input: StartChatInput,
    ipAddress: string | null
  ): Promise<{ session: ChatSession; token: string }> {
    const token = randomBytes(32).toString("base64url");
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from(SESSIONS)
      .insert({
        visitor_token_hash: hashToken(token),
        name: input.name,
        email: input.email,
        phone: input.phone,
        ip_address: ipAddress,
      })
      .select("*")
      .single();

    if (error) throw new Error(`Failed to create chat session: ${error.message}`);

    return { session: rowToChatSession(data as ChatSessionRow), token };
  },

  /** Returns the session only if `token` is the one issued for it. */
  async getSessionForVisitor(id: string, token: string): Promise<ChatSession | null> {
    const row = await fetchSessionRow(id);
    if (!row || row.visitor_token_hash !== hashToken(token)) return null;
    return rowToChatSession(row);
  },

  async getSession(id: string): Promise<ChatSession | null> {
    const row = await fetchSessionRow(id);
    return row ? rowToChatSession(row) : null;
  },

  async listSessions(): Promise<ChatSession[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from(SESSIONS)
      .select("*")
      .order("last_message_at", { ascending: false })
      .limit(200);

    if (error) throw new Error(`Failed to list chat sessions: ${error.message}`);
    return (data as ChatSessionRow[]).map(rowToChatSession);
  },

  async listMessages(sessionId: string, afterId = 0): Promise<ChatMessage[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from(MESSAGES)
      .select("*")
      .eq("session_id", sessionId)
      .gt("id", afterId)
      .order("id", { ascending: true })
      .limit(500);

    if (error) throw new Error(`Failed to list chat messages: ${error.message}`);
    return (data as ChatMessageRow[]).map(rowToChatMessage);
  },

  async countRecentVisitorMessages(sessionId: string, windowSeconds: number): Promise<number> {
    const supabase = createAdminClient();
    const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
    const { count, error } = await supabase
      .from(MESSAGES)
      .select("id", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .eq("sender", "visitor")
      .gte("created_at", since);

    if (error) throw new Error(`Failed to count chat messages: ${error.message}`);
    return count ?? 0;
  },

  async addMessage(sessionId: string, sender: ChatSender, body: string): Promise<ChatMessage> {
    await requireOpenSession(sessionId);
    return insertMessage(sessionId, sender, body);
  },

  /** Saves the query a visitor leaves when no agent has picked up their chat. */
  async submitQuery(sessionId: string, body: string): Promise<{ session: ChatSession; message: ChatMessage }> {
    const row = await requireOpenSession(sessionId);
    if (row.status !== "waiting" || row.query_submitted_at) throw new ChatQueryNotAllowedError(sessionId);

    const message = await insertMessage(sessionId, "visitor", body, "query");
    const session = await updateSession(sessionId, { query_submitted_at: message.createdAt });
    return { session, message };
  },

  async accept(sessionId: string, agentId: string, agentName: string): Promise<ChatSession> {
    const row = await requireOpenSession(sessionId);

    const session = await updateSession(sessionId, {
      status: "active",
      agent_id: agentId,
      agent_name: agentName,
      accepted_at: row.accepted_at ?? new Date().toISOString(),
    });

    await insertMessage(sessionId, "system", `${agentName} joined the chat.`);
    return session;
  },

  async close(sessionId: string, closedBy: "visitor" | "agent"): Promise<ChatSession> {
    await requireOpenSession(sessionId);

    await insertMessage(
      sessionId,
      "system",
      closedBy === "visitor" ? "The visitor ended the chat." : "The agent ended the chat."
    );

    return updateSession(sessionId, { status: "closed", closed_at: new Date().toISOString() });
  },
};
