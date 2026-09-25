import { NextResponse } from "next/server";
import { liveChatRepository } from "@/lib/live-chat-repository";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";

export async function GET() {
  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const sessions = await liveChatRepository.listSessions();
  return NextResponse.json({ sessions });
}
