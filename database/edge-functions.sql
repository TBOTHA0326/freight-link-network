-- =============================================
-- FREIGHT LINK NETWORK - EDGE FUNCTIONS SQL
-- =============================================
-- Run this file in the Supabase SQL Editor
-- Order: 3 (Run after storage-policies.sql)
-- =============================================

-- =============================================
-- FUNCTION: Get dashboard stats for admin
-- =============================================

CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalTransporters', (SELECT COUNT(*) FROM companies WHERE company_type = 'transporter'),
    'totalSuppliers', (SELECT COUNT(*) FROM companies WHERE company_type = 'supplier'),
    'newTransportersToday', (SELECT COUNT(*) FROM companies WHERE company_type = 'transporter' AND DATE(created_at) = CURRENT_DATE),
    'newSuppliersToday', (SELECT COUNT(*) FROM companies WHERE company_type = 'supplier' AND DATE(created_at) = CURRENT_DATE),
    'newTransportersThisWeek', (SELECT COUNT(*) FROM companies WHERE company_type = 'transporter' AND created_at >= DATE_TRUNC('week', CURRENT_DATE)),
    'newSuppliersThisWeek', (SELECT COUNT(*) FROM companies WHERE company_type = 'supplier' AND created_at >= DATE_TRUNC('week', CURRENT_DATE)),
    'pendingDocuments', (SELECT COUNT(*) FROM documents WHERE status = 'pending'),
    'pendingLoads', (SELECT COUNT(*) FROM loads WHERE status = 'pending'),
    'totalPendingApprovals', (
      (SELECT COUNT(*) FROM documents WHERE status = 'pending') +
      (SELECT COUNT(*) FROM loads WHERE status = 'pending')
    ),
    'totalLoads', (SELECT COUNT(*) FROM loads),
    'approvedLoads', (SELECT COUNT(*) FROM loads WHERE status = 'approved'),
    'totalTrucks', (SELECT COUNT(*) FROM trucks),
    'totalTrailers', (SELECT COUNT(*) FROM trailers),
    'totalDrivers', (SELECT COUNT(*) FROM drivers),
    'verifiedCompanies', (SELECT COUNT(*) FROM companies WHERE is_verified = true)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCTION: Get company details with all related data
-- =============================================

CREATE OR REPLACE FUNCTION get_company_full_details(company_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'company', (SELECT row_to_json(c) FROM companies c WHERE c.id = company_uuid),
    'documents', (
      SELECT json_agg(row_to_json(d))
      FROM documents d
      WHERE d.company_id = company_uuid AND d.truck_id IS NULL AND d.trailer_id IS NULL AND d.driver_id IS NULL
    ),
    'trucks', (
      SELECT json_agg(
        json_build_object(
          'truck', row_to_json(t),
          'documents', (
            SELECT json_agg(row_to_json(d))
            FROM documents d
            WHERE d.truck_id = t.id
          )
        )
      )
      FROM trucks t
      WHERE t.company_id = company_uuid
    ),
    'trailers', (
      SELECT json_agg(
        json_build_object(
          'trailer', row_to_json(tr),
          'documents', (
            SELECT json_agg(row_to_json(d))
            FROM documents d
            WHERE d.trailer_id = tr.id
          )
        )
      )
      FROM trailers tr
      WHERE tr.company_id = company_uuid
    ),
    'drivers', (
      SELECT json_agg(
        json_build_object(
          'driver', row_to_json(dr),
          'documents', (
            SELECT json_agg(row_to_json(d))
            FROM documents d
            WHERE d.driver_id = dr.id
          )
        )
      )
      FROM drivers dr
      WHERE dr.company_id = company_uuid
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCTION: Approve or reject a document
-- =============================================

CREATE OR REPLACE FUNCTION review_document(
  doc_id UUID,
  new_status document_status,
  reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  UPDATE documents
  SET
    status = new_status,
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    rejection_reason = CASE WHEN new_status = 'rejected' THEN reason ELSE NULL END
  WHERE id = doc_id;
  
  SELECT row_to_json(d) INTO result FROM documents d WHERE d.id = doc_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCTION: Approve or reject a load
-- =============================================

CREATE OR REPLACE FUNCTION review_load(
  load_id UUID,
  new_status load_status,
  reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  UPDATE loads
  SET
    status = new_status,
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    rejection_reason = CASE WHEN new_status = 'rejected' THEN reason ELSE NULL END
  WHERE id = load_id;
  
  SELECT row_to_json(l) INTO result FROM loads l WHERE l.id = load_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCTION: Get all pending approvals
-- =============================================

CREATE OR REPLACE FUNCTION get_pending_approvals()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'documents', (
      SELECT json_agg(
        json_build_object(
          'document', row_to_json(d),
          'company', (SELECT row_to_json(c) FROM companies c WHERE c.id = d.company_id)
        )
      )
      FROM documents d
      WHERE d.status = 'pending'
      ORDER BY d.created_at DESC
    ),
    'loads', (
      SELECT json_agg(
        json_build_object(
          'load', row_to_json(l),
          'company', (SELECT row_to_json(c) FROM companies c WHERE c.id = l.company_id)
        )
      )
      FROM loads l
      WHERE l.status = 'pending'
      ORDER BY l.created_at DESC
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCTION: Search companies
-- =============================================

CREATE OR REPLACE FUNCTION search_companies(
  search_term TEXT DEFAULT NULL,
  company_type_filter user_role DEFAULT NULL,
  verified_only BOOLEAN DEFAULT FALSE
)
RETURNS SETOF companies AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM companies c
  WHERE
    (search_term IS NULL OR c.name ILIKE '%' || search_term || '%' OR c.registration_number ILIKE '%' || search_term || '%')
    AND (company_type_filter IS NULL OR c.company_type = company_type_filter)
    AND (NOT verified_only OR c.is_verified = true)
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCTION: Get loads for map display
-- =============================================

CREATE OR REPLACE FUNCTION get_map_loads(user_role_param user_role, user_company_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  IF user_role_param = 'admin' THEN
    -- Admins see all loads
    SELECT json_agg(
      json_build_object(
        'id', l.id,
        'title', l.title,
        'price', l.price,
        'from_location', l.from_location,
        'from_latitude', l.from_latitude,
        'from_longitude', l.from_longitude,
        'to_location', l.to_location,
        'to_latitude', l.to_latitude,
        'to_longitude', l.to_longitude,
        'material', l.material,
        'required_truck_type', l.required_truck_type,
        'status', l.status,
        'company_name', c.name
      )
    ) INTO result
    FROM loads l
    JOIN companies c ON l.company_id = c.id;
  ELSIF user_role_param = 'transporter' THEN
    -- Transporters see approved loads only
    SELECT json_agg(
      json_build_object(
        'id', l.id,
        'title', l.title,
        'price', l.price,
        'from_location', l.from_location,
        'from_latitude', l.from_latitude,
        'from_longitude', l.from_longitude,
        'to_location', l.to_location,
        'to_latitude', l.to_latitude,
        'to_longitude', l.to_longitude,
        'material', l.material,
        'required_truck_type', l.required_truck_type,
        'status', l.status,
        'company_name', c.name
      )
    ) INTO result
    FROM loads l
    JOIN companies c ON l.company_id = c.id
    WHERE l.status = 'approved';
  ELSE
    -- Suppliers see only their own loads
    SELECT json_agg(
      json_build_object(
        'id', l.id,
        'title', l.title,
        'price', l.price,
        'from_location', l.from_location,
        'from_latitude', l.from_latitude,
        'from_longitude', l.from_longitude,
        'to_location', l.to_location,
        'to_latitude', l.to_latitude,
        'to_longitude', l.to_longitude,
        'material', l.material,
        'required_truck_type', l.required_truck_type,
        'status', l.status,
        'company_name', c.name
      )
    ) INTO result
    FROM loads l
    JOIN companies c ON l.company_id = c.id
    WHERE l.company_id = user_company_id;
  END IF;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
