-- Add profile fields to users table
-- Run this in Supabase SQL Editor

-- Add cover_image column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Add bio column to users table  
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add location column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add phone column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone TEXT;

