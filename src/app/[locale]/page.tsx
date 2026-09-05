import { packagesRepository } from "@/lib/packages-repository";
import { testimonialsRepository } from "@/lib/testimonials-repository";
import { HomeClient } from "./HomeClient";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale = locale === "ar" ? "ar" : "en";
  const packages = await packagesRepository.getAll(resolvedLocale);
  const testimonials = await testimonialsRepository.listActive();

  return <HomeClient packages={packages} testimonials={testimonials} />;
}
