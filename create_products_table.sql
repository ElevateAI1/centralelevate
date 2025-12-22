-- Create products table for Central Elevate
-- This is separate from projects - it's a node for all our products
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT, -- Photo/image of the product
  current_status TEXT, -- Current status (e.g., "Active", "Maintenance", "Beta")
  git_repo_url TEXT, -- Link to Git repository
  vercel_url TEXT, -- Link to Vercel deployment
  vercel_project_id TEXT, -- Vercel project ID for API integration
  product_url TEXT, -- Link to the actual product
  features TEXT, -- JSON array of features
  is_starred BOOLEAN DEFAULT FALSE, -- Mark as featured/starred product
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_products_is_starred ON public.products(is_starred);
CREATE INDEX IF NOT EXISTS idx_products_current_status ON public.products(current_status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Add comments to document the fields
COMMENT ON TABLE public.products IS 'Products in line - separate from projects, managed by CTO';
COMMENT ON COLUMN public.products.name IS 'Product name';
COMMENT ON COLUMN public.products.description IS 'Product description';
COMMENT ON COLUMN public.products.image_url IS 'Product photo/image URL';
COMMENT ON COLUMN public.products.current_status IS 'Current status of the product (editable by CTO)';
COMMENT ON COLUMN public.products.git_repo_url IS 'Link to Git repository (GitHub, GitLab, etc.)';
COMMENT ON COLUMN public.products.vercel_url IS 'Link to Vercel deployment';
COMMENT ON COLUMN public.products.vercel_project_id IS 'Vercel project ID for API integration';
COMMENT ON COLUMN public.products.product_url IS 'Link to the actual product/live application';
COMMENT ON COLUMN public.products.features IS 'Features/characteristics of the product (stored as JSON array)';
COMMENT ON COLUMN public.products.is_starred IS 'Marks the product as featured/starred';

-- Enable RLS (Row Level Security)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read products
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT USING (true);

-- Policy: Only CTO and Founder can insert products
CREATE POLICY "Only CTO and Founder can create products" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('CTO', 'Founder')
    )
  );

-- Policy: Only CTO and Founder can update products
CREATE POLICY "Only CTO and Founder can update products" ON public.products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('CTO', 'Founder')
    )
  );

-- Policy: Only CTO and Founder can delete products
CREATE POLICY "Only CTO and Founder can delete products" ON public.products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('CTO', 'Founder')
    )
  );

