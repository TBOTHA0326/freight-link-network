-- =============================================
-- COMPREHENSIVE RLS FIX - Run this ONCE in Supabase SQL Editor
-- =============================================
-- This fixes all RLS recursion issues by using SECURITY DEFINER functions.
-- Dashboard → SQL Editor → New Query → Paste ALL of this → Run
-- =============================================

-- =============================================
-- STEP 1: Create helper functions (SECURITY DEFINER bypasses RLS)
-- =============================================

-- Function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role = 'admin', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's company_id
CREATE OR REPLACE FUNCTION get_my_company_id()
RETURNS UUID AS $$
DECLARE
  cid UUID;
BEGIN
  SELECT company_id INTO cid 
  FROM profiles 
  WHERE id = auth.uid();
  
  RETURN cid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'unknown');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to all authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO anon;
GRANT EXECUTE ON FUNCTION get_my_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_company_id() TO anon;
GRANT EXECUTE ON FUNCTION get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_role() TO anon;

-- =============================================
-- STEP 2: Fix PROFILES policies
-- =============================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for registration" ON profiles;

-- Users can always see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Admins can view all profiles (uses SECURITY DEFINER function)
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (is_admin());

-- Allow insert during registration
CREATE POLICY "Enable insert for registration" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- =============================================
-- STEP 3: Fix COMPANIES policies
-- =============================================
DROP POLICY IF EXISTS "Users can view own company" ON companies;
DROP POLICY IF EXISTS "Users can update own company" ON companies;
DROP POLICY IF EXISTS "Users can insert own company" ON companies;
DROP POLICY IF EXISTS "Admins can view all companies" ON companies;
DROP POLICY IF EXISTS "Admins can update all companies" ON companies;
DROP POLICY IF EXISTS "Admins can insert companies" ON companies;
DROP POLICY IF EXISTS "Anyone can view verified companies" ON companies;

-- Users can view their own company
CREATE POLICY "Users can view own company" ON companies
  FOR SELECT USING (id = get_my_company_id());

-- Users can update their own company
CREATE POLICY "Users can update own company" ON companies
  FOR UPDATE USING (id = get_my_company_id());

-- Users can insert a company
CREATE POLICY "Users can insert own company" ON companies
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can view all companies
CREATE POLICY "Admins can view all companies" ON companies
  FOR SELECT USING (is_admin());

-- Admins can update all companies
CREATE POLICY "Admins can update all companies" ON companies
  FOR UPDATE USING (is_admin());

-- Admins can insert companies
CREATE POLICY "Admins can insert companies" ON companies
  FOR INSERT WITH CHECK (is_admin());

-- =============================================
-- STEP 4: Fix LOADS policies (the main issue)
-- =============================================
DROP POLICY IF EXISTS "Suppliers can view own loads" ON loads;
DROP POLICY IF EXISTS "Suppliers can insert own loads" ON loads;
DROP POLICY IF EXISTS "Suppliers can update own loads" ON loads;
DROP POLICY IF EXISTS "Transporters can view approved loads" ON loads;
DROP POLICY IF EXISTS "Admins can view all loads" ON loads;
DROP POLICY IF EXISTS "Admins can update all loads" ON loads;
DROP POLICY IF EXISTS "Admins can insert loads" ON loads;
DROP POLICY IF EXISTS "Admins can delete loads" ON loads;

-- Suppliers can view their own loads
CREATE POLICY "Suppliers can view own loads" ON loads
  FOR SELECT USING (company_id = get_my_company_id());

-- Suppliers can insert their own loads
CREATE POLICY "Suppliers can insert own loads" ON loads
  FOR INSERT WITH CHECK (company_id = get_my_company_id());

-- Suppliers can update their own loads
CREATE POLICY "Suppliers can update own loads" ON loads
  FOR UPDATE USING (company_id = get_my_company_id());

-- Transporters can view approved loads
CREATE POLICY "Transporters can view approved loads" ON loads
  FOR SELECT USING (
    get_my_role() = 'transporter' AND status = 'approved'
  );

-- Admins can view ALL loads
CREATE POLICY "Admins can view all loads" ON loads
  FOR SELECT USING (is_admin());

-- Admins can update ALL loads
CREATE POLICY "Admins can update all loads" ON loads
  FOR UPDATE USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can insert loads
CREATE POLICY "Admins can insert loads" ON loads
  FOR INSERT WITH CHECK (is_admin());

-- Admins can delete loads
CREATE POLICY "Admins can delete loads" ON loads
  FOR DELETE USING (is_admin());

-- =============================================
-- STEP 5: Fix DOCUMENTS policies
-- =============================================
DROP POLICY IF EXISTS "Users can view own company documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own company documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own company documents" ON documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON documents;
DROP POLICY IF EXISTS "Admins can insert all documents" ON documents;
DROP POLICY IF EXISTS "Admins can update all documents" ON documents;
DROP POLICY IF EXISTS "Admins can delete all documents" ON documents;

CREATE POLICY "Users can view own company documents" ON documents
  FOR SELECT USING (company_id = get_my_company_id());

CREATE POLICY "Users can insert own company documents" ON documents
  FOR INSERT WITH CHECK (company_id = get_my_company_id());

CREATE POLICY "Users can delete own company documents" ON documents
  FOR DELETE USING (company_id = get_my_company_id());

CREATE POLICY "Admins can view all documents" ON documents
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert all documents" ON documents
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update all documents" ON documents
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete all documents" ON documents
  FOR DELETE USING (is_admin());

-- =============================================
-- STEP 6: Fix TRUCKS policies
-- =============================================
DROP POLICY IF EXISTS "Users can view own company trucks" ON trucks;
DROP POLICY IF EXISTS "Users can insert own company trucks" ON trucks;
DROP POLICY IF EXISTS "Users can update own company trucks" ON trucks;
DROP POLICY IF EXISTS "Users can delete own company trucks" ON trucks;
DROP POLICY IF EXISTS "Admins can view all trucks" ON trucks;
DROP POLICY IF EXISTS "Admins can update all trucks" ON trucks;
DROP POLICY IF EXISTS "Admins can manage all trucks" ON trucks;

CREATE POLICY "Users can view own company trucks" ON trucks
  FOR SELECT USING (company_id = get_my_company_id());

CREATE POLICY "Users can insert own company trucks" ON trucks
  FOR INSERT WITH CHECK (company_id = get_my_company_id());

CREATE POLICY "Users can update own company trucks" ON trucks
  FOR UPDATE USING (company_id = get_my_company_id());

CREATE POLICY "Users can delete own company trucks" ON trucks
  FOR DELETE USING (company_id = get_my_company_id());

CREATE POLICY "Admins can view all trucks" ON trucks
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage all trucks" ON trucks
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- =============================================
-- STEP 7: Fix TRAILERS policies
-- =============================================
DROP POLICY IF EXISTS "Users can view own company trailers" ON trailers;
DROP POLICY IF EXISTS "Users can insert own company trailers" ON trailers;
DROP POLICY IF EXISTS "Users can update own company trailers" ON trailers;
DROP POLICY IF EXISTS "Users can delete own company trailers" ON trailers;
DROP POLICY IF EXISTS "Admins can view all trailers" ON trailers;
DROP POLICY IF EXISTS "Admins can update all trailers" ON trailers;
DROP POLICY IF EXISTS "Admins can manage all trailers" ON trailers;

CREATE POLICY "Users can view own company trailers" ON trailers
  FOR SELECT USING (company_id = get_my_company_id());

CREATE POLICY "Users can insert own company trailers" ON trailers
  FOR INSERT WITH CHECK (company_id = get_my_company_id());

CREATE POLICY "Users can update own company trailers" ON trailers
  FOR UPDATE USING (company_id = get_my_company_id());

CREATE POLICY "Users can delete own company trailers" ON trailers
  FOR DELETE USING (company_id = get_my_company_id());

CREATE POLICY "Admins can view all trailers" ON trailers
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage all trailers" ON trailers
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- =============================================
-- STEP 8: Fix DRIVERS policies
-- =============================================
DROP POLICY IF EXISTS "Users can view own company drivers" ON drivers;
DROP POLICY IF EXISTS "Users can insert own company drivers" ON drivers;
DROP POLICY IF EXISTS "Users can update own company drivers" ON drivers;
DROP POLICY IF EXISTS "Users can delete own company drivers" ON drivers;
DROP POLICY IF EXISTS "Admins can view all drivers" ON drivers;
DROP POLICY IF EXISTS "Admins can update all drivers" ON drivers;
DROP POLICY IF EXISTS "Admins can manage all drivers" ON drivers;

CREATE POLICY "Users can view own company drivers" ON drivers
  FOR SELECT USING (company_id = get_my_company_id());

CREATE POLICY "Users can insert own company drivers" ON drivers
  FOR INSERT WITH CHECK (company_id = get_my_company_id());

CREATE POLICY "Users can update own company drivers" ON drivers
  FOR UPDATE USING (company_id = get_my_company_id());

CREATE POLICY "Users can delete own company drivers" ON drivers
  FOR DELETE USING (company_id = get_my_company_id());

CREATE POLICY "Admins can view all drivers" ON drivers
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage all drivers" ON drivers
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- =============================================
-- STEP 9: Ensure proper grants
-- =============================================
GRANT ALL ON loads TO authenticated;
GRANT ALL ON companies TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON documents TO authenticated;
GRANT ALL ON trucks TO authenticated;
GRANT ALL ON trailers TO authenticated;
GRANT ALL ON drivers TO authenticated;

-- =============================================
-- VERIFY: Check all policies are correct
-- =============================================
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
