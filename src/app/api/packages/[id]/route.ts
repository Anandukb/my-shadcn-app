import { NextResponse } from "next/server";
import { packagesRepository, PackageNotFoundError } from "@/lib/packages-repository";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";
import { packageUpdateSchema } from "@/lib/packages/schema";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "ar" ? "ar" : "en";

  const pkg = await packagesRepository.getById(Number(id), locale);

  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  return NextResponse.json(pkg);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = packageUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid package data", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const updated = await packagesRepository.update(Number(id), parsed.data);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof PackageNotFoundError) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const { id } = await params;

  try {
    await packagesRepository.delete(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PackageNotFoundError) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }
    throw error;
  }
}
