import { createAdminClient } from "@/lib/supabase/admin";
import { rowToBlogPost, rowToAdminBlogPost, rowToAdminInput, blogPostAdminInputToRow } from "@/lib/blog/mappers";
import type { BlogPostRow } from "@/lib/blog/types";
import type { BlogPostAdminInput } from "@/lib/blog/schema";
import type { BlogPost } from "@/types/blog";

const TABLE = "blog_posts";

export class BlogPostNotFoundError extends Error {
  constructor(id: number) {
    super(`Blog post with ID ${id} not found.`);
    this.name = "BlogPostNotFoundError";
  }
}

export class BlogPostSlugConflictError extends Error {
  constructor(slug: string) {
    super(`A blog post with slug "${slug}" already exists.`);
    this.name = "BlogPostSlugConflictError";
  }
}

async function fetchRowById(id: number): Promise<BlogPostRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch blog post ${id}: ${error.message}`);
  }

  return data as BlogPostRow;
}

async function fetchRowBySlug(slug: string): Promise<BlogPostRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from(TABLE).select("*").eq("slug", slug).single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch blog post "${slug}": ${error.message}`);
  }

  return data as BlogPostRow;
}

export const blogRepository = {
  // Public site — published posts only, newest first.
  async listPublished(locale: "en" | "ar"): Promise<BlogPost[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch blog posts: ${error.message}`);

    return (data as BlogPostRow[]).map((row) => rowToBlogPost(row, locale));
  },

  async getPublishedBySlug(slug: string, locale: "en" | "ar"): Promise<BlogPost | null> {
    const row = await fetchRowBySlug(slug);
    if (!row || !row.is_published) return null;
    return rowToBlogPost(row, locale);
  },

  // Admin panel — every post, published or draft.
  async listAll(): Promise<BlogPost[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(TABLE).select("*").order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch blog posts: ${error.message}`);

    return (data as BlogPostRow[]).map(rowToAdminBlogPost);
  },

  async getAdminInputById(id: number): Promise<BlogPostAdminInput | null> {
    const row = await fetchRowById(id);
    return row ? rowToAdminInput(row) : null;
  },

  async create(input: BlogPostAdminInput, createdBy?: string): Promise<BlogPost> {
    const supabase = createAdminClient();
    const insertRow = {
      ...blogPostAdminInputToRow(input),
      published_at: input.isPublished ? new Date().toISOString() : null,
      created_by: createdBy ?? null,
      updated_by: createdBy ?? null,
    };

    const { data, error } = await supabase.from(TABLE).insert(insertRow).select().single();

    if (error) {
      if (error.code === "23505") throw new BlogPostSlugConflictError(input.slug);
      throw new Error(`Failed to create blog post: ${error.message}`);
    }

    return rowToAdminBlogPost(data as BlogPostRow);
  },

  async update(id: number, input: BlogPostAdminInput, updatedBy?: string): Promise<BlogPost> {
    const existing = await fetchRowById(id);
    if (!existing) {
      throw new BlogPostNotFoundError(id);
    }

    // First time being published, stamp the date; otherwise leave the
    // original publish date alone (re-editing or unpublishing shouldn't
    // make a post look freshly posted).
    const publishedAt = !existing.published_at && input.isPublished ? new Date().toISOString() : existing.published_at;

    const supabase = createAdminClient();
    const updateRow = {
      ...blogPostAdminInputToRow(input),
      published_at: publishedAt,
      updated_by: updatedBy ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from(TABLE).update(updateRow).eq("id", id).select().single();

    if (error) {
      if (error.code === "23505") throw new BlogPostSlugConflictError(input.slug);
      throw new Error(`Failed to update blog post ${id}: ${error.message}`);
    }

    return rowToAdminBlogPost(data as BlogPostRow);
  },

  async delete(id: number): Promise<boolean> {
    const existing = await fetchRowById(id);
    if (!existing) {
      throw new BlogPostNotFoundError(id);
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from(TABLE).delete().eq("id", id);

    if (error) throw new Error(`Failed to delete blog post ${id}: ${error.message}`);

    return true;
  },
};
