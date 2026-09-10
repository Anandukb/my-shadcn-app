import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import ClientLayout from "@/components/layout/ClientLayout";

const GA_MEASUREMENT_ID = "G-NY68C7K3KE";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maram Holidays - Your Gateway to the World",
  description: "Discover amazing destinations with our travel packages, cruise deals, and medical tourism services.",
};

// Define supported locales
const locales = ['en', 'ar'];

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale)) {
    notFound();
  }

  // Get messages for the locale
  const messages = await getMessages();

  // Determine if RTL
  const isRTL = locale === 'ar';

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen bg-background text-foreground" dir={isRTL ? "rtl" : "ltr"}>
            <ClientLayout>{children}</ClientLayout>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
