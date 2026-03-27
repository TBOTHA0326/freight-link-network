-- Contact form submissions
-- Public insert (no auth required), admin-only read/update

CREATE TABLE IF NOT EXISTS contact_submissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  company     TEXT,
  role        TEXT,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone (even unauthenticated) can insert
CREATE POLICY "public_insert_contact" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- Only admins can read and update
CREATE POLICY "admin_read_contact" ON contact_submissions
  FOR SELECT USING (is_admin());

CREATE POLICY "admin_update_contact" ON contact_submissions
  FOR UPDATE USING (is_admin());

CREATE POLICY "admin_delete_contact" ON contact_submissions
  FOR DELETE USING (is_admin());
