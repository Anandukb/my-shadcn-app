import { NextResponse } from "next/server";
import {
  liveChatRepository,
  notifyVisitor,
  ChatSessionClosedError,
  ChatSessionNotFoundError,
} from "@/lib/live-chat-repository";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const { id } = await params;

  try {
    const session = await liveChatRepository.close(id, "agent");
    await notifyVisitor(id);
    return NextResponse.json({ session });
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
