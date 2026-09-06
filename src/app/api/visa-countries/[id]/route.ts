import { NextResponse } from "next/server";
import {
  visaCountriesRepository, VisaCountryNotFoundError, VisaCountrySlugConflictError,
} from "@/lib/visa-countries-repository";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";
import { visaCountryInputSchema } from "@/lib/visa/schema";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = visaCountryInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid visa country data", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const updated = await visaCountriesRepository.update(Number(id), parsed.data, user.id);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof VisaCountryNotFoundError) {
      return NextResponse.json({ error: "Visa country not found" }, { status: 404 });
    }
    if (error instanceof VisaCountrySlugConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
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
    await visaCountriesRepository.remove(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof VisaCountryNotFoundError) {
      return NextResponse.json({ error: "Visa country not found" }, { status: 404 });
    }
    throw error;
  }
}
