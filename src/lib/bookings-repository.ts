import { createAdminClient } from "@/lib/supabase/admin";
import { rowToBooking } from "@/lib/bookings/types";
import type { BookingRow, Booking } from "@/lib/bookings/types";
import type { BookingInput, BookingUpdateInput } from "@/lib/bookings/schema";

const TABLE = "bookings";

export class BookingNotFoundError extends Error {
  constructor(id: number) {
    super(`Booking with ID ${id} not found.`);
    this.name = "BookingNotFoundError";
  }
}

async function fetchRowById(id: number): Promise<BookingRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch booking ${id}: ${error.message}`);
  }

  return data as BookingRow;
}

export const bookingsRepository = {
  async create(input: BookingInput): Promise<Booking> {
    const supabase = createAdminClient();

    const insertRow = {
      name: input.name,
      email: input.email,
      phone: input.phone,
      destination: input.destination ?? null,
      start_date: input.startDate ?? null,
      end_date: input.endDate ?? null,
      travelers: input.travelers ?? null,
      package_id: input.packageId ?? null,
      price: input.price ?? null,
      enquiry_id: input.enquiryId ?? null,
      notes: input.notes ?? null,
    };

    const { data, error } = await supabase.from(TABLE).insert(insertRow).select().single();

    if (error) throw new Error(`Failed to create booking: ${error.message}`);

    return rowToBooking(data as BookingRow);
  },

  async listAll(): Promise<Booking[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(TABLE).select("*").order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch bookings: ${error.message}`);

    return (data as BookingRow[]).map(rowToBooking);
  },

  async update(id: number, input: BookingUpdateInput): Promise<Booking> {
    const existing = await fetchRowById(id);
    if (!existing) {
      throw new BookingNotFoundError(id);
    }

    const supabase = createAdminClient();
    const updateRow = {
      status: input.status ?? existing.status,
      payment_status: input.paymentStatus ?? existing.payment_status,
    };

    const { data, error } = await supabase.from(TABLE).update(updateRow).eq("id", id).select().single();

    if (error) throw new Error(`Failed to update booking ${id}: ${error.message}`);

    return rowToBooking(data as BookingRow);
  },
};
