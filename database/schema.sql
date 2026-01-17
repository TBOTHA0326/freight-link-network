-- =============================================
-- FREIGHT LINK NETWORK - SUPABASE SCHEMA
-- =============================================
-- Run this file in the Supabase SQL Editor
-- Order: 1 (Run this first)
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================

-- User roles enum
CREATE TYPE user_role AS ENUM ('transporter', 'supplier', 'admin');

-- Document status enum
CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected');

-- Load status enum
CREATE TYPE load_status AS ENUM ('pending', 'approved', 'rejected', 'in_transit', 'completed', 'cancelled');

-- Trailer type enum
CREATE TYPE trailer_type AS ENUM ('tautliner', 'flatbed', 'lowbed', 'tanker', 'refrigerated', 'container', 'side_tipper', 'end_tipper', 'other');

-- Document category enum
CREATE TYPE document_category AS ENUM (
  'registration',
  'cipc',
  'tax_document',
  'id_document',
  'drivers_license',
  'pdp',
  'passport',
  'truck_registration',
  'brake_test',
  'roadworthy',
  'trailer_registration',
  'other'
);

-- =============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- =============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'transporter',
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- COMPANIES TABLE
-- =============================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  registration_number TEXT,
  tax_number TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'South Africa',
  phone TEXT,
  email TEXT,
  website TEXT,
  company_type user_role NOT NULL, -- 'transporter' or 'supplier'
  does_cross_border BOOLEAN DEFAULT FALSE, -- Only for transporters
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- =============================================
-- DOCUMENTS TABLE (Universal for all document types)
-- =============================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  truck_id UUID, -- Will be linked via foreign key after trucks table
  trailer_id UUID, -- Will be linked via foreign key after trailers table
  driver_id UUID, -- Will be linked via foreign key after drivers table
  category document_category NOT NULL,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Storage path
  file_name TEXT NOT NULL,
  file_url TEXT, -- Public URL for document
  file_size INTEGER,
  mime_type TEXT,
  status document_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- =============================================
-- TRUCKS TABLE
-- =============================================

CREATE TABLE trucks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  registration_number TEXT NOT NULL,
  make TEXT,
  model TEXT,
  year INTEGER,
  horse_type TEXT, -- Type of horse/truck
  number_of_axles INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add foreign key constraint for truck_id in documents
ALTER TABLE documents 
ADD CONSTRAINT fk_documents_truck 
FOREIGN KEY (truck_id) REFERENCES trucks(id) ON DELETE CASCADE;

-- =============================================
-- TRAILERS TABLE
-- =============================================

CREATE TABLE trailers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  registration_number TEXT NOT NULL,
  trailer_type trailer_type NOT NULL,
  make TEXT,
  model TEXT,
  year INTEGER,
  length_meters DECIMAL(5, 2), -- Length in meters
  payload_capacity_tons DECIMAL(10, 2), -- Payload capacity in tons
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add foreign key constraint for trailer_id in documents
ALTER TABLE documents 
ADD CONSTRAINT fk_documents_trailer 
FOREIGN KEY (trailer_id) REFERENCES trailers(id) ON DELETE CASCADE;

-- =============================================
-- DRIVERS TABLE
-- =============================================

CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  id_number TEXT,
  license_number TEXT,
  license_expiry DATE,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add foreign key constraint for driver_id in documents
ALTER TABLE documents 
ADD CONSTRAINT fk_documents_driver 
FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE;

-- =============================================
-- LOADS TABLE
-- =============================================

CREATE TABLE loads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, -- Supplier company
  title TEXT NOT NULL,
  description TEXT,
  cargo_type TEXT,
  weight_tons DECIMAL(10, 2), -- Weight in tons
  pickup_address TEXT,
  pickup_city TEXT,
  pickup_province TEXT,
  pickup_country TEXT DEFAULT 'South Africa',
  pickup_lat DECIMAL(10, 8),
  pickup_lng DECIMAL(11, 8),
  pickup_date DATE,
  pickup_time_window TEXT,
  delivery_address TEXT,
  delivery_city TEXT,
  delivery_province TEXT,
  delivery_country TEXT DEFAULT 'South Africa',
  delivery_lat DECIMAL(10, 8),
  delivery_lng DECIMAL(11, 8),
  delivery_date DATE,
  delivery_time_window TEXT,
  required_trailer_type trailer_type[],
  budget_amount DECIMAL(12, 2),
  special_instructions TEXT,
  is_hazardous BOOLEAN DEFAULT FALSE,
  is_cross_border BOOLEAN DEFAULT FALSE,
  status load_status DEFAULT 'pending',
  assigned_transporter_id UUID REFERENCES companies(id),
  assigned_truck_id UUID REFERENCES trucks(id),
  assigned_driver_id UUID REFERENCES drivers(id),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- =============================================
-- ADMIN STATS TABLE (for dashboard metrics)
-- =============================================

CREATE TABLE admin_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stat_date DATE DEFAULT CURRENT_DATE UNIQUE,
  new_transporters INTEGER DEFAULT 0,
  new_suppliers INTEGER DEFAULT 0,
  pending_approvals INTEGER DEFAULT 0,
  total_loads INTEGER DEFAULT 0,
  approved_loads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_company ON profiles(company_id);
CREATE INDEX idx_companies_type ON companies(company_type);
CREATE INDEX idx_documents_company ON documents(company_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_trucks_company ON trucks(company_id);
CREATE INDEX idx_trailers_company ON trailers(company_id);
CREATE INDEX idx_drivers_company ON drivers(company_id);
CREATE INDEX idx_loads_company ON loads(company_id);
CREATE INDEX idx_loads_status ON loads(status);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_stats ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow insert during registration
CREATE POLICY "Enable insert for registration" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- COMPANIES POLICIES
-- =============================================

-- Users can view their own company
CREATE POLICY "Users can view own company" ON companies
  FOR SELECT USING (
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Users can update their own company
CREATE POLICY "Users can update own company" ON companies
  FOR UPDATE USING (
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Users can insert their own company
CREATE POLICY "Users can insert own company" ON companies
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Admins can view all companies
CREATE POLICY "Admins can view all companies" ON companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all companies
CREATE POLICY "Admins can update all companies" ON companies
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert companies
CREATE POLICY "Admins can insert companies" ON companies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- DOCUMENTS POLICIES
-- =============================================

-- Users can view documents for their company
CREATE POLICY "Users can view own company documents" ON documents
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Users can insert documents for their company
CREATE POLICY "Users can insert own company documents" ON documents
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can update documents for their company
CREATE POLICY "Users can update own company documents" ON documents
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Users can delete documents for their company
CREATE POLICY "Users can delete own company documents" ON documents
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Admins can view all documents
CREATE POLICY "Admins can view all documents" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all documents (for approvals)
CREATE POLICY "Admins can update all documents" ON documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert documents for any company
CREATE POLICY "Admins can insert any documents" ON documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete documents
CREATE POLICY "Admins can delete documents" ON documents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- TRUCKS POLICIES
-- =============================================

-- Users can view trucks for their company
CREATE POLICY "Users can view own company trucks" ON trucks
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Users can insert trucks for their company
CREATE POLICY "Users can insert own company trucks" ON trucks
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Users can update trucks for their company
CREATE POLICY "Users can update own company trucks" ON trucks
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Users can delete trucks for their company
CREATE POLICY "Users can delete own company trucks" ON trucks
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Admins can view all trucks
CREATE POLICY "Admins can view all trucks" ON trucks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all trucks
CREATE POLICY "Admins can update all trucks" ON trucks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert trucks
CREATE POLICY "Admins can insert trucks" ON trucks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- TRAILERS POLICIES
-- =============================================

-- Users can view trailers for their company
CREATE POLICY "Users can view own company trailers" ON trailers
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Users can insert trailers for their company
CREATE POLICY "Users can insert own company trailers" ON trailers
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Users can update trailers for their company
CREATE POLICY "Users can update own company trailers" ON trailers
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Users can delete trailers for their company
CREATE POLICY "Users can delete own company trailers" ON trailers
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Admins can view all trailers
CREATE POLICY "Admins can view all trailers" ON trailers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all trailers
CREATE POLICY "Admins can update all trailers" ON trailers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert trailers
CREATE POLICY "Admins can insert trailers" ON trailers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- DRIVERS POLICIES
-- =============================================

-- Users can view drivers for their company
CREATE POLICY "Users can view own company drivers" ON drivers
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Users can insert drivers for their company
CREATE POLICY "Users can insert own company drivers" ON drivers
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Users can update drivers for their company
CREATE POLICY "Users can update own company drivers" ON drivers
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Users can delete drivers for their company
CREATE POLICY "Users can delete own company drivers" ON drivers
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Admins can view all drivers
CREATE POLICY "Admins can view all drivers" ON drivers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all drivers
CREATE POLICY "Admins can update all drivers" ON drivers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert drivers
CREATE POLICY "Admins can insert drivers" ON drivers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- LOADS POLICIES
-- =============================================

-- Suppliers can view their own loads
CREATE POLICY "Suppliers can view own loads" ON loads
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Suppliers can insert their own loads
CREATE POLICY "Suppliers can insert own loads" ON loads
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Suppliers can update their own loads
CREATE POLICY "Suppliers can update own loads" ON loads
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Transporters can view approved loads
CREATE POLICY "Transporters can view approved loads" ON loads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'transporter'
    )
    AND status = 'approved'
  );

-- Admins can view all loads
CREATE POLICY "Admins can view all loads" ON loads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all loads
CREATE POLICY "Admins can update all loads" ON loads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert loads
CREATE POLICY "Admins can insert loads" ON loads
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete loads
CREATE POLICY "Admins can delete loads" ON loads
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- ADMIN STATS POLICIES
-- =============================================

-- Only admins can view stats
CREATE POLICY "Admins can view stats" ON admin_stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update stats
CREATE POLICY "Admins can update stats" ON admin_stats
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trucks_updated_at BEFORE UPDATE ON trucks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trailers_updated_at BEFORE UPDATE ON trailers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loads_updated_at BEFORE UPDATE ON loads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'transporter')
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update admin stats
CREATE OR REPLACE FUNCTION update_admin_stats()
RETURNS TRIGGER AS $$
DECLARE
  today DATE := CURRENT_DATE;
BEGIN
  -- Insert or update stats for today
  INSERT INTO admin_stats (stat_date, new_transporters, new_suppliers, pending_approvals, total_loads, approved_loads)
  VALUES (today, 0, 0, 0, 0, 0)
  ON CONFLICT (stat_date) DO NOTHING;

  -- Update counts
  UPDATE admin_stats
  SET
    new_transporters = (SELECT COUNT(*) FROM companies WHERE company_type = 'transporter' AND DATE(created_at) = today),
    new_suppliers = (SELECT COUNT(*) FROM companies WHERE company_type = 'supplier' AND DATE(created_at) = today),
    pending_approvals = (
      SELECT COUNT(*) FROM documents WHERE status = 'pending'
    ) + (
      SELECT COUNT(*) FROM loads WHERE status = 'pending'
    ),
    total_loads = (SELECT COUNT(*) FROM loads),
    approved_loads = (SELECT COUNT(*) FROM loads WHERE status = 'approved'),
    updated_at = NOW()
  WHERE stat_date = today;

  RETURN NULL;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Triggers to update admin stats
CREATE TRIGGER update_stats_on_company_change
  AFTER INSERT OR UPDATE ON companies
  FOR EACH STATEMENT EXECUTE FUNCTION update_admin_stats();

CREATE TRIGGER update_stats_on_document_change
  AFTER INSERT OR UPDATE ON documents
  FOR EACH STATEMENT EXECUTE FUNCTION update_admin_stats();

CREATE TRIGGER update_stats_on_load_change
  AFTER INSERT OR UPDATE ON loads
  FOR EACH STATEMENT EXECUTE FUNCTION update_admin_stats();
