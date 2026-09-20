"use client";

import React, { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2, Newspaper, AlertCircle, Plus, Pencil, Trash2, Eye, EyeOff,
  Upload, Wand2, Search,
} from "lucide-react";
import type { BlogPost } from "@/types/blog";
import type { BlogPostAdminInput } from "@/lib/blog/schema";
import { extractErrorMessage } from "@/lib/extract-error-message";
import { uploadImage } from "@/lib/upload-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

async function fetchBlogPosts(): Promise<BlogPost[]> {
  const res = await fetch("/api/blog?all=1");
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load blog posts"));
  const json = await res.json();
  return json.posts as BlogPost[];
}

async function fetchBlogPostInput(id: number): Promise<BlogPostAdminInput> {
  const res = await fetch(`/api/blog/${id}`);
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load blog post"));
  return res.json() as Promise<BlogPostAdminInput>;
}

async function createBlogPost(input: BlogPostAdminInput): Promise<BlogPost> {
  const res = await fetch("/api/blog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to create blog post"));
  return res.json() as Promise<BlogPost>;
}

async function updateBlogPost(id: number, input: BlogPostAdminInput): Promise<BlogPost> {
  const res = await fetch(`/api/blog/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to update blog post"));
  return res.json() as Promise<BlogPost>;
}

async function deleteBlogPost(id: number): Promise<void> {
  const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to delete blog post"));
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const emptyForm: BlogPostAdminInput = {
  slug: "",
  title: { en: "", ar: "" },
  excerpt: { en: "", ar: "" },
  content: { en: "", ar: "" },
  coverImage: "",
  author: "Maram Tours and Travels",
  category: "",
  tags: [],
  metaTitle: { en: "", ar: "" },
  metaDescription: { en: "", ar: "" },
  isPublished: false,
};

function ImageUploadButton({ onUploaded }: { onUploaded: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onUploaded(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 shrink-0">
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
      <Button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="h-9 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg cursor-pointer gap-1.5"
      >
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        Upload
      </Button>
      {error && <span className="text-[11px] text-red-400">{error}</span>}
    </div>
  );
}

function BlogPostFormDialog({
  open,
  onOpenChange,
  initial,
  isEditing,
  onSubmit,
  isSubmitting,
  submitError,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: BlogPostAdminInput;
  isEditing: boolean;
  onSubmit: (input: BlogPostAdminInput) => void;
  isSubmitting: boolean;
  submitError: string | null;
}) {
  const [form, setForm] = useState<BlogPostAdminInput>(initial);
  const [tagsText, setTagsText] = useState(initial.tags.join(", "));
  const [locale, setLocale] = useState<"en" | "ar">("en");

  const bilingualValue = (field: "title" | "excerpt" | "content") => form[field][locale];
  const setBilingual = (field: "title" | "excerpt" | "content", value: string) =>
    setForm((f) => ({ ...f, [field]: { ...f[field], [locale]: value } }));

  const metaTitleValue = form.metaTitle?.[locale] ?? "";
  const metaDescValue = form.metaDescription?.[locale] ?? "";
  const setMetaTitle = (value: string) =>
    setForm((f) => ({ ...f, metaTitle: { en: f.metaTitle?.en ?? "", ar: f.metaTitle?.ar ?? "", [locale]: value } }));
  const setMetaDescription = (value: string) =>
    setForm((f) => ({
      ...f,
      metaDescription: { en: f.metaDescription?.en ?? "", ar: f.metaDescription?.ar ?? "", [locale]: value },
    }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800/80 text-white rounded-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Blog Post" : "Add Blog Post"}</DialogTitle>
          <DialogDescription className="text-slate-400">
            Published posts appear on the public /blog listing and are indexed by search engines.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-full w-fit border border-slate-800">
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${locale === "en" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLocale("ar")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${locale === "ar" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            العربية
          </button>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ ...form, tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean) });
          }}
        >
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">
              Title {locale === "en" && "*"}
            </label>
            <Input
              required={locale === "en"}
              value={bilingualValue("title")}
              onChange={(e) => {
                const value = e.target.value;
                setBilingual("title", value);
                if (locale === "en") setForm((f) => ({ ...f, slug: f.slug || slugify(value) }));
              }}
              placeholder={locale === "en" ? "e.g. 10 Must-Visit Spots in Kerala" : "مثال: 10 أماكن يجب زيارتها في كيرالا"}
              className="bg-slate-950 border-slate-800 text-white"
            />
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">
                Slug — used in the URL: /blog/&lt;slug&gt; *
              </label>
              <Input
                required
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                placeholder="e.g. 10-must-visit-spots-in-kerala"
                className="bg-slate-950 border-slate-800 text-white font-mono text-sm"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setForm((f) => ({ ...f, slug: slugify(f.title.en) }))}
              className="h-9 gap-1.5 cursor-pointer border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800"
              title="Generate slug from title"
            >
              <Wand2 className="h-3.5 w-3.5" /> Generate
            </Button>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">
              Excerpt {locale === "en" && "*"} — short summary shown on the listing card
            </label>
            <Textarea
              required={locale === "en"}
              rows={2}
              value={bilingualValue("excerpt")}
              onChange={(e) => setBilingual("excerpt", e.target.value)}
              placeholder="A one or two sentence teaser"
              className="bg-slate-950 border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">
              Content {locale === "en" && "*"} — separate paragraphs with a blank line
            </label>
            <Textarea
              required={locale === "en"}
              rows={10}
              value={bilingualValue("content")}
              onChange={(e) => setBilingual("content", e.target.value)}
              placeholder={"Write the full article here.\n\nStart a new paragraph by leaving a blank line."}
              className="bg-slate-950 border-slate-800 text-white font-normal"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">Author</label>
              <Input
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                placeholder="Maram Tours and Travels"
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">Category</label>
              <Input
                value={form.category ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Travel Tips"
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">Tags (comma-separated)</label>
            <Input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="kerala, backwaters, ayurveda"
              className="bg-slate-950 border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">Cover image *</label>
            <div className="flex gap-2">
              <Input
                required
                value={form.coverImage}
                onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                placeholder="https://..."
                className="bg-slate-950 border-slate-800 text-white"
              />
              <ImageUploadButton onUploaded={(url) => setForm((f) => ({ ...f, coverImage: url }))} />
            </div>
            {form.coverImage && (
              <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-800 mt-2">
                <img src={form.coverImage} alt="preview" className="object-cover w-full h-full" />
              </div>
            )}
          </div>

          {/* SEO */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <Search className="w-3.5 h-3.5 text-blue-400" /> Search Engine Listing (optional)
            </h3>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">Meta Title</label>
                <span className={`text-[10px] font-mono ${metaTitleValue.length > 60 ? "text-amber-400" : "text-slate-600"}`}>
                  {metaTitleValue.length}/60
                </span>
              </div>
              <Input
                value={metaTitleValue}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={bilingualValue("title") || "Defaults to the post title"}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">Meta Description</label>
                <span className={`text-[10px] font-mono ${metaDescValue.length > 160 ? "text-amber-400" : "text-slate-600"}`}>
                  {metaDescValue.length}/160
                </span>
              </div>
              <Textarea
                rows={2}
                value={metaDescValue}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder={bilingualValue("excerpt") || "Defaults to the excerpt"}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-blue-600 cursor-pointer"
            />
            Published — visible on the public site
          </label>

          {submitError && (
            <p className="text-sm text-red-400 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 shrink-0" /> {submitError}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BlogPostRowItem({
  post,
  onEdit,
  onTogglePublished,
  onDelete,
  isToggling,
  isDeleting,
}: {
  post: BlogPost;
  onEdit: () => void;
  onTogglePublished: () => void;
  onDelete: () => void;
  isToggling: boolean;
  isDeleting: boolean;
}) {
  return (
    <div className={`flex items-center gap-4 px-5 py-4 border-b border-slate-800/60 last:border-b-0 ${!post.isPublished ? "opacity-60" : ""}`}>
      <div className="relative h-12 w-16 rounded-lg overflow-hidden shrink-0 bg-slate-800">
        {post.coverImage && <img src={post.coverImage} alt="" className="object-cover w-full h-full" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-white truncate">{post.title}</p>
          {post.category && (
            <span className="text-[11px] px-2 py-0.5 rounded-full border border-slate-700 text-slate-400 shrink-0">{post.category}</span>
          )}
          <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${post.isPublished ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-700/30 text-slate-400 border border-slate-700"}`}>
            {post.isPublished ? "Published" : "Draft"}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 font-mono">/blog/{post.slug}</p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onTogglePublished}
          disabled={isToggling}
          title={post.isPublished ? "Unpublish" : "Publish"}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-slate-800/40 transition-all cursor-pointer disabled:opacity-50"
        >
          {post.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onEdit}
          title="Edit"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-slate-800/40 transition-all cursor-pointer"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          title="Delete"
          className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function BlogPostsTable() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ["blog-posts", "admin"],
    queryFn: fetchBlogPosts,
  });

  const { data: editingInput, isLoading: loadingEditingInput } = useQuery({
    queryKey: ["blog-posts", "admin-input", editingId],
    queryFn: () => fetchBlogPostInput(editingId as number),
    enabled: dialogOpen && editingId != null,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["blog-posts"] });

  const createMutation = useMutation({
    mutationFn: createBlogPost,
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
    },
    onError: (err) => setFormError(err instanceof Error ? err.message : "Something went wrong"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: BlogPostAdminInput }) => updateBlogPost(id, input),
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
    },
    onError: (err) => setFormError(err instanceof Error ? err.message : "Something went wrong"),
  });

  const toggleMutation = useMutation({
    mutationFn: async (post: BlogPost) => {
      const input = await fetchBlogPostInput(post.id);
      return updateBlogPost(post.id, { ...input, isPublished: !post.isPublished });
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: invalidate,
  });

  const openCreateDialog = () => {
    setEditingId(null);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (id: number) => {
    setEditingId(id);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSubmit = (input: BlogPostAdminInput) => {
    setFormError(null);
    if (editingId != null) {
      updateMutation.mutate({ id: editingId, input });
    } else {
      createMutation.mutate(input);
    }
  };

  const initialForm = editingId != null ? editingInput ?? emptyForm : emptyForm;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={openCreateDialog} className="cursor-pointer gap-1.5">
          <Plus className="h-4 w-4" /> Add Blog Post
        </Button>
      </div>

      <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-900/15">
        {isLoading ? (
          <div className="flex h-72 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
            <h3 className="text-base font-bold text-slate-350">Failed to load blog posts</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              {error instanceof Error ? error.message : "Something went wrong. Please try again."}
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6">
            <Newspaper className="h-12 w-12 text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-350">No Blog Posts Yet</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Add a post and publish it to show it on the public Blog page.
            </p>
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <BlogPostRowItem
                key={post.id}
                post={post}
                onEdit={() => openEditDialog(post.id)}
                onTogglePublished={() => toggleMutation.mutate(post)}
                onDelete={() => {
                  if (window.confirm(`Delete "${post.title}"? This can't be undone.`)) {
                    deleteMutation.mutate(post.id);
                  }
                }}
                isToggling={toggleMutation.isPending && toggleMutation.variables?.id === post.id}
                isDeleting={deleteMutation.isPending && deleteMutation.variables === post.id}
              />
            ))}
          </div>
        )}
      </div>

      {dialogOpen && (loadingEditingInput ? (
        <Dialog open onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl bg-slate-900 border-slate-800/80 text-white rounded-2xl">
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <BlogPostFormDialog
          key={`${editingId ?? "new"}-${dialogOpen}`}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initial={initialForm}
          isEditing={editingId != null}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          submitError={formError}
        />
      ))}
    </div>
  );
}
