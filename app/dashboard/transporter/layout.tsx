'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Sidebar from '@/components/Sidebar';
import { PageLoading } from '@/components/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TransporterDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !profile) {
      router.push('/login');
    }
    if (!loading && profile && profile.role !== 'transporter') {
      if (profile.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (profile.role === 'supplier') {
        router.push('/dashboard/supplier');
      }
    }
  }, [profile, loading, router]);

  if (loading) {
    return <PageLoading />;
  }

  if (!profile || profile.role !== 'transporter') {
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
