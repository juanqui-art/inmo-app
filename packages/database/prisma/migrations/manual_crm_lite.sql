-- =============================================
-- CRM LITE + PROPERTY VIDEOS MIGRATION
-- Apply this SQL in Supabase Dashboard > SQL Editor
-- 
-- NOTE: Uses TEXT for IDs to match existing schema
-- =============================================

-- ========== PART 1: CRM LITE (AgentClient) ==========

-- 1.1 Create LeadStatus enum
DO $$ BEGIN
  CREATE TYPE "LeadStatus" AS ENUM (
    'NEW',
    'CONTACTED',
    'INTERESTED',
    'NEGOTIATING',
    'CLOSED_WON',
    'CLOSED_LOST'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1.2 Create agent_clients table (using TEXT for IDs)
CREATE TABLE IF NOT EXISTS "agent_clients" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "agent_id" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
  "notes" TEXT,
  "source" TEXT,
  "property_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "agent_clients_pkey" PRIMARY KEY ("id")
);

-- 1.3 Add constraints for agent_clients (only if not exists)
DO $$ BEGIN
  ALTER TABLE "agent_clients" 
    ADD CONSTRAINT "agent_clients_agent_id_client_id_key" UNIQUE ("agent_id", "client_id");
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "agent_clients" 
    ADD CONSTRAINT "agent_clients_agent_id_fkey" 
    FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "agent_clients" 
    ADD CONSTRAINT "agent_clients_client_id_fkey" 
    FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "agent_clients" 
    ADD CONSTRAINT "agent_clients_property_id_fkey" 
    FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1.4 Create indexes for agent_clients
CREATE INDEX IF NOT EXISTS "agent_clients_agent_id_idx" ON "agent_clients"("agent_id");
CREATE INDEX IF NOT EXISTS "agent_clients_client_id_idx" ON "agent_clients"("client_id");
CREATE INDEX IF NOT EXISTS "agent_clients_status_idx" ON "agent_clients"("status");
CREATE INDEX IF NOT EXISTS "agent_clients_agent_id_status_idx" ON "agent_clients"("agent_id", "status");


-- ========== PART 2: PROPERTY VIDEOS ==========

-- 2.1 Create VideoPlatform enum
DO $$ BEGIN
  CREATE TYPE "VideoPlatform" AS ENUM (
    'YOUTUBE',
    'TIKTOK',
    'INSTAGRAM',
    'FACEBOOK',
    'VIMEO',
    'OTHER'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2.2 Create property_videos table (using TEXT for IDs)
CREATE TABLE IF NOT EXISTS "property_videos" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "url" TEXT NOT NULL,
  "platform" "VideoPlatform" NOT NULL,
  "title" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "property_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "property_videos_pkey" PRIMARY KEY ("id")
);

-- 2.3 Add foreign key for property_videos
DO $$ BEGIN
  ALTER TABLE "property_videos" 
    ADD CONSTRAINT "property_videos_property_id_fkey" 
    FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2.4 Create index for property_videos
CREATE INDEX IF NOT EXISTS "property_videos_property_id_idx" ON "property_videos"("property_id");


-- ========== PART 3: TRIGGERS ==========

-- 3.1 Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3.2 Create trigger for agent_clients
DROP TRIGGER IF EXISTS update_agent_clients_updated_at ON "agent_clients";
CREATE TRIGGER update_agent_clients_updated_at
    BEFORE UPDATE ON "agent_clients"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ========== VERIFICATION ==========
-- Run these to confirm:
-- SELECT * FROM pg_type WHERE typname IN ('LeadStatus', 'VideoPlatform');
-- SELECT * FROM information_schema.tables WHERE table_name IN ('agent_clients', 'property_videos');
