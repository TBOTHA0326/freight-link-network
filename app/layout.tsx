import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://f-ln.co.za";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Freight Link Network — South Africa's B2B Freight & Logistics Platform",
    template: "%s | Freight Link Network",
  },
  description:
    "Freight Link Network connects South African freight suppliers with verified transporters. Post loads, manage compliance documents, and move freight across South Africa and cross-border corridors.",
  keywords: [
    "freight South Africa",
    "logistics platform",
    "load board",
    "transporters",
    "freight suppliers",
    "cross-border freight",
    "trucking South Africa",
    "freight matching",
  ],
  applicationName: "Freight Link Network",
  authors: [{ name: "Freight Link Network" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: siteUrl,
    siteName: "Freight Link Network",
    title: "Freight Link Network — South Africa's B2B Freight & Logistics Platform",
    description:
      "Connect with verified transporters and suppliers. Post loads, manage compliance, and move freight across South Africa and beyond.",
    images: [{ url: "/FLNSITELOGO.png", alt: "Freight Link Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Freight Link Network — South Africa's B2B Freight & Logistics Platform",
    description:
      "Connect with verified transporters and suppliers across South Africa.",
    images: ["/FLNSITELOGO.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

// Explicit, deterministic viewport. We intentionally do NOT set
// maximumScale/userScalable — pinch-to-zoom stays enabled for accessibility.
// The iOS focus-zoom annoyance is fixed via 16px form controls in globals.css.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Freight Link Network",
              url: siteUrl,
              logo: `${siteUrl}/FLNSITELOGO.png`,
              description:
                "South Africa's B2B freight platform connecting verified suppliers and transporters.",
              areaServed: "ZA",
            }),
          }}
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
