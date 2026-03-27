"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Globe,
  CheckCircle2,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { createContactSubmission } from "@/database/queries/contact";

const FAQS = [
  {
    question: "How long does verification take?",
    answer:
      "Once you submit your company documents through the onboarding process, our team reviews submissions within 1–3 business days. You will receive an email notification as soon as your account is activated.",
  },
  {
    question: "Is it free to register?",
    answer:
      "Yes — registration on Freight Link Network is free. Create your account, complete the verification process, and start posting or finding freight loads at no upfront cost.",
  },
  {
    question: "What documents do I need?",
    answer:
      "Suppliers require CIPC certificate, tax clearance certificate, and a company ID document. Transporters additionally need truck registration papers, roadworthy certificates, brake test certificates, and PDP licences for drivers. All documents are uploaded through your dashboard.",
  },
  {
    question: "Do you cover cross-border routes?",
    answer:
      "Yes. FLN supports cross-border freight loads to and from Namibia, Zimbabwe, Mozambique, Botswana, Lesotho, and Eswatini. Suppliers can mark loads as cross-border when posting, and transporters can indicate their cross-border capability during registration.",
  },
];

type RoleOption = "Supplier" | "Transporter" | "Other";

interface FormState {
  name: string;
  email: string;
  company: string;
  role: RoleOption | "";
  message: string;
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    company: "",
    role: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createContactSubmission(form);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#06082C] pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#06082C] via-[#0a0e40] to-[#06082C] opacity-80" />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm px-4 py-1.5 rounded-full mb-6 border border-white/20"
          >
            <Mail size={14} />
            We&apos;re here to help
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-5 leading-tight"
          >
            Get In Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="text-white/70 text-lg max-w-xl mx-auto leading-relaxed"
          >
            Have a question about registration, documents, or how Freight Link
            Network works? Send us a message — we respond within one business day.
          </motion.p>
        </div>
      </section>

      {/* Contact info cards */}
      <section className="py-12 px-4 bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5">
          {[
            {
              icon: Mail,
              title: "Email Us",
              value: "onboarding@f-ln.co.za",
              sub: "We respond within 1 business day",
            },
            {
              icon: MapPin,
              title: "Coverage",
              value: "All 9 SA Provinces",
              sub: "+ Cross-border SADC routes",
            },
            {
              icon: Clock,
              title: "Support Hours",
              value: "Mon–Fri, 08:00–17:00",
              sub: "SAST (South Africa Standard Time)",
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[#06082C] flex items-center justify-center flex-shrink-0">
                <card.icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                  {card.title}
                </p>
                <p className="font-semibold text-gray-900 text-sm">{card.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{card.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact form + FAQ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Send a Message</h2>
            <p className="text-gray-500 text-sm mb-7">
              Fill in the form below and we&apos;ll get back to you as soon as possible.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
              >
                <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Message sent!</h3>
                <p className="text-sm text-gray-600">
                  Thanks for reaching out. We&apos;ll be in touch ASAP!
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name <span className="text-[#9B2640]">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06082C] transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address <span className="text-[#9B2640]">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@yourcompany.co.za"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06082C] transition-colors"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Your company (optional)"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06082C] transition-colors"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    I am a <span className="text-[#9B2640]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      required
                      value={form.role}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#06082C] transition-colors bg-white"
                    >
                      <option value="" disabled>
                        Select your role…
                      </option>
                      <option value="Supplier">Supplier (I post freight loads)</option>
                      <option value="Transporter">Transporter (I move freight)</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Message <span className="text-[#9B2640]">*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell us how we can help…"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06082C] transition-colors resize-none"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#06082C] hover:bg-[#0a0e40] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send Message
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 text-sm mb-7">
              Quick answers to the most common questions.
            </p>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="border border-gray-100 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#06082C]"
                  >
                    <span className="font-medium text-gray-900 text-sm">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="px-5 pb-4"
                    >
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {/* Extra CTA */}
            <div className="mt-8 bg-[#06082C] rounded-2xl p-6 text-center">
              <Globe size={28} className="text-white/40 mx-auto mb-3" />
              <p className="text-white font-semibold mb-1 text-sm">
                Ready to get started?
              </p>
              <p className="text-white/60 text-xs mb-4">
                Registration is free. Verification takes 1–3 business days.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#9B2640] hover:bg-[#7d1e33] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Create Free Account
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
