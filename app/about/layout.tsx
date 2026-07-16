import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Freight Link Network — South Africa's purpose-built B2B freight platform connecting verified suppliers and transporters with full compliance management.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Freight Link Network",
    description:
      "South Africa's purpose-built B2B freight platform connecting verified suppliers and transporters.",
    url: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
