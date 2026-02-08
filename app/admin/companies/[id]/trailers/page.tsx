'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { getTrailersByCompany } from '@/database/queries/trailers';
import { getDocumentsByTrailer, uploadDocument, deleteDocument } from '@/database/queries/documents';
import type { Trailer, TrailerType, Document, DocumentCategory } from '@/database/types';
import { Container, ArrowLeft, FileText, Plus } from 'lucide-react';
import { SectionLoading } from '@/components/LoadingSpinner';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentList from '@/components/DocumentList';

const trailerTypes: { value: TrailerType; label: string }[] = [
  { value: 'tautliner', label: 'Tautliner' },
  { value: 'flatbed', label: 'Flatbed' },
  { value: 'lowbed', label: 'Lowbed' },
  { value: 'tanker', label: 'Tanker' },
  { value: 'refrigerated', label: 'Refrigerated' },
  { value: 'container', label: 'Container' },
  { value: 'side_tipper', label: 'Side Tipper' },
  { value: 'end_tipper', label: 'End Tipper' },
  { value: 'other', label: 'Other' },
];

const trailerDocCategories: { category: DocumentCategory; title: string }[] = [
  { category: 'trailer_registration', title: 'Registration Certificate' },
  { category: 'roadworthy', title: 'Roadworthy Certificate' },
  { category: 'brake_test', title: 'Brake Test Certificate' },
  { category: 'other', title: 'Other Documents' },
];

export default function AdminCompanyTrailersPage() {
  const params = useParams();
  const companyId = params.id as string;
  
  const [companyName, setCompanyName] = useState('');
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedTrailer, setSelectedTrailer] = useState<Trailer | null>(null);
  const [activeDocCategory, setActiveDocCategory] = useState<DocumentCategory>('trailer_registration');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: company } = await supabase
          .from('companies')
          .select('name')
          .eq('id', companyId)
          .single();
        
        if (company) setCompanyName(company.name);

        const trailersData = await getTrailersByCompany(companyId);
        setTrailers(trailersData);

        const allDocs: Document[] = [];
        for (const trailer of trailersData) {
          const trailerDocs = await getDocumentsByTrailer(trailer.id);
          allDocs.push(...trailerDocs);
        }
        setDocuments(allDocs);
      } catch (err) {
        console.error('Error fetching trailers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  const openDocModal = (trailer: Trailer) => {
    setSelectedTrailer(trailer);
    setActiveDocCategory('trailer_registration');
    setShowDocModal(true);
  };

  const handleDocumentUpload = async (file: File, title: string) => {
    if (!selectedTrailer) return;

    const doc = await uploadDocument({
      company_id: companyId,
      trailer_id: selectedTrailer.id,
      category: activeDocCategory,
      title,
      file,
    });

    setDocuments([doc, ...documents]);
  };

  const handleDocumentDelete = async (documentId: string) => {
    await deleteDocument(documentId);
    setDocuments(documents.filter((d) => d.id !== documentId));
  };

  const getTrailerDocuments = (trailerId: string) => {
    return documents.filter((d) => d.trailer_id === trailerId);
  };

  const getTrailerTypeLabel = (type: TrailerType) => {
    return trailerTypes.find((t) => t.value === type)?.label || type;
  };

  if (loading) return <SectionLoading />;

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <Link
          href={`/admin/companies/${companyId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#06082C] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {companyName}
        </Link>
        <h1 className="text-2xl font-bold text-[#06082C] flex items-center gap-3">
          <Container className="w-7 h-7" />
          Trailers - {companyName}
        </h1>
        <p className="text-gray-600 mt-1">View and manage trailers for this company</p>
      </div>

      {trailers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Container className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Trailers</h2>
          <p className="text-gray-500">This company hasn't added any trailers yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trailers.map((trailer) => {
            const trailerDocs = getTrailerDocuments(trailer.id);
            return (
              <div
                key={trailer.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-[#9B2640]/10 rounded-lg">
                    <Container className="w-6 h-6 text-[#9B2640]" />
                  </div>
                  <button
                    onClick={() => openDocModal(trailer)}
                    className="p-2 text-gray-400 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors"
                    title="Manage Documents"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-[#06082C] mb-1">
                  {trailer.registration_number}
                </h3>
                <span className="inline-block px-2 py-1 bg-[#9B2640]/10 text-[#9B2640] text-xs font-medium rounded-full mb-3">
                  {getTrailerTypeLabel(trailer.trailer_type)}
                </span>
                <p className="text-gray-600 mb-4">
                  {trailer.make} {trailer.model} {trailer.year && `(${trailer.year})`}
                </p>

                <div className="space-y-2 text-sm">
                  {trailer.length_meters && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Length:</span>
                      <span className="font-medium text-gray-700">{trailer.length_meters}m</span>
                    </div>
                  )}
                  {trailer.payload_capacity_tons && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payload:</span>
                      <span className="font-medium text-gray-700">{trailer.payload_capacity_tons} tons</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Documents:</span>
                    <span className={`font-medium ${
                      trailerDocs.length > 0 ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {trailerDocs.length} uploaded
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Modal */}
      {showDocModal && selectedTrailer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-[#06082C]">
                  Trailer Documents
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedTrailer.registration_number} - {getTrailerTypeLabel(selectedTrailer.trailer_type)}
                </p>
              </div>
              <button
                onClick={() => setShowDocModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-6">
                {trailerDocCategories.map((cat) => (
                  <button
                    key={cat.category}
                    onClick={() => setActiveDocCategory(cat.category)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeDocCategory === cat.category
                        ? 'bg-[#06082C] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <DocumentUpload
                  category={activeDocCategory}
                  title={trailerDocCategories.find((c) => c.category === activeDocCategory)?.title || ''}
                  onUpload={handleDocumentUpload}
                />
              </div>

              <DocumentList
                documents={getTrailerDocuments(selectedTrailer.id).filter(
                  (d) => d.category === activeDocCategory
                )}
                onDelete={handleDocumentDelete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
