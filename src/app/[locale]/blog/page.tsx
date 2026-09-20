import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { blogRepository } from "@/lib/blog-repository";
import { marketingImageUrl } from "@/lib/marketing-images";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { BlogPostCard } from "@/components/blog/BlogPostCard";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return buildMetadata({ locale, path: "/blog", title: t("title"), description: t("subtitle") });
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale = locale === "ar" ? "ar" : "en";
  const t = await getTranslations({ locale, namespace: "blog" });
  const posts = await blogRepository.listPublished(resolvedLocale);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        badgeText={t("badgeText")}
        image={marketingImageUrl("1501785888041-af3ef285b470")}
        imageAlt={t("title")}
        height="50vh"
      />

      <section className="container mx-auto px-4 py-12 md:py-16">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">{t("noPostsFound")}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} locale={resolvedLocale} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
