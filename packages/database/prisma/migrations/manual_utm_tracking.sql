-- UTM Tracking Fields for AgentClient
-- Run this migration manually in Supabase SQL Editor

-- Add UTM tracking columns to agent_clients table
ALTER TABLE agent_clients
ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100),
ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(100),
ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255);

-- Add index for analytics queries
CREATE INDEX IF NOT EXISTS idx_agent_clients_utm_source ON agent_clients(utm_source);

-- Comment for documentation
COMMENT ON COLUMN agent_clients.utm_source IS 'UTM source parameter (facebook, google, instagram)';
COMMENT ON COLUMN agent_clients.utm_medium IS 'UTM medium parameter (cpc, organic, social)';
COMMENT ON COLUMN agent_clients.utm_campaign IS 'UTM campaign name';
