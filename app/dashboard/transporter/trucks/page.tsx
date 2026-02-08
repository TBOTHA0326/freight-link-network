'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getCurrentUserCompany } from '@/database/queries/companies';
import { 
  getTrucksByCompany, 
  createTruck, 
  updateTruck, 
  deleteTruck 
} from '@/database/queries/trucks';
import { getDocumentsByTruck, uploadDocument, deleteDocument } from '@/database/queries/documents';
import type { Company, Truck, TruckFormInput, Document, DocumentCategory } from '@/database/types';
import { Truck as TruckIcon, Plus, Edit2, Trash2, X, AlertCircle, FileText } from 'lucide-react';
import { SectionLoading } from '@/components/LoadingSpinner';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentList from '@/components/DocumentList';

const truckDocCategories: { category: DocumentCategory; title: string }[] = [
  { category: 'truck_registration', title: 'Registration Certificate' },
  { category: 'roadworthy', title: 'Roadworthy Certificate' },
  { category: 'brake_test', title: 'Brake Test Certificate' },
  { category: 'other', title: 'Other Documents' },
];

export default function TransporterTrucksPage() {
  const { profile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [activeDocCategory, setActiveDocCategory] = useState<DocumentCategory>('truck_registration');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TruckFormInput>({
    registration_number: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    horse_type: '',
    number_of_axles: 2,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyData = await getCurrentUserCompany();
        if (companyData) {
          setCompany(companyData);
          const trucksData = await getTrucksByCompany(companyData.id);
          setTrucks(trucksData);
          // Fetch documents for all trucks
          const allDocs: Document[] = [];
          for (const truck of trucksData) {
            const truckDocs = await getDocumentsByTruck(truck.id);
            allDocs.push(...truckDocs);
          }
          setDocuments(allDocs);
        }
      } catch (err) {
        console.error('Error fetching trucks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      registration_number: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      horse_type: '',
      number_of_axles: 2,
    });
    setEditingTruck(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
    setError(null);
  };

  const openEditModal = (truck: Truck) => {
    setEditingTruck(truck);
    setFormData({
      registration_number: truck.registration_number,
      make: truck.make || '',
      model: truck.model || '',
      year: truck.year || new Date().getFullYear(),
      horse_type: truck.horse_type || '',
      number_of_axles: truck.number_of_axles || 2,
    });
    setShowModal(true);
    setError(null);
  };

  const openDocModal = (truck: Truck) => {
    setSelectedTruck(truck);
    setActiveDocCategory('truck_registration');
    setShowDocModal(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value, 10) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    setSaving(true);
    setError(null);

    try {
      if (editingTruck) {
        const updated = await updateTruck(editingTruck.id, formData);
        setTrucks(trucks.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const created = await createTruck(company.id, formData);
        setTrucks([created, ...trucks]);
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save truck');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (truckId: string) => {
    if (!confirm('Are you sure you want to delete this truck?')) return;

    try {
      await deleteTruck(truckId);
      setTrucks(trucks.filter((t) => t.id !== truckId));
      // Also remove associated documents from state
      setDocuments(documents.filter((d) => d.truck_id !== truckId));
    } catch (err) {
      console.error('Error deleting truck:', err);
      alert('Failed to delete truck');
    }
  };

  const handleDocumentUpload = async (file: File, title: string) => {
    if (!company || !selectedTruck) return;

    const doc = await uploadDocument({
      company_id: company.id,
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

  if (loading) {
    return <SectionLoading />;
  }

  if (!company) {
    return (
      <div className="text-center py-16">
        <TruckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No Company Found</h2>
        <p className="text-gray-500">Please set up your company profile first.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#06082C] flex items-center gap-3">
            <TruckIcon className="w-7 h-7" />
            Trucks
          </h1>
          <p className="text-gray-600 mt-1">Manage your fleet of trucks</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#06082C] text-white rounded-lg font-medium hover:bg-[#0a0e40] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Truck
        </button>
      </div>

      {/* Trucks Grid */}
      {trucks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <TruckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Trucks Yet</h2>
          <p className="text-gray-500 mb-6">Add your first truck to get started.</p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#06082C] text-white rounded-lg font-medium hover:bg-[#0a0e40] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Truck
          </button>
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
                <div className="flex gap-2">
                  <button
                    onClick={() => openDocModal(truck)}
                    className="p-2 text-gray-400 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors"
                    title="Manage Documents"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(truck)}
                    className="p-2 text-gray-400 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(truck.id)}
                    className="p-2 text-gray-400 hover:text-[#9B2640] hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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

              {/* Documents Badge */}
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[#06082C]">
                {editingTruck ? 'Edit Truck' : 'Add New Truck'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number *
                </label>
                <input
                  type="text"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleChange}
                  required
                  placeholder="e.g., ABC 123 GP"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Make
                  </label>
                  <input
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    placeholder="e.g., Scania"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g., R500"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Axles
                  </label>
                  <select
                    name="number_of_axles"
                    value={formData.number_of_axles}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  >
                    <option value={2}>2 Axles</option>
                    <option value={3}>3 Axles</option>
                    <option value={4}>4 Axles</option>
                    <option value={5}>5 Axles</option>
                    <option value={6}>6 Axles</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horse Type
                </label>
                <select
                  name="horse_type"
                  value={formData.horse_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                >
                  <option value="">Select Type</option>
                  <option value="sleeper">Sleeper</option>
                  <option value="day_cab">Day Cab</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-[#06082C] text-white rounded-lg font-medium hover:bg-[#0a0e40] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : editingTruck ? 'Update' : 'Add Truck'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Truck Documents Modal */}
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
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Document Category Tabs */}
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

              {/* Document Upload */}
              <div className="mb-6">
                <DocumentUpload
                  category={activeDocCategory}
                  title={truckDocCategories.find((c) => c.category === activeDocCategory)?.title || ''}
                  onUpload={handleDocumentUpload}
                />
              </div>

              {/* Document List */}
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
