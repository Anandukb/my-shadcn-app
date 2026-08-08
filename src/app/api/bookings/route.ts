import { NextResponse } from "next/server";
import { bookingsRepository } from "@/lib/bookings-repository";
import { enquiriesRepository } from "@/lib/enquiries-repository";
import { bookingInputSchema } from "@/lib/bookings/schema";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const body = await request.json();
  const parsed = bookingInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking data", details: parsed.error.flatten() }, { status: 400 });
  }

  const created = await bookingsRepository.create(parsed.data);

  if (parsed.data.enquiryId != null) {
    try {
      await enquiriesRepository.archive(parsed.data.enquiryId);
    } catch {
      // Booking already created successfully; a failure to archive the
      // source enquiry must not roll back or fail this response.
    }
  }

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

  const bookings = await bookingsRepository.listAll();
  return NextResponse.json({ bookings });
}
