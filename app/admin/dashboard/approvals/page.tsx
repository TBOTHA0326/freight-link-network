'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { reviewDocument } from '@/database/queries/documents';
import { updateLoadStatus } from '@/database/queries/loads';
import type { Document, Load, LoadStatus, DocumentStatus } from '@/database/types';
import { 
  FileText, 
  Package, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Clock,
  Building2,
  Filter
} from 'lucide-react';
import { SectionLoading } from '@/components/LoadingSpinner';

type TabType = 'documents' | 'loads';

export default function AdminApprovalsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('documents');
  const [documents, setDocuments] = useState<(Document & { company?: { name: string } })[]>([]);
  const [loads, setLoads] = useState<(Load & { company?: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docsResult, loadsResult] = await Promise.all([
        supabase
          .from('documents')
          .select(`*, company:companies(name)`)
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
        supabase
          .from('loads')
          .select(`*, company:companies(name)`)
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
      ]);

      setDocuments((docsResult.data as any) || []);
      setLoads((loadsResult.data as any) || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentReview = async (
    documentId: string, 
    status: DocumentStatus, 
    notes?: string
  ) => {
    setProcessing(documentId);
    try {
      await reviewDocument(documentId, status, notes);
      setDocuments(documents.filter((d) => d.id !== documentId));
    } catch (err) {
      console.error('Error reviewing document:', err);
      alert('Failed to review document');
    } finally {
      setProcessing(null);
    }
  };

  const handleLoadReview = async (loadId: string, status: LoadStatus) => {
    setProcessing(loadId);
    try {
      await updateLoadStatus(loadId, status);
      setLoads(loads.filter((l) => l.id !== loadId));
    } catch (err) {
      console.error('Error reviewing load:', err);
      alert('Failed to review load');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return <SectionLoading />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#06082C] flex items-center gap-3">
          <Clock className="w-7 h-7" />
          Pending Approvals
        </h1>
        <p className="text-gray-600 mt-1">
          Review and approve pending documents and loads
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'documents'
              ? 'bg-[#06082C] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FileText className="w-5 h-5" />
          Documents
          {documents.length > 0 && (
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'documents' ? 'bg-white/20' : 'bg-gray-200'
            }`}>
              {documents.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('loads')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'loads'
              ? 'bg-[#06082C] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Package className="w-5 h-5" />
          Loads
          {loads.length > 0 && (
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'loads' ? 'bg-white/20' : 'bg-gray-200'
            }`}>
              {loads.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'documents' ? (
        <div>
          {documents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">All Caught Up!</h2>
              <p className="text-gray-500">No documents pending approval.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#06082C]/10 rounded-lg">
                        <FileText className="w-6 h-6 text-[#06082C]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#06082C]">{doc.title}</h3>
                        <p className="text-gray-500 text-sm mt-1">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {doc.company?.name || 'Unknown Company'}
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-3 mt-3 text-sm">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded capitalize">
                            {doc.category.replace('_', ' ')}
                          </span>
                          <span className="text-gray-500">
                            Uploaded {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {doc.file_url && (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Document"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDocumentReview(doc.id, 'rejected', 'Document rejected by admin')}
                        disabled={processing === doc.id}
                        className="p-2 text-gray-400 hover:text-[#9B2640] hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Reject"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDocumentReview(doc.id, 'approved')}
                        disabled={processing === doc.id}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Approve"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {loads.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">All Caught Up!</h2>
              <p className="text-gray-500">No loads pending approval.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loads.map((load) => (
                <div
                  key={load.id}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#9B2640]/10 rounded-lg">
                        <Package className="w-6 h-6 text-[#9B2640]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-[#06082C]">{load.title}</h3>
                          {load.is_cross_border && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              Cross-border
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-sm mt-1">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {load.company?.name || 'Unknown Company'}
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                          <span>
                            {load.pickup_city}, {load.pickup_province} → {load.delivery_city}, {load.delivery_province}
                          </span>
                          {load.cargo_type && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded">
                              {load.cargo_type}
                            </span>
                          )}
                          {load.weight_tons && (
                            <span>{load.weight_tons} tons</span>
                          )}
                          {load.budget_amount && (
                            <span className="font-medium">R{load.budget_amount.toLocaleString()}</span>
                          )}
                        </div>
                        {load.description && (
                          <p className="text-gray-500 text-sm mt-2 line-clamp-2">{load.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLoadReview(load.id, 'rejected')}
                        disabled={processing === load.id}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleLoadReview(load.id, 'approved')}
                        disabled={processing === load.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
