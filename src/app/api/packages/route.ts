import { NextResponse } from "next/server";
import { packagesRepository } from "@/lib/packages-repository";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";
import { packageInputSchema } from "@/lib/packages/schema";

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
    user = await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const body = await request.json();
  const parsed = packageInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid package data", details: parsed.error.flatten() }, { status: 400 });
  }

  const created = await packagesRepository.create(parsed.data, user.id);
  return NextResponse.json(created, { status: 201 });
}
