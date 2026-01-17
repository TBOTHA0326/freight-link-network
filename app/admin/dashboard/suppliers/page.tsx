'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Company, Document, Load } from '@/database/types';
import { 
  Building2, 
  Search, 
  Eye,
  FileText,
  Package,
  X,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { SectionLoading } from '@/components/LoadingSpinner';

interface SupplierCompany extends Company {
  loads?: { count: number }[];
  documents?: Document[];
}

export default function AdminSuppliersPage() {
  const [companies, setCompanies] = useState<SupplierCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<SupplierCompany | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          loads(count),
          documents(*)
        `)
        .eq('company_type', 'supplier')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter((company) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      company.name.toLowerCase().includes(query) ||
      company.city?.toLowerCase().includes(query) ||
      company.province?.toLowerCase().includes(query)
    );
  });

  const getVerificationStatus = (company: SupplierCompany) => {
    const docs = company.documents || [];
    if (docs.length === 0) return 'none';
    const approved = docs.filter((d) => d.status === 'approved').length;
    const pending = docs.filter((d) => d.status === 'pending').length;
    if (approved >= 3) return 'verified';
    if (pending > 0) return 'pending';
    return 'partial';
  };

  const viewCompanyDetails = (company: SupplierCompany) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  if (loading) {
    return <SectionLoading />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#06082C] flex items-center gap-3">
            <Building2 className="w-7 h-7" />
            Supplier Companies
          </h1>
          <p className="text-gray-600 mt-1">
            {companies.length} supplier companies registered
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company name, city, or province..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredCompanies.length} of {companies.length} companies
      </div>

      {/* Companies List */}
      {filteredCompanies.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Companies Found</h2>
          <p className="text-gray-500">
            {searchQuery ? 'Try adjusting your search.' : 'No supplier companies registered yet.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => {
            const status = getVerificationStatus(company);
            const loadsCount = company.loads?.[0]?.count || 0;

            return (
              <div
                key={company.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-[#9B2640]/10 rounded-lg">
                    <Building2 className="w-6 h-6 text-[#9B2640]" />
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      status === 'verified'
                        ? 'bg-green-100 text-green-700'
                        : status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : status === 'partial'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {status === 'verified' ? 'Verified' : status === 'pending' ? 'Pending' : status === 'partial' ? 'Partial' : 'Not Verified'}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-[#06082C] mb-1">{company.name}</h3>
                <p className="text-gray-500 text-sm mb-4">
                  {company.city}, {company.province}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      <span className="font-semibold text-[#06082C]">{loadsCount}</span>
                      <span className="text-gray-500 ml-1">Loads Posted</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => viewCompanyDetails(company)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Company Details Modal */}
      {showModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[#06082C]">
                {selectedCompany.name}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Company Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Registration Number</p>
                  <p className="font-medium">{selectedCompany.registration_number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tax Number</p>
                  <p className="font-medium">{selectedCompany.tax_number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedCompany.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedCompany.email || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">
                    {selectedCompany.address && `${selectedCompany.address}, `}
                    {selectedCompany.city}, {selectedCompany.province} {selectedCompany.postal_code}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cross-border</p>
                  <p className="font-medium">
                    {selectedCompany.does_cross_border ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium">
                    {new Date(selectedCompany.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Documents */}
              <h3 className="font-semibold text-[#06082C] mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents
              </h3>
              {selectedCompany.documents && selectedCompany.documents.length > 0 ? (
                <div className="space-y-2">
                  {selectedCompany.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-sm">{doc.title}</p>
                          <p className="text-xs text-gray-500 capitalize">
                            {doc.category.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          doc.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : doc.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {doc.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                        {doc.status === 'pending' && <Clock className="w-3 h-3" />}
                        {doc.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No documents uploaded.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
