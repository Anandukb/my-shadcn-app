import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Calendar, User, Clock, ArrowLeft } from "lucide-react";
import { blogRepository } from "@/lib/blog-repository";
import { buildMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const resolvedLocale = locale === "ar" ? "ar" : "en";
  const post = await blogRepository.getPublishedBySlug(slug, resolvedLocale);

  if (!post) {
    return { title: "Article Not Found" };
  }

  const meta = buildMetadata({
    locale,
    path: `/blog/${slug}`,
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
  });

  return {
    ...meta,
    openGraph: { ...meta.openGraph, images: [post.coverImage], type: "article" },
    twitter: { ...meta.twitter, images: [post.coverImage] },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const resolvedLocale = locale === "ar" ? "ar" : "en";
  const post = await blogRepository.getPublishedBySlug(slug, resolvedLocale);

  if (!post) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "blog" });
  const paragraphs = post.content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const wordCount = post.content.trim().split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.round(wordCount / 200));
  const dateLabel = post.publishedAt
    ? new Intl.DateTimeFormat(resolvedLocale === "ar" ? "ar" : "en", { dateStyle: "long" }).format(new Date(post.publishedAt))
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Cover image banner */}
      <div className="relative h-64 md:h-[28rem] w-full overflow-hidden">
        <Image src={post.coverImage} alt={post.title} fill sizes="100vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
      </div>

      <article className="container mx-auto px-4 max-w-3xl -mt-16 md:-mt-24 relative z-10 pb-16">
        <div className="bg-background rounded-3xl shadow-xl p-6 md:p-10">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mb-6">
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("backToBlog")}
          </Link>

          {post.category && (
            <Badge className="mb-4 bg-primary/10 text-primary border-0 font-semibold">{post.category}</Badge>
          )}

          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-5 leading-tight">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground mb-8 pb-8 border-b">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {t("by")} {post.author}
            </span>
            {dateLabel && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {dateLabel}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {readMinutes} {t("minRead")}
            </span>
          </div>

          <div className="prose prose-slate max-w-none">
            {paragraphs.map((paragraph, i) => (
              <p key={i} className="text-base md:text-lg leading-relaxed text-foreground/90 mb-5">
                {paragraph}
              </p>
            ))}
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="font-normal">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Conversion CTA */}
        <div className="mt-10 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 p-8 md:p-10 text-center text-white shadow-xl">
          <h2 className="text-2xl md:text-3xl font-black mb-3">Ready to plan your next getaway?</h2>
          <p className="text-white/90 mb-6 max-w-xl mx-auto">
            Talk to our travel consultants today and get a custom quote tailored to you.
          </p>
          <Button size="lg" variant="secondary" className="rounded-full font-bold" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </article>
    </div>
  );
}
