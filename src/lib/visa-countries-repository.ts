import { createAdminClient } from "@/lib/supabase/admin";
import { rowToVisaCountry } from "@/lib/visa/types";
import type { VisaCountryRow, VisaCountry } from "@/lib/visa/types";
import type { VisaCountryInput } from "@/lib/visa/schema";

const TABLE = "visa_countries";

export class VisaCountryNotFoundError extends Error {
  constructor(id: number) {
    super(`Visa country with ID ${id} not found.`);
    this.name = "VisaCountryNotFoundError";
  }
}

export class VisaCountrySlugConflictError extends Error {
  constructor(slug: string) {
    super(`A visa country with slug "${slug}" already exists.`);
    this.name = "VisaCountrySlugConflictError";
  }
}

async function fetchRowById(id: number): Promise<VisaCountryRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch visa country ${id}: ${error.message}`);
  }

  return data as VisaCountryRow;
}

function toRow(input: VisaCountryInput) {
  return {
    name: input.name,
    code: input.code,
    slug: input.slug,
    region: input.region,
    flag: input.flag,
    description: input.description ?? null,
    requirements: input.requirements,
    processing_time: input.processingTime ?? null,
    price: input.price ?? null,
    image: input.image ?? null,
    is_featured: input.isFeatured,
    is_active: input.isActive,
    sort_order: input.sortOrder,
  };
}

export const visaCountriesRepository = {
  // Used by the public site — only countries the admin has marked active.
  async listActive(): Promise<VisaCountry[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw new Error(`Failed to fetch visa countries: ${error.message}`);

    return (data as VisaCountryRow[]).map(rowToVisaCountry);
  },

  // Used by the admin panel — every country, active or not.
  async listAll(): Promise<VisaCountry[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw new Error(`Failed to fetch visa countries: ${error.message}`);

    return (data as VisaCountryRow[]).map(rowToVisaCountry);
  },

  async create(input: VisaCountryInput, userId: string): Promise<VisaCountry> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from(TABLE)
      .insert({ ...toRow(input), created_by: userId, updated_by: userId })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") throw new VisaCountrySlugConflictError(input.slug);
      throw new Error(`Failed to create visa country: ${error.message}`);
    }

    return rowToVisaCountry(data as VisaCountryRow);
  },

  async update(id: number, input: VisaCountryInput, userId: string): Promise<VisaCountry> {
    const existing = await fetchRowById(id);
    if (!existing) throw new VisaCountryNotFoundError(id);

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from(TABLE)
      .update({ ...toRow(input), updated_by: userId, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") throw new VisaCountrySlugConflictError(input.slug);
      throw new Error(`Failed to update visa country ${id}: ${error.message}`);
    }

    return rowToVisaCountry(data as VisaCountryRow);
  },

  async remove(id: number): Promise<void> {
    const existing = await fetchRowById(id);
    if (!existing) throw new VisaCountryNotFoundError(id);

    const supabase = createAdminClient();
    const { error } = await supabase.from(TABLE).delete().eq("id", id);

    if (error) throw new Error(`Failed to delete visa country ${id}: ${error.message}`);
  },
};
