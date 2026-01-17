'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';
import { 
  Package, 
  MapPin, 
  Calendar, 
  Truck,
  ArrowLeft,
  Save,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const SA_PROVINCES = [
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

const TRAILER_TYPES = [
  'Flatbed',
  'Tautliner',
  'Refrigerated',
  'Tanker',
  'Tipper',
  'Lowbed',
  'Container',
  'Side Tipper',
  'Interlink',
  'Other',
];

interface Company {
  id: string;
  name: string;
  company_type: string;
}

export default function AdminNewLoadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Company[]>([]);
  
  const [formData, setFormData] = useState({
    company_id: '',
    title: '',
    description: '',
    cargo_type: '',
    weight_tons: '',
    pickup_address: '',
    pickup_city: '',
    pickup_province: '',
    pickup_lat: '',
    pickup_lng: '',
    delivery_address: '',
    delivery_city: '',
    delivery_province: '',
    delivery_lat: '',
    delivery_lng: '',
    pickup_date: '',
    delivery_date: '',
    budget_amount: '',
    required_trailer_type: '',
    special_requirements: '',
    is_cross_border: false,
    status: 'approved', // Admin can post directly as approved
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, company_type')
      .eq('company_type', 'supplier')
      .order('name');
    
    if (!error && data) {
      setSuppliers(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('loads')
        .insert({
          company_id: formData.company_id || null,
          created_by: user?.id,
          title: formData.title,
          description: formData.description || null,
          cargo_type: formData.cargo_type || null,
          weight_tons: formData.weight_tons ? parseFloat(formData.weight_tons) : null,
          pickup_address: formData.pickup_address || null,
          pickup_city: formData.pickup_city || null,
          pickup_province: formData.pickup_province || null,
          pickup_lat: formData.pickup_lat ? parseFloat(formData.pickup_lat) : null,
          pickup_lng: formData.pickup_lng ? parseFloat(formData.pickup_lng) : null,
          delivery_address: formData.delivery_address || null,
          delivery_city: formData.delivery_city || null,
          delivery_province: formData.delivery_province || null,
          delivery_lat: formData.delivery_lat ? parseFloat(formData.delivery_lat) : null,
          delivery_lng: formData.delivery_lng ? parseFloat(formData.delivery_lng) : null,
          pickup_date: formData.pickup_date || null,
          delivery_date: formData.delivery_date || null,
          budget_amount: formData.budget_amount ? parseFloat(formData.budget_amount) : null,
          required_trailer_type: formData.required_trailer_type || null,
          special_requirements: formData.special_requirements || null,
          is_cross_border: formData.is_cross_border,
          status: formData.status,
        });

      if (insertError) throw insertError;

      router.push('/admin/loads');
    } catch (err) {
      console.error('Error creating load:', err);
      setError(err instanceof Error ? err.message : 'Failed to create load');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link 
          href="/admin/loads" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#06082C] mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Loads
        </Link>
        <h1 className="text-2xl font-bold text-[#06082C] flex items-center gap-3">
          <Package className="w-7 h-7" />
          Add New Load
        </h1>
        <p className="text-gray-600 mt-1">
          Create a new load posting as admin
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#06082C] mb-4">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier (Optional)
              </label>
              <select
                value={formData.company_id}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              >
                <option value="">-- Admin Posted (No Supplier) --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Load Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Steel Coils - Johannesburg to Durban"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Additional details about the load..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cargo Type
              </label>
              <input
                type="text"
                value={formData.cargo_type}
                onChange={(e) => setFormData({ ...formData, cargo_type: e.target.value })}
                placeholder="e.g., Steel, Agricultural, General"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (Tons)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.weight_tons}
                onChange={(e) => setFormData({ ...formData, weight_tons: e.target.value })}
                placeholder="e.g., 30"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#06082C] flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-green-500" />
            Pickup Location
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.pickup_address}
                onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                placeholder="Street address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.pickup_city}
                onChange={(e) => setFormData({ ...formData, pickup_city: e.target.value })}
                placeholder="e.g., Johannesburg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Province
              </label>
              <select
                value={formData.pickup_province}
                onChange={(e) => setFormData({ ...formData, pickup_province: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              >
                <option value="">Select Province</option>
                {SA_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={formData.pickup_lat}
                onChange={(e) => setFormData({ ...formData, pickup_lat: e.target.value })}
                placeholder="-26.2041"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={formData.pickup_lng}
                onChange={(e) => setFormData({ ...formData, pickup_lng: e.target.value })}
                placeholder="28.0473"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
          </div>
        </div>

        {/* Delivery Location */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#06082C] flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-red-500" />
            Delivery Location
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.delivery_address}
                onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                placeholder="Street address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.delivery_city}
                onChange={(e) => setFormData({ ...formData, delivery_city: e.target.value })}
                placeholder="e.g., Durban"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Province
              </label>
              <select
                value={formData.delivery_province}
                onChange={(e) => setFormData({ ...formData, delivery_province: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              >
                <option value="">Select Province</option>
                {SA_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={formData.delivery_lat}
                onChange={(e) => setFormData({ ...formData, delivery_lat: e.target.value })}
                placeholder="-29.8587"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={formData.delivery_lng}
                onChange={(e) => setFormData({ ...formData, delivery_lng: e.target.value })}
                placeholder="31.0218"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
          </div>
        </div>

        {/* Schedule & Requirements */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#06082C] flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5" />
            Schedule & Requirements
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Date
              </label>
              <input
                type="date"
                value={formData.pickup_date}
                onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Date
              </label>
              <input
                type="date"
                value={formData.delivery_date}
                onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget (ZAR)
              </label>
              <input
                type="number"
                value={formData.budget_amount}
                onChange={(e) => setFormData({ ...formData, budget_amount: e.target.value })}
                placeholder="e.g., 25000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required Trailer Type
              </label>
              <select
                value={formData.required_trailer_type}
                onChange={(e) => setFormData({ ...formData, required_trailer_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              >
                <option value="">Any / Not Specified</option>
                {TRAILER_TYPES.map((t) => (
                  <option key={t} value={t.toLowerCase()}>{t}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requirements
              </label>
              <textarea
                value={formData.special_requirements}
                onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
                rows={2}
                placeholder="Any special handling, equipment, or documentation requirements..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_cross_border}
                  onChange={(e) => setFormData({ ...formData, is_cross_border: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-[#06082C] focus:ring-[#06082C]"
                />
                <span className="font-medium text-gray-900">Cross-border load</span>
              </label>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#06082C] flex items-center gap-2 mb-4">
            <Truck className="w-5 h-5" />
            Load Status
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
            >
              <option value="approved">Approved (Visible to transporters)</option>
              <option value="pending">Pending (Requires approval)</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#06082C] text-white rounded-lg font-medium hover:bg-[#0a0e40] transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Creating...' : 'Create Load'}
          </button>
          <Link
            href="/admin/loads"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
