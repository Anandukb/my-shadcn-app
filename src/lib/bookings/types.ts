export type BookingStatus = "confirmed" | "cancelled" | "completed";
export type PaymentStatus = "unpaid" | "partial" | "paid";

export interface BookingRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  travelers: number | null;
  package_id: number | null;
  price: number | null;
  payment_status: PaymentStatus;
  status: BookingStatus;
  enquiry_id: number | null;
  notes: string | null;
  created_at: string;
}

export interface Booking {
  id: number;
  name: string;
  email: string;
  phone: string;
  destination: string | null;
  startDate: string | null;
  endDate: string | null;
  travelers: number | null;
  packageId: number | null;
  price: number | null;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  enquiryId: number | null;
  notes: string | null;
  createdAt: string;
}

export function rowToBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    destination: row.destination,
    startDate: row.start_date,
    endDate: row.end_date,
    travelers: row.travelers,
    packageId: row.package_id,
    price: row.price,
    paymentStatus: row.payment_status,
    status: row.status,
    enquiryId: row.enquiry_id,
    notes: row.notes,
    createdAt: row.created_at,
  };
}
