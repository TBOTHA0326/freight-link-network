'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { getTrucksByCompany } from '@/database/queries/trucks';
import { getDocumentsByTruck, uploadDocument, deleteDocument } from '@/database/queries/documents';
import type { Truck, Document, DocumentCategory } from '@/database/types';
import { Truck as TruckIcon, ArrowLeft, FileText, Plus } from 'lucide-react';
import { SectionLoading } from '@/components/LoadingSpinner';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentList from '@/components/DocumentList';

const truckDocCategories: { category: DocumentCategory; title: string }[] = [
  { category: 'truck_registration', title: 'Registration Certificate' },
  { category: 'roadworthy', title: 'Roadworthy Certificate' },
  { category: 'brake_test', title: 'Brake Test Certificate' },
  { category: 'other', title: 'Other Documents' },
];

export default function AdminCompanyTrucksPage() {
  const params = useParams();
  const companyId = params.id as string;
  
  const [companyName, setCompanyName] = useState('');
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [activeDocCategory, setActiveDocCategory] = useState<DocumentCategory>('truck_registration');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: company } = await supabase
          .from('companies')
          .select('name')
          .eq('id', companyId)
          .single();
        
        if (company) setCompanyName(company.name);

        const trucksData = await getTrucksByCompany(companyId);
        setTrucks(trucksData);

        const allDocs: Document[] = [];
        for (const truck of trucksData) {
          const truckDocs = await getDocumentsByTruck(truck.id);
          allDocs.push(...truckDocs);
        }
        setDocuments(allDocs);
      } catch (err) {
        console.error('Error fetching trucks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  const openDocModal = (truck: Truck) => {
    setSelectedTruck(truck);
    setActiveDocCategory('truck_registration');
    setShowDocModal(true);
  };

  const handleDocumentUpload = async (file: File, title: string) => {
    if (!selectedTruck) return;

    const doc = await uploadDocument({
      company_id: companyId,
      truck_id: selectedTruck.id,
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

  const getTruckDocuments = (truckId: string) => {
    return documents.filter((d) => d.truck_id === truckId);
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
          <TruckIcon className="w-7 h-7" />
          Trucks - {companyName}
        </h1>
        <p className="text-gray-600 mt-1">View and manage trucks for this company</p>
      </div>

      {trucks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <TruckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Trucks</h2>
          <p className="text-gray-500">This company hasn't added any trucks yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trucks.map((truck) => {
            const truckDocs = getTruckDocuments(truck.id);
            return (
              <div
                key={truck.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-[#06082C]/10 rounded-lg">
                    <TruckIcon className="w-6 h-6 text-[#06082C]" />
                  </div>
                  <button
                    onClick={() => openDocModal(truck)}
                    className="p-2 text-gray-400 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors"
                    title="Manage Documents"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-[#06082C] mb-1">
                  {truck.registration_number}
                </h3>
                <p className="text-gray-600 mb-4">
                  {truck.make} {truck.model} {truck.year && `(${truck.year})`}
                </p>

                <div className="space-y-2 text-sm">
                  {truck.horse_type && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Horse Type:</span>
                      <span className="font-medium text-gray-700">{truck.horse_type}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Axles:</span>
                    <span className="font-medium text-gray-700">{truck.number_of_axles}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Documents:</span>
                    <span className={`font-medium ${
                      truckDocs.length > 0 ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {truckDocs.length} uploaded
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Modal */}
      {showDocModal && selectedTruck && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-[#06082C]">
                  Truck Documents
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedTruck.registration_number} - {selectedTruck.make} {selectedTruck.model}
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
                {truckDocCategories.map((cat) => (
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
                  title={truckDocCategories.find((c) => c.category === activeDocCategory)?.title || ''}
                  onUpload={handleDocumentUpload}
                />
              </div>

              <DocumentList
                documents={getTruckDocuments(selectedTruck.id).filter(
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
