-- Add GPS coordinates columns to establishments table
ALTER TABLE public.establishments 
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);

-- Add a comment to explain the purpose
COMMENT ON COLUMN public.establishments.latitude IS 'GPS latitude of the establishment entrance';
COMMENT ON COLUMN public.establishments.longitude IS 'GPS longitude of the establishment entrance';