-- Add mentions and is_everyone_tagged columns to posts table
-- Run this in Supabase SQL Editor

-- Add mentions column (JSON array of user IDs)
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS mentions TEXT;

-- Add is_everyone_tagged column (boolean flag for @everyone)
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS is_everyone_tagged BOOLEAN DEFAULT FALSE;

-- Add comments to document the fields
COMMENT ON COLUMN public.posts.mentions IS 'Array of user IDs mentioned in the post (stored as JSON string)';
COMMENT ON COLUMN public.posts.is_everyone_tagged IS 'True if @everyone was tagged in the post';

-- Add index for faster queries when filtering by mentions
CREATE INDEX IF NOT EXISTS idx_posts_is_everyone_tagged ON public.posts(is_everyone_tagged);

