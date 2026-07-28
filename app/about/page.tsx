"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Eye,
  MapPin,
  Gauge,
  ArrowRight,
  Globe,
  Truck,
  Train,
  Scale,
  Heart,
} from "lucide-react";

const VALUES = [
  {
    icon: Gauge,
    title: "Engineering-Led",
    description:
      "We don't default to road. We diagnose the operation, compare road, rail and intermodal, and design to the lowest total delivered cost — then prove it with the numbers before anything moves.",
  },
  {
    icon: ShieldCheck,
    title: "Trust & Verification",
    description:
      "Every operator in our execution network is verified before activation. CIPC certificates, tax clearance, and PDP licences are reviewed by our team, so every solution is delivered by partners you can trust.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description:
      "No hidden fees, no mystery pricing. Cost per tonne, standing time and total delivered cost are modelled up front. Every action on the platform is tracked and auditable.",
  },
  {
    icon: Heart,
    title: "SA-First",
    description:
      "Built specifically for the South African market — our corridors, compliance categories, and provincial coverage reflect the realities of moving freight here, by road and by rail.",
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
  "Zambia",
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
            Road · Rail · Intermodal — Engineered Logistics
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
            We don&apos;t just move freight — we engineer the system that moves
            it. FLN designs the right road, rail or intermodal solution and
            executes it through a verified transport network.
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
                Engineering the cheapest, most reliable way to move freight
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Most freight in South Africa defaults to road, one truck at a
                time — with no analysis of whether it&apos;s the right mode, the
                right capacity, or the right cost. That inefficiency is paid for
                in empty kilometres, standing time and inflated delivered cost.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our mission is to bring road and rail together into engineered
                solutions — diagnosing the operation, comparing every mode, and
                designing the combination that delivers the lowest total cost,
                then executing it through a verified network of operators.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Truck, label: "Verified Operators", value: "200+" },
                { icon: MapPin, label: "SA Provinces", value: "9" },
                { icon: Globe, label: "Cross-Border Countries", value: "7" },
                { icon: ShieldCheck, label: "Compliance Verified", value: "100%" },
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
              Born out of a system that only knew one answer
            </h2>
            <p className="text-gray-600 leading-relaxed mb-5">
              For years, freight in South Africa has been booked, not designed.
              Every load went to road by default, sourced through phone calls and
              WhatsApp groups, with no comparison of cost per tonne, no capacity
              planning, and no consideration of whether rail could do it cheaper.
            </p>
            <p className="text-gray-600 leading-relaxed mb-5">
              Freight Link Network was founded to change that. We treat freight as
              an engineering problem — evaluating the product, route,
              infrastructure and volume, then designing the optimal road, rail or
              intermodal solution. And we opened rail up to the smaller operator:
              by aggregating and engineering volume, businesses that were always
              told they were too small can now access rail economics that were
              previously out of reach.
            </p>
            <p className="text-gray-600 leading-relaxed">
              The transporter network isn&apos;t the product — it&apos;s how we
              deliver the design. Every operator is verified, every solution is
              quantified, and every corridor is planned. That&apos;s logistics
              that actually works.
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
              Road &amp; Rail, Across the Region
            </h2>
            <p className="text-white/60 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
              Full coverage across all nine provinces, with road and rail
              solutions on seven cross-border corridors.
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
                <h3 className="font-semibold text-white">Cross-Border Corridors</h3>
              </div>
              <p className="text-sm text-white/60 mb-5 leading-relaxed">
                We engineer road, rail and intermodal solutions across seven
                neighbouring countries, with full compliance tracking for
                cross-border documentation.
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

      {/* Modes strip */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: Truck,
              title: "Road",
              desc: "Flexible, door-to-door capacity for shorter hauls and time-sensitive freight.",
            },
            {
              icon: Train,
              title: "Rail",
              desc: "Lower cost per tonne over distance for high-volume and bulk commodities.",
            },
            {
              icon: Scale,
              title: "Intermodal",
              desc: "Road and rail combined into one flow, engineered for the lowest total cost.",
            },
          ].map((m) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
            >
              <div className="w-10 h-10 rounded-xl bg-[#06082C] flex items-center justify-center mb-4">
                <m.icon size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{m.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 bg-gray-50">
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
              Logistics engineers, not just brokers
            </h2>
            <p className="text-gray-600 leading-relaxed mb-5">
              Our team combines deep experience in South African logistics, rail
              and road operations, technology and compliance. We understand the
              corridors, the infrastructure, the regulations, and the real
              economics of moving freight here.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              We are committed to building solutions the South African freight
              industry can rely on — not just a tool, but a long-term partner in
              designing and running smarter logistics.
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
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Let&apos;s Engineer Your Logistics Solution
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Whether you need a freight solution designed, or you&apos;re an
              operator who wants to join our verified execution network — register
              today and let&apos;s build something that works.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-[#9B2640] hover:bg-[#7d1e33] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
              >
                Get Started Free
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
