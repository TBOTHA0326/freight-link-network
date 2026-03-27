"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Clock, ArrowRight, Tag } from "lucide-react";

const POSTS = [
  {
    slug: "freight-south-africa-guide",
    title: "Freight in South Africa: The Complete Guide for 2024",
    excerpt:
      "Everything you need to know about moving freight across South Africa — regulations, corridors, compliance requirements, and how technology is reshaping the industry.",
    category: "Industry Guide",
    readTime: "8 min read",
    date: "March 2024",
    image: "#06082C",
  },
  {
    slug: "freight-loads-find-transport",
    title: "How to Find Reliable Transport for Your Freight Loads",
    excerpt:
      "Sourcing compliant, reliable trucks for your freight loads doesn't have to mean hours on the phone. Learn how digital freight matching is changing the game for SA suppliers.",
    category: "For Suppliers",
    readTime: "6 min read",
    date: "March 2024",
    image: "#9B2640",
  },
  {
    slug: "diesel-price-impact-transporters",
    title: "Diesel Prices & SA Trucking: How to Protect Your Margins",
    excerpt:
      "South African diesel prices are among the most volatile in the region. We break down how rising fuel costs are squeezing transporters — and how smarter load matching helps reduce empty kilometres.",
    category: "For Transporters",
    readTime: "7 min read",
    date: "February 2024",
    image: "#1a3a2a",
  },
  {
    slug: "cross-border-freight-africa",
    title: "Cross-Border Freight in Southern Africa: Corridors, Compliance & Costs",
    excerpt:
      "Moving freight between South Africa, Namibia, Zimbabwe, Mozambique, Botswana, Lesotho, and Eswatini requires the right documentation, the right partners, and the right platform.",
    category: "Cross-Border",
    readTime: "9 min read",
    date: "February 2024",
    image: "#2a1a0e",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Industry Guide": "bg-blue-50 text-blue-700 border-blue-100",
  "For Suppliers": "bg-[#9B2640]/10 text-[#9B2640] border-[#9B2640]/20",
  "For Transporters": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Cross-Border": "bg-amber-50 text-amber-700 border-amber-100",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#06082C] pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(155,38,64,0.15),_transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-bold text-[#9B2640] uppercase tracking-widest mb-3"
          >
            Insights & Resources
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight"
          >
            The FLN Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Industry insights, compliance guides, and freight intelligence for South African logistics businesses.
          </motion.p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {POSTS.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Card image area */}
                <div
                  className="h-44 flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: post.image }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(255,255,255,0.05),_transparent_60%)]" />
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                  <span className="relative text-white/20 text-6xl font-black tracking-tighter select-none">
                    FLN
                  </span>
                </div>

                {/* Card body */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[post.category]}`}
                    >
                      <Tag size={10} />
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={11} />
                      {post.readTime}
                    </span>
                    <span className="text-xs text-gray-400">{post.date}</span>
                  </div>

                  <h2 className="text-lg font-bold text-gray-900 mb-3 leading-snug group-hover:text-[#06082C] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#06082C] hover:text-[#9B2640] transition-colors"
                  >
                    Read Article
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">
              Ready to experience FLN firsthand?
            </h2>
            <p className="text-gray-500 mb-8">
              Join South Africa&apos;s growing network of verified freight suppliers and transporters.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold px-8 py-4 rounded-xl transition-colors"
            >
              Get Started Free
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
