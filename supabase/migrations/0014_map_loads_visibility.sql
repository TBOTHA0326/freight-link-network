-- Update get_map_loads visibility rules:
-- Admin:       all loads (all statuses), with company name
-- Supplier:    only their own company's loads, with company name
-- Transporter: all approved loads, company_name returned as NULL (supplier identity hidden)

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
    -- Transporters cannot see which company posted the load
    CASE WHEN user_role_param = 'transporter' THEN NULL ELSE c.name END AS company_name,
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
        WHEN user_role_param = 'admin'       THEN TRUE
        WHEN user_role_param = 'supplier'    THEN l.company_id = user_company_id
        WHEN user_role_param = 'transporter' THEN l.status = 'approved'
        ELSE FALSE
      END
    );
END;
$$;
