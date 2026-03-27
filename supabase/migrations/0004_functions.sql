-- Database functions and triggers

-- update_updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply update_updated_at trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_loads_updated_at
  BEFORE UPDATE ON loads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_trucks_updated_at
  BEFORE UPDATE ON trucks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_trailers_updated_at
  BEFORE UPDATE ON trailers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_admin_stats_updated_at
  BEFORE UPDATE ON admin_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- handle_new_user trigger: auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, registration_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'transporter'),
    'approved_pending_setup'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- approve_registration RPC (legacy: pending_admin_approval -> approved_pending_setup)
CREATE OR REPLACE FUNCTION approve_registration(user_id UUID)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_profile profiles;
BEGIN
  UPDATE profiles
  SET
    registration_status = 'approved_pending_setup',
    registration_approved_at = now()
  WHERE id = user_id
  RETURNING * INTO updated_profile;
  RETURN updated_profile;
END;
$$;

-- reject_registration RPC
CREATE OR REPLACE FUNCTION reject_registration(user_id UUID, reason TEXT)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_profile profiles;
BEGIN
  UPDATE profiles
  SET
    registration_status = 'rejected',
    rejection_reason = reason
  WHERE id = user_id
  RETURNING * INTO updated_profile;
  RETURN updated_profile;
END;
$$;

-- activate_user RPC: pending_final_approval -> active
CREATE OR REPLACE FUNCTION activate_user(user_id UUID)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_profile profiles;
BEGIN
  UPDATE profiles
  SET
    registration_status = 'active',
    setup_completed_at = now()
  WHERE id = user_id
  RETURNING * INTO updated_profile;
  RETURN updated_profile;
END;
$$;

-- review_load RPC: admin approve/reject load
CREATE OR REPLACE FUNCTION review_load(load_id UUID, new_status load_status, reason TEXT DEFAULT NULL)
RETURNS loads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_load loads;
BEGIN
  UPDATE loads
  SET
    status = new_status,
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    rejection_reason = reason
  WHERE id = load_id
  RETURNING * INTO updated_load;
  RETURN updated_load;
END;
$$;

-- review_document RPC: admin approve/reject document
CREATE OR REPLACE FUNCTION review_document(doc_id UUID, new_status document_status, reason TEXT DEFAULT NULL)
RETURNS documents
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_doc documents;
BEGIN
  UPDATE documents
  SET
    status = new_status,
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    rejection_reason = reason
  WHERE id = doc_id
  RETURNING * INTO updated_doc;
  RETURN updated_doc;
END;
$$;

-- get_map_loads RPC: loads with coordinates for map display
CREATE OR REPLACE FUNCTION get_map_loads(user_role_param TEXT, user_company_id UUID DEFAULT NULL)
RETURNS TABLE(
  id UUID,
  title TEXT,
  status load_status,
  pickup_address TEXT,
  pickup_city TEXT,
  pickup_lat DECIMAL,
  pickup_lng DECIMAL,
  delivery_address TEXT,
  delivery_city TEXT,
  delivery_lat DECIMAL,
  delivery_lng DECIMAL,
  pickup_date DATE,
  delivery_date DATE,
  cargo_type TEXT,
  weight_tons DECIMAL,
  company_name TEXT,
  is_cross_border BOOLEAN,
  is_hazardous BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.title,
    l.status,
    l.pickup_address,
    l.pickup_city,
    l.pickup_lat,
    l.pickup_lng,
    l.delivery_address,
    l.delivery_city,
    l.delivery_lat,
    l.delivery_lng,
    l.pickup_date,
    l.delivery_date,
    l.cargo_type,
    l.weight_tons,
    c.name AS company_name,
    l.is_cross_border,
    l.is_hazardous
  FROM loads l
  LEFT JOIN companies c ON l.company_id = c.id
  WHERE
    l.pickup_lat IS NOT NULL
    AND l.pickup_lng IS NOT NULL
    AND l.delivery_lat IS NOT NULL
    AND l.delivery_lng IS NOT NULL
    AND (
      CASE
        WHEN user_role_param = 'admin' THEN TRUE
        WHEN user_role_param = 'supplier' THEN l.company_id = user_company_id
        WHEN user_role_param = 'transporter' THEN l.status = 'approved'
        ELSE FALSE
      END
    );
END;
$$;

-- get_admin_dashboard_stats RPC: all KPI counts
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users',            (SELECT COUNT(*) FROM profiles),
    'pending_approvals',      (SELECT COUNT(*) FROM profiles WHERE registration_status IN ('pending_admin_approval', 'pending_final_approval')),
    'active_companies',       (SELECT COUNT(*) FROM companies WHERE is_verified = true),
    'total_loads',            (SELECT COUNT(*) FROM loads),
    'pending_loads',          (SELECT COUNT(*) FROM loads WHERE status = 'pending'),
    'approved_loads',         (SELECT COUNT(*) FROM loads WHERE status = 'approved'),
    'in_transit_loads',       (SELECT COUNT(*) FROM loads WHERE status = 'in_transit'),
    'completed_loads',        (SELECT COUNT(*) FROM loads WHERE status = 'completed'),
    'total_transporters',     (SELECT COUNT(*) FROM profiles WHERE role = 'transporter'),
    'total_suppliers',        (SELECT COUNT(*) FROM profiles WHERE role = 'supplier'),
    'pending_registrations',  (SELECT COUNT(*) FROM profiles WHERE registration_status = 'pending_admin_approval'),
    'pending_setups',         (SELECT COUNT(*) FROM profiles WHERE registration_status = 'pending_final_approval')
  ) INTO result;
  RETURN result;
END;
$$;
