import { NextResponse } from "next/server";
import { packagesRepository } from "@/lib/packages-repository";
import { authorizePackage } from "@/lib/packages/authorize";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const auth = await authorizePackage("view", Number(id));
  if ("response" in auth) return auth.response;
  const input = await packagesRepository.getAdminInputById(Number(id));

  if (!input) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  return NextResponse.json(input);
}
