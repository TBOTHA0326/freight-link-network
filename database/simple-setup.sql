-- =============================================
-- FREIGHT LINK NETWORK - SIMPLIFIED SETUP
-- =============================================
-- 
-- BEFORE RUNNING THIS:
-- 1. Go to Supabase Dashboard → Authentication → Providers → Email
-- 2. Toggle OFF "Confirm email" (users auto-verify on signup)
-- 3. Then run this entire file in SQL Editor
--
-- =============================================

-- =============================================
-- STEP 1: CLEAN SLATE (if re-running)
-- =============================================

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;

-- =============================================
-- STEP 2: EXTENSIONS
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- STEP 3: ENUMS (safe create)
-- =============================================

DO $$ BEGIN CREATE TYPE user_role AS ENUM ('transporter', 'supplier', 'admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE load_status AS ENUM ('pending', 'approved', 'rejected', 'in_transit', 'completed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE trailer_type AS ENUM ('tautliner', 'flatbed', 'lowbed', 'tanker', 'refrigerated', 'container', 'side_tipper', 'end_tipper', 'other'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE document_category AS ENUM ('registration', 'cipc', 'tax_document', 'id_document', 'drivers_license', 'pdp', 'passport', 'truck_registration', 'brake_test', 'roadworthy', 'trailer_registration', 'other'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============================================
-- STEP 4: TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'transporter',
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS loads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
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

-- Foreign keys for documents (safe add)
DO $$ BEGIN ALTER TABLE documents ADD CONSTRAINT fk_documents_truck FOREIGN KEY (truck_id) REFERENCES trucks(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE documents ADD CONSTRAINT fk_documents_trailer FOREIGN KEY (trailer_id) REFERENCES trailers(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE documents ADD CONSTRAINT fk_documents_driver FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============================================
-- STEP 5: INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(company_type);
CREATE INDEX IF NOT EXISTS idx_documents_company ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_trucks_company ON trucks(company_id);
CREATE INDEX IF NOT EXISTS idx_trailers_company ON trailers(company_id);
CREATE INDEX IF NOT EXISTS idx_drivers_company ON drivers(company_id);
CREATE INDEX IF NOT EXISTS idx_loads_company ON loads(company_id);
CREATE INDEX IF NOT EXISTS idx_loads_status ON loads(status);

-- =============================================
-- STEP 6: ENABLE RLS
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
-- STEP 7: PROFILE CREATION TRIGGER (CRITICAL!)
-- =============================================
-- This is the MOST important part - creates profile when user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_value user_role;
BEGIN
  -- Safely extract role from metadata, default to 'transporter'
  BEGIN
    user_role_value := COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'role'), '')::user_role,
      'transporter'::user_role
    );
  EXCEPTION WHEN OTHERS THEN
    user_role_value := 'transporter'::user_role;
  END;

  -- Insert profile (with upsert to handle edge cases)
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    user_role_value,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    role = COALESCE(EXCLUDED.role, profiles.role),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- STEP 8: HELPER FUNCTION FOR ADMIN CHECK
-- =============================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- =============================================
-- STEP 9: RLS POLICIES (Simplified & Working)
-- =============================================

-- Clear existing policies
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for registration" ON profiles;

-- PROFILES: Simple, non-recursive policies
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true); -- Allow all inserts (trigger handles this)
CREATE POLICY "profiles_select_admin" ON profiles FOR SELECT USING (is_admin());

-- COMPANIES policies
DROP POLICY IF EXISTS "Users can view own company" ON companies;
DROP POLICY IF EXISTS "Users can update own company" ON companies;
DROP POLICY IF EXISTS "Users can insert own company" ON companies;
DROP POLICY IF EXISTS "Admins can view all companies" ON companies;
DROP POLICY IF EXISTS "Admins can update all companies" ON companies;
DROP POLICY IF EXISTS "Admins can insert companies" ON companies;

CREATE POLICY "companies_select_own" ON companies FOR SELECT USING (
  id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR is_admin()
);
CREATE POLICY "companies_insert_own" ON companies FOR INSERT WITH CHECK (created_by = auth.uid() OR is_admin());
CREATE POLICY "companies_update_own" ON companies FOR UPDATE USING (
  id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR is_admin()
);

-- DOCUMENTS policies
DROP POLICY IF EXISTS "Users can view own company documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own company documents" ON documents;
DROP POLICY IF EXISTS "Users can update own company documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own company documents" ON documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON documents;
DROP POLICY IF EXISTS "Admins can update all documents" ON documents;
DROP POLICY IF EXISTS "Admins can insert any documents" ON documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON documents;

CREATE POLICY "documents_select" ON documents FOR SELECT USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR is_admin()
);
CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR is_admin()
);
CREATE POLICY "documents_update" ON documents FOR UPDATE USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR is_admin()
);
CREATE POLICY "documents_delete" ON documents FOR DELETE USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR is_admin()
);

-- TRUCKS policies
DROP POLICY IF EXISTS "Users can view own company trucks" ON trucks;
DROP POLICY IF EXISTS "Users can insert own company trucks" ON trucks;
DROP POLICY IF EXISTS "Users can update own company trucks" ON trucks;
DROP POLICY IF EXISTS "Users can delete own company trucks" ON trucks;
DROP POLICY IF EXISTS "Admins can view all trucks" ON trucks;
DROP POLICY IF EXISTS "Admins can update all trucks" ON trucks;
DROP POLICY IF EXISTS "Admins can insert trucks" ON trucks;

CREATE POLICY "trucks_select" ON trucks FOR SELECT USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR is_admin()
);
CREATE POLICY "trucks_insert" ON trucks FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR is_admin()
);
CREATE POLICY "trucks_update" ON trucks FOR UPDATE USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR is_admin()
);
CREATE POLICY "trucks_delete" ON trucks FOR DELETE USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR is_admin()
);

-- TRAILERS policies
DROP POLICY IF EXISTS "Users can view own company trailers" ON trailers;
DROP POLICY IF EXISTS "Users can insert own company trailers" ON trailers;
DROP POLICY IF EXISTS "Users can update own company trailers" ON trailers;
DROP POLICY IF EXISTS "Users can delete own company trailers" ON trailers;
DROP POLICY IF EXISTS "Admins can view all trailers" ON trailers;
DROP POLICY IF EXISTS "Admins can update all trailers" ON trailers;
DROP POLICY IF EXISTS "Admins can insert trailers" ON trailers;

CREATE POLICY "trailers_select" ON trailers FOR SELECT USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR is_admin()
);
CREATE POLICY "trailers_insert" ON trailers FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR is_admin()
);
CREATE POLICY "trailers_update" ON trailers FOR UPDATE USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR is_admin()
);
CREATE POLICY "trailers_delete" ON trailers FOR DELETE USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR is_admin()
);

-- DRIVERS policies
DROP POLICY IF EXISTS "Users can view own company drivers" ON drivers;
DROP POLICY IF EXISTS "Users can insert own company drivers" ON drivers;
DROP POLICY IF EXISTS "Users can update own company drivers" ON drivers;
DROP POLICY IF EXISTS "Users can delete own company drivers" ON drivers;
DROP POLICY IF EXISTS "Admins can view all drivers" ON drivers;
DROP POLICY IF EXISTS "Admins can update all drivers" ON drivers;
DROP POLICY IF EXISTS "Admins can insert drivers" ON drivers;

CREATE POLICY "drivers_select" ON drivers FOR SELECT USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR is_admin()
);
CREATE POLICY "drivers_insert" ON drivers FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR is_admin()
);
CREATE POLICY "drivers_update" ON drivers FOR UPDATE USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR is_admin()
);
CREATE POLICY "drivers_delete" ON drivers FOR DELETE USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR is_admin()
);

-- LOADS policies
DROP POLICY IF EXISTS "Suppliers can view own loads" ON loads;
DROP POLICY IF EXISTS "Suppliers can insert own loads" ON loads;
DROP POLICY IF EXISTS "Suppliers can update own loads" ON loads;
DROP POLICY IF EXISTS "Transporters can view approved loads" ON loads;
DROP POLICY IF EXISTS "Admins can view all loads" ON loads;
DROP POLICY IF EXISTS "Admins can update all loads" ON loads;
DROP POLICY IF EXISTS "Admins can insert loads" ON loads;
DROP POLICY IF EXISTS "Admins can delete loads" ON loads;

CREATE POLICY "loads_select_own" ON loads FOR SELECT USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "loads_select_approved" ON loads FOR SELECT USING (
  status = 'approved' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'transporter')
);
CREATE POLICY "loads_select_admin" ON loads FOR SELECT USING (is_admin());
CREATE POLICY "loads_insert" ON loads FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR is_admin()
);
CREATE POLICY "loads_update" ON loads FOR UPDATE USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()) OR is_admin()
);
CREATE POLICY "loads_delete" ON loads FOR DELETE USING (is_admin());

-- ADMIN_STATS policies
DROP POLICY IF EXISTS "Admins can view stats" ON admin_stats;
DROP POLICY IF EXISTS "Admins can manage stats" ON admin_stats;

CREATE POLICY "admin_stats_all" ON admin_stats FOR ALL USING (is_admin());

-- =============================================
-- STEP 10: GRANTS
-- =============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- =============================================
-- STEP 11: BACKFILL ANY EXISTING USERS WITHOUT PROFILES
-- =============================================

INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  u.id,
  COALESCE(u.email, ''),
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data->>'role'), '')::user_role,
    'transporter'::user_role
  )
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- VERIFICATION
-- =============================================

SELECT '=== TRIGGER CHECK ===' as info;
SELECT tgname, tgrelid::regclass, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

SELECT '=== FUNCTION CHECK ===' as info;
SELECT proname, prosecdef as is_security_definer
FROM pg_proc 
WHERE proname = 'handle_new_user';

SELECT '=== PROFILES POLICIES ===' as info;
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';

SELECT '=== EXISTING PROFILES ===' as info;
SELECT id, email, role, created_at FROM profiles ORDER BY created_at DESC LIMIT 5;

SELECT '=== USERS WITHOUT PROFILES ===' as info;
SELECT u.id, u.email, p.id IS NOT NULL as has_profile
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id;

-- =============================================
-- ✅ DONE!
-- =============================================
-- 
-- NOW TEST:
-- 1. Make sure "Confirm email" is OFF in Supabase Auth settings
-- 2. Register a new user in your app
-- 3. They should be logged in immediately (no email needed)
-- 4. Check profiles table - should have a new row
--
-- To create an admin:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
--
-- =============================================

SELECT '✅ Setup complete! Email confirmation is disabled - users auto-verify on signup.' as status;
