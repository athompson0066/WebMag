-- Add the missing accentColor column to the slides table
ALTER TABLE slides ADD COLUMN IF NOT EXISTS "accentColor" TEXT;
