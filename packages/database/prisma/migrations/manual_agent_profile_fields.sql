-- Agent Profile Fields Migration
-- Run this migration manually in Supabase SQL Editor

-- Add agent profile customization fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS license_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS website VARCHAR(500),
ADD COLUMN IF NOT EXISTS brand_color VARCHAR(7),
ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_license_id ON users(license_id) WHERE license_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN users.bio IS 'Professional biography for agent profile page';
COMMENT ON COLUMN users.license_id IS 'Real estate agent license ID for verification';
COMMENT ON COLUMN users.website IS 'Agent or agency website URL';
COMMENT ON COLUMN users.brand_color IS 'Hex color code for agent branding (#RRGGBB)';
COMMENT ON COLUMN users.logo_url IS 'URL to agent/agency logo image';
