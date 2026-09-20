import { NextResponse } from "next/server";
import { blogRepository, BlogPostSlugConflictError } from "@/lib/blog-repository";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";
import { blogPostAdminInputSchema } from "@/lib/blog/schema";

// Public — used by the blog listing page. Admin callers pass ?all=1 to also
// see drafts in the admin table.
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
    const posts = await blogRepository.listAll();
    return NextResponse.json({ posts });
  }

  const locale = searchParams.get("locale") === "ar" ? "ar" : "en";
  const posts = await blogRepository.listPublished(locale);
  return NextResponse.json({ posts });
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
  const parsed = blogPostAdminInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid blog post data", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const created = await blogRepository.create(parsed.data, user.id);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof BlogPostSlugConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
