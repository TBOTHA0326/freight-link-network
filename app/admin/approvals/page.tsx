'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  FileCheck, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Building2,
  Download
} from 'lucide-react';
import { SectionLoading } from '@/components/LoadingSpinner';

interface Document {
  id: string;
  title: string;
  category: string;
  status: string;
  file_path: string;
  file_name: string;
  created_at: string;
  company?: {
    name: string;
  };
}

export default function AdminApprovalsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          company:companies(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentStatus = async (docId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ status })
        .eq('id', docId);

      if (error) throw error;
      
      setDocuments(documents.map(d => 
        d.id === docId ? { ...d, status } : d
      ));
    } catch (err) {
      console.error('Error updating document status:', err);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && doc.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm">
            <XCircle className="w-4 h-4" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
            <Clock className="w-4 h-4" /> Pending
          </span>
        );
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'company_registration': 'Company Registration',
      'tax_clearance': 'Tax Clearance',
      'bee_certificate': 'BEE Certificate',
      'insurance': 'Insurance',
      'vehicle_registration': 'Vehicle Registration',
      'roadworthy': 'Roadworthy',
      'driver_license': 'Driver License',
      'prdp': 'PRDP',
      'other': 'Other'
    };
    return labels[category] || category;
  };

  if (loading) return <SectionLoading />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#06082C] flex items-center gap-3">
          <FileCheck className="w-7 h-7" />
          Document Approvals
        </h1>
        <p className="text-gray-600 mt-1">
          Review and approve uploaded documents
        </p>
      </div>

      {/* Pending Alert */}
      {documents.filter(d => d.status === 'pending').length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-600" />
          <p className="text-yellow-800">
            <span className="font-medium">{documents.filter(d => d.status === 'pending').length}</span> document(s) awaiting review
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['pending', 'all', 'approved', 'rejected'] as const).map((f) => (
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
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Documents</p>
          <p className="text-2xl font-bold text-[#06082C]">{documents.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {documents.filter(d => d.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {documents.filter(d => d.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Rejected</p>
          <p className="text-2xl font-bold text-red-600">
            {documents.filter(d => d.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Document</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Category</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Company</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No documents found
                </td>
              </tr>
            ) : (
              filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.title}</p>
                        <p className="text-sm text-gray-500">{doc.file_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {getCategoryLabel(doc.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {(doc.company as { name: string } | null)?.name || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(doc.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {doc.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateDocumentStatus(doc.id, 'approved')}
                            className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateDocumentStatus(doc.id, 'rejected')}
                            className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
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
