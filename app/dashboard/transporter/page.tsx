'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getCurrentUserCompany } from '@/database/queries/companies';
import { getTrucksByCompany } from '@/database/queries/trucks';
import { getTrailersByCompany } from '@/database/queries/trailers';
import { getDriversByCompany } from '@/database/queries/drivers';
import { getApprovedLoads } from '@/database/queries/loads';
import type { Company, Truck, Trailer, Driver, LoadWithCompany } from '@/database/types';
import { 
  Building2, 
  Truck as TruckIcon, 
  Container, 
  Users, 
  Package, 
  AlertCircle,
  ArrowRight,
  Plus
} from 'lucide-react';
import { SectionLoading } from '@/components/LoadingSpinner';

export default function TransporterDashboardPage() {
  const { profile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [availableLoads, setAvailableLoads] = useState<LoadWithCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyData = await getCurrentUserCompany();
        setCompany(companyData);

        if (companyData) {
          const [trucksData, trailersData, driversData] = await Promise.all([
            getTrucksByCompany(companyData.id),
            getTrailersByCompany(companyData.id),
            getDriversByCompany(companyData.id),
          ]);
          setTrucks(trucksData);
          setTrailers(trailersData);
          setDrivers(driversData);
        }

        const loadsData = await getApprovedLoads();
        setAvailableLoads(loadsData.slice(0, 5)); // Show only first 5
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <SectionLoading />;
  }

  const stats = [
    {
      label: 'Trucks',
      value: trucks.length,
      icon: <TruckIcon className="w-6 h-6" />,
      href: '/dashboard/transporter/trucks',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Trailers',
      value: trailers.length,
      icon: <Container className="w-6 h-6" />,
      href: '/dashboard/transporter/trailers',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Drivers',
      value: drivers.length,
      icon: <Users className="w-6 h-6" />,
      href: '/dashboard/transporter/drivers',
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Available Loads',
      value: availableLoads.length,
      icon: <Package className="w-6 h-6" />,
      href: '/dashboard/transporter/loads',
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#06082C]">
          Welcome, {profile?.full_name || 'Transporter'}
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your fleet and find loads to transport
        </p>
      </div>

      {/* Company Setup Alert */}
      {!company && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-4">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-yellow-800">Complete Your Company Setup</h3>
            <p className="text-sm text-yellow-700">
              Add your company details to start adding trucks, trailers, and drivers.
            </p>
          </div>
          <Link
            href="/dashboard/transporter/company"
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
          >
            Add Company
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Link
            key={index}
            href={stat.href}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-[#06082C]">{stat.value}</p>
            <p className="text-gray-500 mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions & Recent Loads */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#06082C] mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/dashboard/transporter/trucks"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[#06082C] hover:bg-gray-50 transition-all"
            >
              <div className="w-10 h-10 bg-[#06082C]/5 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-[#06082C]" />
              </div>
              <div>
                <p className="font-medium text-[#06082C]">Add New Truck</p>
                <p className="text-sm text-gray-500">Register a new truck to your fleet</p>
              </div>
            </Link>
            <Link
              href="/dashboard/transporter/trailers"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[#06082C] hover:bg-gray-50 transition-all"
            >
              <div className="w-10 h-10 bg-[#06082C]/5 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-[#06082C]" />
              </div>
              <div>
                <p className="font-medium text-[#06082C]">Add New Trailer</p>
                <p className="text-sm text-gray-500">Add a trailer to your fleet</p>
              </div>
            </Link>
            <Link
              href="/dashboard/transporter/drivers"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[#06082C] hover:bg-gray-50 transition-all"
            >
              <div className="w-10 h-10 bg-[#06082C]/5 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-[#06082C]" />
              </div>
              <div>
                <p className="font-medium text-[#06082C]">Add New Driver</p>
                <p className="text-sm text-gray-500">Register a new driver</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Available Loads */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#06082C]">Available Loads</h2>
            <Link
              href="/dashboard/transporter/loads"
              className="text-sm text-[#06082C] hover:underline"
            >
              View All
            </Link>
          </div>
          {availableLoads.length > 0 ? (
            <div className="space-y-3">
              {availableLoads.map((load) => (
                <div
                  key={load.id}
                  className="p-4 rounded-lg border border-gray-200 hover:border-[#06082C] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-[#06082C]">{load.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {load.pickup_city}, {load.pickup_province} → {load.delivery_city}, {load.delivery_province}
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-[#9B2640]">
                      R{(load.budget_amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{load.cargo_type || 'N/A'}</span>
                    <span>•</span>
                    <span>{load.required_trailer_type?.join(', ') || 'Any'}</span>
                    {load.weight_tons && (
                      <>
                        <span>•</span>
                        <span>{load.weight_tons} tons</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No available loads at the moment</p>
            </div>
          )}
        </div>
      </div>

      {/* Company Info Card */}
      {company && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#06082C]">Company Information</h2>
            <Link
              href="/dashboard/transporter/company"
              className="text-sm text-[#06082C] hover:underline"
            >
              Edit
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Company Name</p>
                <p className="font-medium text-[#06082C]">{company.name}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Registration Number</p>
              <p className="font-medium text-[#06082C]">
                {company.registration_number || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cross-Border</p>
              <p className="font-medium text-[#06082C]">
                {company.does_cross_border ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
