-- Truck Packs: bundled PDF documentation packages uploaded by transporters
CREATE TABLE IF NOT EXISTS truck_packs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  file_path     TEXT NOT NULL,
  file_name     TEXT NOT NULL,
  file_size     INTEGER,
  uploaded_by   UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE truck_packs ENABLE ROW LEVEL SECURITY;

-- Transporters can manage their own company's packs
CREATE POLICY "transporter_own_packs" ON truck_packs
  FOR ALL USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Admins can do everything
CREATE POLICY "admin_all_packs" ON truck_packs
  FOR ALL USING (is_admin());
