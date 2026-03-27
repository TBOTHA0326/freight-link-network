-- Core tables for Freight Link Network

-- companies table
CREATE TABLE IF NOT EXISTS companies (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  registration_number TEXT,
  tax_number          TEXT,
  address             TEXT,
  city                TEXT,
  province            TEXT,
  postal_code         TEXT,
  country             TEXT NOT NULL DEFAULT 'South Africa',
  phone               TEXT,
  email               TEXT,
  website             TEXT,
  company_type        user_role NOT NULL,
  does_cross_border   BOOLEAN NOT NULL DEFAULT false,
  is_verified         BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by          UUID REFERENCES auth.users(id)
);

-- profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id                       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                    TEXT NOT NULL,
  full_name                TEXT,
  phone                    TEXT,
  role                     user_role NOT NULL DEFAULT 'transporter',
  registration_status      registration_status NOT NULL DEFAULT 'approved_pending_setup',
  company_id               UUID REFERENCES companies(id) ON DELETE SET NULL,
  rejection_reason         TEXT,
  registration_approved_at TIMESTAMPTZ,
  setup_completed_at       TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- loads table
CREATE TABLE IF NOT EXISTS loads (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id               UUID REFERENCES companies(id) ON DELETE CASCADE,
  title                    TEXT NOT NULL,
  description              TEXT,
  cargo_type               TEXT,
  weight_tons              DECIMAL(8,2),
  contact_phone            TEXT,
  internal_notes           TEXT,
  -- Pickup
  pickup_address           TEXT,
  pickup_city              TEXT,
  pickup_province          TEXT,
  pickup_country           TEXT,
  pickup_lat               DECIMAL(10,8),
  pickup_lng               DECIMAL(11,8),
  pickup_place_id          TEXT,
  pickup_date              DATE,
  pickup_time_window       TEXT,
  -- Delivery
  delivery_address         TEXT,
  delivery_city            TEXT,
  delivery_province        TEXT,
  delivery_country         TEXT,
  delivery_lat             DECIMAL(10,8),
  delivery_lng             DECIMAL(11,8),
  delivery_place_id        TEXT,
  delivery_date            DATE,
  delivery_time_window     TEXT,
  -- Other fields
  required_trailer_type    trailer_type[],
  budget_amount            DECIMAL(12,2),
  special_instructions     TEXT,
  is_hazardous             BOOLEAN NOT NULL DEFAULT false,
  is_cross_border          BOOLEAN NOT NULL DEFAULT false,
  status                   load_status NOT NULL DEFAULT 'pending',
  assigned_transporter_id  UUID REFERENCES companies(id),
  assigned_truck_id        UUID,
  assigned_driver_id       UUID,
  reviewed_by              UUID REFERENCES auth.users(id),
  reviewed_at              TIMESTAMPTZ,
  rejection_reason         TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by               UUID REFERENCES auth.users(id)
);

-- trucks table
CREATE TABLE IF NOT EXISTS trucks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  registration_number TEXT NOT NULL,
  make                TEXT,
  model               TEXT,
  year                INTEGER,
  horse_type          TEXT,
  number_of_axles     INTEGER CHECK (number_of_axles BETWEEN 2 AND 6),
  is_active           BOOLEAN NOT NULL DEFAULT true,
  is_verified         BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by          UUID REFERENCES auth.users(id)
);

-- trailers table
CREATE TABLE IF NOT EXISTS trailers (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id             UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  registration_number    TEXT NOT NULL,
  trailer_type           trailer_type NOT NULL,
  make                   TEXT,
  model                  TEXT,
  year                   INTEGER,
  length_meters          DECIMAL(6,2),
  payload_capacity_tons  DECIMAL(8,2),
  is_active              BOOLEAN NOT NULL DEFAULT true,
  is_verified            BOOLEAN NOT NULL DEFAULT false,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by             UUID REFERENCES auth.users(id)
);

-- drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  id_number       TEXT,
  license_number  TEXT,
  license_expiry  DATE,
  phone           TEXT,
  email           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  is_verified     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by      UUID REFERENCES auth.users(id)
);

-- documents table
CREATE TABLE IF NOT EXISTS documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  truck_id        UUID REFERENCES trucks(id) ON DELETE SET NULL,
  trailer_id      UUID REFERENCES trailers(id) ON DELETE SET NULL,
  driver_id       UUID REFERENCES drivers(id) ON DELETE SET NULL,
  category        document_category NOT NULL,
  title           TEXT NOT NULL,
  file_path       TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  file_url        TEXT,
  file_size       BIGINT,
  mime_type       TEXT,
  status          document_status NOT NULL DEFAULT 'pending',
  reviewed_by     UUID REFERENCES auth.users(id),
  reviewed_at     TIMESTAMPTZ,
  rejection_reason TEXT,
  uploaded_by     UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- load_interests table
CREATE TABLE IF NOT EXISTS load_interests (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id                  UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
  transporter_company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(load_id, transporter_company_id)
);

-- admin_stats table
CREATE TABLE IF NOT EXISTS admin_stats (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date           DATE NOT NULL UNIQUE,
  new_transporters    INTEGER DEFAULT 0,
  new_suppliers       INTEGER DEFAULT 0,
  pending_approvals   INTEGER DEFAULT 0,
  total_loads         INTEGER DEFAULT 0,
  approved_loads      INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
