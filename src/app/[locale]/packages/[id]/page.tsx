import { getPackageById } from "@/lib/api";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import PackageDetailClient from "./PackageDetailClient";

export async function generateMetadata(
  // @ts-ignore : params typing differs based on Next version
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const pkg = await getPackageById(resolvedParams.id);
  
  if (!pkg) {
    return {
      title: "Package Not Found"
    };
  }

  return {
    title: `${pkg.title} | Premium Travel`,
    description: pkg.description,
    openGraph: {
      title: pkg.title,
      description: pkg.description,
      images: [pkg.image],
    }
  };
}

export default async function PackageDetailPage(
  // @ts-ignore
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const pkg = await getPackageById(resolvedParams.id);

  if (!pkg) {
    notFound();
  }

  return <PackageDetailClient pkg={pkg} />;
}
