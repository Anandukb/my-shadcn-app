import { createAdminClient } from "@/lib/supabase/admin";
import { rowToPackage, rowToAdminPackage, packageInputToInsertRow, packageInputToUpdateRow } from "@/lib/packages/mappers";
import type { PackageRow } from "@/lib/packages/types";
import type { Package } from "@/types/package";

const TABLE = "packages";

export class PackageNotFoundError extends Error {
  constructor(id: number) {
    super(`Package with ID ${id} not found.`);
    this.name = "PackageNotFoundError";
  }
}

async function fetchRowById(id: number): Promise<PackageRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch package ${id}: ${error.message}`);
  }

  return data as PackageRow;
}

export const packagesRepository = {
  async getAll(locale: "en" | "ar"): Promise<Package[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(TABLE).select("*").order("id", { ascending: true });

    if (error) throw new Error(`Failed to fetch packages: ${error.message}`);

    return (data as PackageRow[]).map((row) => rowToPackage(row, locale));
  },

  async getByCategory(category: string, locale: "en" | "ar"): Promise<Package[]> {
    const supabase = createAdminClient();

    if (category === "all") {
      return this.getAll(locale);
    }

    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("category", category)
      .order("id", { ascending: true });

    if (error) throw new Error(`Failed to fetch packages for category ${category}: ${error.message}`);

    return (data as PackageRow[]).map((row) => rowToPackage(row, locale));
  },

  async getById(id: number, locale: "en" | "ar"): Promise<Package | null> {
    const row = await fetchRowById(id);
    return row ? rowToPackage(row, locale) : null;
  },

  async create(input: Omit<Package, "id">): Promise<Package> {
    const supabase = createAdminClient();
    const insertRow = packageInputToInsertRow(input);

    const { data, error } = await supabase.from(TABLE).insert(insertRow).select().single();

    if (error) throw new Error(`Failed to create package: ${error.message}`);

    return rowToAdminPackage(data as PackageRow);
  },

  async update(id: number, input: Partial<Package>): Promise<Package> {
    const existing = await fetchRowById(id);
    if (!existing) {
      throw new PackageNotFoundError(id);
    }

    const supabase = createAdminClient();
    const updateRow = packageInputToUpdateRow(input, existing);

    const { data, error } = await supabase.from(TABLE).update(updateRow).eq("id", id).select().single();

    if (error) throw new Error(`Failed to update package ${id}: ${error.message}`);

    return rowToAdminPackage(data as PackageRow);
  },

  async delete(id: number): Promise<boolean> {
    const existing = await fetchRowById(id);
    if (!existing) {
      throw new PackageNotFoundError(id);
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from(TABLE).delete().eq("id", id);

    if (error) throw new Error(`Failed to delete package ${id}: ${error.message}`);

    return true;
  },

  async toggleFeatured(id: number): Promise<Package> {
    const existing = await fetchRowById(id);
    if (!existing) {
      throw new PackageNotFoundError(id);
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from(TABLE)
      .update({ featured: !existing.featured })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to toggle featured for package ${id}: ${error.message}`);

    return rowToAdminPackage(data as PackageRow);
  },
};
