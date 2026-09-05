import { NextResponse } from "next/server";
import { testimonialsRepository, TestimonialNotFoundError } from "@/lib/testimonials-repository";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";
import { testimonialInputSchema } from "@/lib/testimonials/schema";

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
  const parsed = testimonialInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid testimonial data", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const updated = await testimonialsRepository.update(Number(id), parsed.data, user.id);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof TestimonialNotFoundError) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
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
    await testimonialsRepository.remove(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof TestimonialNotFoundError) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }
    throw error;
  }
}
