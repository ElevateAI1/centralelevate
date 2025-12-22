-- Add fields for Central Elevate products
-- Run this in Supabase SQL Editor

-- Add git_repo_url column (link to Git repository)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS git_repo_url TEXT;

-- Add vercel_url column (link to Vercel deployment)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS vercel_url TEXT;

-- Add product_url column (link to the actual product - separate from project_url)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS product_url TEXT;

-- Add current_status column (current status editable by CTO - different from project status)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS current_status TEXT;

-- Add features column (JSON array or TEXT for project features)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS features TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_current_status ON public.projects(current_status);

-- Add comments to document the fields
COMMENT ON COLUMN public.projects.git_repo_url IS 'Link to Git repository (GitHub, GitLab, etc.)';
COMMENT ON COLUMN public.projects.vercel_url IS 'Link to Vercel deployment';
COMMENT ON COLUMN public.projects.product_url IS 'Link to the actual product/live application';
COMMENT ON COLUMN public.projects.current_status IS 'Current status of the product (editable by CTO) - e.g., "Active", "Maintenance", "Beta", etc.';
COMMENT ON COLUMN public.projects.features IS 'Features/characteristics of the project (stored as JSON array or comma-separated text)';

