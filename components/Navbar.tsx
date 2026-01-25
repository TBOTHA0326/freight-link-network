'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-[#06082C] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 relative flex items-center justify-center">
                <Image
                  src="/FLNSITELOGO.png"
                  alt="FL logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-white text-[#06082C] hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0e40] border-t border-[#1a1e4c]">
          <div className="px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-[#1a1e4c]" />
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center px-4 py-2 rounded-lg text-sm font-medium bg-white text-[#06082C] hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
