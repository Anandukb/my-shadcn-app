import { NextResponse } from "next/server";
import {
  liveChatRepository,
  ChatQueryNotAllowedError,
  ChatSessionClosedError,
} from "@/lib/live-chat-repository";
import { chatMessageSchema } from "@/lib/live-chat/schema";
import { toVisitorChatSession } from "@/lib/live-chat/types";
import { resolveVisitorSession } from "@/lib/live-chat/visitor-auth";
import { sendChatQueryNotification } from "@/lib/live-chat/notify";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await resolveVisitorSession(request, id);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = chatMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await liveChatRepository.submitQuery(session.id, parsed.data.body);
    void sendChatQueryNotification(result.session, parsed.data.body);
    return NextResponse.json({ session: toVisitorChatSession(result.session), message: result.message }, { status: 201 });
  } catch (error) {
    if (error instanceof ChatQueryNotAllowedError || error instanceof ChatSessionClosedError) {
      return NextResponse.json({ error: "A query can't be left for this chat." }, { status: 409 });
    }
    throw error;
  }
}
