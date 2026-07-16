import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on South African freight, logistics, compliance, diesel costs, and cross-border haulage from Freight Link Network.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Freight Link Network Blog",
    description:
      "Insights on South African freight, logistics, compliance, and cross-border haulage.",
    url: "/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
