import { packagesRepository } from "@/lib/packages-repository";
import { HomeClient } from "./HomeClient";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale = locale === "ar" ? "ar" : "en";
  const packages = await packagesRepository.getAll(resolvedLocale);

  return <HomeClient packages={packages} />;
}
