export type EnquiryType = "contact" | "hotel_booking" | "hotel_search" | "book_now";
export type EnquiryStatus = "new" | "contacted" | "closed";

export interface EnquiryRow {
  id: number;
  type: EnquiryType;
  name: string | null;
  email: string;
  phone: string;
  message: string | null;
  status: EnquiryStatus;
  package_id: number | null;
  details: Record<string, unknown>;
  archived: boolean;
  created_at: string;
}

export interface Enquiry {
  id: number;
  type: EnquiryType;
  name: string | null;
  email: string;
  phone: string;
  message: string | null;
  status: EnquiryStatus;
  packageId: number | null;
  details: Record<string, unknown>;
  archived: boolean;
  createdAt: string;
}

export function rowToEnquiry(row: EnquiryRow): Enquiry {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    status: row.status,
    packageId: row.package_id,
    details: row.details,
    archived: row.archived,
    createdAt: row.created_at,
  };
}
