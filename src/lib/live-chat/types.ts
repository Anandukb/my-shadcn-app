export type ChatStatus = "waiting" | "active" | "closed";
export type ChatSender = "visitor" | "agent" | "system";
export type ChatMessageKind = "message" | "query";

export interface ChatSessionRow {
  id: string;
  visitor_token_hash: string;
  name: string;
  email: string;
  phone: string;
  status: ChatStatus;
  agent_id: string | null;
  agent_name: string | null;
  ip_address: string | null;
  created_at: string;
  accepted_at: string | null;
  closed_at: string | null;
  last_message_at: string;
  query_submitted_at: string | null;
}

export interface ChatMessageRow {
  id: number;
  session_id: string;
  sender: ChatSender;
  kind: ChatMessageKind;
  body: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: ChatStatus;
  agentName: string | null;
  createdAt: string;
  acceptedAt: string | null;
  closedAt: string | null;
  lastMessageAt: string;
  querySubmittedAt: string | null;
}

export interface ChatMessage {
  id: number;
  sessionId: string;
  sender: ChatSender;
  kind: ChatMessageKind;
  body: string;
  createdAt: string;
}

/** What a visitor is allowed to see about their own session. */
export interface VisitorChatSession {
  id: string;
  name: string;
  status: ChatStatus;
  agentName: string | null;
  createdAt: string;
  querySubmittedAt: string | null;
}

export function rowToChatSession(row: ChatSessionRow): ChatSession {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    status: row.status,
    agentName: row.agent_name,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
    closedAt: row.closed_at,
    lastMessageAt: row.last_message_at,
    querySubmittedAt: row.query_submitted_at,
  };
}

export function toVisitorChatSession(session: ChatSession): VisitorChatSession {
  return {
    id: session.id,
    name: session.name,
    status: session.status,
    agentName: session.agentName,
    createdAt: session.createdAt,
    querySubmittedAt: session.querySubmittedAt,
  };
}

export function rowToChatMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    sessionId: row.session_id,
    sender: row.sender,
    kind: row.kind ?? "message",
    body: row.body,
    createdAt: row.created_at,
  };
}

/** Realtime broadcast channel a visitor listens on for their session. */
export function visitorChannelName(sessionId: string): string {
  return `live-chat:${sessionId}`;
}
