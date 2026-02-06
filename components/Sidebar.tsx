'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import {
  LayoutDashboard,
  Building2,
  Truck,
  Container,
  Users,
  Package,
  FileCheck,
  LogOut,
  MapPin,
  Settings,
  ChevronRight,
  UserPlus,
} from 'lucide-react';

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const transporterLinks: SidebarLink[] = [
  { href: '/dashboard/transporter', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/dashboard/transporter/company', label: 'Company', icon: <Building2 className="w-5 h-5" /> },
  { href: '/dashboard/transporter/trucks', label: 'Trucks', icon: <Truck className="w-5 h-5" /> },
  { href: '/dashboard/transporter/trailers', label: 'Trailers', icon: <Container className="w-5 h-5" /> },
  { href: '/dashboard/transporter/drivers', label: 'Drivers', icon: <Users className="w-5 h-5" /> },
  { href: '/dashboard/transporter/loads', label: 'Available Loads', icon: <Package className="w-5 h-5" /> },
  { href: '/dashboard/transporter/map', label: 'Load Map', icon: <MapPin className="w-5 h-5" /> },
];

const supplierLinks: SidebarLink[] = [
  { href: '/dashboard/supplier', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/dashboard/supplier/company', label: 'Company', icon: <Building2 className="w-5 h-5" /> },
  { href: '/dashboard/supplier/loads', label: 'My Loads', icon: <Package className="w-5 h-5" /> },
  { href: '/dashboard/supplier/map', label: 'Load Map', icon: <MapPin className="w-5 h-5" /> },
];

const adminLinks: SidebarLink[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/admin/users', label: 'Pending Users', icon: <UserPlus className="w-5 h-5" /> },
  { href: '/admin/transporters', label: 'Transporters', icon: <Truck className="w-5 h-5" /> },
  { href: '/admin/suppliers', label: 'Suppliers', icon: <Building2 className="w-5 h-5" /> },
  { href: '/admin/loads', label: 'All Loads', icon: <Package className="w-5 h-5" /> },
  { href: '/admin/map', label: 'Load Map', icon: <MapPin className="w-5 h-5" /> },
  { href: '/admin/approvals', label: 'Approvals', icon: <FileCheck className="w-5 h-5" /> },
  { href: '/admin/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  // Determine which links to show based on user role
  let links: SidebarLink[] = [];
  let roleLabel = '';

  if (profile?.role === 'admin') {
    links = adminLinks;
    roleLabel = 'Admin';
  } else if (profile?.role === 'supplier') {
    links = supplierLinks;
    roleLabel = 'Supplier';
  } else {
    links = transporterLinks;
    roleLabel = 'Transporter';
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#06082C] text-white z-40 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" aria-label="Freight Link Network home" className="flex items-center gap-3">
          <div className="w-10 h-10 relative flex items-center justify-center">
            <Image
              src="/FLNSITELOGOSMALL.png"
              alt="Freight Link Network logo"
              width={32}
              height={32}
              className="object-contain"
              onError={(e: any) => { e.currentTarget.src = '/FLNSITELOGO.png'; }}
            />
          </div>
          <div>
            <span className="sr-only">Freight Link Network</span>
            <span className="block text-xs text-gray-400">{roleLabel} Portal</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.icon}
                  <span className="font-medium">{link.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-white/10">
        <div className="px-4 py-2 mb-2">
          <p className="text-sm font-medium truncate">{profile?.full_name || profile?.email}</p>
          <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
