import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/types/blog";

// Pure server-rendered card — no client JS needed for a listing grid, which
// keeps the blog's HTML fully crawlable without waiting on hydration.
export async function BlogPostCard({ post, locale }: { post: BlogPost; locale: string }) {
    const t = await getTranslations({ locale, namespace: "blog" });
    const dateLabel = post.publishedAt
        ? new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", { dateStyle: "medium" }).format(new Date(post.publishedAt))
        : null;

    return (
        <Card className="group flex flex-col h-full overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300 rounded-3xl bg-background">
            <Link href={`/blog/${post.slug}`} className="relative h-52 overflow-hidden shrink-0 block">
                <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                {post.category && (
                    <Badge className="absolute top-4 left-4 bg-white/90 text-slate-900 hover:bg-white border-0 shadow-md font-semibold text-xs">
                        {post.category}
                    </Badge>
                )}
            </Link>

            <div className="p-5 md:p-6 flex flex-col flex-1">
                {dateLabel && (
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium mb-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{dateLabel}</span>
                    </div>
                )}
                <h3 className="text-lg font-bold mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">{post.excerpt}</p>
                <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group/link mt-auto"
                >
                    <span className="group-hover/link:underline">{t("readMore")}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
                </Link>
            </div>
        </Card>
    );
}
