-- This script creates a test mailing with 12 ad spots
-- Note: You'll need to create an admin user separately through sign-up
-- Then update their profile to set is_admin = TRUE

-- Insert a test mailing (admin will need to exist first)
INSERT INTO public.mailings (
  id,
  title,
  scheduled_mail_date,
  zip_codes,
  estimated_recipients,
  status,
  price_per_spot
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'January 2026 - Niceville',
  '2026-01-25',
  ARRAY['32578'],
  5000,
  'active',
  -- Updated price per spot to $675
  675.00
);

-- Create 12 ad spots for the mailing (6 front, 6 back)
-- Front side spots
-- Updated all spot prices to $675
INSERT INTO public.ad_spots (mailing_id, position, side, grid_position, status, price) VALUES
  ('a0000000-0000-0000-0000-000000000001', 1, 'front', 1, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000001', 2, 'front', 2, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000001', 3, 'front', 3, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000001', 4, 'front', 4, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000001', 5, 'front', 5, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000001', 6, 'front', 6, 'available', 675.00);

-- Back side spots
INSERT INTO public.ad_spots (mailing_id, position, side, grid_position, status, price) VALUES
  ('a0000000-0000-0000-0000-000000000001', 7, 'back', 1, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000001', 8, 'back', 2, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000001', 9, 'back', 3, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000001', 10, 'back', 4, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000001', 11, 'back', 5, 'available', 675.00),
  ('a0000000-0000-0000-0000-000000000001', 12, 'back', 6, 'available', 675.00);
