"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Eye,
  MapPin,
  FileCheck,
  ArrowRight,
  Globe,
  Truck,
  Users,
  Heart,
} from "lucide-react";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Trust & Verification",
    description:
      "Every company on FLN is verified before they can post or accept loads. CIPC certificates, tax clearance, and compliance documents are reviewed by our team so you always know who you're dealing with.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description:
      "No hidden fees, no mystery pricing. Load budgets are visible upfront. Document statuses are clear. Every action on the platform is tracked and auditable.",
  },
  {
    icon: Heart,
    title: "SA-First",
    description:
      "Built specifically for the South African market — our business rules, compliance categories, and provincial coverage reflect the realities of doing logistics in SA, not a copy-paste from overseas.",
  },
  {
    icon: FileCheck,
    title: "Compliance",
    description:
      "PDP licences, roadworthy certificates, brake tests — we take fleet compliance seriously. Transporters are required to keep documents current, giving suppliers confidence in every match.",
  },
];

const SA_PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Free State",
  "Northern Cape",
];

const CROSS_BORDER = [
  "Namibia",
  "Zimbabwe",
  "Mozambique",
  "Botswana",
  "Lesotho",
  "Eswatini",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#06082C] pt-32 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#06082C] via-[#0a0e40] to-[#06082C] opacity-80" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm px-4 py-1.5 rounded-full mb-6 border border-white/20"
          >
            <Globe size={14} />
            South Africa&apos;s B2B Logistics Platform
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
          >
            About Freight Link Network
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            We are connecting South Africa&apos;s suppliers and transporters on one
            verified, compliant, digital platform — reducing empty kilometres and
            building a stronger logistics economy.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <span className="text-[#9B2640] font-semibold text-sm uppercase tracking-widest">
                Our Mission
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mt-3 mb-5 leading-snug">
                Connecting suppliers and transporters to move South Africa forward
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Every day, thousands of trucks travel South African roads with empty
                loads — wasted capacity that costs transporters money and inflates
                logistics costs for suppliers. Freight Link Network exists to eliminate
                that inefficiency.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our mission is to create a trusted, digital marketplace where freight
                owners can post loads with confidence, verified transporters can find
                work efficiently, and South Africa&apos;s logistics economy grows stronger
                as a result.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Truck, label: "Verified Transporters", value: "200+" },
                { icon: Users, label: "Active Suppliers", value: "50+" },
                { icon: MapPin, label: "Provinces Covered", value: "9" },
                { icon: Globe, label: "SADC Countries", value: "6" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-center"
                >
                  <stat.icon size={22} className="text-[#9B2640] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-[#06082C]">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-[#9B2640] font-semibold text-sm uppercase tracking-widest">
              Our Story
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mt-3 mb-6">
              Born out of a broken system
            </h2>
            <p className="text-gray-600 leading-relaxed mb-5">
              For years, freight matching in South Africa relied on phone calls, WhatsApp
              groups, and handshake agreements. Suppliers had no way to verify a transporter&apos;s
              compliance. Transporters had no reliable channel to find consistent work.
              Deals fell through. Documents were forged. Empty kilometres piled up.
            </p>
            <p className="text-gray-600 leading-relaxed mb-5">
              Freight Link Network was founded to fix this. We built a platform that
              brings digital verification, structured compliance document review, and
              real-time load matching to South Africa&apos;s road freight industry — replacing
              informal chaos with a trusted, auditable system.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Today, every company on FLN has been reviewed. Every load is posted with
              full details. Every transporter&apos;s fleet documents are on file. That&apos;s the
              foundation of a logistics network that actually works.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <span className="text-[#9B2640] font-semibold text-sm uppercase tracking-widest">
              What We Stand For
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mt-3">Our Values</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
              >
                <div className="w-10 h-10 rounded-xl bg-[#06082C] flex items-center justify-center mb-4">
                  <val.icon size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{val.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{val.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SA Focus */}
      <section className="py-20 px-4 bg-[#06082C]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <span className="text-[#9B2640] font-semibold text-sm uppercase tracking-widest">
              Where We Operate
            </span>
            <h2 className="text-3xl font-bold text-white mt-3">
              Built for South Africa
            </h2>
            <p className="text-white/60 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
              Full coverage across all nine provinces, with cross-border support for
              six SADC countries.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-10">
            {/* Provinces */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-lg bg-[#9B2640] flex items-center justify-center">
                  <MapPin size={18} className="text-white" />
                </div>
                <h3 className="font-semibold text-white">All 9 Provinces</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SA_PROVINCES.map((prov) => (
                  <div key={prov} className="flex items-center gap-2 text-sm text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9B2640] flex-shrink-0" />
                    {prov}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Cross-border */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-lg bg-[#9B2640] flex items-center justify-center">
                  <Globe size={18} className="text-white" />
                </div>
                <h3 className="font-semibold text-white">Cross-Border SADC</h3>
              </div>
              <p className="text-sm text-white/60 mb-5 leading-relaxed">
                FLN supports cross-border freight loads to and from six neighbouring
                SADC countries, with compliance tracking for cross-border documentation.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CROSS_BORDER.map((country) => (
                  <div key={country} className="flex items-center gap-2 text-sm text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0" />
                    {country}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-[#9B2640] font-semibold text-sm uppercase tracking-widest">
              The Team
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mt-3 mb-5">
              Passionate about logistics and South Africa
            </h2>
            <p className="text-gray-600 leading-relaxed mb-5">
              Our team combines deep experience in South African logistics, technology,
              and compliance. We understand the roads, the regulations, and the real
              challenges that transporters and suppliers face every day.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              We are committed to building a platform that the South African freight
              industry can rely on — not just as a tool, but as a long-term partner in
              growth and compliance.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Get in Touch
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Join the Freight Link Network
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Whether you are a supplier looking for reliable transporters or a
              transporter looking for consistent freight loads — register today and
              become part of South Africa&apos;s verified logistics network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-[#9B2640] hover:bg-[#7d1e33] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
              >
                Register Now
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-100 font-semibold px-8 py-3.5 rounded-xl transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
