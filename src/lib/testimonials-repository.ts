import { createAdminClient } from "@/lib/supabase/admin";
import { rowToTestimonial } from "@/lib/testimonials/types";
import type { TestimonialRow, Testimonial } from "@/lib/testimonials/types";
import type { TestimonialInput } from "@/lib/testimonials/schema";

const TABLE = "testimonials";

export class TestimonialNotFoundError extends Error {
  constructor(id: number) {
    super(`Testimonial with ID ${id} not found.`);
    this.name = "TestimonialNotFoundError";
  }
}

async function fetchRowById(id: number): Promise<TestimonialRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch testimonial ${id}: ${error.message}`);
  }

  return data as TestimonialRow;
}

export const testimonialsRepository = {
  // Used by the public site (homepage) — only testimonials the admin has
  // marked active, in display order.
  async listActive(): Promise<Testimonial[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch testimonials: ${error.message}`);

    return (data as TestimonialRow[]).map(rowToTestimonial);
  },

  // Used by the admin panel — every testimonial, active or not.
  async listAll(): Promise<Testimonial[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch testimonials: ${error.message}`);

    return (data as TestimonialRow[]).map(rowToTestimonial);
  },

  async create(input: TestimonialInput, userId: string): Promise<Testimonial> {
    const supabase = createAdminClient();

    const insertRow = {
      name: input.name,
      place: input.place,
      review_text: input.text,
      rating: input.rating,
      is_active: input.isActive,
      sort_order: input.sortOrder,
      created_by: userId,
      updated_by: userId,
    };

    const { data, error } = await supabase.from(TABLE).insert(insertRow).select().single();

    if (error) throw new Error(`Failed to create testimonial: ${error.message}`);

    return rowToTestimonial(data as TestimonialRow);
  },

  async update(id: number, input: TestimonialInput, userId: string): Promise<Testimonial> {
    const existing = await fetchRowById(id);
    if (!existing) throw new TestimonialNotFoundError(id);

    const supabase = createAdminClient();

    const updateRow = {
      name: input.name,
      place: input.place,
      review_text: input.text,
      rating: input.rating,
      is_active: input.isActive,
      sort_order: input.sortOrder,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from(TABLE).update(updateRow).eq("id", id).select().single();

    if (error) throw new Error(`Failed to update testimonial ${id}: ${error.message}`);

    return rowToTestimonial(data as TestimonialRow);
  },

  async remove(id: number): Promise<void> {
    const existing = await fetchRowById(id);
    if (!existing) throw new TestimonialNotFoundError(id);

    const supabase = createAdminClient();
    const { error } = await supabase.from(TABLE).delete().eq("id", id);

    if (error) throw new Error(`Failed to delete testimonial ${id}: ${error.message}`);
  },
};
