'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { 
  Truck, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Building2,
  Phone,
  Mail
} from 'lucide-react';
import { SectionLoading } from '@/components/LoadingSpinner';

interface Company {
  id: string;
  name: string;
  registration_number: string | null;
  city: string | null;
  province: string | null;
  phone: string | null;
  email: string | null;
  is_verified: boolean;
  created_at: string;
  _count?: {
    trucks: number;
    drivers: number;
  };
}

export default function AdminTransportersPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('company_type', 'transporter')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (err) {
      console.error('Error fetching transporters:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (companyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ is_verified: !currentStatus })
        .eq('id', companyId);

      if (error) throw error;
      
      setCompanies(companies.map(c => 
        c.id === companyId ? { ...c, is_verified: !currentStatus } : c
      ));
    } catch (err) {
      console.error('Error updating verification:', err);
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.registration_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'verified') return matchesSearch && company.is_verified;
    if (filter === 'unverified') return matchesSearch && !company.is_verified;
    return matchesSearch;
  });

  if (loading) return <SectionLoading />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#06082C] flex items-center gap-3">
          <Truck className="w-7 h-7" />
          Transporters
        </h1>
        <p className="text-gray-600 mt-1">
          Manage and verify transporter companies
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or registration..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'verified', 'unverified'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === f
                    ? 'bg-[#06082C] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Transporters</p>
          <p className="text-2xl font-bold text-[#06082C]">{companies.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Verified</p>
          <p className="text-2xl font-bold text-green-600">
            {companies.filter(c => c.is_verified).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Pending Verification</p>
          <p className="text-2xl font-bold text-yellow-600">
            {companies.filter(c => !c.is_verified).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Company</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Location</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Contact</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCompanies.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No transporters found
                </td>
              </tr>
            ) : (
              filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#06082C]/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-[#06082C]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{company.name}</p>
                        <p className="text-sm text-gray-500">{company.registration_number || 'No reg'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {company.city && company.province 
                      ? `${company.city}, ${company.province}`
                      : company.city || company.province || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {company.phone && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {company.phone}
                        </p>
                      )}
                      {company.email && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {company.email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {company.is_verified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        <CheckCircle className="w-4 h-4" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                        <Clock className="w-4 h-4" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/companies/${company.id}`}
                        className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" /> View
                      </Link>
                      <button
                        onClick={() => toggleVerification(company.id, company.is_verified)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          company.is_verified
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {company.is_verified ? 'Revoke' : 'Verify'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
