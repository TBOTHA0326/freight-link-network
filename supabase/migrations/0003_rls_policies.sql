-- Row Level Security policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_stats ENABLE ROW LEVEL SECURITY;

-- is_admin() helper function (SECURITY DEFINER so it bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- profiles policies
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (id = auth.uid() OR is_admin());

-- companies policies
CREATE POLICY "companies_select" ON companies
  FOR SELECT USING (created_by = auth.uid() OR is_admin());

CREATE POLICY "companies_insert" ON companies
  FOR INSERT WITH CHECK (created_by = auth.uid() OR is_admin());

CREATE POLICY "companies_update" ON companies
  FOR UPDATE USING (created_by = auth.uid() OR is_admin());

CREATE POLICY "companies_delete" ON companies
  FOR DELETE USING (is_admin());

-- loads policies
CREATE POLICY "loads_select" ON loads
  FOR SELECT USING (
    company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
    OR is_admin()
    OR status = 'approved'
  );

CREATE POLICY "loads_insert" ON loads
  FOR INSERT WITH CHECK (
    company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
    OR is_admin()
  );

CREATE POLICY "loads_update" ON loads
  FOR UPDATE USING (
    company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
    OR is_admin()
  );

CREATE POLICY "loads_delete" ON loads
  FOR DELETE USING (
    (
      company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
      AND status IN ('pending', 'rejected')
    )
    OR is_admin()
  );

-- trucks policies
CREATE POLICY "trucks_select" ON trucks
  FOR SELECT USING (
    company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
    OR is_admin()
  );

CREATE POLICY "trucks_insert" ON trucks
  FOR INSERT WITH CHECK (
    company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
  );

CREATE POLICY "trucks_update" ON trucks
  FOR UPDATE USING (
    company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
    OR is_admin()
  );

CREATE POLICY "trucks_delete" ON trucks
  FOR DELETE USING (
    company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
    OR is_admin()
  );

-- trailers policies
CREATE POLICY "trailers_select" ON trailers
  FOR SELECT USING (
    company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
    OR is_admin()
  );

CREATE POLICY "trailers_insert" ON trailers
  FOR INSERT WITH CHECK (
    company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
  );

CREATE POLICY "trailers_update" ON trailers
  FOR UPDATE USING (
    company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
    OR is_admin()
  );

CREATE POLICY "trailers_delete" ON trailers
  FOR DELETE USING (
    company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
    OR is_admin()
  );

-- drivers policies
CREATE POLICY "drivers_select" ON drivers
  FOR SELECT USING (
    company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
    OR is_admin()
  );

CREATE POLICY "drivers_insert" ON drivers
  FOR INSERT WITH CHECK (
    company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
  );

CREATE POLICY "drivers_update" ON drivers
  FOR UPDATE USING (
    company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
    OR is_admin()
  );

CREATE POLICY "drivers_delete" ON drivers
  FOR DELETE USING (
    company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
    OR is_admin()
  );

-- documents policies
CREATE POLICY "documents_select" ON documents
  FOR SELECT USING (
    company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
    OR is_admin()
  );

CREATE POLICY "documents_insert" ON documents
  FOR INSERT WITH CHECK (
    company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
  );

CREATE POLICY "documents_update" ON documents
  FOR UPDATE USING (
    company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
    OR is_admin()
  );

CREATE POLICY "documents_delete" ON documents
  FOR DELETE USING (
    company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
    OR is_admin()
  );

-- load_interests policies
CREATE POLICY "load_interests_select" ON load_interests
  FOR SELECT USING (
    transporter_company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
    OR is_admin()
  );

CREATE POLICY "load_interests_insert" ON load_interests
  FOR INSERT WITH CHECK (
    transporter_company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
  );

CREATE POLICY "load_interests_delete" ON load_interests
  FOR DELETE USING (
    transporter_company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
  );

-- admin_stats policies (admin only)
CREATE POLICY "admin_stats_all" ON admin_stats
  FOR ALL USING (is_admin());
