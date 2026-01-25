'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getCurrentUserCompany } from '@/database/queries/companies';
import { createLoad } from '@/database/queries/loads';
import type { Company, LoadFormInput, TrailerType } from '@/database/types';
import { Package, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
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

export default function NewLoadPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<LoadFormInput>({
    title: '',
    description: '',
    cargo_type: '',
    weight_tons: undefined,
    pickup_address: '',
    pickup_city: '',
    pickup_province: '',
    pickup_country: 'South Africa',
    pickup_date: '',
    pickup_time_window: '',
    delivery_address: '',
    delivery_city: '',
    delivery_province: '',
    delivery_country: 'South Africa',
    delivery_date: '',
    delivery_time_window: '',
    required_trailer_type: [],
    budget_amount: undefined,
    special_instructions: '',
    is_hazardous: false,
    is_cross_border: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyData = await getCurrentUserCompany();
        setCompany(companyData);
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
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value ? parseFloat(value) : undefined,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleTrailerTypeChange = (type: TrailerType) => {
    const current = formData.required_trailer_type || [];
    if (current.includes(type)) {
      setFormData({
        ...formData,
        required_trailer_type: current.filter((t) => t !== type),
      });
    } else {
      setFormData({
        ...formData,
        required_trailer_type: [...current, type],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    setSaving(true);
    setError(null);

    try {
      // Check if cross-border based on countries
      const isCrossBorder = 
        formData.pickup_country !== formData.delivery_country ||
        formData.is_cross_border;

      await createLoad(company.id, {
        ...formData,
        is_cross_border: isCrossBorder,
      });

      router.push('/dashboard/supplier/loads');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create load');
      setSaving(false);
    }
  };

  if (loading) {
    return <SectionLoading />;
  }

  if (!company) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No Company Found</h2>
        <p className="text-gray-500 mb-6">Please set up your company profile first.</p>
        <Link
          href="/dashboard/supplier/company"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#06082C] text-white rounded-lg font-medium hover:bg-[#0a0e40] transition-colors"
        >
          Setup Company
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/supplier/loads"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#06082C] mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Loads
        </Link>
        <h1 className="text-2xl font-bold text-[#06082C] flex items-center gap-3">
          <Package className="w-7 h-7" />
          Post New Load
        </h1>
        <p className="text-gray-600 mt-1">Create a new load for transporters to view</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Load Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#06082C] mb-6">Load Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Load Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Maize Coils from Johannesburg to Durban"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe the load, special requirements, etc."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Load Type
                    </label>
                    <input
                      type="text"
                      name="cargo_type"
                      value={formData.cargo_type}
                      onChange={handleChange}
                      placeholder="e.g., Steel, Chemicals, Food"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (tons)
                    </label>
                    <input
                      type="number"
                      name="weight_tons"
                      value={formData.weight_tons || ''}
                      onChange={handleChange}
                      step="0.1"
                      min="0"
                      placeholder="e.g., 30"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Amount (ZAR)
                  </label>
                  <input
                    type="number"
                    name="budget_amount"
                    value={formData.budget_amount || ''}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g., 25000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Required Trailer Type(s)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {trailerTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleTrailerTypeChange(type.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          formData.required_trailer_type?.includes(type.value)
                            ? 'bg-[#06082C] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_hazardous"
                      checked={formData.is_hazardous}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-[#9B2640] focus:ring-[#9B2640]"
                    />
                    <span className="text-sm text-gray-700">Hazardous Material</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_cross_border"
                      checked={formData.is_cross_border}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-[#9B2640] focus:ring-[#9B2640]"
                    />
                    <span className="text-sm text-gray-700">Cross-border</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    name="special_instructions"
                    value={formData.special_instructions}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Any special documentation or other requirements..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Locations */}
          <div className="space-y-6">
            {/* Pickup Location */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#06082C] mb-6">Pickup Location</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="pickup_address"
                    value={formData.pickup_address}
                    onChange={handleChange}
                    placeholder="Street address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="pickup_city"
                      value={formData.pickup_city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province *
                    </label>
                    <select
                      name="pickup_province"
                      value={formData.pickup_province}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                    >
                      <option value="">Select Province</option>
                      {provinces.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available From:
                    </label>
                    <input
                      type="date"
                      name="pickup_date"
                      value={formData.pickup_date}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Window
                    </label>
                    <input
                      type="text"
                      name="pickup_time_window"
                      value={formData.pickup_time_window}
                      onChange={handleChange}
                      placeholder="e.g., 06:00 - 12:00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="pickup_country"
                    value={formData.pickup_country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Location */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#06082C] mb-6">Delivery Location</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="delivery_address"
                    value={formData.delivery_address}
                    onChange={handleChange}
                    placeholder="Street address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="delivery_city"
                      value={formData.delivery_city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province *
                    </label>
                    <select
                      name="delivery_province"
                      value={formData.delivery_province}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                    >
                      <option value="">Select Province</option>
                      {provinces.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Until:
                    </label>
                    <input
                      type="date"
                      name="delivery_date"
                      value={formData.delivery_date}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Window
                    </label>
                    <input
                      type="text"
                      name="delivery_time_window"
                      value={formData.delivery_time_window}
                      onChange={handleChange}
                      placeholder="e.g., 08:00 - 16:00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="delivery_country"
                    value={formData.delivery_country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#9B2640] text-white rounded-lg font-medium hover:bg-[#7a1e33] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Posting Load...' : 'Post Load'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
