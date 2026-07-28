import { NextResponse } from "next/server";
import { packagesRepository } from "@/lib/packages-repository";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const { id } = await params;
  const input = await packagesRepository.getAdminInputById(Number(id));

  if (!input) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  return NextResponse.json(input);
}
