"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Truck,
  Package,
  ShieldCheck,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Building2,
  Users,
  Globe,
  X,
  Phone,
  FileText,
  Clock,
  TrendingUp,
  Zap,
  Star,
  Route,
  Fuel,
  BadgeCheck,
  BarChart3,
} from "lucide-react";

// ─── Animation variants ────────────────────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.15 } },
  viewport: { once: true },
};

const cardVariant = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

// ─── Floating decorative element ──────────────────────────────────────────

function FloatingIcon({
  icon: Icon,
  className,
  delay = 0,
  size = 20,
}: {
  icon: React.ElementType;
  className?: string;
  delay?: number;
  size?: number;
}) {
  return (
    <motion.div
      className={`absolute flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm ${className}`}
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <Icon size={size} className="text-white/40" />
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function LandingPage() {
  const industries = [
    "Mining",
    "Agriculture",
    "Manufacturing",
    "Retail",
    "Construction",
    "FMCG",
    "Automotive",
    "Petrochemical",
    "Pharmaceuticals",
    "Steel & Metals",
  ];

  const stats = [
    { value: "200+", label: "Active Transporters" },
    { value: "2 000+", label: "Possible Loads" },
    { value: "9", label: "Provinces Covered" },
    { value: "6", label: "Countries Served" },
  ];

  const oldWay = [
    "Cold-calling dozens of truckers",
    "Managing bookings via WhatsApp & spreadsheets",
    "No visibility on truck compliance status",
    "Chasing invoices and paper-based PODs",
    "Unreliable load tracking and ETAs",
    "No cross-border documentation support",
  ];

  const flnWay = [
    "Browse a verified transporter network instantly",
    "Post loads and receive interest in real time",
    "All carriers verified — CIPC, PDP & tax clearance",
    "Digital load management from post to delivery",
    "Live load status and map tracking",
    "Full cross-border corridor support",
  ];

  const features = [
    {
      icon: Package,
      title: "For Suppliers",
      desc: "Post freight loads in minutes, upload compliance documents, monitor load status end-to-end, and manage your company profile — all from a single dashboard.",
      color: "#9B2640",
      bg: "#9B264010",
    },
    {
      icon: Truck,
      title: "For Transporters",
      desc: "Browse approved loads, manage your full fleet — trucks, trailers, and drivers — upload fleet documents, and grow your logistics business across SA.",
      color: "#06082C",
      bg: "#06082C12",
    },
    {
      icon: ShieldCheck,
      title: "Verified & Compliant",
      desc: "Every company on the platform is reviewed by our admin team. CIPC certificates, tax clearance, and PDP licences are checked before any account goes live.",
      color: "#059669",
      bg: "#05966910",
    },
  ];

  const steps = [
    {
      icon: Users,
      step: "01",
      title: "Register",
      desc: "Create your account in under two minutes. Choose your role — freight supplier or transporter.",
    },
    {
      icon: Building2,
      step: "02",
      title: "Setup Your Company",
      desc: "Complete your company profile and upload the required compliance documents for verification.",
    },
    {
      icon: BadgeCheck,
      step: "03",
      title: "Get Verified",
      desc: "Our team reviews your submission, approves your documents, and activates your account.",
    },
    {
      icon: MapPin,
      step: "04",
      title: "Start Moving Freight",
      desc: "Post loads, browse freight opportunities, and connect with partners across South Africa and beyond.",
    },
  ];

  const saReasons = [
    {
      icon: Fuel,
      title: "Rising Diesel Costs",
      desc: "Empty return trips cost the SA trucking industry billions annually. FLN matches loads to routes, reducing dead kilometres.",
    },
    {
      icon: Route,
      title: "Cross-Border Corridors",
      desc: "Supporting freight routes to Namibia, Zimbabwe, Mozambique, Botswana, Lesotho, and Eswatini — the region's busiest corridors.",
    },
    {
      icon: FileText,
      title: "CIPC & Compliance First",
      desc: "SA-specific compliance built in — CIPC certificates, PDP licences, roadworthy certificates, and tax clearance are mandatory.",
    },
    {
      icon: BarChart3,
      title: "Fragmented Industry",
      desc: "Over 80% of SA freight is moved by road, yet the sector remains highly fragmented. FLN creates a connected, trusted network.",
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative bg-[#06082C] pt-32 pb-0 px-4 overflow-hidden">
        {/* Background gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#06082C] via-[#0a0e40] to-[#06082C]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(155,38,64,0.15),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(10,14,64,0.4),_transparent_60%)]" />

        {/* Decorative floating icons */}
        <FloatingIcon icon={Truck} className="w-14 h-14 top-28 left-[8%]" delay={0} size={24} />
        <FloatingIcon icon={Package} className="w-12 h-12 top-40 right-[10%]" delay={1.2} size={20} />
        <FloatingIcon icon={MapPin} className="w-10 h-10 top-64 left-[18%]" delay={0.6} size={18} />
        <FloatingIcon icon={Route} className="w-12 h-12 top-48 right-[22%]" delay={2} size={20} />
        <FloatingIcon icon={ShieldCheck} className="w-11 h-11 bottom-32 left-[12%]" delay={1.5} size={18} />
        <FloatingIcon icon={Globe} className="w-10 h-10 bottom-24 right-[14%]" delay={0.3} size={18} />

        {/* Grid dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/8 text-white/75 text-sm px-4 py-1.5 rounded-full mb-8 border border-white/15"
          >
            <Globe size={14} />
            South Africa&apos;s Leading B2B Logistics Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-[1.05] tracking-tight"
          >
            Connect Freight.{" "}
            <span className="text-[#9B2640]">Move Smarter.</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/65 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Freight Link Network connects South African suppliers with verified,
            compliant transporters. Post loads, find trucks, and track shipments
            — all in one trusted platform.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-[#9B2640] hover:bg-[#7d1e33] text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/15 text-white font-semibold px-8 py-4 rounded-xl border border-white/20 transition-colors text-base"
            >
              Sign In to Your Account
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-20 border-t border-white/10 pt-10 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs text-white/45 mt-1.5 font-medium uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Hero bottom fade into next section */}
          <div className="h-20 w-full mt-10 bg-gradient-to-b from-transparent to-white/0" />
        </div>

        {/* Wave divider */}
        <div className="relative -mb-px -mx-4">
          <svg
            viewBox="0 0 1440 80"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full block"
            preserveAspectRatio="none"
            style={{ display: "block" }}
          >
            <path
              d="M0,80 L0,55 C360,0 1080,90 1440,40 L1440,80 Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* ─── TRUSTED BY ───────────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.p
            {...fadeInUp}
            className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8"
          >
            Trusted by companies across South Africa
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {industries.map((industry, i) => (
              <motion.span
                key={industry}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-600"
              >
                {industry}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── PROBLEM / SOLUTION ───────────────────────────────────────── */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Freight Management,{" "}
              <span className="text-[#9B2640]">Reimagined</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              The South African logistics industry has been running on phone calls
              and spreadsheets for too long. There&apos;s a better way.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Old Way */}
            <motion.div
              {...fadeInUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-2xl border border-red-100 p-8 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <Phone size={18} className="text-red-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-400 uppercase tracking-wider">
                    Before FLN
                  </p>
                  <h3 className="text-lg font-bold text-gray-900">The Old Way</h3>
                </div>
              </div>
              <ul className="space-y-3">
                {oldWay.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                      <X size={12} className="text-red-500" />
                    </div>
                    <span className="text-sm text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* FLN Way */}
            <motion.div
              {...fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#06082C] rounded-2xl border border-[#0a0e40] p-8 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Zap size={18} className="text-[#9B2640]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#9B2640] uppercase tracking-wider">
                    With FLN
                  </p>
                  <h3 className="text-lg font-bold text-white">The FLN Way</h3>
                </div>
              </div>
              <ul className="space-y-3">
                {flnWay.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                    </div>
                    <span className="text-sm text-white/75">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              A complete logistics platform purpose-built for the South African
              market — from first load post to final delivery.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={cardVariant}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: f.bg }}
                >
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                <div
                  className="mt-6 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  style={{ color: f.color }}
                >
                  Learn more <ArrowRight size={13} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Up and Running in Minutes
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Our streamlined onboarding gets you from sign-up to first load in
              four simple steps.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-9 left-[calc(12.5%+28px)] right-[calc(12.5%+28px)] h-px bg-gradient-to-r from-gray-200 via-[#9B2640]/30 to-gray-200" />

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-4 gap-8"
            >
              {steps.map((s, i) => (
                <motion.div
                  key={s.step}
                  variants={cardVariant}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="text-center relative"
                >
                  {/* Step number circle */}
                  <div className="w-16 h-16 bg-[#06082C] rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10 shadow-md">
                    <s.icon size={26} className="text-white" />
                  </div>
                  <div className="text-xs font-extrabold text-[#9B2640] mb-1.5 tracking-widest">
                    STEP {s.step}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── WHY SA NEEDS THIS ────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: text content */}
            <motion.div {...fadeInUp}>
              <p className="text-xs font-bold text-[#9B2640] uppercase tracking-widest mb-3">
                Built for South Africa
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-5 leading-snug">
                Why SA&apos;s Road Freight Industry Needs FLN
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                South Africa moves over 80% of its goods by road. With rising
                diesel costs, regulatory complexity, and a fragmented carrier
                market, the industry urgently needs a trusted digital
                infrastructure layer. Freight Link Network was built to provide
                exactly that.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {saReasons.map((reason, i) => (
                  <motion.div
                    key={reason.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex gap-3"
                  >
                    <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border border-gray-100">
                      <reason.icon size={16} className="text-[#06082C]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 mb-1">
                        {reason.title}
                      </p>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {reason.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: visual block */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              {/* Main image placeholder */}
              <div className="bg-[#06082C] rounded-3xl aspect-[4/3] flex items-center justify-center relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(155,38,64,0.3),_transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(10,14,64,0.6),_transparent_60%)]" />
                {/* Route visualisation placeholder */}
                <div className="relative z-10 text-center px-8">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                      <Route size={32} className="text-white/60" />
                    </div>
                  </div>
                  <p className="text-white/50 text-sm font-medium">
                    Cross-border freight corridors
                  </p>
                  <p className="text-white/30 text-xs mt-1">
                    SA · Namibia · Zimbabwe · Mozambique · Botswana · Lesotho · Eswatini
                  </p>
                </div>
                {/* Decorative dots */}
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, white 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />
              </div>

              {/* Floating stat cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl border border-gray-100 px-5 py-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <TrendingUp size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Loads this month</p>
                  <p className="text-lg font-extrabold text-gray-900">+247</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl border border-gray-100 px-5 py-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-[#9B2640]/10 rounded-xl flex items-center justify-center">
                  <Clock size={18} className="text-[#9B2640]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Avg. match time</p>
                  <p className="text-lg font-extrabold text-gray-900">&lt; 2 hrs</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIAL ──────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeInUp}>
            {/* Stars */}
            <div className="flex justify-center gap-1 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className="text-amber-400 fill-amber-400"
                />
              ))}
            </div>

            <blockquote className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-8">
              &ldquo;Before FLN, finding a compliant, reliable transporter for our
              cross-border loads took days of phone calls. Now we post a load and
              have verified interest within hours. It&apos;s completely changed
              how we operate.&rdquo;
            </blockquote>

            <div className="flex items-center justify-center gap-3">
              <div className="w-11 h-11 bg-[#9B2640] rounded-full flex items-center justify-center text-white font-bold text-sm">
                KM
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">Kgomotso Mokoena</p>
                <p className="text-xs text-gray-500">Logistics Manager · Mining Supplier, Gauteng</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-[#06082C] relative overflow-hidden">
        {/* Background accents */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(155,38,64,0.2),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(10,14,64,0.5),_transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div {...fadeInUp}>
            <div className="inline-flex items-center gap-2 bg-white/8 text-white/70 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/15 uppercase tracking-wider">
              <Zap size={12} />
              Free to register
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
              Ready to Move Freight Smarter?
            </h2>
            <p className="text-white/55 mb-10 text-lg max-w-xl mx-auto leading-relaxed">
              Join hundreds of South African businesses already using Freight Link
              Network to connect, verify, and move freight across the continent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-[#9B2640] hover:bg-[#7d1e33] text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
              >
                Create Free Account
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/15 text-white font-semibold px-8 py-4 rounded-xl border border-white/20 transition-colors text-base"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
