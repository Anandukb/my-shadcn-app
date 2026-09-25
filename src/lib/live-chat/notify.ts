import { Resend } from "resend";
import type { ChatSession } from "@/lib/live-chat/types";

function getNotifyConfig(): { notifyEmail: string; apiKey: string } | null {
  const notifyEmail = process.env.ENQUIRY_NOTIFY_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;

  if (!notifyEmail || !apiKey) {
    console.warn("Live chat notification skipped: ENQUIRY_NOTIFY_EMAIL or RESEND_API_KEY not set.");
    return null;
  }
  return { notifyEmail, apiKey };
}

/** Emails the admin inbox when a visitor starts a live chat. Best-effort. */
export async function sendNewChatNotification(session: ChatSession): Promise<void> {
  const config = getNotifyConfig();
  if (!config) return;
  const { notifyEmail, apiKey } = config;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "info@maramtoursandtravels.com",
      to: notifyEmail,
      subject: `New live chat from ${session.name} — waiting for an agent`,
      text: [
        `${session.name} is waiting in the live chat.`,
        "",
        `Email: ${session.email}`,
        `Phone: ${session.phone}`,
        "",
        "Open the admin panel → Live Chat to reply.",
      ].join("\n"),
    });
  } catch (error) {
    console.error("Failed to send live chat notification email:", error);
  }
}

/** Emails the admin inbox when a visitor leaves a query because no agent connected. */
export async function sendChatQueryNotification(session: ChatSession, query: string): Promise<void> {
  const config = getNotifyConfig();
  if (!config) return;

  try {
    const resend = new Resend(config.apiKey);
    await resend.emails.send({
      from: "info@maramtoursandtravels.com",
      to: config.notifyEmail,
      subject: `Live chat query from ${session.name} — no agent connected`,
      text: [
        `${session.name} left a query after no agent joined their live chat.`,
        "",
        `Email: ${session.email}`,
        `Phone: ${session.phone}`,
        "",
        "Query:",
        query,
        "",
        "Open the admin panel → Live Chat to reply.",
      ].join("\n"),
    });
  } catch (error) {
    console.error("Failed to send live chat query notification email:", error);
  }
}
