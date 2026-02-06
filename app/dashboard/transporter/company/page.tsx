'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { 
  getCurrentUserCompany, 
  createCompany, 
  updateCompany 
} from '@/database/queries/companies';
import { getDocumentsByCompany, uploadDocument, deleteDocument } from '@/database/queries/documents';
import type { Company, Document, CompanyFormInput, DocumentCategory } from '@/database/types';
import { Building2, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { SectionLoading } from '@/components/LoadingSpinner';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentList from '@/components/DocumentList';

const documentCategories: { category: DocumentCategory; title: string }[] = [
  { category: 'registration', title: 'Company Registration' },
  { category: 'cipc', title: 'CIPC Document' },
  { category: 'tax_document', title: 'Tax Document' },
];

export default function TransporterCompanyPage() {
  const { profile, refreshProfile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeDocCategory, setActiveDocCategory] = useState<DocumentCategory>('registration');

  const [formData, setFormData] = useState<CompanyFormInput>({
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
    does_cross_border: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyData = await getCurrentUserCompany();
        if (companyData) {
          setCompany(companyData);
          setFormData({
            name: companyData.name,
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
            does_cross_border: companyData.does_cross_border || false,
          });

          const docs = await getDocumentsByCompany(companyData.id);
          setDocuments(docs);
        }
      } catch (err) {
        console.error('Error fetching company:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      if (company) {
        const updated = await updateCompany(company.id, formData);
        setCompany(updated);
        setSuccess('Company information updated successfully');
      } else {
        const created = await createCompany(formData, 'transporter');
        setCompany(created);
        await refreshProfile();
        setSuccess('Company created successfully');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save company');
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentUpload = async (file: File, title: string) => {
    if (!company) return;

    const doc = await uploadDocument({
      company_id: company.id,
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

  if (loading) {
    return <SectionLoading />;
  }

  const provinces = [
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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#06082C] flex items-center gap-3">
          <Building2 className="w-7 h-7" />
          Company Information
        </h1>
        <p className="text-gray-600 mt-1">
          {company ? 'Update your company details and documents' : 'Set up your company profile'}
        </p>
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

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Company Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#06082C] mb-6">Company Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Number
                  </label>
                  <input
                    type="text"
                    name="tax_number"
                    value={formData.tax_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  >
                    <option value="">Select Province</option>
                    {provinces.map((p) => (
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="does_cross_border"
                    checked={formData.does_cross_border}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-[#06082C] focus:ring-[#06082C]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    This company does cross-border loads
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#06082C] text-white rounded-lg font-medium hover:bg-[#0a0e40] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : company ? 'Update Company' : 'Create Company'}
              </button>
            </form>
          </div>
        </div>

        {/* Documents Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#06082C] mb-6">Company Documents</h2>
            
            {company ? (
              <>
                {/* Document Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {documentCategories.map((cat) => (
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
                    title={documentCategories.find((c) => c.category === activeDocCategory)?.title || ''}
                    onUpload={handleDocumentUpload}
                  />
                </div>

                {/* Document List */}
                <DocumentList
                  documents={documents.filter((d) => d.category === activeDocCategory)}
                  onDelete={handleDocumentDelete}
                />
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Please create your company first to upload documents.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
