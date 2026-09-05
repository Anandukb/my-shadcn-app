import { NextResponse } from "next/server";
import { testimonialsRepository } from "@/lib/testimonials-repository";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";
import { testimonialInputSchema } from "@/lib/testimonials/schema";

export async function GET() {
  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const testimonials = await testimonialsRepository.listAll();
  return NextResponse.json({ testimonials });
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
  const parsed = testimonialInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid testimonial data", details: parsed.error.flatten() }, { status: 400 });
  }

  const created = await testimonialsRepository.create(parsed.data, user.id);
  return NextResponse.json(created, { status: 201 });
}
