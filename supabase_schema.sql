-- GitMesh CE Content Management Schema
-- This script initializes the 'content' table for blogs, announcements, and welfare info.
-- Last Updated: 2025-12-19

-- 1. Table definition
-- Stores polymorphic content differentiated by the 'type' column.
CREATE TABLE IF NOT EXISTS public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,                                     -- URL-safe identifier
  type TEXT NOT NULL CHECK (type IN ('blog', 'announcement', 'welfare')), -- content categorization
  title TEXT NOT NULL,
  content TEXT NOT NULL,                                         -- MDX/Markdown body
  excerpt TEXT NOT NULL,                                         -- SEO/Summary text
  author TEXT NOT NULL,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}',                                      -- Array for categorization and targeting
  featured BOOLEAN DEFAULT FALSE,                                -- Flag for home/hero sections
  newsletter BOOLEAN DEFAULT FALSE,                              -- Flag to track newsletter inclusion
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Performance optimization
-- B-tree indexes for fast lookups on slug (primary fetch key) and type (filtering)
CREATE INDEX IF NOT EXISTS idx_content_slug ON public.content(slug);
CREATE INDEX IF NOT EXISTS idx_content_type ON public.content(type);

-- 3. Security Layer (Row Level Security)
-- RLS must be enabled for production compliance on Supabase.
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- 4. Access Policies
-- Note: We implement permissive policies here to support server-side handling via service roles.
-- For production, tighten these if client-side Direct-to-Supabase fetching is required.

DROP POLICY IF EXISTS "anon_all" ON public.content;
DROP POLICY IF EXISTS "auth_all" ON public.content;
DROP POLICY IF EXISTS "service_all" ON public.content;

CREATE POLICY "anon_all" ON public.content FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON public.content FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON public.content FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. Automations
-- Trigger to maintain the 'updated_at' timestamp on row modifications.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_updated_at
BEFORE UPDATE ON public.content
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
