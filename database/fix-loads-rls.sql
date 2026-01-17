-- =============================================
-- FIX: Loads RLS Policies for Admin Access
-- =============================================
-- Run this in Supabase SQL Editor AFTER running fix-profiles-rls.sql
-- Dashboard → SQL Editor → New Query → Paste & Run

-- Step 1: Check if is_admin() function exists (should exist from fix-profiles-rls.sql)
-- If not, create it:
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

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO anon;

-- Step 2: Drop existing loads policies that might cause recursion
DROP POLICY IF EXISTS "Admins can view all loads" ON loads;
DROP POLICY IF EXISTS "Admins can update all loads" ON loads;
DROP POLICY IF EXISTS "Admins can insert loads" ON loads;
DROP POLICY IF EXISTS "Admins can delete loads" ON loads;

-- Step 3: Create new admin policies using is_admin() function
CREATE POLICY "Admins can view all loads" ON loads
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all loads" ON loads
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can insert loads" ON loads
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete loads" ON loads
  FOR DELETE
  USING (is_admin());

-- =============================================
-- DEBUG: Check your setup
-- =============================================

-- Check how many loads exist:
SELECT COUNT(*) as total_loads FROM loads;

-- Check loads with coordinates:
SELECT COUNT(*) as loads_with_coords FROM loads WHERE pickup_lat IS NOT NULL;

-- View sample loads:
SELECT id, title, status, pickup_city, pickup_lat, pickup_lng 
FROM loads 
LIMIT 5;

-- Check your profile role:
SELECT id, email, role FROM profiles WHERE id = auth.uid();

-- =============================================
-- INSERT SAMPLE LOADS (if none exist)
-- =============================================
-- Uncomment and run if you have no loads:

/*
-- First, get or create a company for the loads
INSERT INTO companies (name, company_type, is_verified)
VALUES ('Admin Test Company', 'supplier', true)
ON CONFLICT DO NOTHING;

-- Get the company ID
DO $$
DECLARE
  test_company_id UUID;
BEGIN
  SELECT id INTO test_company_id FROM companies WHERE name = 'Admin Test Company' LIMIT 1;
  
  -- Insert sample loads with coordinates
  INSERT INTO loads (company_id, title, status, cargo_type, weight_tons, pickup_city, pickup_province, pickup_lat, pickup_lng, delivery_city, delivery_province, delivery_lat, delivery_lng, pickup_date)
  VALUES 
    (test_company_id, 'Steel Beams to Durban', 'approved', 'Steel', 25, 'Johannesburg', 'Gauteng', -26.2041, 28.0473, 'Durban', 'KwaZulu-Natal', -29.8587, 31.0218, CURRENT_DATE + INTERVAL '2 days'),
    (test_company_id, 'Mining Equipment', 'approved', 'Machinery', 40, 'Pretoria', 'Gauteng', -25.7479, 28.2293, 'Rustenburg', 'North West', -25.6669, 27.2418, CURRENT_DATE + INTERVAL '3 days'),
    (test_company_id, 'Fresh Produce', 'pending', 'Agricultural', 15, 'Cape Town', 'Western Cape', -33.9249, 18.4241, 'Port Elizabeth', 'Eastern Cape', -33.9608, 25.6022, CURRENT_DATE + INTERVAL '1 day'),
    (test_company_id, 'Automotive Parts', 'approved', 'Automotive', 8, 'East London', 'Eastern Cape', -33.0153, 27.9116, 'Bloemfontein', 'Free State', -29.0852, 26.1596, CURRENT_DATE + INTERVAL '4 days'),
    (test_company_id, 'Construction Materials', 'in_transit', 'Construction', 30, 'Nelspruit', 'Mpumalanga', -25.4753, 30.9694, 'Polokwane', 'Limpopo', -23.9045, 29.4688, CURRENT_DATE);
END $$;
*/

-- =============================================
-- VERIFY POLICIES
-- =============================================
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'loads';
