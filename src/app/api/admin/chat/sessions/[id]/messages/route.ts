import { NextResponse } from "next/server";
import {
  liveChatRepository,
  notifyVisitor,
  ChatSessionClosedError,
  ChatSessionNotFoundError,
} from "@/lib/live-chat-repository";
import { chatMessageSchema } from "@/lib/live-chat/schema";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = chatMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const message = await liveChatRepository.addMessage(id, "agent", parsed.data.body);
    await notifyVisitor(id);
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof ChatSessionNotFoundError) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }
    if (error instanceof ChatSessionClosedError) {
      return NextResponse.json({ error: "This chat has already ended." }, { status: 409 });
    }
    throw error;
  }
}
