'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getCurrentUserCompany } from '@/database/queries/companies';
import { 
  getDriversByCompany, 
  createDriver, 
  updateDriver, 
  deleteDriver 
} from '@/database/queries/drivers';
import { getDocumentsByCompany, uploadDocument, deleteDocument } from '@/database/queries/documents';
import type { Company, Driver, DriverFormInput, Document, DocumentCategory } from '@/database/types';
import { Users, Plus, Edit2, Trash2, X, AlertCircle, FileText, Upload } from 'lucide-react';
import { SectionLoading } from '@/components/LoadingSpinner';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentList from '@/components/DocumentList';

const driverDocCategories: { category: DocumentCategory; title: string }[] = [
  { category: 'id_document', title: 'ID Document' },
  { category: 'drivers_license', title: "Driver's License" },
  { category: 'pdp', title: 'Professional Driving Permit (PDP)' },
  { category: 'passport', title: 'Passport' },
];

export default function TransporterDriversPage() {
  const { profile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [activeDocCategory, setActiveDocCategory] = useState<DocumentCategory>('id_document');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<DriverFormInput>({
    first_name: '',
    last_name: '',
    id_number: '',
    license_number: '',
    license_expiry: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyData = await getCurrentUserCompany();
        if (companyData) {
          setCompany(companyData);
          const driversData = await getDriversByCompany(companyData.id);
          setDrivers(driversData);
          const docs = await getDocumentsByCompany(companyData.id);
          setDocuments(docs);
        }
      } catch (err) {
        console.error('Error fetching drivers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      id_number: '',
      license_number: '',
      license_expiry: '',
      phone: '',
      email: '',
    });
    setEditingDriver(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
    setError(null);
  };

  const openEditModal = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      first_name: driver.first_name,
      last_name: driver.last_name,
      id_number: driver.id_number || '',
      license_number: driver.license_number || '',
      license_expiry: driver.license_expiry || '',
      phone: driver.phone || '',
      email: driver.email || '',
    });
    setShowModal(true);
    setError(null);
  };

  const openDocModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowDocModal(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    setSaving(true);
    setError(null);

    try {
      if (editingDriver) {
        const updated = await updateDriver(editingDriver.id, formData);
        setDrivers(drivers.map((d) => (d.id === updated.id ? updated : d)));
      } else {
        const created = await createDriver(company.id, formData);
        setDrivers([created, ...drivers]);
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save driver');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (driverId: string) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;

    try {
      await deleteDriver(driverId);
      setDrivers(drivers.filter((d) => d.id !== driverId));
    } catch (err) {
      console.error('Error deleting driver:', err);
      alert('Failed to delete driver');
    }
  };

  const handleDocumentUpload = async (file: File, title: string) => {
    if (!company || !selectedDriver) return;

    const doc = await uploadDocument({
      company_id: company.id,
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

  if (loading) {
    return <SectionLoading />;
  }

  if (!company) {
    return (
      <div className="text-center py-16">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
            <Users className="w-7 h-7" />
            Drivers
          </h1>
          <p className="text-gray-600 mt-1">Manage your drivers and their documents</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#06082C] text-white rounded-lg font-medium hover:bg-[#0a0e40] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Driver
        </button>
      </div>

      {/* Drivers Grid */}
      {drivers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Drivers Yet</h2>
          <p className="text-gray-500 mb-6">Add your first driver to get started.</p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#06082C] text-white rounded-lg font-medium hover:bg-[#0a0e40] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Driver
          </button>
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
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#06082C] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {driver.first_name[0]}{driver.last_name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#06082C]">
                        {driver.first_name} {driver.last_name}
                      </h3>
                      {driver.phone && (
                        <p className="text-sm text-gray-500">{driver.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openDocModal(driver)}
                      className="p-2 text-gray-400 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors"
                      title="Manage Documents"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(driver)}
                      className="p-2 text-gray-400 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(driver.id)}
                      className="p-2 text-gray-400 hover:text-[#9B2640] hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {driver.id_number && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">ID Number:</span>
                      <span className="font-medium text-gray-700">{driver.id_number}</span>
                    </div>
                  )}
                  {driver.license_number && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">License:</span>
                      <span className="font-medium text-gray-700">{driver.license_number}</span>
                    </div>
                  )}
                  {driver.license_expiry && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">License Expiry:</span>
                      <span className={`font-medium ${
                        new Date(driver.license_expiry) < new Date() 
                          ? 'text-[#9B2640]' 
                          : 'text-gray-700'
                      }`}>
                        {new Date(driver.license_expiry).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {driver.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium text-gray-700 truncate ml-2">{driver.email}</span>
                    </div>
                  )}
                </div>

                {/* Documents Badge */}
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

      {/* Add/Edit Driver Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[#06082C]">
                {editingDriver ? 'Edit Driver' : 'Add New Driver'}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Number
                </label>
                <input
                  type="text"
                  name="id_number"
                  value={formData.id_number}
                  onChange={handleChange}
                  placeholder="e.g., 8501015800086"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Number
                  </label>
                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Expiry
                  </label>
                  <input
                    type="date"
                    name="license_expiry"
                    value={formData.license_expiry}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g., 0821234567"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>
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
                  {saving ? 'Saving...' : editingDriver ? 'Update' : 'Add Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Driver Documents Modal */}
      {showDocModal && selectedDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-[#06082C]">
                  Driver Documents
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedDriver.first_name} {selectedDriver.last_name}
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

              {/* Document Upload */}
              <div className="mb-6">
                <DocumentUpload
                  category={activeDocCategory}
                  title={driverDocCategories.find((c) => c.category === activeDocCategory)?.title || ''}
                  onUpload={handleDocumentUpload}
                />
              </div>

              {/* Document List */}
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
