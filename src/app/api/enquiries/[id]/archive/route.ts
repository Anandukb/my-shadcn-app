import { NextResponse } from "next/server";
import { enquiriesRepository, EnquiryNotFoundError } from "@/lib/enquiries-repository";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const updated = await enquiriesRepository.toggleArchived(Number(id));
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof EnquiryNotFoundError) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }
    throw error;
  }
}
