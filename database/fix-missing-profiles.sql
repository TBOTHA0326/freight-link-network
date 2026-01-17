-- =============================================
-- FIX: Create missing profiles for existing auth users
-- =============================================
-- Run this in Supabase SQL Editor to create profiles
-- for users who already confirmed their email but don't have profiles
-- Dashboard → SQL Editor → New Query → Paste & Run

-- Step 1: Create profiles for any auth users that don't have one
INSERT INTO profiles (id, email, full_name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  COALESCE(
    NULLIF(u.raw_user_meta_data->>'role', '')::user_role, 
    'transporter'
  )
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 2: Verify the fix - show all users and their profile status
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.raw_user_meta_data->>'full_name' as meta_full_name,
  u.raw_user_meta_data->>'role' as meta_role,
  p.id IS NOT NULL as has_profile,
  p.role as profile_role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Step 3: Make sure the trigger is properly set up for future users
-- Drop and recreate to ensure it's correct
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'role', '')::user_role, 
      'transporter'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 4: Grant permissions (in case they were missing)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON profiles TO service_role;

SELECT 'Done! Check the results above to see which users now have profiles.' as status;
