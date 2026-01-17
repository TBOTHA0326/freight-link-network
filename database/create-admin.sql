-- =============================================
-- CREATE ADMIN USER SCRIPT
-- =============================================
-- 
-- INSTRUCTIONS:
-- 1. First, register a user through the app at /register
--    OR create a user in Supabase Dashboard → Authentication → Users
-- 
-- 2. Then run ONE of the queries below in Supabase SQL Editor
--    (Dashboard → SQL Editor → New Query)
--
-- =============================================

-- OPTION A: Promote an existing user to admin by EMAIL
-- Replace 'admin@example.com' with the actual email address
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';

-- OPTION B: Promote an existing user to admin by USER ID
-- Replace the UUID with the actual user ID from auth.users
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE id = '00000000-0000-0000-0000-000000000000';

-- =============================================
-- VERIFY ADMIN USER
-- =============================================
-- Run this to verify the admin was created successfully:

SELECT id, email, full_name, role, created_at 
FROM profiles 
WHERE role = 'admin';

-- =============================================
-- LIST ALL USERS AND THEIR ROLES
-- =============================================
-- Run this to see all users:

-- SELECT id, email, full_name, role, company_id, created_at 
-- FROM profiles 
-- ORDER BY created_at DESC;
