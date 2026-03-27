-- Payment Statuses (admin-configurable dropdown values)
CREATE TABLE IF NOT EXISTS payment_statuses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label       TEXT NOT NULL,
  color       TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE payment_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_payment_statuses" ON payment_statuses
  FOR ALL USING (is_admin());

-- Payment Records (the ledger entries)
CREATE TABLE IF NOT EXISTS payment_records (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  amount      DECIMAL(12,2),
  status_id   UUID NOT NULL REFERENCES payment_statuses(id) ON DELETE RESTRICT,
  load_id     UUID REFERENCES loads(id) ON DELETE SET NULL,
  company_id  UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_payment_records" ON payment_records
  FOR ALL USING (is_admin());

CREATE TRIGGER update_payment_records_updated_at
  BEFORE UPDATE ON payment_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed default statuses
INSERT INTO payment_statuses (label, color, sort_order) VALUES
  ('Invoiced',            '#6366f1', 0),
  ('Waiting for Payment', '#f59e0b', 1),
  ('Payment Received',    '#10b981', 2),
  ('In Progress',         '#3b82f6', 3),
  ('Overdue',             '#ef4444', 4),
  ('Cancelled',           '#6b7280', 5)
ON CONFLICT DO NOTHING;
