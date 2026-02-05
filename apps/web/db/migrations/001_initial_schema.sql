-- Initial schema for Agent Intents
-- Run with: psql $POSTGRES_URL_NON_POOLING -f 001_initial_schema.sql

-- Intents table
CREATE TABLE IF NOT EXISTS intents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  
  -- Intent details (stored as JSONB for flexibility)
  details JSONB NOT NULL,
  
  -- Metadata
  urgency TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  
  -- Transaction data (populated after signing)
  tx_hash TEXT,
  tx_url TEXT
);

-- Intent status history (append-only audit trail)
CREATE TABLE IF NOT EXISTS intent_status_history (
  id SERIAL PRIMARY KEY,
  intent_id TEXT NOT NULL REFERENCES intents(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note TEXT
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_intents_user_created 
  ON intents(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_intents_user_status_created 
  ON intents(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_intent_status_history_intent 
  ON intent_status_history(intent_id, timestamp);

-- Check constraint for valid status values
ALTER TABLE intents DROP CONSTRAINT IF EXISTS intents_status_check;
ALTER TABLE intents ADD CONSTRAINT intents_status_check 
  CHECK (status IN ('pending', 'approved', 'rejected', 'signed', 'confirmed', 'failed', 'expired'));

-- Check constraint for valid urgency values
ALTER TABLE intents DROP CONSTRAINT IF EXISTS intents_urgency_check;
ALTER TABLE intents ADD CONSTRAINT intents_urgency_check 
  CHECK (urgency IN ('low', 'normal', 'high', 'critical'));
