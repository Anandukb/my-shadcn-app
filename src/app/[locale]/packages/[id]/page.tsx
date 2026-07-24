import { packagesRepository } from "@/lib/packages-repository";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import PackageDetailClient from "./PackageDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  const resolvedLocale = locale === "ar" ? "ar" : "en";
  const pkg = await packagesRepository.getById(Number(id), resolvedLocale);

  if (!pkg) {
    return {
      title: "Package Not Found",
    };
  }

  return {
    title: `${pkg.title} | Premium Travel`,
    description: pkg.description,
    openGraph: {
      title: pkg.title,
      description: pkg.description,
      images: [pkg.image],
    },
  };
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const resolvedLocale = locale === "ar" ? "ar" : "en";
  const pkg = await packagesRepository.getById(Number(id), resolvedLocale);

  if (!pkg) {
    notFound();
  }

  return <PackageDetailClient pkg={pkg} />;
}
