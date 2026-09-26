import { NextResponse } from "next/server";
import { packagesRepository, PackageSlugConflictError } from "@/lib/packages-repository";
import { getAdminContext, requirePackagePermission, UnauthorizedError } from "@/lib/admin-auth";
import { packageAdminInputSchema } from "@/lib/packages/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "all";
  const locale = searchParams.get("locale") === "ar" ? "ar" : "en";

  const packages = await packagesRepository.getByCategory(category, locale);

  return NextResponse.json({ packages });
}

export async function POST(request: Request) {
  let user;
  try {
    user = (await getAdminContext()).user;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const body = await request.json();
  const parsed = packageAdminInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid package data", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await requirePackagePermission("create", [parsed.data.category]);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  try {
    const created = await packagesRepository.create(parsed.data, user.id);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof PackageSlugConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
