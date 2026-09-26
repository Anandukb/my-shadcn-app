import { NextResponse } from "next/server";
import { blogRepository, BlogPostNotFoundError, BlogPostSlugConflictError } from "@/lib/blog-repository";
import { requirePermission, UnauthorizedError } from "@/lib/admin-auth";
import { blogPostAdminInputSchema } from "@/lib/blog/schema";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("blog:view");
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const { id } = await params;
  const input = await blogRepository.getAdminInputById(Number(id));

  if (!input) {
    return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
  }

  return NextResponse.json(input);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requirePermission("blog:edit");
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = blogPostAdminInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid blog post data", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const updated = await blogRepository.update(Number(id), parsed.data, user.id);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof BlogPostNotFoundError) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }
    if (error instanceof BlogPostSlugConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("blog:delete");
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const { id } = await params;

  try {
    await blogRepository.delete(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof BlogPostNotFoundError) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }
    throw error;
  }
}
