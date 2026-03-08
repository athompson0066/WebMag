-- Create the config table
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- Create the slides table
CREATE TABLE IF NOT EXISTS slides (
  id TEXT PRIMARY KEY,
  url TEXT,
  content TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  accentColor TEXT,
  listicleData JSONB,
  webhookUrl TEXT,
  googleSheetSubmissionUrl TEXT,
  price TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS) policies for anonymous access
-- Note: This allows anyone to read/write. If you add authentication later, you should secure these.

ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow public read access on config" ON config FOR SELECT USING (true);
CREATE POLICY "Allow public read access on slides" ON slides FOR SELECT USING (true);

-- Allow anonymous insert/update/delete (since it's an admin app without auth yet)
CREATE POLICY "Allow public all access on config" ON config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on slides" ON slides FOR ALL USING (true) WITH CHECK (true);

-- Create the listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  email TEXT NOT NULL,
  website_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  paypal_transaction_id TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on listings" ON listings FOR SELECT USING (true);
CREATE POLICY "Allow public all access on listings" ON listings FOR ALL USING (true) WITH CHECK (true);

