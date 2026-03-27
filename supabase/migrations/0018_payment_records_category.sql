-- Add free-text company name and category to payment_records
ALTER TABLE payment_records ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE payment_records ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'General';
