import { NextResponse } from "next/server";
import {
  liveChatRepository,
  notifyVisitor,
  ChatSessionClosedError,
  ChatSessionNotFoundError,
} from "@/lib/live-chat-repository";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

async function resolveAgentName(userId: string, email: string | undefined): Promise<string> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle();
  const fullName = (data as { full_name: string | null } | null)?.full_name?.trim();
  if (fullName) return fullName;
  return email ? email.split("@")[0] : "Maram Support";
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const { id } = await params;

  try {
    const agentName = await resolveAgentName(user.id, user.email);
    const session = await liveChatRepository.accept(id, user.id, agentName);
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
