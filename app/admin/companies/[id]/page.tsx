'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { 
  Building2, 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  FileText,
  Truck,
  Users,
  Package,
  Container,
  ArrowRight
} from 'lucide-react';
import { SectionLoading } from '@/components/LoadingSpinner';

interface Company {
  id: string;
  name: string;
  company_type: string;
  registration_number: string | null;
  tax_number: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  is_verified: boolean;
  does_cross_border: boolean;
  created_at: string;
}

interface Document {
  id: string;
  category: string;
  title: string;
  file_url: string;
  status: string;
  created_at: string;
}

const SA_PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape',
];

export default function AdminCompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  
  const [company, setCompany] = useState<Company | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState({ trucks: 0, trailers: 0, drivers: 0, loads: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    registration_number: '',
    tax_number: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'South Africa',
    phone: '',
    email: '',
    website: '',
    is_verified: false,
    does_cross_border: false,
  });

  useEffect(() => {
    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId]);

  const fetchCompanyData = async () => {
    try {
      // Fetch company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (companyError) throw companyError;
      
      setCompany(companyData);
      setFormData({
        name: companyData.name || '',
        registration_number: companyData.registration_number || '',
        tax_number: companyData.tax_number || '',
        address: companyData.address || '',
        city: companyData.city || '',
        province: companyData.province || '',
        postal_code: companyData.postal_code || '',
        country: companyData.country || 'South Africa',
        phone: companyData.phone || '',
        email: companyData.email || '',
        website: companyData.website || '',
        is_verified: companyData.is_verified || false,
        does_cross_border: companyData.does_cross_border || false,
      });

      // Fetch documents
      const { data: docs } = await supabase
        .from('documents')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      setDocuments(docs || []);

      // Fetch stats based on company type
      if (companyData.company_type === 'transporter') {
        const [trucksRes, trailersRes, driversRes] = await Promise.all([
          supabase.from('trucks').select('id', { count: 'exact' }).eq('company_id', companyId),
          supabase.from('trailers').select('id', { count: 'exact' }).eq('company_id', companyId),
          supabase.from('drivers').select('id', { count: 'exact' }).eq('company_id', companyId),
        ]);
        setStats({
          trucks: trucksRes.count || 0,
          trailers: trailersRes.count || 0,
          drivers: driversRes.count || 0,
          loads: 0,
        });
      } else {
        const loadsRes = await supabase
          .from('loads')
          .select('id', { count: 'exact' })
          .eq('company_id', companyId);
        setStats({
          trucks: 0,
          trailers: 0,
          drivers: 0,
          loads: loadsRes.count || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching company:', err);
      setError('Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          name: formData.name,
          registration_number: formData.registration_number || null,
          tax_number: formData.tax_number || null,
          address: formData.address || null,
          city: formData.city || null,
          province: formData.province || null,
          postal_code: formData.postal_code || null,
          country: formData.country || null,
          phone: formData.phone || null,
          email: formData.email || null,
          website: formData.website || null,
          is_verified: formData.is_verified,
          does_cross_border: formData.does_cross_border,
          updated_at: new Date().toISOString(),
        })
        .eq('id', companyId);

      if (updateError) throw updateError;
      
      setSuccess('Company updated successfully');
      
      // Refresh company data
      const { data: updated } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
      
      if (updated) setCompany(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SectionLoading />;

  if (!company) {
    return (
      <div className="text-center py-16">
        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Company Not Found</h2>
        <Link
          href="/admin/transporters"
          className="text-[#06082C] hover:underline"
        >
          Back to list
        </Link>
      </div>
    );
  }

  const backLink = company.company_type === 'supplier' ? '/admin/suppliers' : '/admin/transporters';
  const typeLabel = company.company_type === 'supplier' ? 'Supplier' : 'Transporter';

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href={backLink}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-white hover:bg-[#06082C] border border-gray-300 rounded-lg mb-6 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {typeLabel}s
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#06082C] flex items-center gap-3">
              <Building2 className="w-7 h-7" />
              {company.name}
            </h1>
            <p className="text-gray-600 mt-1">
              {typeLabel} • Created {new Date(company.created_at).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            company.is_verified 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {company.is_verified ? 'Verified' : 'Pending Verification'}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {company.company_type === 'transporter' ? (
          <>
            <Link href={`/admin/companies/${companyId}/trucks`} className="block group">
              <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-[#06082C]">{stats.trucks}</p>
                    <p className="text-sm text-gray-600">Trucks</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
            <Link href={`/admin/companies/${companyId}/trailers`} className="block group">
              <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Container className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-[#06082C]">{stats.trailers}</p>
                    <p className="text-sm text-gray-600">Trailers</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
            <Link href={`/admin/companies/${companyId}/drivers`} className="block group">
              <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-[#06082C]">{stats.drivers}</p>
                    <p className="text-sm text-gray-600">Drivers</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#06082C]">{stats.loads}</p>
                <p className="text-sm text-gray-600">Loads Posted</p>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#06082C]">{documents.length}</p>
              <p className="text-sm text-gray-600">Documents</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Company Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#06082C] mb-6">Company Details</h2>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Number
                  </label>
                  <input
                    type="text"
                    name="tax_number"
                    value={formData.tax_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province
                  </label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                  >
                    <option value="">Select Province</option>
                    {SA_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_verified"
                    checked={formData.is_verified}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-[#06082C] focus:ring-[#06082C]"
                  />
                  <span className="font-medium text-gray-700">Verified Company</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="does_cross_border"
                    checked={formData.does_cross_border}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-[#06082C] focus:ring-[#06082C]"
                  />
                  <span className="font-medium text-gray-700">Cross-border Operations</span>
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#06082C] text-white rounded-lg font-medium hover:bg-[#0a0e40] transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Documents Sidebar */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#06082C] mb-4">Documents</h2>
            
            {documents.length === 0 ? (
              <p className="text-gray-500 text-sm">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-sm text-gray-900">{doc.title}</p>
                        <p className="text-xs text-gray-500 capitalize">{doc.category.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      doc.status === 'approved' 
                        ? 'bg-green-100 text-green-700'
                        : doc.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
