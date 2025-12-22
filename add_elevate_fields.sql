-- Add project_url and is_starred fields to projects table
-- Run this in Supabase SQL Editor

-- Add project_url column (optional text field for direct links)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS project_url TEXT;

-- Add is_starred column (boolean to mark featured/starred projects)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE;

-- Add index for faster queries when filtering starred projects
CREATE INDEX IF NOT EXISTS idx_projects_is_starred ON public.projects(is_starred);

-- Add comment to document the fields
COMMENT ON COLUMN public.projects.project_url IS 'Direct URL/link to access the project externally';
COMMENT ON COLUMN public.projects.is_starred IS 'Marks the project as a featured/starred product in Central Elevate';

