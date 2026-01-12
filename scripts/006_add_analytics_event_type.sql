-- Add event_type column to analytics table to distinguish scans from conversions
-- 'scan' = QR code scanned, landing page viewed
-- 'conversion' = Offer claimed at the business location

ALTER TABLE public.analytics
ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'scan' CHECK (event_type IN ('scan', 'conversion'));

-- Add index for faster filtering by event type
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics(event_type);

-- Update existing records to be 'scan' type (they all are scans)
UPDATE public.analytics SET event_type = 'scan' WHERE event_type IS NULL;
