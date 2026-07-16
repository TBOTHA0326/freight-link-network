import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Freight Link Network. Questions about posting loads, joining as a transporter, or platform support — we're here to help.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Freight Link Network",
    description:
      "Get in touch with the Freight Link Network team for support or partnership enquiries.",
    url: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
