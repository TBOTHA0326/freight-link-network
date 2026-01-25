-- =============================================
-- FIX: Allow admin-posted loads without company_id
-- =============================================
-- 
-- Run this in Supabase SQL Editor to allow admins
-- to post loads without selecting a supplier company.
--
-- =============================================

-- Make company_id nullable on loads table
ALTER TABLE loads ALTER COLUMN company_id DROP NOT NULL;

-- Update the RLS policy to allow admins to insert loads without company_id
DROP POLICY IF EXISTS "Suppliers can insert own loads" ON loads;
DROP POLICY IF EXISTS "Admins can insert loads" ON loads;

-- Recreate policies
CREATE POLICY "Suppliers can insert own loads" ON loads
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can insert loads" ON loads
  FOR INSERT WITH CHECK (is_admin());

-- Also update the SELECT policy for transporters to handle null company_id
DROP POLICY IF EXISTS "Transporters can view approved loads" ON loads;

CREATE POLICY "Transporters can view approved loads" ON loads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'transporter'
    )
    AND status = 'approved'
  );

-- Grant admin full control
GRANT ALL ON loads TO authenticated;

SELECT 'Admin loads fix applied successfully!' as status;
