-- ==============================================================
-- InstantIPESubmit PostgreSQL Schema for Supabase
-- ==============================================================

-- 1. Submissions Table for All 5 Services
CREATE TABLE IF NOT EXISTS ipe_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id VARCHAR(50) UNIQUE NOT NULL,
  service_type VARCHAR(30) NOT NULL, -- IPE, MOD_IPE, VALIDATION, MOD_VALIDATION, MODIFICATION
  identifier_code VARCHAR(30) NOT NULL, -- 15-char alphanumeric or 11-digit NIN
  modification_type VARCHAR(100), -- Name Correction, Phone Number Update, Address Update, Date of Birth
  applicant_name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(50) NOT NULL,
  state VARCHAR(100),
  lga VARCHAR(100),
  additional_notes TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  payment_status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, PAID, FAILED
  payment_reference VARCHAR(100),
  payment_channel VARCHAR(50) DEFAULT 'paystack',
  paid_at TIMESTAMPTZ,
  status VARCHAR(40) DEFAULT 'SUBMITTED', -- SUBMITTED, PAID_PENDING_ACCEPTANCE, IN_PROGRESS, COMPLETED, REJECTED
  admin_accepted BOOLEAN DEFAULT FALSE,
  admin_accepted_at TIMESTAMPTZ,
  admin_accepted_by VARCHAR(100),
  admin_notes TEXT,
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ultra-fast queries
CREATE INDEX IF NOT EXISTS idx_ipe_tracking_id ON ipe_submissions(tracking_id);
CREATE INDEX IF NOT EXISTS idx_ipe_identifier_code ON ipe_submissions(identifier_code);
CREATE INDEX IF NOT EXISTS idx_ipe_status ON ipe_submissions(status);
CREATE INDEX IF NOT EXISTS idx_ipe_created_at ON ipe_submissions(created_at DESC);

-- 2. Portal Pricing & System Configuration
CREATE TABLE IF NOT EXISTS ipe_portal_settings (
  id INT PRIMARY KEY DEFAULT 1,
  portal_name VARCHAR(100) DEFAULT 'InstantIPESubmit',
  portal_tagline TEXT DEFAULT 'instantipesubmit.com.ng • Fast-Track IPE, Mod IPE, Validation, Mod Validation & Modifications',
  support_email VARCHAR(150) DEFAULT 'support@instantipesubmit.com.ng',
  support_phone VARCHAR(50) DEFAULT '+234 (0) 800 433 6848',
  support_whatsapp VARCHAR(50) DEFAULT '+2348004336848',
  currency VARCHAR(10) DEFAULT 'NGN',
  currency_symbol VARCHAR(5) DEFAULT '₦',
  rate_ipe NUMERIC(10, 2) DEFAULT 1000,
  rate_mod_ipe NUMERIC(10, 2) DEFAULT 2500,
  rate_validation NUMERIC(10, 2) DEFAULT 1500,
  rate_mod_validation NUMERIC(10, 2) DEFAULT 1500,
  rate_modification NUMERIC(10, 2) DEFAULT 2500,
  paystack_public_key TEXT,
  paystack_secret_key TEXT,
  paystack_test_mode BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default rates if table is fresh
INSERT INTO ipe_portal_settings (id, rate_ipe, rate_mod_ipe, rate_validation, rate_mod_validation, rate_modification)
VALUES (1, 1000, 2500, 1500, 1500, 2500)
ON CONFLICT (id) DO NOTHING;
