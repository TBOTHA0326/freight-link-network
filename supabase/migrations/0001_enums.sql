-- Enums for Freight Link Network
CREATE TYPE user_role AS ENUM ('transporter', 'supplier', 'admin');

CREATE TYPE registration_status AS ENUM (
  'pending_admin_approval',
  'approved_pending_setup',
  'pending_final_approval',
  'active',
  'rejected'
);

CREATE TYPE load_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'in_transit',
  'completed',
  'cancelled'
);

CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE document_category AS ENUM (
  'registration',
  'cipc',
  'tax_document',
  'id_document',
  'drivers_license',
  'pdp',
  'passport',
  'truck_registration',
  'brake_test',
  'roadworthy',
  'trailer_registration',
  'other'
);

CREATE TYPE trailer_type AS ENUM (
  'tautliner',
  'flatbed',
  'lowbed',
  'tanker',
  'refrigerated',
  'container',
  'side_tipper',
  'end_tipper',
  'other'
);
