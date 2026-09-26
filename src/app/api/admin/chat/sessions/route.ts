import { NextResponse } from "next/server";
import { liveChatRepository } from "@/lib/live-chat-repository";
import { requirePermission, UnauthorizedError } from "@/lib/admin-auth";

export async function GET() {
  try {
    await requirePermission("live_chat:view");
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const sessions = await liveChatRepository.listSessions();
  return NextResponse.json({ sessions });
}
