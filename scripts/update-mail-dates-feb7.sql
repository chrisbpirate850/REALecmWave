-- Update all mailing dates from January 25, 2026 to February 7, 2026
-- and update titles from "January 2026" to "February 2026"

UPDATE public.mailings
SET
  scheduled_mail_date = '2026-02-07',
  title = REPLACE(title, 'January 2026', 'February 2026')
WHERE scheduled_mail_date = '2026-01-25';
