import { NextResponse } from "next/server";
import { packagesRepository, PackageNotFoundError } from "@/lib/packages-repository";
import { authorizePackage } from "@/lib/packages/authorize";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const auth = await authorizePackage("edit", Number(id));
  if ("response" in auth) return auth.response;
  const user = auth.user;

  try {
    const updated = await packagesRepository.toggleFeatured(Number(id), user.id);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof PackageNotFoundError) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }
    throw error;
  }
}
