-- ============================================
-- NEXUS AI AGENCY OS - SUPABASE SCHEMA
-- ============================================
-- Script completo para todas las funcionalidades
-- Incluye: Tablas, Relaciones, RLS, Triggers, Funciones
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
-- USERS TABLE (Extends Supabase auth.users)
-- ============================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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
  last_update TEXT, -- Formatted string like "2 hours ago"
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECT_TECH_STACK (Many-to-Many)
-- ============================================

CREATE TABLE public.project_tech_stack (
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  tech TEXT NOT NULL, -- 'React', 'Node', 'Python', etc.
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
  last_contact TEXT, -- Formatted string like "Yesterday"
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
  timestamp TEXT NOT NULL, -- Formatted string like "2 hours ago"
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
  timestamp TEXT NOT NULL, -- Formatted string like "4 hours ago"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users
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
-- FUNCTION: Auto-create user profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, avatar, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://picsum.photos/seed/' || NEW.id || '/200'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'Developer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

-- Users can read all users
CREATE POLICY "Users can view all users"
  ON public.users FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- PROJECTS POLICIES
-- ============================================

-- All authenticated users can view projects
CREATE POLICY "Authenticated users can view projects"
  ON public.projects FOR SELECT
  USING (auth.role() = 'authenticated');

-- Founders, CTOs, and Sales can create projects
CREATE POLICY "Admins can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Founder', 'CTO', 'Sales')
    )
  );

-- Project creators and admins can update projects
CREATE POLICY "Admins and creators can update projects"
  ON public.projects FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND (
      created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role IN ('Founder', 'CTO')
      )
    )
  );

-- Only Founders and CTOs can delete projects
CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Founder', 'CTO')
    )
  );

-- ============================================
-- PROJECT_TECH_STACK POLICIES
-- ============================================

CREATE POLICY "Authenticated users can manage tech stack"
  ON public.project_tech_stack FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================
-- PROJECT_TEAM POLICIES
-- ============================================

CREATE POLICY "Authenticated users can view project teams"
  ON public.project_team FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage project teams"
  ON public.project_team FOR ALL
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Founder', 'CTO')
    )
  );

-- ============================================
-- TASKS POLICIES
-- ============================================

-- Users can view tasks for projects they're on or all tasks if admin
CREATE POLICY "Users can view relevant tasks"
  ON public.tasks FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      assignee_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.project_team
        WHERE project_id = tasks.project_id AND user_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role IN ('Founder', 'CTO')
      )
    )
  );

-- Authenticated users can create tasks
CREATE POLICY "Authenticated users can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own tasks or admins can update any
CREATE POLICY "Users can update relevant tasks"
  ON public.tasks FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND (
      assignee_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role IN ('Founder', 'CTO')
      )
    )
  );

-- ============================================
-- LEADS POLICIES
-- ============================================

-- Authenticated users can view leads
CREATE POLICY "Authenticated users can view leads"
  ON public.leads FOR SELECT
  USING (auth.role() = 'authenticated');

-- Sales, Founders, and CTOs can create leads
CREATE POLICY "Sales and admins can create leads"
  ON public.leads FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Founder', 'CTO', 'Sales')
    )
  );

-- Sales and admins can update leads
CREATE POLICY "Sales and admins can update leads"
  ON public.leads FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Founder', 'CTO', 'Sales')
    )
  );

-- ============================================
-- SUBSCRIPTIONS POLICIES
-- ============================================

-- Authenticated users can view subscriptions
CREATE POLICY "Authenticated users can view subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.role() = 'authenticated');

-- CFO, Founders, and CTOs can manage subscriptions
CREATE POLICY "Finance and admins can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Founder', 'CTO', 'CFO')
    )
  );

-- ============================================
-- TRANSACTIONS POLICIES
-- ============================================

-- Authenticated users can view transactions
CREATE POLICY "Authenticated users can view transactions"
  ON public.transactions FOR SELECT
  USING (auth.role() = 'authenticated');

-- CFO, Founders, and CTOs can manage transactions
CREATE POLICY "Finance and admins can manage transactions"
  ON public.transactions FOR ALL
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Founder', 'CTO', 'CFO')
    )
  );

-- ============================================
-- AI_RESOURCES POLICIES
-- ============================================

-- All authenticated users can view AI resources
CREATE POLICY "Authenticated users can view AI resources"
  ON public.ai_resources FOR SELECT
  USING (auth.role() = 'authenticated');

-- All authenticated users can create AI resources
CREATE POLICY "Authenticated users can create AI resources"
  ON public.ai_resources FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own resources or admins can update any
CREATE POLICY "Users can update relevant AI resources"
  ON public.ai_resources FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND (
      author_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role IN ('Founder', 'CTO')
      )
    )
  );

-- ============================================
-- AI_RESOURCE_TAGS POLICIES
-- ============================================

CREATE POLICY "Authenticated users can manage tags"
  ON public.ai_resource_tags FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================
-- POSTS POLICIES
-- ============================================

-- All authenticated users can view posts
CREATE POLICY "Authenticated users can view posts"
  ON public.posts FOR SELECT
  USING (auth.role() = 'authenticated');

-- All authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own posts or admins can update any
CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND (
      author_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role IN ('Founder', 'CTO')
      )
    )
  );

-- ============================================
-- COMMENTS POLICIES
-- ============================================

-- All authenticated users can view comments
CREATE POLICY "Authenticated users can view comments"
  ON public.comments FOR SELECT
  USING (auth.role() = 'authenticated');

-- All authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND (
      author_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role IN ('Founder', 'CTO')
      )
    )
  );

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

-- ============================================
-- END OF SCHEMA
-- ============================================

