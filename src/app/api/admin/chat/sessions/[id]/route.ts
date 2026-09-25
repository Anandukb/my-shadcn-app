import { NextResponse } from "next/server";
import { liveChatRepository } from "@/lib/live-chat-repository";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const { id } = await params;
  const session = await liveChatRepository.getSession(id);

  if (!session) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  const messages = await liveChatRepository.listMessages(id);
  return NextResponse.json({ session, messages });
}
