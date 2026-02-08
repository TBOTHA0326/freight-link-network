-- =============================================
-- FREIGHT LINK NETWORK - STORAGE SETUP
-- =============================================
-- Run this file in the Supabase SQL Editor
-- Order: 2 (Run after schema.sql)
-- =============================================

-- Note: Storage buckets are created via Supabase Dashboard or CLI
-- This file contains the storage policies

-- First, enable RLS on storage.objects (should already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload to company folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view company documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update company documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete company documents" ON storage.objects;

-- =============================================
-- STORAGE POLICIES FOR 'documents' BUCKET
-- =============================================

-- Policy: Users can upload documents to their company folder
CREATE POLICY "Users can upload to company folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated' AND
    (
      -- Check if user has a company and folder matches company ID
      EXISTS (
        SELECT 1 FROM profiles p
        JOIN companies c ON p.company_id = c.id
        WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = c.id::text
      )
      OR
      -- Admins can upload anywhere
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Policy: Users can view documents from their company folder
CREATE POLICY "Users can view company documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated' AND
    (
      -- Check if user has a company and folder matches company ID
      EXISTS (
        SELECT 1 FROM profiles p
        JOIN companies c ON p.company_id = c.id
        WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = c.id::text
      )
      OR
      -- Admins can view all
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Policy: Users can update documents in their company folder
CREATE POLICY "Users can update company documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated' AND
    (
      EXISTS (
        SELECT 1 FROM profiles p
        JOIN companies c ON p.company_id = c.id
        WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = c.id::text
      )
      OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Policy: Users can delete documents from their company folder
CREATE POLICY "Users can delete company documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated' AND
    (
      EXISTS (
        SELECT 1 FROM profiles p
        JOIN companies c ON p.company_id = c.id
        WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = c.id::text
      )
      OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- =============================================
-- HELPER FUNCTION FOR DEBUGGING UPLOADS
-- =============================================

-- Function to check user's upload permissions (for debugging)
CREATE OR REPLACE FUNCTION check_upload_permissions(company_folder TEXT)
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  has_profile BOOLEAN,
  company_id UUID,
  company_name TEXT,
  is_admin BOOLEAN,
  can_upload BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.uid() as user_id,
    (SELECT email FROM auth.users WHERE id = auth.uid()) as user_email,
    (p.id IS NOT NULL) as has_profile,
    p.company_id,
    c.name as company_name,
    (p.role = 'admin') as is_admin,
    (
      (p.company_id IS NOT NULL AND c.id::text = company_folder) OR
      (p.role = 'admin')
    ) as can_upload
  FROM profiles p
  LEFT JOIN companies c ON p.company_id = c.id
  WHERE p.id = auth.uid();
END;
$$;
