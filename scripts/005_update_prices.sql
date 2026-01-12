-- Update default price per spot to $675
UPDATE public.mailings 
SET price_per_spot = 675.00 
WHERE price_per_spot = 199.00;

-- Update all ad spots to $675
UPDATE public.ad_spots 
SET price = 675.00 
WHERE price = 199.00;
