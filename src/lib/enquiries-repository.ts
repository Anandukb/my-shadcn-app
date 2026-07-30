// src/lib/enquiries-repository.ts
import { createAdminClient } from "@/lib/supabase/admin";
import { rowToEnquiry } from "@/lib/enquiries/types";
import type { EnquiryRow, Enquiry } from "@/lib/enquiries/types";
import type { EnquiryInput } from "@/lib/enquiries/schema";

const TABLE = "enquiries";

export const enquiriesRepository = {
  async create(input: EnquiryInput): Promise<Enquiry> {
    const supabase = createAdminClient();

    const insertRow = {
      type: input.type,
      name: input.name ?? null,
      email: input.email,
      phone: input.phone,
      message: input.message ?? null,
      package_id: input.type === "book_now" ? (input.packageId ?? null) : null,
      details: input.details,
    };

    const { data, error } = await supabase.from(TABLE).insert(insertRow).select().single();

    if (error) throw new Error(`Failed to create enquiry: ${error.message}`);

    return rowToEnquiry(data as EnquiryRow);
  },

  async listAll(): Promise<Enquiry[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(TABLE).select("*").order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch enquiries: ${error.message}`);

    return (data as EnquiryRow[]).map(rowToEnquiry);
  },
};
