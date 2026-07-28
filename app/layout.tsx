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
    default: "Freight Link Network — Engineered Road, Rail & Intermodal Logistics",
    template: "%s | Freight Link Network",
  },
  description:
    "Freight Link Network engineers road, rail and intermodal freight solutions across South Africa and seven cross-border corridors — designing the lowest-cost way to move your freight and executing it through a verified transport network.",
  keywords: [
    "logistics engineering South Africa",
    "road rail intermodal",
    "rail freight South Africa",
    "road versus rail",
    "freight solutions",
    "cross-border freight",
    "intermodal logistics",
    "cost per tonne",
    "supply chain diagnostic",
    "trucking South Africa",
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
    title: "Freight Link Network — Engineered Road, Rail & Intermodal Logistics",
    description:
      "We don't just move freight — we engineer the system that moves it. Road, rail and intermodal solutions across South Africa and beyond.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Freight Link Network — Engineered Road, Rail & Intermodal Logistics",
    description:
      "We engineer the lowest-cost road, rail and intermodal freight solutions across South Africa.",
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
                "Engineered road, rail and intermodal freight solutions across South Africa, delivered through a verified transport network.",
              areaServed: "ZA",
            }),
          }}
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
