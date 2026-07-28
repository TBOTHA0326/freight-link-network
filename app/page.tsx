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
  Globe,
  X,
  Phone,
  Zap,
  Star,
  Route,
  BarChart3,
  Train,
  Scale,
  Layers,
  Warehouse,
  Gauge,
  Calculator,
  Settings,
  Network,
  Stethoscope,
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

  const stats: { value: string; label: string; valueClass?: string }[] = [
    { value: "9", label: "SA Provinces" },
    { value: "7", label: "Cross-Border Countries" },
    { value: "100%", label: "Compliance Verified" },
    {
      value: "Road + Rail",
      label: "Modes Engineered",
      valueClass: "text-2xl md:text-3xl",
    },
  ];

  const modes = [
    {
      icon: Truck,
      title: "Road",
      desc: "Flexible, fast and door-to-door. The right answer for shorter hauls, time-sensitive freight and lower volumes.",
      color: "#9B2640",
      bg: "#9B264010",
    },
    {
      icon: Train,
      title: "Rail",
      desc: "Dramatically lower cost per tonne over distance. The right answer for high-volume, long-haul and bulk commodities.",
      color: "#06082C",
      bg: "#06082C12",
    },
    {
      icon: Layers,
      title: "Intermodal",
      desc: "The best of both — first-mile road to the siding, rail for the long haul, last-mile road to the door. One engineered flow.",
      color: "#059669",
      bg: "#05966910",
    },
  ];

  const commodityWay = [
    "Book whatever truck is available",
    "Road by default, every single time",
    "No comparison of total delivered cost",
    "Capacity guessed, not calculated",
    "No corridor or feasibility study",
    "Empty runs and standing time absorbed as cost",
  ];

  const engineeredWay = [
    "Diagnose the operation before we quote",
    "Compare road, rail and intermodal options",
    "Design to the lowest total delivered cost",
    "Capacity engineered — trucks, wagons, throughput",
    "Corridor feasibility assessed up front",
    "Executed through a verified transport network",
  ];

  const services = [
    {
      icon: Stethoscope,
      title: "Supply-Chain Diagnostic",
      desc: "Review the existing operation and identify cost, capacity and performance constraints.",
    },
    {
      icon: Route,
      title: "Corridor Feasibility Study",
      desc: "Assess whether a proposed corridor is commercially and operationally viable.",
    },
    {
      icon: Scale,
      title: "Road-versus-Rail Analysis",
      desc: "Compare total cost, transit time, capacity, infrastructure and risk across modes.",
    },
    {
      icon: Layers,
      title: "Intermodal Design",
      desc: "Design first-mile road, terminal transfer, rail movement and last-mile delivery as one system.",
    },
    {
      icon: Warehouse,
      title: "Terminal & Siding Assessment",
      desc: "Evaluate location, track access, loading methods, stockholding, equipment and throughput.",
    },
    {
      icon: Gauge,
      title: "Capacity Engineering",
      desc: "Determine the trucks, wagons, train frequency, loading, warehouse and stockpile capacity required.",
    },
    {
      icon: Calculator,
      title: "Cost Engineering",
      desc: "Calculate cost per tonne and per kilometre, handling, storage, standing time and total delivered cost.",
    },
    {
      icon: Settings,
      title: "Implementation Management",
      desc: "Convert the approved design into a fully running operation.",
    },
  ];

  const capacityItems = [
    "Trucks required",
    "Wagons required",
    "Train frequency",
    "Loading capacity",
    "Warehouse capacity",
    "Stockpile size",
    "Labour & equipment",
  ];

  const costItems = [
    "Cost per tonne",
    "Cost per kilometre",
    "Handling cost",
    "Storage cost",
    "Standing-time exposure",
    "Rail vs road comparison",
    "Total delivered cost",
    "Margin & cash-flow",
  ];

  const process = [
    {
      icon: Stethoscope,
      step: "01",
      title: "Diagnose",
      desc: "We review your product, volumes, routes, infrastructure and commercial requirements.",
    },
    {
      icon: Layers,
      step: "02",
      title: "Design",
      desc: "We compare road, rail and intermodal, then design the optimal system end to end.",
    },
    {
      icon: Gauge,
      step: "03",
      title: "Engineer",
      desc: "We calculate the capacity and cost — trucks, wagons, throughput and total delivered cost.",
    },
    {
      icon: Settings,
      step: "04",
      title: "Implement",
      desc: "We deploy the verified network and convert the design into a running operation.",
    },
  ];

  const networkProvides = [
    "Road capacity",
    "Specialist trailers",
    "Cross-border capability",
    "First- & last-mile transport",
    "Rapid capacity deployment",
    "Route-specific operators",
  ];

  const saReasons = [
    {
      icon: Scale,
      title: "Lowest Total Delivered Cost",
      desc: "We compare road, rail and intermodal to find the cheapest reliable answer — not just the first available truck.",
    },
    {
      icon: Train,
      title: "Rail Where It Wins",
      desc: "For high-volume and long-haul freight, rail can dramatically cut cost per tonne. We design the road-rail-road flow around it.",
    },
    {
      icon: Route,
      title: "Cross-Border Corridors",
      desc: "Road and rail solutions across Namibia, Zimbabwe, Zambia, Mozambique, Botswana, Lesotho and Eswatini.",
    },
    {
      icon: BarChart3,
      title: "Engineered, Not Guessed",
      desc: "Capacity and cost are calculated up front — trucks, wagons, throughput and total delivered cost.",
    },
  ];

  const crossBorder =
    "SA · Namibia · Zimbabwe · Zambia · Mozambique · Botswana · Lesotho · Eswatini";

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
        <FloatingIcon icon={Train} className="w-12 h-12 top-40 right-[10%]" delay={1.2} size={22} />
        <FloatingIcon icon={MapPin} className="w-10 h-10 top-64 left-[18%]" delay={0.6} size={18} />
        <FloatingIcon icon={Route} className="w-12 h-12 top-48 right-[22%]" delay={2} size={20} />
        <FloatingIcon icon={Package} className="w-11 h-11 bottom-32 left-[12%]" delay={1.5} size={18} />
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
            <Network size={14} />
            Road · Rail · Intermodal — Engineered Logistics
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-[1.08] tracking-tight"
          >
            We Don&apos;t Just Move Freight.{" "}
            <span className="text-[#9B2640]">
              We Engineer the System That Moves It.
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/65 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Every logistics challenge is different. FLN evaluates your product,
            route, infrastructure, volume and commercial requirements — then
            designs the right road, rail or intermodal solution and executes it
            through a verified transport network.
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
              Onboard with FLN
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/15 text-white font-semibold px-8 py-4 rounded-xl border border-white/20 transition-colors text-base"
            >
              Talk to Our Engineers
            </Link>
          </motion.div>

          {/* Live network callout */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex justify-center"
          >
            <div className="inline-flex items-center gap-5 sm:gap-8 bg-white/8 border border-white/15 rounded-2xl px-6 sm:px-9 py-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-xl bg-[#9B2640]/25 border border-[#9B2640]/40 flex items-center justify-center flex-shrink-0">
                  <Network size={18} className="text-white" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-2xl md:text-3xl font-extrabold text-white leading-none">
                    87
                  </p>
                  <p className="text-[11px] text-white/50 mt-1 uppercase tracking-wide">
                    Verified Transporters
                  </p>
                </div>
              </div>

              <div className="w-px h-10 bg-white/15" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                  <Truck size={18} className="text-white/75" />
                </div>
                <div className="text-left">
                  <p className="text-2xl md:text-3xl font-extrabold text-white leading-none">
                    497
                  </p>
                  <p className="text-[11px] text-white/50 mt-1 uppercase tracking-wide">
                    Vehicles in the Network
                  </p>
                </div>
              </div>
            </div>
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
                <p
                  className={`${stat.valueClass ?? "text-3xl md:text-4xl"} font-extrabold text-white tracking-tight whitespace-nowrap`}
                >
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
            Engineering freight solutions across South Africa
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

      {/* ─── MODES: ROAD + RAIL TOGETHER ──────────────────────────────── */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              We Bring Road and Rail{" "}
              <span className="text-[#9B2640]">Together</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Most freight defaults to road. We test every option — road, rail,
              or an intermodal mix — and engineer the combination that delivers
              the lowest total cost.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {modes.map((m) => (
              <motion.div
                key={m.title}
                variants={cardVariant}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: m.bg }}
                >
                  <m.icon size={22} style={{ color: m.color }} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {m.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{m.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Rail, opened up — for the smaller players */}
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 bg-[#06082C] rounded-2xl p-8 md:p-10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(155,38,64,0.18),_transparent_60%)]" />
            <div className="relative flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                <Train size={26} className="text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 bg-white/8 text-white/70 text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-white/15 uppercase tracking-wider">
                  Rail, opened up
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold text-white mb-2 leading-snug">
                  We make rail work for the smaller operator
                </h3>
                <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-3xl">
                  Rail has traditionally been the preserve of high-volume
                  shippers with dedicated contracts and their own sidings. FLN
                  aggregates and engineers volume so mid-sized and smaller
                  operations can access rail economics that were previously out
                  of reach — without needing the scale to go it alone.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── COMMODITY vs ENGINEERED ──────────────────────────────────── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Freight, Engineered —{" "}
              <span className="text-[#9B2640]">Not Just Booked</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Most logistics is booked. Ours is designed. We start with the
              problem, then engineer the cheapest, most reliable way to solve it.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Commodity */}
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
                    The Old Way
                  </p>
                  <h3 className="text-lg font-bold text-gray-900">
                    The Commodity Approach
                  </h3>
                </div>
              </div>
              <ul className="space-y-3">
                {commodityWay.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                      <X size={12} className="text-red-500" />
                    </div>
                    <span className="text-sm text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Engineered */}
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
                    The FLN Way
                  </p>
                  <h3 className="text-lg font-bold text-white">
                    The Engineered Approach
                  </h3>
                </div>
              </div>
              <ul className="space-y-3">
                {engineeredWay.map((item) => (
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

      {/* ─── SERVICES ─────────────────────────────────────────────────── */}
      <section id="services" className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <p className="text-xs font-bold text-[#9B2640] uppercase tracking-widest mb-3">
              What We Do
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              From Diagnostic to Running Operation
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              A complete engineering scope — we design the solution and see it
              through to implementation.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {services.map((s) => (
              <motion.div
                key={s.title}
                variants={cardVariant}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 rounded-xl bg-[#06082C] flex items-center justify-center mb-5">
                  <s.icon size={20} className="text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug">
                  {s.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CAPACITY & COST ENGINEERING ──────────────────────────────── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Engineered Down to the Tonne
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Every solution is quantified before anything moves. No guesswork —
              just the numbers that determine whether it works.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Capacity engineering */}
            <motion.div
              {...fadeInUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gray-50 rounded-2xl border border-gray-100 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-[#06082C] flex items-center justify-center">
                  <Gauge size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#9B2640] uppercase tracking-wider">
                    Capacity Engineering
                  </p>
                  <h3 className="text-lg font-bold text-gray-900">
                    We determine
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {capacityItems.map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle2
                      size={16}
                      className="text-[#06082C] flex-shrink-0"
                    />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Cost engineering */}
            <motion.div
              {...fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-50 rounded-2xl border border-gray-100 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-[#9B2640] flex items-center justify-center">
                  <Calculator size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#9B2640] uppercase tracking-wider">
                    Cost Engineering
                  </p>
                  <h3 className="text-lg font-bold text-gray-900">
                    We calculate
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {costItems.map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle2
                      size={16}
                      className="text-[#9B2640] flex-shrink-0"
                    />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── PROCESS ──────────────────────────────────────────────────── */}
      <section id="process" className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              How We Engineer a Solution
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              A structured path from understanding the problem to running the
              operation.
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
              {process.map((s, i) => (
                <motion.div
                  key={s.step}
                  variants={cardVariant}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="text-center relative"
                >
                  <div className="w-16 h-16 bg-[#06082C] rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10 shadow-md">
                    <s.icon size={26} className="text-white" />
                  </div>
                  <div className="text-xs font-extrabold text-[#9B2640] mb-1.5 tracking-widest">
                    STEP {s.step}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {s.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── EXECUTION NETWORK ────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-[#06082C] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(155,38,64,0.18),_transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <motion.div {...fadeInUp}>
              <div className="inline-flex items-center gap-2 bg-white/8 text-white/70 text-xs font-semibold px-3 py-1 rounded-full mb-5 border border-white/15 uppercase tracking-wider">
                <Network size={12} />
                The Execution Layer
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-5 leading-snug">
                A Verified Execution Network
              </h2>
              <p className="text-white/60 leading-relaxed mb-4">
                FLN maintains a verified execution network that lets engineered
                logistics solutions be implemented at scale. The network is not
                the product — it is how we deliver the design, integrated with
                rail for long-haul and bulk movements.
              </p>
              <p className="text-white/45 text-sm leading-relaxed mb-8">
                Every operator is reviewed before activation — CIPC registration,
                tax clearance and driver PDPs — so every solution is executed by
                partners you can trust.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#9B2640] hover:bg-[#7d1e33] text-white font-semibold px-6 py-3.5 rounded-xl transition-colors"
              >
                Operate With FLN — Join the Network
                <ArrowRight size={16} />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="grid grid-cols-2 gap-4"
            >
              {networkProvides.map((item, i) => {
                const icons = [Truck, Package, Globe, MapPin, Zap, Route];
                const Icon = icons[i % icons.length];
                return (
                  <div
                    key={item}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                      <Icon size={18} className="text-white/70" />
                    </div>
                    <p className="text-sm font-semibold text-white/85 leading-snug">
                      {item}
                    </p>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── WHY SA / CORRIDORS ───────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: text content */}
            <motion.div {...fadeInUp}>
              <p className="text-xs font-bold text-[#9B2640] uppercase tracking-widest mb-3">
                Built for South Africa
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-5 leading-snug">
                Road, Rail &amp; Every Corridor
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                South Africa moves over 80% of its goods by road, yet for the
                right freight, rail is far cheaper per tonne. We engineer the
                balance — across all nine provinces and seven cross-border
                corridors — to deliver the lowest total cost.
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
              <div className="bg-[#06082C] rounded-3xl aspect-[4/3] flex items-center justify-center relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(155,38,64,0.3),_transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(10,14,64,0.6),_transparent_60%)]" />
                <div className="relative z-10 text-center px-8">
                  <div className="flex justify-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                      <Truck size={26} className="text-white/60" />
                    </div>
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                      <Train size={26} className="text-white/60" />
                    </div>
                  </div>
                  <p className="text-white/50 text-sm font-medium">
                    Road, rail &amp; intermodal corridors
                  </p>
                  <p className="text-white/30 text-xs mt-1">{crossBorder}</p>
                </div>
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
                  <Scale size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">
                    Total delivered cost
                  </p>
                  <p className="text-lg font-extrabold text-gray-900">Modelled</p>
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
                  <Train size={18} className="text-[#9B2640]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">
                    Road + Rail
                  </p>
                  <p className="text-lg font-extrabold text-gray-900">Compared</p>
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
              &ldquo;FLN didn&apos;t just find us a truck — they redesigned our
              whole outbound flow. Moving the long-haul volume onto rail and
              keeping road for the last mile dropped our cost per tonne and
              solved our capacity problem.&rdquo;
            </blockquote>

            <div className="flex items-center justify-center gap-3">
              <div className="w-11 h-11 bg-[#9B2640] rounded-full flex items-center justify-center text-white font-bold text-sm">
                KM
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">
                  Kgomotso Mokoena
                </p>
                <p className="text-xs text-gray-500">
                  Logistics Manager · Mining Supplier, Gauteng
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-[#06082C] relative overflow-hidden">
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
              Let&apos;s Engineer Your Logistics Solution
            </h2>
            <p className="text-white/55 mb-10 text-lg max-w-xl mx-auto leading-relaxed">
              Tell us what you move, where, and how much. We&apos;ll design the
              road, rail or intermodal solution that delivers it for the lowest
              total cost — and execute it through our verified network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-[#9B2640] hover:bg-[#7d1e33] text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
              >
                Get Started Free
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/15 text-white font-semibold px-8 py-4 rounded-xl border border-white/20 transition-colors text-base"
              >
                Talk to Our Engineers
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
