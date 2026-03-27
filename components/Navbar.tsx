"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#06082C]/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/FLNSITELOGONAV.png"
              alt="Freight Link Network"
              width={140}
              height={35}
              style={{ height: "auto" }}
              className="object-contain"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/about" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              About
            </Link>
            <Link href="/blog" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              Blog
            </Link>
            <Link href="/contact" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              Contact
            </Link>
            <Link href="/login" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-[#9B2640] hover:bg-[#7d1e33] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white/70 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden pb-4 space-y-1">
            <Link
              href="/about"
              className="block px-3 py-2 text-white/70 hover:text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
              About
            </Link>
            <Link
              href="/blog"
              className="block px-3 py-2 text-white/70 hover:text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 text-white/70 hover:text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/login"
              className="block px-3 py-2 text-white/70 hover:text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="block px-3 py-2 bg-[#9B2640] text-white text-sm font-medium rounded-lg"
            >
              Get Started
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
