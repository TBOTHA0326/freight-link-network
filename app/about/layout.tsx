import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Freight Link Network engineers road, rail and intermodal freight solutions across South Africa — designing the lowest-cost way to move freight and executing it through a verified transport network.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Freight Link Network",
    description:
      "We don't just move freight — we engineer the system that moves it. Road, rail and intermodal solutions across South Africa.",
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
