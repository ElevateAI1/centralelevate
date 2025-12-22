-- ============================================
-- MIGRACIÓN A CUSTOM AUTH
-- ============================================
-- Este script elimina el schema anterior y crea el nuevo
-- ⚠️ ADVERTENCIA: Esto eliminará TODOS los datos existentes
-- ============================================

-- Deshabilitar RLS temporalmente
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_tech_stack DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_team DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_resource_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comments DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas RLS existentes
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Only admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can create projects" ON public.projects;
DROP POLICY IF EXISTS "Admins and creators can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can manage tech stack" ON public.project_tech_stack;
DROP POLICY IF EXISTS "Users can manage tech stack" ON public.project_tech_stack;
DROP POLICY IF EXISTS "Authenticated users can view project teams" ON public.project_team;
DROP POLICY IF EXISTS "Admins can manage project teams" ON public.project_team;
DROP POLICY IF EXISTS "Users can manage project teams" ON public.project_team;
DROP POLICY IF EXISTS "Users can view relevant tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update relevant tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Sales and admins can create leads" ON public.leads;
DROP POLICY IF EXISTS "Sales and admins can update leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can view subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Finance and admins can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Authenticated users can view transactions" ON public.transactions;
DROP POLICY IF EXISTS "Finance and admins can manage transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can manage transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can view AI resources" ON public.ai_resources;
DROP POLICY IF EXISTS "Authenticated users can create AI resources" ON public.ai_resources;
DROP POLICY IF EXISTS "Users can update relevant AI resources" ON public.ai_resources;
DROP POLICY IF EXISTS "Authenticated users can manage tags" ON public.ai_resource_tags;
DROP POLICY IF EXISTS "Authenticated users can view posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can view comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;

-- Eliminar triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
DROP TRIGGER IF EXISTS update_ai_resources_updated_at ON public.ai_resources;
DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;

-- Eliminar funciones
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.verify_password(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_account(UUID, TEXT, TEXT, TEXT, user_role, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.update_user_password(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(UUID) CASCADE;

-- Eliminar vistas
DROP VIEW IF EXISTS public.projects_with_team_count CASCADE;
DROP VIEW IF EXISTS public.tasks_with_details CASCADE;
DROP VIEW IF EXISTS public.monthly_financials CASCADE;

-- Eliminar tablas (en orden correcto por dependencias)
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.ai_resource_tags CASCADE;
DROP TABLE IF EXISTS public.ai_resources CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.project_team CASCADE;
DROP TABLE IF EXISTS public.project_tech_stack CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Eliminar tipos (en orden correcto)
DROP TYPE IF EXISTS post_category CASCADE;
DROP TYPE IF EXISTS ai_resource_type CASCADE;
DROP TYPE IF EXISTS transaction_status CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS subscription_category CASCADE;
DROP TYPE IF EXISTS subscription_cycle CASCADE;
DROP TYPE IF EXISTS lead_stage CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS theme_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Ahora ejecuta el contenido de supabase_schema_custom_auth.sql
-- (Continúa con el schema nuevo)

