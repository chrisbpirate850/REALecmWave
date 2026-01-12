-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (profiles for advertisers and admins)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  business_name TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mailings table (represents each postcard campaign)
CREATE TABLE IF NOT EXISTS public.mailings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  scheduled_mail_date DATE NOT NULL,
  zip_codes TEXT[] NOT NULL,
  estimated_recipients INTEGER DEFAULT 5000,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  -- Updated default price per spot to $675
  price_per_spot DECIMAL(10, 2) NOT NULL DEFAULT 675.00,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad spots table (12 spots per mailing: 6 front + 6 back)
CREATE TABLE IF NOT EXISTS public.ad_spots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mailing_id UUID NOT NULL REFERENCES public.mailings(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 12),
  side TEXT NOT NULL CHECK (side IN ('front', 'back')),
  grid_position INTEGER NOT NULL CHECK (grid_position BETWEEN 1 AND 6),
  advertiser_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'purchased', 'uploaded')),
  price DECIMAL(10, 2) NOT NULL,
  qr_code_data TEXT,
  ad_copy_url TEXT,
  landing_page_slug TEXT,
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mailing_id, position)
);

-- Payments table (track Stripe payments)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_spot_id UUID NOT NULL REFERENCES public.ad_spots(id) ON DELETE CASCADE,
  advertiser_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_payment_id TEXT,
  stripe_payment_link TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics table (track QR code scans)
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_spot_id UUID NOT NULL REFERENCES public.ad_spots(id) ON DELETE CASCADE,
  advertiser_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT,
  location TEXT
);

-- Landing pages table (custom pages for each advertiser's offer)
CREATE TABLE IF NOT EXISTS public.landing_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_spot_id UUID NOT NULL REFERENCES public.ad_spots(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  headline TEXT,
  offer_description TEXT,
  cta_text TEXT DEFAULT 'Claim Offer',
  cta_url TEXT,
  custom_content JSONB,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_mailings_status ON public.mailings(status);
CREATE INDEX idx_mailings_scheduled_date ON public.mailings(scheduled_mail_date);
CREATE INDEX idx_ad_spots_mailing ON public.ad_spots(mailing_id);
CREATE INDEX idx_ad_spots_advertiser ON public.ad_spots(advertiser_id);
CREATE INDEX idx_ad_spots_status ON public.ad_spots(status);
CREATE INDEX idx_analytics_ad_spot ON public.analytics(ad_spot_id);
CREATE INDEX idx_analytics_scanned_at ON public.analytics(scanned_at);
CREATE INDEX idx_landing_pages_slug ON public.landing_pages(slug);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mailings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
