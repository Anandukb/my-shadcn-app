import { NextResponse } from "next/server";
import { liveChatRepository } from "@/lib/live-chat-repository";
import { startChatSchema } from "@/lib/live-chat/schema";
import { toVisitorChatSession, visitorChannelName } from "@/lib/live-chat/types";
import { getClientIp } from "@/lib/live-chat/visitor-auth";
import { sendNewChatNotification } from "@/lib/live-chat/notify";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const allowed = await checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = startChatSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat details", details: parsed.error.flatten() }, { status: 400 });
  }

  const { session, token } = await liveChatRepository.createSession(parsed.data, ip);

  void sendNewChatNotification(session);

  return NextResponse.json(
    {
      session: toVisitorChatSession(session),
      token,
      channel: visitorChannelName(session.id),
    },
    { status: 201 }
  );
}
