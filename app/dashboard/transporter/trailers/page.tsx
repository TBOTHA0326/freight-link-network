'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getCurrentUserCompany } from '@/database/queries/companies';
import { 
  getTrailersByCompany, 
  createTrailer, 
  updateTrailer, 
  deleteTrailer 
} from '@/database/queries/trailers';
import type { Company, Trailer, TrailerFormInput, TrailerType } from '@/database/types';
import { Container, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { SectionLoading } from '@/components/LoadingSpinner';

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

export default function TransporterTrailersPage() {
  const { profile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrailer, setEditingTrailer] = useState<Trailer | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TrailerFormInput>({
    registration_number: '',
    trailer_type: 'tautliner',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    length_meters: undefined,
    payload_capacity_tons: undefined,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyData = await getCurrentUserCompany();
        if (companyData) {
          setCompany(companyData);
          const trailersData = await getTrailersByCompany(companyData.id);
          setTrailers(trailersData);
        }
      } catch (err) {
        console.error('Error fetching trailers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      registration_number: '',
      trailer_type: 'tautliner',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      length_meters: undefined,
      payload_capacity_tons: undefined,
    });
    setEditingTrailer(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
    setError(null);
  };

  const openEditModal = (trailer: Trailer) => {
    setEditingTrailer(trailer);
    setFormData({
      registration_number: trailer.registration_number,
      trailer_type: trailer.trailer_type,
      make: trailer.make || '',
      model: trailer.model || '',
      year: trailer.year || new Date().getFullYear(),
      length_meters: trailer.length_meters || undefined,
      payload_capacity_tons: trailer.payload_capacity_tons || undefined,
    });
    setShowModal(true);
    setError(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? (value ? parseFloat(value) : undefined) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    setSaving(true);
    setError(null);

    try {
      if (editingTrailer) {
        const updated = await updateTrailer(editingTrailer.id, formData);
        setTrailers(trailers.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const created = await createTrailer(company.id, formData);
        setTrailers([created, ...trailers]);
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save trailer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (trailerId: string) => {
    if (!confirm('Are you sure you want to delete this trailer?')) return;

    try {
      await deleteTrailer(trailerId);
      setTrailers(trailers.filter((t) => t.id !== trailerId));
    } catch (err) {
      console.error('Error deleting trailer:', err);
      alert('Failed to delete trailer');
    }
  };

  const getTrailerTypeLabel = (type: TrailerType) => {
    return trailerTypes.find((t) => t.value === type)?.label || type;
  };

  if (loading) {
    return <SectionLoading />;
  }

  if (!company) {
    return (
      <div className="text-center py-16">
        <Container className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
            <Container className="w-7 h-7" />
            Trailers
          </h1>
          <p className="text-gray-600 mt-1">Manage your trailer fleet</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#06082C] text-white rounded-lg font-medium hover:bg-[#0a0e40] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Trailer
        </button>
      </div>

      {/* Trailers Grid */}
      {trailers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Container className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Trailers Yet</h2>
          <p className="text-gray-500 mb-6">Add your first trailer to get started.</p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#06082C] text-white rounded-lg font-medium hover:bg-[#0a0e40] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Trailer
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trailers.map((trailer) => (
            <div
              key={trailer.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-[#9B2640]/10 rounded-lg">
                  <Container className="w-6 h-6 text-[#9B2640]" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(trailer)}
                    className="p-2 text-gray-400 hover:text-[#06082C] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(trailer.id)}
                    className="p-2 text-gray-400 hover:text-[#9B2640] hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[#06082C]">
                {editingTrailer ? 'Edit Trailer' : 'Add New Trailer'}
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
                  placeholder="e.g., XYZ 789 GP"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trailer Type *
                </label>
                <select
                  name="trailer_type"
                  value={formData.trailer_type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                >
                  {trailerTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
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
                    placeholder="e.g., SA Truck Bodies"
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
                    placeholder="e.g., Interlink"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year || ''}
                    onChange={handleChange}
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Length (m)
                  </label>
                  <input
                    type="number"
                    name="length_meters"
                    value={formData.length_meters || ''}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    placeholder="12.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payload (t)
                  </label>
                  <input
                    type="number"
                    name="payload_capacity_tons"
                    value={formData.payload_capacity_tons || ''}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    placeholder="34"
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
                  {saving ? 'Saving...' : editingTrailer ? 'Update' : 'Add Trailer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
