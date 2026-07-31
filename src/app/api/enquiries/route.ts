import { NextResponse } from "next/server";
import { enquiriesRepository } from "@/lib/enquiries-repository";
import { enquiryInputSchema } from "@/lib/enquiries/schema";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEnquiryNotification } from "@/lib/notify-enquiry";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";

function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (!forwardedFor) return null;
  return forwardedFor.split(",")[0].trim();
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const allowed = await checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = enquiryInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid enquiry data", details: parsed.error.flatten() }, { status: 400 });
  }

  const created = await enquiriesRepository.create(parsed.data);

  void sendEnquiryNotification(created);

  return NextResponse.json(created, { status: 201 });
}

export async function GET() {
  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const enquiries = await enquiriesRepository.listAll();
  return NextResponse.json({ enquiries });
}
