import { NextResponse } from "next/server";
import { liveChatRepository, ChatSessionClosedError } from "@/lib/live-chat-repository";
import { chatMessageSchema } from "@/lib/live-chat/schema";
import { resolveVisitorSession } from "@/lib/live-chat/visitor-auth";

const MAX_MESSAGES_PER_MINUTE = 20;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await resolveVisitorSession(request, id);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = chatMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message", details: parsed.error.flatten() }, { status: 400 });
  }

  const recent = await liveChatRepository.countRecentVisitorMessages(session.id, 60);
  if (recent >= MAX_MESSAGES_PER_MINUTE) {
    return NextResponse.json({ error: "You're sending messages too quickly." }, { status: 429 });
  }

  try {
    const message = await liveChatRepository.addMessage(session.id, "visitor", parsed.data.body);
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof ChatSessionClosedError) {
      return NextResponse.json({ error: "This chat has ended." }, { status: 409 });
    }
    throw error;
  }
}
