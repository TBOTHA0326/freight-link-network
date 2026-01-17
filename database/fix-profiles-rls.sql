-- =============================================
-- FIX: Infinite recursion in profiles RLS policy
-- =============================================
-- Run this in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste & Run

-- Step 1: Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for users" ON profiles;
DROP POLICY IF EXISTS "Enable update access for users" ON profiles;

-- Step 2: Create simple, non-recursive policies
-- Users can ALWAYS view their own profile (no recursion - uses auth.uid() directly)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can ALWAYS update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (for the trigger)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Step 3: Create a SECURITY DEFINER function to check admin status
-- This avoids recursion by bypassing RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM profiles 
  WHERE id = auth.uid();
  
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create admin policies using the function
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Step 5: Allow service role to bypass RLS (for triggers)
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;

-- Grant execute on the function
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- =============================================
-- VERIFY FIX
-- =============================================
-- List all policies on profiles:
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
