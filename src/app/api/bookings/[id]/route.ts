import { NextResponse } from "next/server";
import { bookingsRepository, BookingNotFoundError } from "@/lib/bookings-repository";
import { bookingUpdateSchema } from "@/lib/bookings/schema";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = bookingUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking data", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const updated = await bookingsRepository.update(Number(id), parsed.data);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof BookingNotFoundError) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    throw error;
  }
}
