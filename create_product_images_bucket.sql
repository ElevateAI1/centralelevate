-- Create storage bucket for product images
-- Run this in Supabase SQL Editor

-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for product-images bucket
-- Policy: Anyone can view images (public bucket)
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Policy: Allow authenticated users to upload (we'll check role in the app)
-- Note: Since we use custom auth, we'll use service_role key for uploads from the app
-- Or we can make it public for uploads and handle permissions in the app layer
CREATE POLICY "Allow authenticated uploads to product-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- Policy: Allow authenticated users to update
CREATE POLICY "Allow authenticated updates to product-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

-- Policy: Allow authenticated users to delete
CREATE POLICY "Allow authenticated deletes to product-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

