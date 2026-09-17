import { packagesRepository } from "@/lib/packages-repository";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import PackageDetailClient from "./PackageDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const resolvedLocale = locale === "ar" ? "ar" : "en";
  const pkg = await packagesRepository.getBySlug(slug, resolvedLocale);

  if (!pkg) {
    return { title: "Package Not Found" };
  }

  const meta = buildMetadata({
    locale,
    path: `/packages/${slug}`,
    title: pkg.metaTitle || pkg.title,
    description: pkg.metaDescription || pkg.description,
  });

  return {
    ...meta,
    openGraph: { ...meta.openGraph, images: [pkg.image] },
    twitter: { ...meta.twitter, images: [pkg.image] },
  };
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const resolvedLocale = locale === "ar" ? "ar" : "en";
  const pkg = await packagesRepository.getBySlug(slug, resolvedLocale);

  if (!pkg) {
    notFound();
  }

  return <PackageDetailClient pkg={pkg} />;
}
