-- ================================================
-- Establishment Archiving System Migration
-- ================================================
-- Run this SQL in Supabase SQL Editor (Database > SQL Editor)
-- ================================================

-- Add archived fields to establishments table
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES auth.users(id);

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_establishments_archived 
ON establishments(is_archived);

-- Grant necessary permissions (if needed)
GRANT ALL ON establishments TO authenticated;
GRANT ALL ON establishments TO service_role;
