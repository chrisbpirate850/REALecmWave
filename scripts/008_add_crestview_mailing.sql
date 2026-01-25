-- This script adds the Crestview, Florida 32536 mailing

-- Create Crestview mailing
INSERT INTO public.mailings (
  id,
  title,
  scheduled_mail_date,
  zip_codes,
  estimated_recipients,
  status,
  price_per_spot
) VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'January 2026 - Crestview',
  '2026-01-25',
  ARRAY['32536'],
  5000,
  'active',
  675.00
);

-- Create 12 ad spots for Crestview mailing (6 front, 6 back)
INSERT INTO public.ad_spots (mailing_id, position, side, grid_position, status, price) VALUES
  ('a0000000-0000-0000-0000-000000000004', 1, 'front', 1, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000004', 2, 'front', 2, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000004', 3, 'front', 3, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000004', 4, 'front', 4, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000004', 5, 'front', 5, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000004', 6, 'front', 6, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000004', 7, 'back', 1, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000004', 8, 'back', 2, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000004', 9, 'back', 3, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000004', 10, 'back', 4, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000004', 11, 'back', 5, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000004', 12, 'back', 6, 'available', 675.00);
