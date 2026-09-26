import { NextResponse } from "next/server";
import { enquiriesRepository, EnquiryNotFoundError } from "@/lib/enquiries-repository";
import { requirePermission, UnauthorizedError } from "@/lib/admin-auth";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("enquiries:edit");
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const { id } = await params;

  try {
    const updated = await enquiriesRepository.toggleArchived(Number(id));
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof EnquiryNotFoundError) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }
    throw error;
  }
}
