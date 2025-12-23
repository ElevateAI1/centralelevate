-- Fix RLS policies for posts deletion
-- Run this in Supabase SQL Editor

-- First, check current policies
-- SELECT * FROM pg_policies WHERE tablename = 'posts';

-- Enable RLS if not already enabled
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop existing delete policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "CTO and Founder can delete any post" ON public.posts;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON public.posts;

-- Policy 1: Users can delete their own posts
CREATE POLICY "Users can delete their own posts"
ON public.posts
FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Policy 2: CTO and Founder can delete any post
CREATE POLICY "CTO and Founder can delete any post"
ON public.posts
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('CTO', 'Founder')
  )
);

-- Also fix comments deletion policies
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Drop existing delete policies for comments
DROP POLICY IF EXISTS "Users can delete comments from their posts" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
DROP POLICY IF EXISTS "CTO and Founder can delete any comment" ON public.comments;

-- Policy: Users can delete comments from their posts
CREATE POLICY "Users can delete comments from their posts"
ON public.comments
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = comments.post_id
    AND posts.author_id = auth.uid()
  )
);

-- Policy: Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.comments
FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Policy: CTO and Founder can delete any comment
CREATE POLICY "CTO and Founder can delete any comment"
ON public.comments
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('CTO', 'Founder')
  )
);

-- Verify policies were created
-- SELECT * FROM pg_policies WHERE tablename IN ('posts', 'comments');

