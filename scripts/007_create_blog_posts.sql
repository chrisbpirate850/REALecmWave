-- Blog posts table for content marketing
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  meta_description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for blog posts
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for blog posts
-- Anyone can read published posts
CREATE POLICY "Anyone can read published blog posts"
  ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

-- Admins can do everything with blog posts
CREATE POLICY "Admins can manage all blog posts"
  ON public.blog_posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- Add category column to ad_spots if not exists (for filtering)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ad_spots' AND column_name = 'category'
  ) THEN
    ALTER TABLE public.ad_spots ADD COLUMN category TEXT;
  END IF;
END $$;

-- Add status options to mailings for print workflow
-- Update check constraint to include new statuses
ALTER TABLE public.mailings DROP CONSTRAINT IF EXISTS mailings_status_check;
ALTER TABLE public.mailings ADD CONSTRAINT mailings_status_check
  CHECK (status IN ('draft', 'active', 'printing', 'sent', 'completed', 'cancelled'));
