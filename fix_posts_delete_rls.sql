-- Fix RLS policies for posts deletion
-- IMPORTANT: This app uses custom authentication (not Supabase Auth)
-- So we need to disable RLS or create permissive policies
-- Run this in Supabase SQL Editor

-- Option 1: Disable RLS completely (simplest, but less secure)
-- This allows all operations without RLS checks
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, use permissive policies
-- Uncomment the following if you prefer RLS enabled:

/*
-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow all operations on posts" ON public.posts;
DROP POLICY IF EXISTS "Allow all operations on comments" ON public.comments;

-- Create permissive policies that allow all operations
-- Since we use custom auth, we can't use auth.uid() in policies
-- These policies allow all authenticated requests (using anon key)
CREATE POLICY "Allow all operations on posts"
ON public.posts
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on comments"
ON public.comments
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
*/

-- Verify RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('posts', 'comments');

