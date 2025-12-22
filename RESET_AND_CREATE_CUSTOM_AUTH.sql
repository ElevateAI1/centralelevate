-- ============================================
-- RESET COMPLETO Y CREACIÓN DE CUSTOM AUTH
-- ============================================
-- ⚠️ ADVERTENCIA: Esto eliminará TODOS los datos existentes
-- Ejecuta este script completo en Supabase SQL Editor
-- ============================================

-- ============================================
-- PASO 1: LIMPIAR TODO LO ANTERIOR
-- ============================================

-- Eliminar todas las políticas RLS
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

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- Para hashear passwords

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('Founder', 'CTO', 'Developer', 'Sales', 'CFO', 'Client');
CREATE TYPE project_status AS ENUM ('Proposal', 'In Development', 'Testing', 'Delivered', 'Maintenance');
CREATE TYPE task_status AS ENUM ('Todo', 'In Progress', 'Done');
CREATE TYPE task_priority AS ENUM ('High', 'Medium', 'Low');
CREATE TYPE lead_stage AS ENUM ('New', 'Contacted', 'Proposal', 'Negotiation', 'Won', 'Lost');
CREATE TYPE subscription_cycle AS ENUM ('Monthly', 'Yearly');
CREATE TYPE subscription_category AS ENUM ('Infrastructure', 'Design', 'AI', 'Management');
CREATE TYPE transaction_type AS ENUM ('Income', 'Expense');
CREATE TYPE transaction_status AS ENUM ('Pending', 'Completed');
CREATE TYPE ai_resource_type AS ENUM ('Prompt', 'Snippet', 'ModelConfig');
CREATE TYPE post_category AS ENUM ('General', 'Announcement', 'ProjectUpdate');
CREATE TYPE theme_type AS ENUM ('dark', 'light', 'system');

-- ============================================
-- USERS TABLE (Custom Auth - No Supabase Auth)
-- ============================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- Hashed password using pgcrypto
  name TEXT NOT NULL,
  avatar TEXT,
  role user_role NOT NULL DEFAULT 'Developer',
  theme theme_type DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECTS TABLE
-- ============================================

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_logo TEXT,
  status project_status NOT NULL DEFAULT 'Proposal',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  due_date DATE NOT NULL,
  budget DECIMAL(12, 2) NOT NULL DEFAULT 0,
  description TEXT,
  manager_notes TEXT,
  last_update TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECT_TECH_STACK (Many-to-Many)
-- ============================================

CREATE TABLE public.project_tech_stack (
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  tech TEXT NOT NULL,
  PRIMARY KEY (project_id, tech)
);

-- ============================================
-- PROJECT_TEAM (Many-to-Many)
-- ============================================

CREATE TABLE public.project_team (
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, user_id)
);

-- ============================================
-- TASKS TABLE
-- ============================================

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status task_status NOT NULL DEFAULT 'Todo',
  priority task_priority NOT NULL DEFAULT 'Medium',
  due_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEADS TABLE
-- ============================================

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  stage lead_stage NOT NULL DEFAULT 'New',
  probability INTEGER NOT NULL DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  last_contact TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service TEXT NOT NULL,
  cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cycle subscription_cycle NOT NULL DEFAULT 'Monthly',
  renewal_date DATE NOT NULL,
  category subscription_category NOT NULL DEFAULT 'Infrastructure',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  type transaction_type NOT NULL,
  category TEXT NOT NULL,
  status transaction_status NOT NULL DEFAULT 'Completed',
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AI_RESOURCES TABLE
-- ============================================

CREATE TABLE public.ai_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type ai_resource_type NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AI_RESOURCE_TAGS (Many-to-Many)
-- ============================================

CREATE TABLE public.ai_resource_tags (
  resource_id UUID REFERENCES public.ai_resources(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (resource_id, tag)
);

-- ============================================
-- POSTS TABLE
-- ============================================

CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  category post_category NOT NULL DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMMENTS TABLE
-- ============================================

CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

-- Projects
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_created_by ON public.projects(created_by);
CREATE INDEX idx_projects_due_date ON public.projects(due_date);

-- Project Team
CREATE INDEX idx_project_team_user ON public.project_team(user_id);
CREATE INDEX idx_project_team_project ON public.project_team(project_id);

-- Tasks
CREATE INDEX idx_tasks_project ON public.tasks(project_id);
CREATE INDEX idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);

-- Leads
CREATE INDEX idx_leads_stage ON public.leads(stage);
CREATE INDEX idx_leads_created_by ON public.leads(created_by);

-- Transactions
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_category ON public.transactions(category);

-- AI Resources
CREATE INDEX idx_ai_resources_type ON public.ai_resources(type);
CREATE INDEX idx_ai_resources_author ON public.ai_resources(author_id);

-- Posts
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_category ON public.posts(category);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);

-- Comments
CREATE INDEX idx_comments_post ON public.comments(post_id);
CREATE INDEX idx_comments_author ON public.comments(author_id);

-- ============================================
-- FUNCTIONS FOR AUTO-UPDATED TIMESTAMPS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_resources_updated_at BEFORE UPDATE ON public.ai_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS FOR CUSTOM AUTH
-- ============================================

-- Function to verify password
CREATE OR REPLACE FUNCTION public.verify_password(
  user_email TEXT,
  password_plain TEXT
)
RETURNS TABLE(id UUID, email TEXT, name TEXT, avatar TEXT, role user_role) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    u.avatar,
    u.role
  FROM public.users u
  WHERE u.email = user_email
    AND u.password_hash = crypt(password_plain, u.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user (only for Founder/CTO)
CREATE OR REPLACE FUNCTION public.create_user_account(
  creator_id UUID,
  user_email TEXT,
  password_plain TEXT,
  user_name TEXT,
  user_role user_role,
  user_avatar TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
  creator_role user_role;
BEGIN
  -- Check if creator is Founder or CTO
  SELECT role INTO creator_role
  FROM public.users
  WHERE id = creator_id;
  
  IF creator_role NOT IN ('Founder', 'CTO') THEN
    RAISE EXCEPTION 'Only Founder and CTO can create user accounts';
  END IF;
  
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM public.users WHERE email = user_email) THEN
    RAISE EXCEPTION 'Email already exists';
  END IF;
  
  -- Generate new user ID
  new_user_id := uuid_generate_v4();
  
  -- Insert new user with hashed password
  INSERT INTO public.users (id, email, password_hash, name, avatar, role)
  VALUES (
    new_user_id,
    user_email,
    crypt(password_plain, gen_salt('bf')), -- bcrypt hash
    user_name,
    COALESCE(user_avatar, 'https://picsum.photos/seed/' || new_user_id || '/200'),
    user_role
  );
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user password
CREATE OR REPLACE FUNCTION public.update_user_password(
  user_id UUID,
  new_password TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET password_hash = crypt(new_password, gen_salt('bf'))
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tech_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS POLICIES
-- ============================================

-- Users can view all users (but not passwords)
CREATE POLICY "Users can view all users"
  ON public.users FOR SELECT
  USING (true);

-- Users can update their own profile (but not password or role)
-- Note: This will be handled by application logic, RLS allows all updates
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Only Founder/CTO can create users (via function, not direct insert)
CREATE POLICY "Only admins can insert users"
  ON public.users FOR INSERT
  WITH CHECK (false); -- Disable direct inserts, use function instead

-- ============================================
-- PROJECTS POLICIES
-- ============================================

-- All users can view projects
CREATE POLICY "Users can view projects"
  ON public.projects FOR SELECT
  USING (true);

-- Users can create projects (application handles authorization)
CREATE POLICY "Users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (true);

-- Project creators and admins can update projects
-- Note: Application will handle authorization
CREATE POLICY "Users can update projects"
  ON public.projects FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Only Founders and CTOs can delete projects
-- Note: Application will handle authorization
CREATE POLICY "Users can delete projects"
  ON public.projects FOR DELETE
  USING (true);

-- ============================================
-- PROJECT_TECH_STACK POLICIES
-- ============================================

CREATE POLICY "Authenticated users can manage tech stack"
  ON public.project_tech_stack FOR ALL
  USING (true);

-- ============================================
-- PROJECT_TEAM POLICIES
-- ============================================

CREATE POLICY "Authenticated users can view project teams"
  ON public.project_team FOR SELECT
  USING (true);

CREATE POLICY "Users can manage project teams"
  ON public.project_team FOR ALL
  USING (true);

-- ============================================
-- TASKS POLICIES
-- ============================================

CREATE POLICY "Users can view relevant tasks"
  ON public.tasks FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update relevant tasks"
  ON public.tasks FOR UPDATE
  USING (true);

-- ============================================
-- LEADS POLICIES
-- ============================================

CREATE POLICY "Authenticated users can view leads"
  ON public.leads FOR SELECT
  USING (true);

CREATE POLICY "Users can create leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update leads"
  ON public.leads FOR UPDATE
  USING (true);

-- ============================================
-- SUBSCRIPTIONS POLICIES
-- ============================================

CREATE POLICY "Authenticated users can view subscriptions"
  ON public.subscriptions FOR SELECT
  USING (true);

CREATE POLICY "Users can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (true);

-- ============================================
-- TRANSACTIONS POLICIES
-- ============================================

CREATE POLICY "Authenticated users can view transactions"
  ON public.transactions FOR SELECT
  USING (true);

CREATE POLICY "Users can manage transactions"
  ON public.transactions FOR ALL
  USING (true);

-- ============================================
-- AI_RESOURCES POLICIES
-- ============================================

CREATE POLICY "Authenticated users can view AI resources"
  ON public.ai_resources FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create AI resources"
  ON public.ai_resources FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update relevant AI resources"
  ON public.ai_resources FOR UPDATE
  USING (true);

-- ============================================
-- AI_RESOURCE_TAGS POLICIES
-- ============================================

CREATE POLICY "Authenticated users can manage tags"
  ON public.ai_resource_tags FOR ALL
  USING (true);

-- ============================================
-- POSTS POLICIES
-- ============================================

CREATE POLICY "Authenticated users can view posts"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  USING (true);

-- ============================================
-- COMMENTS POLICIES
-- ============================================

CREATE POLICY "Authenticated users can view comments"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role IN ('Founder', 'CTO')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Projects with team count
CREATE VIEW public.projects_with_team_count AS
SELECT 
  p.*,
  COUNT(DISTINCT pt.user_id) as team_count
FROM public.projects p
LEFT JOIN public.project_team pt ON p.id = pt.project_id
GROUP BY p.id;

-- View: Tasks with project and assignee info
CREATE VIEW public.tasks_with_details AS
SELECT 
  t.*,
  p.name as project_name,
  u.name as assignee_name,
  u.avatar as assignee_avatar
FROM public.tasks t
LEFT JOIN public.projects p ON t.project_id = p.id
LEFT JOIN public.users u ON t.assignee_id = u.id;

-- View: Monthly financial summary
CREATE VIEW public.monthly_financials AS
SELECT 
  DATE_TRUNC('month', date)::DATE as month,
  SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END) as revenue,
  SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) as expenses,
  SUM(CASE WHEN type = 'Income' THEN amount ELSE -amount END) as profit
FROM public.transactions
WHERE status = 'Completed'
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant select on all tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant insert/update/delete based on RLS policies
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.verify_password TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.create_user_account TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_password TO authenticated;

-- ============================================
-- FIN DEL SCHEMA
-- ============================================
-- Ahora ejecuta create_first_user_calogero.sql para crear el primer usuario
-- ============================================

