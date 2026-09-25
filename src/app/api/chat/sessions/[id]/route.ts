import { NextResponse } from "next/server";
import { liveChatRepository } from "@/lib/live-chat-repository";
import { toVisitorChatSession } from "@/lib/live-chat/types";
import { resolveVisitorSession } from "@/lib/live-chat/visitor-auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await resolveVisitorSession(request, id);
  if (session instanceof NextResponse) return session;

  const after = Number(new URL(request.url).searchParams.get("after") ?? 0) || 0;
  const messages = await liveChatRepository.listMessages(session.id, after);

  return NextResponse.json({ session: toVisitorChatSession(session), messages });
}
