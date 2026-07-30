import { Resend } from "resend";
import type { Enquiry } from "@/lib/enquiries/types";

function formatEnquiryText(enquiry: Enquiry): string {
  const lines = [
    `Type: ${enquiry.type}`,
    `Name: ${enquiry.name ?? "(not provided)"}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone}`,
  ];

  if (enquiry.message) lines.push(`Message: ${enquiry.message}`);
  if (enquiry.packageId) lines.push(`Package ID: ${enquiry.packageId}`);

  lines.push("", "Details:", JSON.stringify(enquiry.details, null, 2));

  return lines.join("\n");
}

export async function sendEnquiryNotification(enquiry: Enquiry): Promise<void> {
  const notifyEmail = process.env.ENQUIRY_NOTIFY_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;

  if (!notifyEmail || !apiKey) {
    console.warn("Enquiry notification skipped: ENQUIRY_NOTIFY_EMAIL or RESEND_API_KEY not set.");
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "enquiries@maramholidays.com",
      to: notifyEmail,
      subject: `New ${enquiry.type} enquiry from ${enquiry.name ?? enquiry.email}`,
      text: formatEnquiryText(enquiry),
    });
  } catch (error) {
    console.error("Failed to send enquiry notification email:", error);
  }
}
