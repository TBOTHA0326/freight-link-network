-- =============================================
-- FREIGHT LINK NETWORK - COMPLETE DATABASE SETUP
-- =============================================
-- 
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Create a New Query
-- 3. Copy and paste this ENTIRE file
-- 4. Click "Run" (or Ctrl+Enter)
-- 
-- This file includes EVERYTHING:
-- - Extensions
-- - Enums
-- - Tables
-- - Indexes
-- - Row Level Security (RLS) policies
-- - Functions & Triggers (including profile auto-creation)
-- - Edge functions for dashboard/admin
-- - Storage policies
-- 
-- =============================================

-- =============================================
-- PART 1: EXTENSIONS
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PART 2: ENUMS
-- =============================================

-- User roles enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('transporter', 'supplier', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Document status enum
DO $$ BEGIN
  CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Load status enum
DO $$ BEGIN
  CREATE TYPE load_status AS ENUM ('pending', 'approved', 'rejected', 'in_transit', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Trailer type enum
DO $$ BEGIN
  CREATE TYPE trailer_type AS ENUM ('tautliner', 'flatbed', 'lowbed', 'tanker', 'refrigerated', 'container', 'side_tipper', 'end_tipper', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Document category enum
DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- PART 3: TABLES
-- =============================================

-- PROFILES TABLE (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'transporter',
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMPANIES TABLE
CREATE TABLE IF NOT EXISTS companies (
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
  company_type user_role NOT NULL,
  does_cross_border BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  truck_id UUID,
  trailer_id UUID,
  driver_id UUID,
  category document_category NOT NULL,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
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

-- TRUCKS TABLE
CREATE TABLE IF NOT EXISTS trucks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  registration_number TEXT NOT NULL,
  make TEXT,
  model TEXT,
  year INTEGER,
  horse_type TEXT,
  number_of_axles INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add foreign key for truck_id in documents (if not exists)
DO $$ BEGIN
  ALTER TABLE documents 
  ADD CONSTRAINT fk_documents_truck 
  FOREIGN KEY (truck_id) REFERENCES trucks(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- TRAILERS TABLE
CREATE TABLE IF NOT EXISTS trailers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  registration_number TEXT NOT NULL,
  trailer_type trailer_type NOT NULL,
  make TEXT,
  model TEXT,
  year INTEGER,
  length_meters DECIMAL(5, 2),
  payload_capacity_tons DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add foreign key for trailer_id in documents (if not exists)
DO $$ BEGIN
  ALTER TABLE documents 
  ADD CONSTRAINT fk_documents_trailer 
  FOREIGN KEY (trailer_id) REFERENCES trailers(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- DRIVERS TABLE
CREATE TABLE IF NOT EXISTS drivers (
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

-- Add foreign key for driver_id in documents (if not exists)
DO $$ BEGIN
  ALTER TABLE documents 
  ADD CONSTRAINT fk_documents_driver 
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- LOADS TABLE
CREATE TABLE IF NOT EXISTS loads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE, -- Nullable for admin-posted loads
  title TEXT NOT NULL,
  description TEXT,
  cargo_type TEXT,
  weight_tons DECIMAL(10, 2),
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

-- ADMIN STATS TABLE
CREATE TABLE IF NOT EXISTS admin_stats (
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
-- PART 4: INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(company_type);
CREATE INDEX IF NOT EXISTS idx_documents_company ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_trucks_company ON trucks(company_id);
CREATE INDEX IF NOT EXISTS idx_trailers_company ON trailers(company_id);
CREATE INDEX IF NOT EXISTS idx_drivers_company ON drivers(company_id);
CREATE INDEX IF NOT EXISTS idx_loads_company ON loads(company_id);
CREATE INDEX IF NOT EXISTS idx_loads_status ON loads(status);

-- =============================================
-- PART 5: ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_stats ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PART 6: HELPER FUNCTION FOR ADMIN CHECK
-- =============================================
-- This function bypasses RLS to check if user is admin
-- (avoids infinite recursion in policies)

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role_value TEXT;
BEGIN
  SELECT role INTO user_role_value 
  FROM profiles 
  WHERE id = auth.uid();
  
  RETURN user_role_value = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- =============================================
-- PART 7: PROFILES RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for registration" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- CRITICAL: Allow profile creation during signup
-- This policy allows both the user themselves AND the service role (trigger) to insert
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id 
    OR auth.role() = 'service_role'
  );

-- Admins can view all profiles (uses helper function to avoid recursion)
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (is_admin())
  WITH CHECK (is_admin());

-- =============================================
-- PART 8: COMPANIES RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Users can view own company" ON companies;
DROP POLICY IF EXISTS "Users can update own company" ON companies;
DROP POLICY IF EXISTS "Users can insert own company" ON companies;
DROP POLICY IF EXISTS "Admins can view all companies" ON companies;
DROP POLICY IF EXISTS "Admins can update all companies" ON companies;
DROP POLICY IF EXISTS "Admins can insert companies" ON companies;

CREATE POLICY "Users can view own company" ON companies
  FOR SELECT USING (
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update own company" ON companies
  FOR UPDATE USING (
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert own company" ON companies
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can view all companies" ON companies
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all companies" ON companies
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can insert companies" ON companies
  FOR INSERT WITH CHECK (is_admin());

-- =============================================
-- PART 9: DOCUMENTS RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Users can view own company documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own company documents" ON documents;
DROP POLICY IF EXISTS "Users can update own company documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own company documents" ON documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON documents;
DROP POLICY IF EXISTS "Admins can update all documents" ON documents;
DROP POLICY IF EXISTS "Admins can insert any documents" ON documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON documents;

CREATE POLICY "Users can view own company documents" ON documents
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert own company documents" ON documents
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Users can update own company documents" ON documents
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete own company documents" ON documents
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can view all documents" ON documents
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all documents" ON documents
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can insert any documents" ON documents
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can delete documents" ON documents
  FOR DELETE USING (is_admin());

-- =============================================
-- PART 10: TRUCKS RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Users can view own company trucks" ON trucks;
DROP POLICY IF EXISTS "Users can insert own company trucks" ON trucks;
DROP POLICY IF EXISTS "Users can update own company trucks" ON trucks;
DROP POLICY IF EXISTS "Users can delete own company trucks" ON trucks;
DROP POLICY IF EXISTS "Admins can view all trucks" ON trucks;
DROP POLICY IF EXISTS "Admins can update all trucks" ON trucks;
DROP POLICY IF EXISTS "Admins can insert trucks" ON trucks;

CREATE POLICY "Users can view own company trucks" ON trucks
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert own company trucks" ON trucks
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update own company trucks" ON trucks
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete own company trucks" ON trucks
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can view all trucks" ON trucks
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all trucks" ON trucks
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can insert trucks" ON trucks
  FOR INSERT WITH CHECK (is_admin());

-- =============================================
-- PART 11: TRAILERS RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Users can view own company trailers" ON trailers;
DROP POLICY IF EXISTS "Users can insert own company trailers" ON trailers;
DROP POLICY IF EXISTS "Users can update own company trailers" ON trailers;
DROP POLICY IF EXISTS "Users can delete own company trailers" ON trailers;
DROP POLICY IF EXISTS "Admins can view all trailers" ON trailers;
DROP POLICY IF EXISTS "Admins can update all trailers" ON trailers;
DROP POLICY IF EXISTS "Admins can insert trailers" ON trailers;

CREATE POLICY "Users can view own company trailers" ON trailers
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert own company trailers" ON trailers
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update own company trailers" ON trailers
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete own company trailers" ON trailers
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can view all trailers" ON trailers
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all trailers" ON trailers
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can insert trailers" ON trailers
  FOR INSERT WITH CHECK (is_admin());

-- =============================================
-- PART 12: DRIVERS RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Users can view own company drivers" ON drivers;
DROP POLICY IF EXISTS "Users can insert own company drivers" ON drivers;
DROP POLICY IF EXISTS "Users can update own company drivers" ON drivers;
DROP POLICY IF EXISTS "Users can delete own company drivers" ON drivers;
DROP POLICY IF EXISTS "Admins can view all drivers" ON drivers;
DROP POLICY IF EXISTS "Admins can update all drivers" ON drivers;
DROP POLICY IF EXISTS "Admins can insert drivers" ON drivers;

CREATE POLICY "Users can view own company drivers" ON drivers
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert own company drivers" ON drivers
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update own company drivers" ON drivers
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete own company drivers" ON drivers
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can view all drivers" ON drivers
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all drivers" ON drivers
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can insert drivers" ON drivers
  FOR INSERT WITH CHECK (is_admin());

-- =============================================
-- PART 13: LOADS RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Suppliers can view own loads" ON loads;
DROP POLICY IF EXISTS "Suppliers can insert own loads" ON loads;
DROP POLICY IF EXISTS "Suppliers can update own loads" ON loads;
DROP POLICY IF EXISTS "Transporters can view approved loads" ON loads;
DROP POLICY IF EXISTS "Admins can view all loads" ON loads;
DROP POLICY IF EXISTS "Admins can update all loads" ON loads;
DROP POLICY IF EXISTS "Admins can insert loads" ON loads;
DROP POLICY IF EXISTS "Admins can delete loads" ON loads;

CREATE POLICY "Suppliers can view own loads" ON loads
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Suppliers can insert own loads" ON loads
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Suppliers can update own loads" ON loads
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Transporters can view approved loads" ON loads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'transporter'
    )
    AND status = 'approved'
  );

CREATE POLICY "Admins can view all loads" ON loads
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all loads" ON loads
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can insert loads" ON loads
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can delete loads" ON loads
  FOR DELETE USING (is_admin());

-- =============================================
-- PART 14: ADMIN STATS RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Admins can view stats" ON admin_stats;
DROP POLICY IF EXISTS "Admins can update stats" ON admin_stats;
DROP POLICY IF EXISTS "Admins can manage stats" ON admin_stats;

CREATE POLICY "Admins can view stats" ON admin_stats
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage stats" ON admin_stats
  FOR ALL USING (is_admin());

-- =============================================
-- PART 15: UPDATED_AT TRIGGER FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trucks_updated_at ON trucks;
CREATE TRIGGER update_trucks_updated_at BEFORE UPDATE ON trucks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trailers_updated_at ON trailers;
CREATE TRIGGER update_trailers_updated_at BEFORE UPDATE ON trailers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_drivers_updated_at ON drivers;
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_loads_updated_at ON loads;
CREATE TRIGGER update_loads_updated_at BEFORE UPDATE ON loads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- PART 16: HANDLE NEW USER SIGNUP (CRITICAL!)
-- =============================================
-- This trigger automatically creates a profile when
-- a new user signs up via Supabase Auth

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'role', '')::user_role, 
      'transporter'
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- PART 17: ADMIN STATS UPDATE FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION update_admin_stats()
RETURNS TRIGGER AS $$
DECLARE
  today DATE := CURRENT_DATE;
BEGIN
  INSERT INTO admin_stats (stat_date, new_transporters, new_suppliers, pending_approvals, total_loads, approved_loads)
  VALUES (today, 0, 0, 0, 0, 0)
  ON CONFLICT (stat_date) DO NOTHING;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Stats triggers
DROP TRIGGER IF EXISTS update_stats_on_company_change ON companies;
CREATE TRIGGER update_stats_on_company_change
  AFTER INSERT OR UPDATE ON companies
  FOR EACH STATEMENT EXECUTE FUNCTION update_admin_stats();

DROP TRIGGER IF EXISTS update_stats_on_document_change ON documents;
CREATE TRIGGER update_stats_on_document_change
  AFTER INSERT OR UPDATE ON documents
  FOR EACH STATEMENT EXECUTE FUNCTION update_admin_stats();

DROP TRIGGER IF EXISTS update_stats_on_load_change ON loads;
CREATE TRIGGER update_stats_on_load_change
  AFTER INSERT OR UPDATE ON loads
  FOR EACH STATEMENT EXECUTE FUNCTION update_admin_stats();

-- =============================================
-- PART 18: EDGE FUNCTIONS
-- =============================================

-- Get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalTransporters', (SELECT COUNT(*) FROM companies WHERE company_type = 'transporter'),
    'totalSuppliers', (SELECT COUNT(*) FROM companies WHERE company_type = 'supplier'),
    'newTransportersToday', (SELECT COUNT(*) FROM companies WHERE company_type = 'transporter' AND DATE(created_at) = CURRENT_DATE),
    'newSuppliersToday', (SELECT COUNT(*) FROM companies WHERE company_type = 'supplier' AND DATE(created_at) = CURRENT_DATE),
    'newTransportersThisWeek', (SELECT COUNT(*) FROM companies WHERE company_type = 'transporter' AND created_at >= DATE_TRUNC('week', CURRENT_DATE)),
    'newSuppliersThisWeek', (SELECT COUNT(*) FROM companies WHERE company_type = 'supplier' AND created_at >= DATE_TRUNC('week', CURRENT_DATE)),
    'pendingDocuments', (SELECT COUNT(*) FROM documents WHERE status = 'pending'),
    'pendingLoads', (SELECT COUNT(*) FROM loads WHERE status = 'pending'),
    'totalPendingApprovals', (
      (SELECT COUNT(*) FROM documents WHERE status = 'pending') +
      (SELECT COUNT(*) FROM loads WHERE status = 'pending')
    ),
    'totalLoads', (SELECT COUNT(*) FROM loads),
    'approvedLoads', (SELECT COUNT(*) FROM loads WHERE status = 'approved'),
    'totalTrucks', (SELECT COUNT(*) FROM trucks),
    'totalTrailers', (SELECT COUNT(*) FROM trailers),
    'totalDrivers', (SELECT COUNT(*) FROM drivers),
    'verifiedCompanies', (SELECT COUNT(*) FROM companies WHERE is_verified = true)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get company full details
CREATE OR REPLACE FUNCTION get_company_full_details(company_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'company', (SELECT row_to_json(c) FROM companies c WHERE c.id = company_uuid),
    'documents', (
      SELECT json_agg(row_to_json(d))
      FROM documents d
      WHERE d.company_id = company_uuid AND d.truck_id IS NULL AND d.trailer_id IS NULL AND d.driver_id IS NULL
    ),
    'trucks', (
      SELECT json_agg(
        json_build_object(
          'truck', row_to_json(t),
          'documents', (
            SELECT json_agg(row_to_json(d))
            FROM documents d
            WHERE d.truck_id = t.id
          )
        )
      )
      FROM trucks t
      WHERE t.company_id = company_uuid
    ),
    'trailers', (
      SELECT json_agg(
        json_build_object(
          'trailer', row_to_json(tr),
          'documents', (
            SELECT json_agg(row_to_json(d))
            FROM documents d
            WHERE d.trailer_id = tr.id
          )
        )
      )
      FROM trailers tr
      WHERE tr.company_id = company_uuid
    ),
    'drivers', (
      SELECT json_agg(
        json_build_object(
          'driver', row_to_json(dr),
          'documents', (
            SELECT json_agg(row_to_json(d))
            FROM documents d
            WHERE d.driver_id = dr.id
          )
        )
      )
      FROM drivers dr
      WHERE dr.company_id = company_uuid
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Review document function
CREATE OR REPLACE FUNCTION review_document(
  doc_id UUID,
  new_status document_status,
  reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  UPDATE documents
  SET
    status = new_status,
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    rejection_reason = CASE WHEN new_status = 'rejected' THEN reason ELSE NULL END
  WHERE id = doc_id;
  
  SELECT row_to_json(d) INTO result FROM documents d WHERE d.id = doc_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Review load function
CREATE OR REPLACE FUNCTION review_load(
  load_id UUID,
  new_status load_status,
  reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  UPDATE loads
  SET
    status = new_status,
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    rejection_reason = CASE WHEN new_status = 'rejected' THEN reason ELSE NULL END
  WHERE id = load_id;
  
  SELECT row_to_json(l) INTO result FROM loads l WHERE l.id = load_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get pending approvals
CREATE OR REPLACE FUNCTION get_pending_approvals()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'documents', (
      SELECT json_agg(
        json_build_object(
          'document', row_to_json(d),
          'company', (SELECT row_to_json(c) FROM companies c WHERE c.id = d.company_id)
        )
      )
      FROM documents d
      WHERE d.status = 'pending'
      ORDER BY d.created_at DESC
    ),
    'loads', (
      SELECT json_agg(
        json_build_object(
          'load', row_to_json(l),
          'company', (SELECT row_to_json(c) FROM companies c WHERE c.id = l.company_id)
        )
      )
      FROM loads l
      WHERE l.status = 'pending'
      ORDER BY l.created_at DESC
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search companies
CREATE OR REPLACE FUNCTION search_companies(
  search_term TEXT DEFAULT NULL,
  company_type_filter user_role DEFAULT NULL,
  verified_only BOOLEAN DEFAULT FALSE
)
RETURNS SETOF companies AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM companies c
  WHERE
    (search_term IS NULL OR c.name ILIKE '%' || search_term || '%' OR c.registration_number ILIKE '%' || search_term || '%')
    AND (company_type_filter IS NULL OR c.company_type = company_type_filter)
    AND (NOT verified_only OR c.is_verified = true)
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PART 19: PERMISSIONS / GRANTS
-- =============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON profiles TO anon, authenticated, service_role;
GRANT ALL ON companies TO anon, authenticated, service_role;
GRANT ALL ON documents TO anon, authenticated, service_role;
GRANT ALL ON trucks TO anon, authenticated, service_role;
GRANT ALL ON trailers TO anon, authenticated, service_role;
GRANT ALL ON drivers TO anon, authenticated, service_role;
GRANT ALL ON loads TO anon, authenticated, service_role;
GRANT ALL ON admin_stats TO anon, authenticated, service_role;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_company_full_details(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION review_document(UUID, document_status, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION review_load(UUID, load_status, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_approvals() TO authenticated;
GRANT EXECUTE ON FUNCTION search_companies(TEXT, user_role, BOOLEAN) TO authenticated;

-- =============================================
-- PART 20: STORAGE BUCKET POLICIES
-- =============================================
-- NOTE: You must create the 'documents' bucket manually in Supabase Dashboard:
-- Storage → Create new bucket → Name: "documents" → Public: checked (or unchecked for private)

-- Policy: Users can upload documents to their company folder
DROP POLICY IF EXISTS "Users can upload to company folder" ON storage.objects;
CREATE POLICY "Users can upload to company folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    (
      EXISTS (
        SELECT 1 FROM profiles p
        JOIN companies c ON p.company_id = c.id
        WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = c.id::text
      )
      OR is_admin()
    )
  );

-- Policy: Users can view documents from their company folder
DROP POLICY IF EXISTS "Users can view company documents" ON storage.objects;
CREATE POLICY "Users can view company documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    (
      EXISTS (
        SELECT 1 FROM profiles p
        JOIN companies c ON p.company_id = c.id
        WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = c.id::text
      )
      OR is_admin()
    )
  );

-- Policy: Users can update documents in their company folder
DROP POLICY IF EXISTS "Users can update company documents" ON storage.objects;
CREATE POLICY "Users can update company documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND
    (
      EXISTS (
        SELECT 1 FROM profiles p
        JOIN companies c ON p.company_id = c.id
        WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = c.id::text
      )
      OR is_admin()
    )
  );

-- Policy: Users can delete documents from their company folder
DROP POLICY IF EXISTS "Users can delete company documents" ON storage.objects;
CREATE POLICY "Users can delete company documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    (
      EXISTS (
        SELECT 1 FROM profiles p
        JOIN companies c ON p.company_id = c.id
        WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = c.id::text
      )
      OR is_admin()
    )
  );

-- =============================================
-- VERIFICATION QUERIES (Run after setup to verify)
-- =============================================

-- Check trigger exists
SELECT 'Trigger check:' as info, tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Check policies on profiles
SELECT 'Profiles policies:' as info, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Check handle_new_user function exists
SELECT 'Function check:' as info, proname, prosecdef as security_definer
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- =============================================
-- DONE!
-- =============================================
-- 
-- NEXT STEPS:
-- 1. Create the "documents" storage bucket in Supabase Dashboard:
--    Storage → New bucket → Name: "documents"
-- 
-- 2. Configure Auth settings in Supabase Dashboard:
--    Authentication → URL Configuration:
--    - Site URL: http://localhost:3000 (or your production URL)
--    - Redirect URLs: 
--      - http://localhost:3000/**
--      - http://localhost:3000/auth/callback
--      - http://localhost:3000/auth/confirm
--      - https://your-production-url.com/**
-- 
-- 3. Test signup:
--    - Register a new user
--    - Check that profile is created automatically
--    - Verify email works
-- 
-- 4. Create admin user (after registering):
--    UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
--
-- =============================================

SELECT '✅ Setup complete! Check verification queries above for confirmation.' as status;
