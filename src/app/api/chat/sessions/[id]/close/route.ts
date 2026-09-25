import { NextResponse } from "next/server";
import { liveChatRepository, ChatSessionClosedError } from "@/lib/live-chat-repository";
import { toVisitorChatSession } from "@/lib/live-chat/types";
import { resolveVisitorSession } from "@/lib/live-chat/visitor-auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await resolveVisitorSession(request, id);
  if (session instanceof NextResponse) return session;

  try {
    const closed = await liveChatRepository.close(session.id, "visitor");
    return NextResponse.json({ session: toVisitorChatSession(closed) });
  } catch (error) {
    if (error instanceof ChatSessionClosedError) {
      return NextResponse.json({ session: toVisitorChatSession(session) });
    }
    throw error;
  }
}
