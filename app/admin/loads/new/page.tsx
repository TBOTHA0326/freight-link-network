'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';
import { geocodeAddress } from '@/lib/mapbox';
import { 
  Package, 
  MapPin, 
  Calendar, 
  Truck,
  ArrowLeft,
  Save,
  AlertCircle,
  Loader2,
  CheckCircle
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
  { value: 'flatbed', label: 'Flatbed' },
  { value: 'tautliner', label: 'Tautliner' },
  { value: 'refrigerated', label: 'Refrigerated' },
  { value: 'tanker', label: 'Tanker' },
  { value: 'side_tipper', label: 'Side Tipper' },
  { value: 'end_tipper', label: 'End Tipper' },
  { value: 'lowbed', label: 'Lowbed' },
  { value: 'container', label: 'Container' },
  { value: 'other', label: 'Other' },
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
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
    required_trailer_type: [] as string[],
    special_instructions: '',
    is_cross_border: false,
    is_hazardous: false,
    status: 'approved',
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

  const handleTrailerTypeToggle = (type: string) => {
    setFormData(prev => {
      const current = prev.required_trailer_type;
      if (current.includes(type)) {
        return { ...prev, required_trailer_type: current.filter(t => t !== type) };
      }
      return { ...prev, required_trailer_type: [...current, type] };
    });
  };

  const geocodeLocations = async () => {
    setGeocoding(true);
    setError(null);
    setSuccess(null);
    
    let geocodedPickup = false;
    let geocodedDelivery = false;
    
    try {
      // Geocode pickup location
      if (formData.pickup_city && !formData.pickup_lat) {
        const pickupAddress = [
          formData.pickup_address,
          formData.pickup_city,
          formData.pickup_province,
          'South Africa'
        ].filter(Boolean).join(', ');
        
        console.log('Geocoding pickup:', pickupAddress);
        const pickupCoords = await geocodeAddress(pickupAddress);
        console.log('Pickup coords:', pickupCoords);
        
        if (pickupCoords) {
          setFormData(prev => ({
            ...prev,
            pickup_lat: pickupCoords.latitude.toString(),
            pickup_lng: pickupCoords.longitude.toString()
          }));
          geocodedPickup = true;
        }
      }

      // Geocode delivery location
      if (formData.delivery_city && !formData.delivery_lat) {
        const deliveryAddress = [
          formData.delivery_address,
          formData.delivery_city,
          formData.delivery_province,
          'South Africa'
        ].filter(Boolean).join(', ');
        
        console.log('Geocoding delivery:', deliveryAddress);
        const deliveryCoords = await geocodeAddress(deliveryAddress);
        console.log('Delivery coords:', deliveryCoords);
        
        if (deliveryCoords) {
          setFormData(prev => ({
            ...prev,
            delivery_lat: deliveryCoords.latitude.toString(),
            delivery_lng: deliveryCoords.longitude.toString()
          }));
          geocodedDelivery = true;
        }
      }
      
      // Provide feedback
      if (geocodedPickup && geocodedDelivery) {
        setSuccess('Both pickup and delivery locations geocoded successfully!');
      } else if (geocodedPickup) {
        setSuccess('Pickup location geocoded. Delivery location could not be found - please check the address or enter coordinates manually.');
      } else if (geocodedDelivery) {
        setSuccess('Delivery location geocoded. Pickup location could not be found - please check the address or enter coordinates manually.');
      } else if (!formData.pickup_city && !formData.delivery_city) {
        setError('Please enter at least a city for pickup or delivery before geocoding.');
      } else if (formData.pickup_lat && formData.delivery_lat) {
        setSuccess('Coordinates already filled in.');
      } else {
        setError('Could not geocode addresses. Please check the addresses are valid South African locations, or enter coordinates manually. Make sure NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is set in your .env.local file.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Failed to geocode addresses. Please enter coordinates manually or check addresses.');
    } finally {
      setGeocoding(false);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return 'Load title is required';
    }
    if (!formData.pickup_city.trim()) {
      return 'Pickup city is required';
    }
    if (!formData.delivery_city.trim()) {
      return 'Delivery city is required';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Auto-geocode if coordinates are missing
      let pickupLat = formData.pickup_lat ? parseFloat(formData.pickup_lat) : null;
      let pickupLng = formData.pickup_lng ? parseFloat(formData.pickup_lng) : null;
      let deliveryLat = formData.delivery_lat ? parseFloat(formData.delivery_lat) : null;
      let deliveryLng = formData.delivery_lng ? parseFloat(formData.delivery_lng) : null;

      // Geocode if missing
      if (!pickupLat && formData.pickup_city) {
        const pickupAddress = [formData.pickup_address, formData.pickup_city, formData.pickup_province, 'South Africa'].filter(Boolean).join(', ');
        const coords = await geocodeAddress(pickupAddress);
        if (coords) {
          pickupLat = coords.latitude;
          pickupLng = coords.longitude;
        }
      }

      if (!deliveryLat && formData.delivery_city) {
        const deliveryAddress = [formData.delivery_address, formData.delivery_city, formData.delivery_province, 'South Africa'].filter(Boolean).join(', ');
        const coords = await geocodeAddress(deliveryAddress);
        if (coords) {
          deliveryLat = coords.latitude;
          deliveryLng = coords.longitude;
        }
      }

      const { error: insertError } = await supabase
        .from('loads')
        .insert({
          company_id: formData.company_id || null,
          created_by: user?.id,
          title: formData.title.trim(),
          description: formData.description || null,
          cargo_type: formData.cargo_type || null,
          weight_tons: formData.weight_tons ? parseFloat(formData.weight_tons) : null,
          pickup_address: formData.pickup_address || null,
          pickup_city: formData.pickup_city || null,
          pickup_province: formData.pickup_province || null,
          pickup_lat: pickupLat,
          pickup_lng: pickupLng,
          delivery_address: formData.delivery_address || null,
          delivery_city: formData.delivery_city || null,
          delivery_province: formData.delivery_province || null,
          delivery_lat: deliveryLat,
          delivery_lng: deliveryLng,
          pickup_date: formData.pickup_date || null,
          delivery_date: formData.delivery_date || null,
          budget_amount: formData.budget_amount ? parseFloat(formData.budget_amount) : null,
          required_trailer_type: formData.required_trailer_type.length > 0 ? formData.required_trailer_type : null,
          special_instructions: formData.special_instructions || null,
          is_cross_border: formData.is_cross_border,
          is_hazardous: formData.is_hazardous,
          status: formData.status,
        });

      if (insertError) {
        // Provide helpful error messages
        if (insertError.message?.includes('violates not-null constraint') && insertError.message?.includes('company_id')) {
          throw new Error('Database requires a company_id. Please run database/fix-admin-loads.sql in Supabase SQL Editor to enable admin load posting without a supplier.');
        }
        throw insertError;
      }

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

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p>{success}</p>
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
                placeholder="e.g., Maize - Johannesburg to Durban"
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
                min="0"
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#06082C] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-500" />
              Pickup Location
            </h2>
          </div>
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
                City *
              </label>
              <input
                type="text"
                required
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
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.pickup_lat}
                onChange={(e) => setFormData({ ...formData, pickup_lat: e.target.value })}
                placeholder="Auto-filled or enter manually"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.pickup_lng}
                onChange={(e) => setFormData({ ...formData, pickup_lng: e.target.value })}
                placeholder="Auto-filled or enter manually"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
          </div>
        </div>

        {/* Delivery Location */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#06082C] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              Delivery Location
            </h2>
          </div>
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
                City *
              </label>
              <input
                type="text"
                required
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
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.delivery_lat}
                onChange={(e) => setFormData({ ...formData, delivery_lat: e.target.value })}
                placeholder="Auto-filled or enter manually"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.delivery_lng}
                onChange={(e) => setFormData({ ...formData, delivery_lng: e.target.value })}
                placeholder="Auto-filled or enter manually"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
          </div>
        </div>

        {/* Geocode Button */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">Auto-fill Coordinates</p>
              <p className="text-sm text-blue-700">Click to automatically geocode pickup and delivery locations for map display</p>
            </div>
            <button
              type="button"
              onClick={geocodeLocations}
              disabled={geocoding || (!formData.pickup_city && !formData.delivery_city)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {geocoding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Geocoding...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  Geocode Addresses
                </>
              )}
            </button>
          </div>
        </div>

        {/* Schedule & Requirements */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#06082C] flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5" />
            Schedule &amp; Requirements
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available From
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
                Delivery By
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
                min="0"
                value={formData.budget_amount}
                onChange={(e) => setFormData({ ...formData, budget_amount: e.target.value })}
                placeholder="e.g., 25000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              >
                <option value="approved">Approved (Visible to transporters)</option>
                <option value="pending">Pending (Requires approval)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Required Trailer Type(s)
              </label>
              <div className="flex flex-wrap gap-2">
                {TRAILER_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTrailerTypeToggle(type.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      formData.required_trailer_type.includes(type.value)
                        ? 'bg-[#06082C] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions
              </label>
              <textarea
                value={formData.special_instructions}
                onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                rows={2}
                placeholder="Any special requirements or documentation needed..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C]"
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_cross_border}
                  onChange={(e) => setFormData({ ...formData, is_cross_border: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-[#06082C] focus:ring-[#06082C]"
                />
                <span className="font-medium text-gray-700">Cross-border load</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_hazardous}
                  onChange={(e) => setFormData({ ...formData, is_hazardous: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-[#9B2640] focus:ring-[#9B2640]"
                />
                <span className="font-medium text-gray-700">Hazardous material</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#06082C] text-white rounded-lg font-medium hover:bg-[#0a0e40] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Create Load
              </>
            )}
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
