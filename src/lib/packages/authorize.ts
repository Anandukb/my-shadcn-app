import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { requirePackagePermission, UnauthorizedError } from "@/lib/admin-auth";
import { packagesRepository } from "@/lib/packages-repository";
import type { PermissionAction } from "@/lib/access/permissions";

/**
 * Checks the caller may perform `action` on the existing package `id`
 * (and on `newCategory` too when an edit moves it to another category).
 * Returns the user, or the error response to send back.
 */
export async function authorizePackage(
  action: PermissionAction,
  id: number,
  newCategory?: string,
): Promise<{ user: User } | { response: NextResponse }> {
  try {
    const category = await packagesRepository.getCategoryById(id);
    if (category === null) {
      // Still require some package access before revealing the id does not exist.
      const ctx = await requirePackagePermission(action, []);
      void ctx;
      return { response: NextResponse.json({ error: "Package not found" }, { status: 404 }) };
    }
    const categories = newCategory && newCategory !== category ? [category, newCategory] : [category];
    const ctx = await requirePackagePermission(action, categories);
    return { user: ctx.user };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { response: NextResponse.json({ error: error.message }, { status: error.status }) };
    }
    throw error;
  }
}
