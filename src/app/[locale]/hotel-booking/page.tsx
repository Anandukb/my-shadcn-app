import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import HotelBookingClient from "./HotelBookingClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hotelBooking.booking" });
  return buildMetadata({
    locale,
    path: "/hotel-booking",
    title: t("title"),
    description: t("subtitle"),
    noIndex: true,
  });
}

export default function HotelBookingPage() {
  return <HotelBookingClient />;
}
