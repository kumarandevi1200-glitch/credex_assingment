-- audits table
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id TEXT UNIQUE NOT NULL, -- nanoid, public-safe
  tools JSONB NOT NULL,
  team_size INT,
  use_case TEXT,
  total_monthly_savings NUMERIC,
  total_annual_savings NUMERIC,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- leads table  
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES audits(id),
  email TEXT NOT NULL,
  company_name TEXT,
  role TEXT,
  team_size INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- rate_limits table (simple IP-based)
CREATE TABLE rate_limits (
  ip TEXT PRIMARY KEY,
  count INT DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- audits: public read by share_id (used for shared result pages)
CREATE POLICY "Public read audits by share_id"
  ON audits FOR SELECT USING (true);

-- audits: insert via service role only (server-side API routes)
CREATE POLICY "Service role insert audits"
  ON audits FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- leads: insert via service role only
CREATE POLICY "Service role insert leads"
  ON leads FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- rate_limits: full access via service role
CREATE POLICY "Service role all rate_limits"
  ON rate_limits FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
