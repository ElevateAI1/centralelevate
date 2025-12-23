-- Enable Realtime for all tables
-- Run this in Supabase SQL Editor
-- This enables Realtime subscriptions for live updates

-- Enable Realtime for posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;

-- Enable Realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- Enable Realtime for tasks
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- Enable Realtime for projects
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;

-- Enable Realtime for project_team
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_team;

-- Enable Realtime for project_tech_stack
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_tech_stack;

-- Enable Realtime for leads
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;

-- Enable Realtime for transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- Enable Realtime for subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;

-- Enable Realtime for ai_resources
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_resources;

-- Enable Realtime for products
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- Enable Realtime for users (for profile updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- Note: If you get an error saying the publication doesn't exist, you may need to create it first:
-- CREATE PUBLICATION supabase_realtime FOR ALL TABLES;

