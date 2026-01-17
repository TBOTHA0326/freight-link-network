-- =============================================
-- FREIGHT LINK NETWORK - STORAGE SETUP
-- =============================================
-- Run this file in the Supabase SQL Editor
-- Order: 2 (Run after schema.sql)
-- =============================================

-- Note: Storage buckets are created via Supabase Dashboard or CLI
-- This file contains the storage policies

-- =============================================
-- STORAGE POLICIES FOR 'documents' BUCKET
-- =============================================

-- Policy: Users can upload documents to their company folder
CREATE POLICY "Users can upload to company folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    (
      -- Check if user has a company
      EXISTS (
        SELECT 1 FROM profiles p
        JOIN companies c ON p.company_id = c.id
        WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = c.id::text
      )
      OR
      -- Admins can upload anywhere
      EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Policy: Users can view documents from their company folder
CREATE POLICY "Users can view company documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    (
      -- Check if user has a company
      EXISTS (
        SELECT 1 FROM profiles p
        JOIN companies c ON p.company_id = c.id
        WHERE p.id = auth.uid()
        AND (storage.foldername(name))[1] = c.id::text
      )
      OR
      -- Admins can view all
      EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Policy: Users can update documents in their company folder
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
      OR
      EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Policy: Users can delete documents from their company folder
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
      OR
      EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );
