import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#06082C] text-white/60 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div>
            <p className="text-white font-bold text-sm mb-2">Freight Link Network</p>
            <p className="text-xs leading-relaxed text-white/40">
              South Africa&apos;s leading B2B logistics platform connecting verified transporters and freight suppliers.
            </p>
          </div>
          <div>
            <p className="text-white/80 font-semibold text-xs uppercase tracking-widest mb-3">Company</p>
            <nav className="flex flex-col gap-2">
              <Link href="/about" className="text-sm hover:text-white transition-colors">About Us</Link>
              <Link href="/blog" className="text-sm hover:text-white transition-colors">Blog</Link>
              <Link href="/contact" className="text-sm hover:text-white transition-colors">Contact</Link>
            </nav>
          </div>
          <div>
            <p className="text-white/80 font-semibold text-xs uppercase tracking-widest mb-3">Platform</p>
            <nav className="flex flex-col gap-2">
              <Link href="/register" className="text-sm hover:text-white transition-colors">Get Started</Link>
              <Link href="/login" className="text-sm hover:text-white transition-colors">Sign In</Link>
            </nav>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6">
          <p className="text-xs text-white/30 text-center">
            &copy; {new Date().getFullYear()} Freight Link Network. All rights reserved. South Africa&apos;s leading B2B logistics platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
