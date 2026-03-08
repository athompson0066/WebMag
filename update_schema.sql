-- Add the missing accentColor column to the slides table
ALTER TABLE slides ADD COLUMN IF NOT EXISTS "accentColor" TEXT;

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
