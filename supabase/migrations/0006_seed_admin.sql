-- Seed admin user
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard -> Authentication -> Users -> Add user
-- 2. Fill in email and password for the admin user
-- 3. The handle_new_user trigger will auto-create the profile
-- 4. Copy the UUID from the users list
-- 5. Run this UPDATE replacing PASTE-UUID-HERE with the actual UUID:

-- UPDATE profiles
-- SET role = 'admin', registration_status = 'active'
-- WHERE id = 'PASTE-UUID-HERE';

-- This file is intentionally left as instructions only.
-- Do not run the commented UPDATE until you have created the admin user in Auth.
SELECT 'Run the UPDATE statement above after creating admin user in Auth dashboard' AS instructions;
