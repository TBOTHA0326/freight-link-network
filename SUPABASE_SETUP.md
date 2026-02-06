# Freight Link Network - Supabase Setup Guide

This guide will walk you through setting up your Supabase project for the Freight Link Network platform.

## Table of Contents
1. [Create Supabase Project](#1-create-supabase-project)
2. [Database Setup](#2-database-setup)
3. [Storage Setup](#3-storage-setup)
4. [Authentication Setup](#4-authentication-setup)
5. [Environment Variables](#5-environment-variables)
6. [Mapbox Setup](#6-mapbox-setup)
7. [Deploy to Vercel](#7-deploy-to-vercel)

---

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: `freight-link-network`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose the closest region to South Africa (e.g., `eu-west-2` or `ap-south-1`)
4. Click **"Create new project"**
5. Wait for the project to be provisioned (2-3 minutes)

---

## 2. Database Setup

### Run the Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `database/schema.sql` and paste it
4. Click **"Run"** (or press Ctrl+Enter)
5. You should see "Success. No rows returned" for each statement

### Verify Tables Created

Go to **Table Editor** in the sidebar. You should see:
- `profiles`
- `companies`
- `documents`
- `trucks`
- `trailers`
- `drivers`
- `loads`
- `admin_stats`

### Run Admin Loads Fix (Required for Admin Load Posting)

1. Go back to **SQL Editor**
2. Create a new query
3. Copy contents of `database/fix-admin-loads.sql` and run it
4. This allows admins to post loads without selecting a supplier company

### Run Storage Policies (Optional)

1. Go back to **SQL Editor**
2. Create a new query
3. Copy contents of `database/storage-policies.sql` and run it

---

## 3. Storage Setup

### Create Storage Bucket

1. Go to **Storage** in the sidebar
2. Click **"Create a new bucket"**
3. Name: `documents`
4. Check **"Public bucket"** (or configure RLS for private access)
5. Click **"Create bucket"**

### Set Up Storage Policies

If you want authenticated uploads only:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Allow users to read their own company's documents
CREATE POLICY "Users can read their company documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');
```

---

## 4. Authentication Setup

### Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled
3. Configure settings:
   - Enable email confirmations (recommended for production)
   - Set site URL to your domain

### Configure Auth Settings

1. Go to **Authentication** → **URL Configuration**
2. Set your **Site URL**: `http://localhost:3000` (development) or your production URL
3. Add **Redirect URLs**:
   - `http://localhost:3000/**`
   - `https://your-production-domain.com/**`

### Create First Admin User

1. Go to **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter admin email and password
4. After user is created, go to **SQL Editor** and run:

```sql
-- Replace 'admin@example.com' with your admin email
UPDATE profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@example.com'
);
```

---

## 5. Environment Variables

### Get Your Supabase Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Create `.env.local` File

Create a file called `.env.local` in your project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token-here
```

**⚠️ Never commit `.env.local` to version control!**

---

## 6. Mapbox Setup

### Get Mapbox Access Token

1. Go to [https://www.mapbox.com](https://www.mapbox.com) and create an account
2. Go to your **Account** → **Tokens**
3. Copy your **Default public token** or create a new one
4. Add it to your `.env.local` file

### Mapbox Configuration

The map is pre-configured for South Africa with:
- Center: `[25.0, -29.0]` (approximately center of South Africa)
- Zoom: `5`
- Style: `mapbox://styles/mapbox/streets-v12`

---

## 7. Deploy to Vercel

### Connect Repository

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Click **"New Project"**
4. Import your GitHub repository
5. Select the `freight-link-network` folder as the root

### Configure Environment Variables

In Vercel project settings, add the same environment variables:

1. Go to **Settings** → **Environment Variables**
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

### Deploy

1. Click **"Deploy"**
2. Wait for the build to complete
3. Your app is now live!

---

## Testing the Setup

### 1. Test Registration

1. Go to `/register`
2. Select "Transporter" or "Supplier"
3. Fill in the registration form
4. Check that a profile is created in Supabase

### 2. Test Login

1. Go to `/login`
2. Enter credentials
3. Verify redirect to correct dashboard

### 3. Test Document Upload

1. Create a company in the dashboard
2. Go to company documents
3. Upload a test PDF
4. Check the file appears in Supabase Storage

### 4. Test Map

1. Create a load as a supplier
2. Approve it via admin dashboard
3. Check it appears on the transporter map

---

## Troubleshooting

### "Invalid API key" Error

- Double-check your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Ensure there are no extra spaces or quotes

### "permission denied for table" Error

- Make sure RLS policies are set up correctly
- Check that the user has the correct role in the `profiles` table

### Map Not Loading

- Verify your Mapbox token is correct
- Check browser console for specific errors
- Ensure the token has the required scopes

### Storage Upload Fails

- Verify the `documents` bucket exists
- Check storage policies allow authenticated uploads
- Ensure file size is within limits (default: 50MB)

---

## Database Schema Overview

### User Roles
- **transporter**: Can manage fleet, view available loads
- **supplier**: Can post loads, manage company
- **admin**: Full access to all data, approve/reject items

### Document Categories
- `registration` - Company registration documents
- `cipc` - CIPC documents
- `tax_document` - Tax clearance certificates
- `id_document` - Driver ID documents
- `drivers_license` - Driver's license
- `pdp` - Professional Driving Permit
- `passport` - Passport (for cross-border)

### Load Status Flow
1. `pending` - Awaiting admin approval
2. `approved` - Visible to transporters
3. `in_transit` - Load has been picked up
4. `completed` - Load delivered
5. `rejected` - Admin rejected the load
6. `cancelled` - Supplier cancelled the load

---

## Support

For issues or questions:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Check the [Next.js Documentation](https://nextjs.org/docs)
- Review the [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/)

---

## Security Checklist

Before going to production:

- [ ] Enable email confirmation for new users
- [ ] Set up proper CORS origins
- [ ] Review and test all RLS policies
- [ ] Remove any test/demo data
- [ ] Set up proper backup schedule
- [ ] Configure rate limiting
- [ ] Enable SSL/HTTPS only
- [ ] Review storage bucket permissions
- [ ] Set up monitoring and alerts
