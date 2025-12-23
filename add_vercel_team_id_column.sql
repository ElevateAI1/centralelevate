-- Add vercel_team_id column to products table for Vercel team projects support
-- This column stores the Vercel Team ID which is required when making API calls for projects in a team

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS vercel_team_id TEXT;

COMMENT ON COLUMN public.products.vercel_team_id IS 'Vercel Team ID required for API calls when project is in a team. Find it in Team Settings > General in Vercel.';

