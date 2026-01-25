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
            <Link href="/" aria-label="Freight Link Network home" className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 relative flex items-center justify-center">
                <Image
                  src="/FLNSITELOGOSMALL.png"
                  alt="Freight Link Network logo"
                  width={48}
                  height={48}
                  className="object-contain"
                  priority
                  onError={(e: any) => { e.currentTarget.src = '/FLNSITELOGO.png'; }}
                />
              </div>
              <span className="text-white font-bold text-lg md:text-2xl leading-tight whitespace-nowrap">
                Freight Link Network
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`text-sm font-medium transition-colors ${isActive ? 'text-white border-b-2 border-white pb-1 font-semibold' : 'text-gray-300 hover:text-white'}`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                aria-current={pathname.startsWith('/login') ? 'page' : undefined}
                className={`text-sm font-medium transition-colors ${pathname.startsWith('/login') ? 'text-white border-b-2 border-white pb-1 font-semibold' : 'text-gray-300 hover:text-white'}`}
              >
                Log In
              </Link>
              <Link
                href="/register"
                aria-current={pathname.startsWith('/register') ? 'page' : undefined}
                className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium ${pathname.startsWith('/register') ? 'bg-white text-[#06082C] ring-2 ring-offset-1 ring-white' : 'bg-white text-[#06082C] hover:bg-gray-100'} transition-colors`}
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
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`block text-sm font-medium transition-colors ${isActive ? 'text-white font-semibold' : 'text-gray-300 hover:text-white'}`}
                >
                  {link.label}
                </Link>
              );
            })}
            <hr className="border-[#1a1e4c]" />
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              aria-current={pathname.startsWith('/login') ? 'page' : undefined}
              className={`block text-sm font-medium transition-colors ${pathname.startsWith('/login') ? 'text-white font-semibold' : 'text-gray-300 hover:text-white'}`}
            >
              Log In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              aria-current={pathname.startsWith('/register') ? 'page' : undefined}
              className={`block w-full text-center px-4 py-2 rounded-lg text-sm font-medium ${pathname.startsWith('/register') ? 'bg-white text-[#06082C] ring-2 ring-offset-1 ring-white' : 'bg-white text-[#06082C] hover:bg-gray-100'} transition-colors`}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
