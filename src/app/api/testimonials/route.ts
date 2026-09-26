import { NextResponse } from "next/server";
import { testimonialsRepository } from "@/lib/testimonials-repository";
import { requirePermission, UnauthorizedError } from "@/lib/admin-auth";
import { testimonialInputSchema } from "@/lib/testimonials/schema";

export async function GET() {
  try {
    await requirePermission("testimonials:view");
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const testimonials = await testimonialsRepository.listAll();
  return NextResponse.json({ testimonials });
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requirePermission("testimonials:create");
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
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
