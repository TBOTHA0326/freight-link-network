// =============================================
// FREIGHT LINK NETWORK - DATABASE TYPES
// =============================================

// User roles
export type UserRole = 'transporter' | 'supplier' | 'admin';

// Document status
export type DocumentStatus = 'pending' | 'approved' | 'rejected';

// Load status
export type LoadStatus = 'pending' | 'approved' | 'rejected' | 'in_transit' | 'completed' | 'cancelled';

// Trailer types
export type TrailerType = 
  | 'tautliner' 
  | 'flatbed' 
  | 'lowbed' 
  | 'tanker' 
  | 'refrigerated' 
  | 'container' 
  | 'side_tipper' 
  | 'end_tipper' 
  | 'other';

// Document categories
export type DocumentCategory =
  | 'registration'
  | 'cipc'
  | 'tax_document'
  | 'id_document'
  | 'drivers_license'
  | 'pdp'
  | 'passport'
  | 'truck_registration'
  | 'brake_test'
  | 'roadworthy'
  | 'trailer_registration'
  | 'other';

// Profile type
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

// Company type
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

// Document type (named DocumentRecord to avoid conflict with DOM Document)
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
  created_at: string;
  updated_at: string;
  uploaded_by: string | null;
}

// Alias for backward compatibility
export type Document = DocumentRecord;

// Truck type
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

// Trailer type
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

// Driver type
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

// Load type
export interface Load {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  cargo_type: string | null;
  weight_tons: number | null;
  pickup_address: string | null;
  pickup_city: string | null;
  pickup_province: string | null;
  pickup_country: string | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
  pickup_date: string | null;
  pickup_time_window: string | null;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_province: string | null;
  delivery_country: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
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

// Admin stats type
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

// Extended types with relations
export interface TruckWithDocuments extends Truck {
  documents?: Document[];
}

export interface TrailerWithDocuments extends Trailer {
  documents?: Document[];
}

export interface DriverWithDocuments extends Driver {
  documents?: Document[];
}

export interface CompanyWithDetails extends Company {
  documents?: Document[];
  trucks?: TruckWithDocuments[];
  trailers?: TrailerWithDocuments[];
  drivers?: DriverWithDocuments[];
}

export interface LoadWithCompany extends Load {
  company?: Company;
  company_name?: string;
}

// Dashboard stats response type
export interface DashboardStats {
  totalTransporters: number;
  totalSuppliers: number;
  newTransportersToday: number;
  newSuppliersToday: number;
  newTransportersThisWeek: number;
  newSuppliersThisWeek: number;
  pendingDocuments: number;
  pendingLoads: number;
  totalPendingApprovals: number;
  totalLoads: number;
  approvedLoads: number;
  totalTrucks: number;
  totalTrailers: number;
  totalDrivers: number;
  verifiedCompanies: number;
}

// Pending approvals response type
export interface PendingApprovals {
  documents: Array<{
    document: Document;
    company: Company;
  }>;
  loads: Array<{
    load: Load;
    company: Company;
  }>;
}

// Map load type for display
export interface MapLoad {
  id: string;
  title: string;
  budget_amount: number | null;
  pickup_city: string | null;
  pickup_province: string | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
  delivery_city: string | null;
  delivery_province: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  cargo_type: string | null;
  required_trailer_type: TrailerType[] | null;
  status: LoadStatus;
  company_name: string;
}

// Form input types
export interface CompanyFormInput {
  name: string;
  registration_number?: string;
  tax_number?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  does_cross_border?: boolean;
}

export interface TruckFormInput {
  registration_number: string;
  make?: string;
  model?: string;
  year?: number;
  horse_type?: string;
  number_of_axles?: number;
  company_id?: string;
}

export interface TrailerFormInput {
  registration_number: string;
  trailer_type: TrailerType;
  make?: string;
  model?: string;
  year?: number;
  length_meters?: number;
  payload_capacity_tons?: number;
  company_id?: string;
}

export interface DriverFormInput {
  first_name: string;
  last_name: string;
  id_number?: string;
  license_number?: string;
  license_expiry?: string;
  phone?: string;
  email?: string;
  company_id?: string;
}

export interface LoadFormInput {
  title: string;
  description?: string;
  cargo_type?: string;
  weight_tons?: number;
  pickup_address?: string;
  pickup_city?: string;
  pickup_province?: string;
  pickup_country?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  pickup_date?: string;
  pickup_time_window?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_province?: string;
  delivery_country?: string;
  delivery_lat?: number;
  delivery_lng?: number;
  delivery_date?: string;
  delivery_time_window?: string;
  required_trailer_type?: TrailerType[];
  budget_amount?: number;
  special_instructions?: string;
  is_hazardous?: boolean;
  is_cross_border?: boolean;
  company_id?: string;
}

// Document upload input
export interface DocumentUploadInput {
  company_id: string;
  truck_id?: string;
  trailer_id?: string;
  driver_id?: string;
  category: DocumentCategory;
  title: string;
  file: File;
}

// Database tables for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
        Relationships: [];
      };
      companies: {
        Row: Company;
        Insert: Partial<Company>;
        Update: Partial<Company>;
        Relationships: [];
      };
      documents: {
        Row: DocumentRecord;
        Insert: Partial<DocumentRecord>;
        Update: Partial<DocumentRecord>;
        Relationships: [];
      };
      trucks: {
        Row: Truck;
        Insert: Partial<Truck>;
        Update: Partial<Truck>;
        Relationships: [];
      };
      trailers: {
        Row: Trailer;
        Insert: Partial<Trailer>;
        Update: Partial<Trailer>;
        Relationships: [];
      };
      drivers: {
        Row: Driver;
        Insert: Partial<Driver>;
        Update: Partial<Driver>;
        Relationships: [];
      };
      loads: {
        Row: Load;
        Insert: Partial<Load>;
        Update: Partial<Load>;
        Relationships: [];
      };
      admin_stats: {
        Row: AdminStats;
        Insert: Partial<AdminStats>;
        Update: Partial<AdminStats>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_admin_dashboard_stats: {
        Args: Record<string, never>;
        Returns: DashboardStats;
      };
      get_company_full_details: {
        Args: { company_uuid: string };
        Returns: CompanyWithDetails;
      };
      review_document: {
        Args: { doc_id: string; new_status: DocumentStatus; reason?: string };
        Returns: DocumentRecord;
      };
      review_load: {
        Args: { load_id: string; new_status: LoadStatus; reason?: string };
        Returns: Load;
      };
      get_pending_approvals: {
        Args: Record<string, never>;
        Returns: PendingApprovals;
      };
      get_map_loads: {
        Args: { user_role_param: UserRole; user_company_id?: string };
        Returns: MapLoad[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
