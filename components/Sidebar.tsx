"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/components/AuthProvider";
import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  Building2,
  Map,
  Settings,
  LogOut,
  ChevronRight,
  FileCheck,
  Layers,
  UserCheck,
  ShieldCheck,
  PlusCircle,
  MessageSquare,
  Archive,
  ReceiptText,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const supplierNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/supplier", icon: LayoutDashboard },
  { label: "My Loads", href: "/dashboard/supplier/loads", icon: Package },
  { label: "Post a Load", href: "/dashboard/supplier/loads/new", icon: PlusCircle },
  { label: "Company Profile", href: "/dashboard/supplier/company", icon: Building2 },
  { label: "Load Map", href: "/dashboard/supplier/map", icon: Map },
];

const transporterNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/transporter", icon: LayoutDashboard },
  { label: "Available Loads", href: "/dashboard/transporter/loads", icon: Package },
  { label: "My Trucks", href: "/dashboard/transporter/trucks", icon: Truck },
  { label: "My Trailers", href: "/dashboard/transporter/trailers", icon: Layers },
  { label: "My Drivers", href: "/dashboard/transporter/drivers", icon: Users },
  { label: "Truck Packs", href: "/dashboard/transporter/truck-packs", icon: Archive },
  { label: "Company Profile", href: "/dashboard/transporter/company", icon: Building2 },
  { label: "Load Map", href: "/dashboard/transporter/map", icon: Map },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Approvals", href: "/admin/approvals", icon: FileCheck },
  { label: "Loads", href: "/admin/loads", icon: Package },
  { label: "Post a Load", href: "/admin/loads/new", icon: PlusCircle },
  { label: "Finance", href: "/admin/finance", icon: ReceiptText },
  { label: "Suppliers", href: "/admin/suppliers", icon: Building2 },
  { label: "Transporters", href: "/admin/transporters", icon: Truck },
  { label: "Users", href: "/admin/users", icon: UserCheck },
  { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  { label: "Map", href: "/admin/map", icon: Map },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const navItems =
    profile?.role === "admin"
      ? adminNav
      : profile?.role === "supplier"
      ? supplierNav
      : transporterNav;

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : profile?.email?.slice(0, 2).toUpperCase() ?? "?";

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="block" onClick={() => setMobileOpen(false)}>
          <Image
            src="/FLNSITELOGONAV.png"
            alt="Freight Link Network"
            width={160}
            height={40}
            style={{ height: "auto" }}
            className="object-contain"
            priority
          />
        </Link>
        <button
          className="md:hidden text-white/60 hover:text-white transition-colors"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-red flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-semibold">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{profile?.full_name ?? "—"}</p>
            <p className="text-white/50 text-xs truncate capitalize">{profile?.role ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard/supplier" &&
              item.href !== "/dashboard/transporter" &&
              item.href !== "/admin/dashboard" &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <item.icon
                size={17}
                className={isActive ? "text-white" : "text-white/60 group-hover:text-white"}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} className="text-white/40" />}
            </Link>
          );
        })}
      </nav>

      {/* Role badge + sign out */}
      <div className="px-3 py-3 border-t border-white/10 space-y-1">
        {profile?.role === "admin" && (
          <div className="flex items-center gap-2 px-3 py-2">
            <ShieldCheck size={14} className="text-primary-red" />
            <span className="text-xs text-white/60">Administrator</span>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 w-10 h-10 bg-primary-blue rounded-lg flex items-center justify-center text-white shadow-lg"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — fixed on mobile, in-flow on desktop */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-primary-blue flex flex-col
          transform transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0 md:shrink-0 md:h-full
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
