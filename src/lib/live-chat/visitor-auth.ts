import "server-only";

import { NextResponse } from "next/server";
import { liveChatRepository } from "@/lib/live-chat-repository";
import type { ChatSession } from "@/lib/live-chat/types";

export const CHAT_TOKEN_HEADER = "x-chat-token";

/**
 * Resolves the visitor's chat session from the route id + the token header,
 * or returns a 404 response (we don't distinguish "wrong token" from "no such
 * session" so ids can't be probed).
 */
export async function resolveVisitorSession(
  request: Request,
  id: string
): Promise<ChatSession | NextResponse> {
  const token = request.headers.get(CHAT_TOKEN_HEADER);
  const session = token ? await liveChatRepository.getSessionForVisitor(id, token) : null;

  if (!session) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  return session;
}

export function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (!forwardedFor) return null;
  return forwardedFor.split(",")[0].trim();
}
