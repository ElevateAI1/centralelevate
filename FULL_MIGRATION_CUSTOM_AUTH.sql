-- ============================================
-- MIGRACIÓN COMPLETA A CUSTOM AUTH
-- ============================================
-- Este script elimina todo lo anterior y crea el nuevo schema
-- ⚠️ ADVERTENCIA: Esto eliminará TODOS los datos existentes
-- ============================================

-- ============================================
-- PASO 1: LIMPIAR SCHEMA ANTERIOR
-- ============================================

-- Deshabilitar RLS temporalmente
DO $$ 
BEGIN
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
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignorar errores si las tablas no existen
END $$;

-- Eliminar todas las políticas
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

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

-- ============================================
-- PASO 2: CREAR NUEVO SCHEMA
-- ============================================
-- Ahora ejecuta el contenido completo de supabase_schema_custom_auth.sql
-- O continúa aquí con el schema nuevo...

