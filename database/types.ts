// ============================================================
// Enums
// ============================================================

export type UserRole = "transporter" | "supplier" | "admin";

export type RegistrationStatus =
  | "pending_admin_approval"
  | "approved_pending_setup"
  | "pending_final_approval"
  | "active"
  | "rejected";

export type LoadStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "in_transit"
  | "completed"
  | "cancelled";

export type DocumentStatus = "pending" | "approved" | "rejected";

export type DocumentCategory =
  | "registration"
  | "cipc"
  | "tax_document"
  | "id_document"
  | "drivers_license"
  | "pdp"
  | "passport"
  | "truck_registration"
  | "brake_test"
  | "roadworthy"
  | "trailer_registration"
  | "other";

export type TrailerType =
  | "tautliner"
  | "flatbed"
  | "lowbed"
  | "tanker"
  | "refrigerated"
  | "container"
  | "side_tipper"
  | "end_tipper"
  | "other";

// ============================================================
// Database Tables
// ============================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  registration_status: RegistrationStatus;
  company_id: string | null;
  rejection_reason: string | null;
  registration_approved_at: string | null;
  setup_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  registration_number: string | null;
  tax_number: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  company_type: UserRole;
  does_cross_border: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Load {
  id: string;
  company_id: string | null;
  title: string;
  description: string | null;
  cargo_type: string | null;
  weight_tons: number | null;
  contact_phone: string | null;
  internal_notes: string | null;
  pickup_address: string | null;
  pickup_city: string | null;
  pickup_province: string | null;
  pickup_country: string | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
  pickup_place_id: string | null;
  pickup_date: string | null;
  pickup_time_window: string | null;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_province: string | null;
  delivery_country: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  delivery_place_id: string | null;
  delivery_date: string | null;
  delivery_time_window: string | null;
  required_trailer_type: TrailerType[] | null;
  budget_amount: number | null;
  special_instructions: string | null;
  is_hazardous: boolean;
  is_cross_border: boolean;
  status: LoadStatus;
  assigned_transporter_id: string | null;
  assigned_truck_id: string | null;
  assigned_driver_id: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Truck {
  id: string;
  company_id: string;
  registration_number: string;
  make: string | null;
  model: string | null;
  year: number | null;
  horse_type: string | null;
  number_of_axles: number | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Trailer {
  id: string;
  company_id: string;
  registration_number: string;
  trailer_type: TrailerType;
  make: string | null;
  model: string | null;
  year: number | null;
  length_meters: number | null;
  payload_capacity_tons: number | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Driver {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  id_number: string | null;
  license_number: string | null;
  license_expiry: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface DocumentRecord {
  id: string;
  company_id: string;
  truck_id: string | null;
  trailer_id: string | null;
  driver_id: string | null;
  category: DocumentCategory;
  title: string;
  file_path: string;
  file_name: string;
  file_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  status: DocumentStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoadInterest {
  id: string;
  load_id: string;
  transporter_company_id: string;
  created_at: string;
}

export interface AdminStats {
  id: string;
  stat_date: string;
  new_transporters: number;
  new_suppliers: number;
  pending_approvals: number;
  total_loads: number;
  approved_loads: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Composite / View types
// ============================================================

export interface ProfileWithCompany extends Profile {
  company: Company | null;
}

export interface CompanyWithDocuments extends Company {
  documents: DocumentRecord[];
}

export interface MapLoad {
  id: string;
  title: string;
  status: LoadStatus;
  pickup_address: string | null;
  pickup_city: string | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  pickup_date: string | null;
  delivery_date: string | null;
  cargo_type: string | null;
  weight_tons: number | null;
  company_name: string | null;
  is_cross_border: boolean;
  is_hazardous: boolean;
}

export interface DashboardStats {
  total_users: number;
  pending_approvals: number;
  active_companies: number;
  total_loads: number;
  pending_loads: number;
  approved_loads: number;
  in_transit_loads: number;
  completed_loads: number;
  total_transporters: number;
  total_suppliers: number;
  pending_registrations: number;
  pending_setups: number;
}

export interface AddressSuggestion {
  id: string;
  place_name: string;
  lat: number;
  lng: number;
}

// ============================================================
// Form Input Types
// ============================================================

export interface RegisterFormInput {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role: "transporter" | "supplier";
}

export interface CompanyFormInput {
  name: string;
  registration_number: string;
  tax_number: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  does_cross_border: boolean;
  lat?: number;
  lng?: number;
  place_id?: string;
}

export interface LoadFormInput {
  title: string;
  description: string;
  cargo_type: string;
  weight_tons: string;
  contact_phone: string;
  internal_notes: string;
  pickup_address: string;
  pickup_city: string;
  pickup_province: string;
  pickup_country: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  pickup_place_id: string;
  pickup_date: string;
  pickup_time_window: string;
  delivery_address: string;
  delivery_city: string;
  delivery_province: string;
  delivery_country: string;
  delivery_lat: number | null;
  delivery_lng: number | null;
  delivery_place_id: string;
  delivery_date: string;
  delivery_time_window: string;
  required_trailer_type: TrailerType[];
  budget_amount: string;
  special_instructions: string;
  is_hazardous: boolean;
  is_cross_border: boolean;
}

export interface TruckFormInput {
  registration_number: string;
  make: string;
  model: string;
  year: string;
  horse_type: string;
  number_of_axles: string;
}

export interface TrailerFormInput {
  registration_number: string;
  trailer_type: TrailerType;
  make: string;
  model: string;
  year: string;
  length_meters: string;
  payload_capacity_tons: string;
}

export interface DriverFormInput {
  first_name: string;
  last_name: string;
  id_number: string;
  license_number: string;
  license_expiry: string;
  phone: string;
  email: string;
}

export interface DocumentUploadInput {
  company_id: string;
  category: DocumentCategory;
  title: string;
  file: File;
  truck_id?: string;
  trailer_id?: string;
  driver_id?: string;
}

export interface PaymentStatus {
  id: string;
  label: string;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  name: string;
  description: string | null;
  amount: number | null;
  status_id: string;
  load_id: string | null;
  company_id: string | null;
  company_name: string | null;
  category: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// PaymentRecord with joined fields returned by getPaymentRecords()
export interface PaymentRecordRow extends PaymentRecord {
  status: { id: string; label: string; color: string };
  load: { title: string } | null;
}

export interface PaymentRecordFormInput {
  name: string;
  description: string;
  amount: string;       // string for controlled input, parsed to number on save
  status_id: string;
  load_id: string;      // empty string = no link
  company_name: string; // free-text company name, empty string = none
  category: string;
}

export const PAYMENT_CATEGORIES = [
  "General",
  "Load / Freight",
  "Diesel & Fuel",
  "Maintenance & Repairs",
  "Insurance",
  "Driver Pay",
  "Toll Fees",
  "Permits & Licensing",
  "Border Fees",
  "Other",
] as const;

// ============================================================
// Constants
// ============================================================

export const SA_PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Free State",
  "Northern Cape",
];

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  registration: "Registration",
  cipc: "CIPC Certificate",
  tax_document: "Tax Document",
  id_document: "ID Document",
  drivers_license: "Driver's Licence",
  pdp: "PDP Certificate",
  passport: "Passport",
  truck_registration: "Truck Registration",
  brake_test: "Brake Test",
  roadworthy: "Roadworthy",
  trailer_registration: "Trailer Registration",
  other: "Other",
};

export const TRAILER_TYPE_LABELS: Record<TrailerType, string> = {
  tautliner: "Tautliner",
  flatbed: "Flatbed",
  lowbed: "Lowbed",
  tanker: "Tanker",
  refrigerated: "Refrigerated",
  container: "Container",
  side_tipper: "Side Tipper",
  end_tipper: "End Tipper",
  other: "Other",
};
