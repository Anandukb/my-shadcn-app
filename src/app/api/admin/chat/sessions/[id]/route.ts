import { NextResponse } from "next/server";
import { liveChatRepository } from "@/lib/live-chat-repository";
import { requirePermission, UnauthorizedError } from "@/lib/admin-auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("live_chat:view");
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
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
