-- =============================================
-- FREIGHT LINK NETWORK - SAFE MIGRATION SCRIPT
-- =============================================
-- This script can be safely re-run multiple times.
-- It uses IF EXISTS / IF NOT EXISTS to avoid errors.
-- Run this in the Supabase SQL Editor after the initial schema.
-- =============================================

-- Enable UUID extension (safe to re-run)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUM UPDATES (Safe migration approach)
-- =============================================

-- Add new values to load_status enum if they don't exist
DO $$ 
BEGIN
    -- Check if 'in_transit' exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'in_transit' AND enumtypid = 'load_status'::regtype) THEN
        ALTER TYPE load_status ADD VALUE IF NOT EXISTS 'in_transit';
    END IF;
    
    -- Check if 'cancelled' exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'cancelled' AND enumtypid = 'load_status'::regtype) THEN
        ALTER TYPE load_status ADD VALUE IF NOT EXISTS 'cancelled';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Enum values may already exist or load_status type needs to be created';
END $$;

-- Add new values to trailer_type enum if they don't exist
DO $$ 
BEGIN
    ALTER TYPE trailer_type ADD VALUE IF NOT EXISTS 'flatbed';
    ALTER TYPE trailer_type ADD VALUE IF NOT EXISTS 'lowbed';
    ALTER TYPE trailer_type ADD VALUE IF NOT EXISTS 'tanker';
    ALTER TYPE trailer_type ADD VALUE IF NOT EXISTS 'refrigerated';
    ALTER TYPE trailer_type ADD VALUE IF NOT EXISTS 'container';
    ALTER TYPE trailer_type ADD VALUE IF NOT EXISTS 'side_tipper';
    ALTER TYPE trailer_type ADD VALUE IF NOT EXISTS 'end_tipper';
    ALTER TYPE trailer_type ADD VALUE IF NOT EXISTS 'other';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Some trailer_type values may already exist';
END $$;

-- Add new values to document_category enum if they don't exist
DO $$ 
BEGIN
    ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'id_document';
    ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'drivers_license';
    ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'pdp';
    ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'passport';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Some document_category values may already exist';
END $$;

-- =============================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- =============================================

-- Add file_url column to documents if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'documents' AND column_name = 'file_url') THEN
        ALTER TABLE documents ADD COLUMN file_url TEXT;
    END IF;
END $$;

-- Add horse_type column to trucks if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trucks' AND column_name = 'horse_type') THEN
        ALTER TABLE trucks ADD COLUMN horse_type TEXT;
    END IF;
END $$;

-- Add number_of_axles column to trucks if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trucks' AND column_name = 'number_of_axles') THEN
        ALTER TABLE trucks ADD COLUMN number_of_axles INTEGER;
    END IF;
END $$;

-- Add length_meters column to trailers if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trailers' AND column_name = 'length_meters') THEN
        ALTER TABLE trailers ADD COLUMN length_meters DECIMAL(5, 2);
    END IF;
END $$;

-- Add payload_capacity_tons column to trailers if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trailers' AND column_name = 'payload_capacity_tons') THEN
        ALTER TABLE trailers ADD COLUMN payload_capacity_tons DECIMAL(10, 2);
    END IF;
END $$;

-- =============================================
-- RENAME COLUMNS IF OLD SCHEMA EXISTS
-- =============================================

-- Rename driver columns if old schema exists
DO $$ 
BEGIN
    -- Check if old 'full_name' column exists and 'first_name' doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'drivers' AND column_name = 'full_name')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'drivers' AND column_name = 'first_name') THEN
        ALTER TABLE drivers RENAME COLUMN full_name TO first_name;
    END IF;
    
    -- Check if old 'surname' column exists and 'last_name' doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'drivers' AND column_name = 'surname')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'drivers' AND column_name = 'last_name') THEN
        ALTER TABLE drivers RENAME COLUMN surname TO last_name;
    END IF;
    
    -- Check if old 'cell_number' column exists and 'phone' doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'drivers' AND column_name = 'cell_number')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'drivers' AND column_name = 'phone') THEN
        ALTER TABLE drivers RENAME COLUMN cell_number TO phone;
    END IF;
END $$;

-- Add first_name if it doesn't exist (in case table was created without it)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'drivers' AND column_name = 'first_name') THEN
        ALTER TABLE drivers ADD COLUMN first_name TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Add last_name if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'drivers' AND column_name = 'last_name') THEN
        ALTER TABLE drivers ADD COLUMN last_name TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Add phone if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'drivers' AND column_name = 'phone') THEN
        ALTER TABLE drivers ADD COLUMN phone TEXT;
    END IF;
END $$;

-- Add license_number if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'drivers' AND column_name = 'license_number') THEN
        ALTER TABLE drivers ADD COLUMN license_number TEXT;
    END IF;
END $$;

-- Add license_expiry if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'drivers' AND column_name = 'license_expiry') THEN
        ALTER TABLE drivers ADD COLUMN license_expiry DATE;
    END IF;
END $$;

-- =============================================
-- LOADS TABLE COLUMN MIGRATIONS
-- =============================================

-- Add new load columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loads' AND column_name = 'cargo_type') THEN
        ALTER TABLE loads ADD COLUMN cargo_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loads' AND column_name = 'weight_tons') THEN
        ALTER TABLE loads ADD COLUMN weight_tons DECIMAL(10, 2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loads' AND column_name = 'pickup_address') THEN
        ALTER TABLE loads ADD COLUMN pickup_address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loads' AND column_name = 'pickup_city') THEN
        ALTER TABLE loads ADD COLUMN pickup_city TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loads' AND column_name = 'pickup_province') THEN
        ALTER TABLE loads ADD COLUMN pickup_province TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loads' AND column_name = 'pickup_country') THEN
        ALTER TABLE loads ADD COLUMN pickup_country TEXT DEFAULT 'South Africa';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loads' AND column_name = 'pickup_lat') THEN
        ALTER TABLE loads ADD COLUMN pickup_lat DECIMAL(10, 8);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loads' AND column_name = 'pickup_lng') THEN
        ALTER TABLE loads ADD COLUMN pickup_lng DECIMAL(11, 8);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loads' AND column_name = 'pickup_time_window') THEN
        ALTER TABLE loads ADD COLUMN pickup_time_window TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loads' AND column_name = 'delivery_address') THEN
        ALTER TABLE loads ADD COLUMN delivery_address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loads' AND column_name = 'delivery_city') THEN
        ALTER TABLE loads ADD COLUMN delivery_city TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loads' AND column_name = 'delivery_province') THEN
        ALTER TABLE loads ADD COLUMN delivery_province TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loads' AND column_name = 'delivery_country') THEN
        ALTER TABLE loads ADD COLUMN delivery_country TEXT DEFAULT 'South Africa';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loads' AND column_name = 'delivery_lat') THEN
        ALTER TABLE loads ADD COLUMN delivery_lat DECIMAL(10, 8);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loads' AND column_name = 'delivery_lng') THEN
        ALTER TABLE loads ADD COLUMN delivery_lng DECIMAL(11, 8);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loads' AND column_name = 'delivery_time_window') THEN
        ALTER TABLE loads ADD COLUMN delivery_time_window TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loads' AND column_name = 'required_trailer_type') THEN
        ALTER TABLE loads ADD COLUMN required_trailer_type trailer_type[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loads' AND column_name = 'budget_amount') THEN
        ALTER TABLE loads ADD COLUMN budget_amount DECIMAL(12, 2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loads' AND column_name = 'special_instructions') THEN
        ALTER TABLE loads ADD COLUMN special_instructions TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loads' AND column_name = 'is_hazardous') THEN
        ALTER TABLE loads ADD COLUMN is_hazardous BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loads' AND column_name = 'is_cross_border') THEN
        ALTER TABLE loads ADD COLUMN is_cross_border BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- =============================================
-- CREATE INDEXES IF NOT EXISTS
-- =============================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(company_type);
CREATE INDEX IF NOT EXISTS idx_documents_company ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_trucks_company ON trucks(company_id);
CREATE INDEX IF NOT EXISTS idx_trailers_company ON trailers(company_id);
CREATE INDEX IF NOT EXISTS idx_drivers_company ON drivers(company_id);
CREATE INDEX IF NOT EXISTS idx_loads_company ON loads(company_id);
CREATE INDEX IF NOT EXISTS idx_loads_status ON loads(status);

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

DO $$ 
BEGIN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE 'All columns and enum values have been updated.';
END $$;
