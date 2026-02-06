import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from '@/components/Navbar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Get the site URL from environment or default
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'https://freightlinknetwork.co.za';

export const metadata: Metadata = {
  title: {
    default: 'Freight Link Network',
    template: '%s | Freight Link Network',
  },
  description: 'Connecting transporters and suppliers across South Africa. Streamline your logistics operations with our comprehensive platform.',
  keywords: ['logistics', 'freight', 'transport', 'suppliers', 'transporters', 'south africa', 'logistics platform'],
  authors: [{ name: 'Freight Link Network' }],
  openGraph: {
    title: 'Freight Link Network',
    description: 'Connecting transporters and suppliers across South Africa. Streamline your logistics operations with our comprehensive platform.',
    url: siteUrl,
    siteName: 'Freight Link Network',
    images: [
      {
        url: '/FLNSITELOGOSMALL.png',
        width: 1200,
        height: 630,
        alt: 'Freight Link Network logo',
      },
      '/FLNSITELOGO.png',
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Freight Link Network',
    description: 'Connecting transporters and suppliers across South Africa. Streamline your logistics operations with our comprehensive platform.',
    images: ['/FLNSITELOGOSMALL.png'],
  },
  icons: {
    icon: '/FLNSITELOGOSMALL.png',
    shortcut: '/FLNSITELOGOSMALL.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const metadataBase = new URL(siteUrl);

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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
