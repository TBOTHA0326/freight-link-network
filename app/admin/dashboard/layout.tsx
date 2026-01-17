'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Sidebar from '@/components/Sidebar';
import { SectionLoading } from '@/components/LoadingSpinner';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (profile?.role !== 'admin') {
        // Redirect to appropriate dashboard based on role
        if (profile?.role === 'transporter') {
          router.push('/dashboard/transporter');
        } else if (profile?.role === 'supplier') {
          router.push('/dashboard/supplier');
        } else {
          router.push('/login');
        }
      } else {
        setAuthorized(true);
      }
    }
  }, [user, profile, loading, router]);

  if (loading || !authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <SectionLoading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:ml-64 p-6 pt-20 lg:pt-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
