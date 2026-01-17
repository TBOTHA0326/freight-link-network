# Supabase Storage Buckets Setup Guide

This guide explains how to set up the storage buckets required for Freight Link Network.

## Overview

The application uses Supabase Storage to store uploaded documents such as:
- Company registration documents
- CIPC certificates
- Tax clearance certificates
- Driver ID documents, licenses, PDP, passports
- Truck and trailer registration documents

---

## Step 1: Navigate to Storage

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **Freight Link Network** project
3. Click on **Storage** in the left sidebar

---

## Step 2: Create the Documents Bucket

1. Click **New bucket**
2. Configure the bucket:
   - **Name:** `documents`
   - **Public bucket:** Leave **unchecked** (documents should be private)
   - **File size limit:** `10` MB (or adjust as needed)
   - **Allowed MIME types:** Leave empty to allow all, or specify:
     ```
     image/jpeg,image/png,image/gif,application/pdf
     ```
3. Click **Create bucket**

---

## Step 3: Set Up Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies to control access.

### Option A: Using the Supabase Dashboard

1. Click on the `documents` bucket
2. Click on **Policies** tab
3. Click **New Policy**

### Option B: Using SQL (Recommended)

Run the following SQL in the Supabase SQL Editor:

```sql
-- =============================================
-- STORAGE POLICIES FOR DOCUMENTS BUCKET
-- =============================================

-- Allow authenticated users to upload files to their company folder
CREATE POLICY "Users can upload documents to their company folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM companies 
    WHERE id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  )
);

-- Allow authenticated users to view their company's documents
CREATE POLICY "Users can view their company documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM companies 
    WHERE id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  )
);

-- Allow authenticated users to update their company's documents
CREATE POLICY "Users can update their company documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM companies 
    WHERE id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  )
);

-- Allow authenticated users to delete their company's documents
CREATE POLICY "Users can delete their company documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM companies 
    WHERE id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  )
);

-- Allow admins to access all documents
CREATE POLICY "Admins can access all documents"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

---

## Step 4: File Path Structure

Documents are stored with the following path structure:

```
documents/
├── {company_id}/
│   ├── company/
│   │   ├── registration_{uuid}.pdf
│   │   ├── cipc_{uuid}.pdf
│   │   └── tax_{uuid}.pdf
│   ├── trucks/
│   │   └── {truck_id}/
│   │       ├── registration_{uuid}.pdf
│   │       └── roadworthy_{uuid}.pdf
│   ├── trailers/
│   │   └── {trailer_id}/
│   │       └── registration_{uuid}.pdf
│   └── drivers/
│       └── {driver_id}/
│           ├── id_{uuid}.pdf
│           ├── license_{uuid}.pdf
│           ├── pdp_{uuid}.pdf
│           └── passport_{uuid}.pdf
```

---

## Step 5: Environment Variables

Make sure your `.env.local` file has the Supabase URL and anon key:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Step 6: Test the Setup

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Register a new account** and create a company

3. **Navigate to the Company page** and try uploading a document

4. **Check the Storage bucket** in Supabase Dashboard to confirm the file was uploaded

---

## Troubleshooting

### Error: "new row violates row-level security policy"

This means the storage policy is blocking the upload. Check:
- The user is authenticated
- The user has a company assigned in their profile
- The file path starts with the company ID

### Error: "Bucket not found"

Make sure:
- The bucket is named exactly `documents` (lowercase)
- The bucket exists in your Supabase project

### Files not appearing

Check:
- Storage policies are set up correctly
- The user has the correct company_id in their profile
- RLS is enabled on the storage.objects table

---

## Optional: Create Additional Buckets

If you need separate buckets for different file types:

| Bucket Name | Purpose | Public |
|-------------|---------|--------|
| `documents` | All documents (IDs, licenses, etc.) | No |
| `avatars` | Profile pictures | Yes |
| `load-images` | Photos of cargo | No |

---

## Quick Reference: Supabase Storage API

```typescript
// Upload a file
const { data, error } = await supabase.storage
  .from('documents')
  .upload(`${companyId}/company/registration_${uuid}.pdf`, file);

// Get public URL (for public buckets)
const { data: { publicUrl } } = supabase.storage
  .from('documents')
  .getPublicUrl('path/to/file.pdf');

// Get signed URL (for private buckets)
const { data: { signedUrl } } = await supabase.storage
  .from('documents')
  .createSignedUrl('path/to/file.pdf', 3600); // expires in 1 hour

// Delete a file
const { error } = await supabase.storage
  .from('documents')
  .remove(['path/to/file.pdf']);

// List files in a folder
const { data, error } = await supabase.storage
  .from('documents')
  .list(`${companyId}/company`);
```

---

## Summary

1. ✅ Create bucket named `documents` (private)
2. ✅ Run the storage policies SQL
3. ✅ Verify environment variables are set
4. ✅ Test by uploading a document

Your storage is now ready for the Freight Link Network application!
