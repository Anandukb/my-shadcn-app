import { NextResponse } from "next/server";
import { visaCountriesRepository, VisaCountrySlugConflictError } from "@/lib/visa-countries-repository";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";
import { visaCountryInputSchema } from "@/lib/visa/schema";

// Public — used by the visa listing page, country detail page, and the
// homepage's VisaBanner. Admin callers pass ?all=1 to also see inactive
// countries in the admin table.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wantsAll = searchParams.get("all") === "1";

  if (wantsAll) {
    try {
      await requireAdminSession();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      throw error;
    }
    const countries = await visaCountriesRepository.listAll();
    return NextResponse.json({ countries });
  }

  const countries = await visaCountriesRepository.listActive();
  return NextResponse.json({ countries });
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
  const parsed = visaCountryInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid visa country data", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const created = await visaCountriesRepository.create(parsed.data, user.id);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof VisaCountrySlugConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
