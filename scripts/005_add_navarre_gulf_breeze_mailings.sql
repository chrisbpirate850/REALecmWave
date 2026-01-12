-- This script adds Navarre and Gulf Breeze mailings
-- and updates the existing Niceville mailing to remove Fort Walton Beach reference

-- First, update the existing mailing to be Niceville only
UPDATE public.mailings
SET
  title = 'January 2026 - Niceville',
  zip_codes = ARRAY['32578']
WHERE id = 'a0000000-0000-0000-0000-000000000001';

-- Create Navarre mailing
INSERT INTO public.mailings (
  id,
  title,
  scheduled_mail_date,
  zip_codes,
  estimated_recipients,
  status,
  price_per_spot
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'January 2026 - Navarre',
  '2026-01-25',
  ARRAY['32566'],
  5000,
  'active',
  675.00
);

-- Create 12 ad spots for Navarre mailing (6 front, 6 back)
INSERT INTO public.ad_spots (mailing_id, position, side, grid_position, status, price) VALUES
  ('a0000000-0000-0000-0000-000000000002', 1, 'front', 1, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000002', 2, 'front', 2, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000002', 3, 'front', 3, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000002', 4, 'front', 4, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000002', 5, 'front', 5, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000002', 6, 'front', 6, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000002', 7, 'back', 1, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000002', 8, 'back', 2, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000002', 9, 'back', 3, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000002', 10, 'back', 4, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000002', 11, 'back', 5, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000002', 12, 'back', 6, 'available', 675.00);

-- Create Gulf Breeze mailing
INSERT INTO public.mailings (
  id,
  title,
  scheduled_mail_date,
  zip_codes,
  estimated_recipients,
  status,
  price_per_spot
) VALUES (
  'a0000000-0000-0000-0000-000000000003',
  'January 2026 - Gulf Breeze',
  '2026-01-25',
  ARRAY['32561'],
  5000,
  'active',
  675.00
);

-- Create 12 ad spots for Gulf Breeze mailing (6 front, 6 back)
INSERT INTO public.ad_spots (mailing_id, position, side, grid_position, status, price) VALUES
  ('a0000000-0000-0000-0000-000000000003', 1, 'front', 1, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000003', 2, 'front', 2, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000003', 3, 'front', 3, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000003', 4, 'front', 4, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000003', 5, 'front', 5, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000003', 6, 'front', 6, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000003', 7, 'back', 1, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000003', 8, 'back', 2, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000003', 9, 'back', 3, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000003', 10, 'back', 4, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000003', 11, 'back', 5, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000003', 12, 'back', 6, 'available', 675.00);
