'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { getDriversByCompany } from '@/database/queries/drivers';
import { getDocumentsByDriver, uploadDocument, deleteDocument } from '@/database/queries/documents';
import type { Driver, Document, DocumentCategory } from '@/database/types';
import { UserCircle, ArrowLeft, FileText, Plus } from 'lucide-react';
import { SectionLoading } from '@/components/LoadingSpinner';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentList from '@/components/DocumentList';

const driverDocCategories: { category: DocumentCategory; title: string }[] = [
  { category: 'id_document', title: 'ID Document' },
  { category: 'drivers_license', title: 'Driver\'s License' },
  { category: 'pdp', title: 'PDP Certificate' },
  { category: 'passport', title: 'Passport' },
  { category: 'other', title: 'Other Documents' },
];

export default function AdminCompanyDriversPage() {
  const params = useParams();
  const companyId = params.id as string;
  
  const [companyName, setCompanyName] = useState('');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [activeDocCategory, setActiveDocCategory] = useState<DocumentCategory>('id_document');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: company } = await supabase
          .from('companies')
          .select('name')
          .eq('id', companyId)
          .single();
        
        if (company) setCompanyName(company.name);

        const driversData = await getDriversByCompany(companyId);
        setDrivers(driversData);

        const allDocs: Document[] = [];
        for (const driver of driversData) {
          const driverDocs = await getDocumentsByDriver(driver.id);
          allDocs.push(...driverDocs);
        }
        setDocuments(allDocs);
      } catch (err) {
        console.error('Error fetching drivers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  const openDocModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setActiveDocCategory('id_document');
    setShowDocModal(true);
  };

  const handleDocumentUpload = async (file: File, title: string) => {
    if (!selectedDriver) return;

    const doc = await uploadDocument({
      company_id: companyId,
      driver_id: selectedDriver.id,
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

  const getDriverDocuments = (driverId: string) => {
    return documents.filter((d) => d.driver_id === driverId);
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
          <UserCircle className="w-7 h-7" />
          Drivers - {companyName}
        </h1>
        <p className="text-gray-600 mt-1">View and manage drivers for this company</p>
      </div>

      {drivers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Drivers</h2>
          <p className="text-gray-500">This company hasn't added any drivers yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => {
            const driverDocs = getDriverDocuments(driver.id);
            return (
              <div
                key={driver.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-[#9B2640]/10 rounded-lg">
                    <UserCircle className="w-6 h-6 text-[#9B2640]" />
                  </div>
                  <button
                    onClick={() => openDocModal(driver)}
                    className="p-2 text-gray-400 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors"
                    title="Manage Documents"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-[#06082C] mb-1">
                  {driver.first_name} {driver.last_name}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {driver.license_number}
                </p>

                <div className="space-y-2 text-sm">
                  {driver.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium text-gray-700">{driver.phone}</span>
                    </div>
                  )}
                  {driver.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium text-gray-700 truncate max-w-[180px]">{driver.email}</span>
                    </div>
                  )}
                  {driver.id_number && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">ID Number:</span>
                      <span className="font-medium text-gray-700">{driver.id_number}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Documents:</span>
                    <span className={`font-medium ${
                      driverDocs.length > 0 ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {driverDocs.length} uploaded
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Modal */}
      {showDocModal && selectedDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-[#06082C]">
                  Driver Documents
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedDriver.first_name} {selectedDriver.last_name} - {selectedDriver.license_number}
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
                {driverDocCategories.map((cat) => (
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
                  title={driverDocCategories.find((c) => c.category === activeDocCategory)?.title || ''}
                  onUpload={handleDocumentUpload}
                />
              </div>

              <DocumentList
                documents={getDriverDocuments(selectedDriver.id).filter(
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
