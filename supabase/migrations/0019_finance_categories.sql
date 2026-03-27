-- Finance categories — configurable from admin settings
CREATE TABLE IF NOT EXISTS finance_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label      TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin-only RLS
ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage finance_categories"
  ON finance_categories FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Seed default categories
INSERT INTO finance_categories (label, sort_order) VALUES
  ('General',                1),
  ('Load / Freight',         2),
  ('Diesel & Fuel',          3),
  ('Maintenance & Repairs',  4),
  ('Insurance',              5),
  ('Driver Pay',             6),
  ('Toll Fees',              7),
  ('Permits & Licensing',    8),
  ('Border Fees',            9),
  ('Other',                 10)
ON CONFLICT DO NOTHING;
