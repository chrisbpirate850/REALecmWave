-- ============================================
-- HELPER FUNCTION FOR ADMIN CHECK (SECURITY DEFINER)
-- ============================================
-- This function bypasses RLS to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$;

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Use security definer function to prevent infinite recursion
-- Admins can view all profiles
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- ============================================
-- MAILINGS TABLE POLICIES
-- ============================================

-- Anyone can view active mailings
CREATE POLICY "mailings_select_active"
  ON public.mailings FOR SELECT
  USING (status IN ('active', 'completed'));

-- Use security definer function to prevent infinite recursion
-- Admins can view all mailings
CREATE POLICY "mailings_select_admin"
  ON public.mailings FOR SELECT
  USING (public.is_admin());

-- Use security definer function to prevent infinite recursion
-- Admins can insert mailings
CREATE POLICY "mailings_insert_admin"
  ON public.mailings FOR INSERT
  WITH CHECK (public.is_admin());

-- Use security definer function to prevent infinite recursion
-- Admins can update mailings
CREATE POLICY "mailings_update_admin"
  ON public.mailings FOR UPDATE
  USING (public.is_admin());

-- Use security definer function to prevent infinite recursion
-- Admins can delete mailings
CREATE POLICY "mailings_delete_admin"
  ON public.mailings FOR DELETE
  USING (public.is_admin());

-- ============================================
-- AD_SPOTS TABLE POLICIES
-- ============================================

-- Anyone can view ad spots for active mailings
CREATE POLICY "ad_spots_select_public"
  ON public.ad_spots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mailings
      WHERE id = mailing_id AND status IN ('active', 'completed')
    )
  );

-- Advertisers can view their own ad spots
CREATE POLICY "ad_spots_select_own"
  ON public.ad_spots FOR SELECT
  USING (advertiser_id = auth.uid());

-- Use security definer function to prevent infinite recursion
-- Admins can view all ad spots
CREATE POLICY "ad_spots_select_admin"
  ON public.ad_spots FOR SELECT
  USING (public.is_admin());

-- Use security definer function to prevent infinite recursion
-- Admins can insert ad spots
CREATE POLICY "ad_spots_insert_admin"
  ON public.ad_spots FOR INSERT
  WITH CHECK (public.is_admin());

-- Use security definer function to prevent infinite recursion
-- Admins can update ad spots
CREATE POLICY "ad_spots_update_admin"
  ON public.ad_spots FOR UPDATE
  USING (public.is_admin());

-- Advertisers can update their own ad spots (upload content only)
CREATE POLICY "ad_spots_update_own"
  ON public.ad_spots FOR UPDATE
  USING (advertiser_id = auth.uid());

-- ============================================
-- PAYMENTS TABLE POLICIES
-- ============================================

-- Advertisers can view their own payments
CREATE POLICY "payments_select_own"
  ON public.payments FOR SELECT
  USING (advertiser_id = auth.uid());

-- Use security definer function to prevent infinite recursion
-- Admins can view all payments
CREATE POLICY "payments_select_admin"
  ON public.payments FOR SELECT
  USING (public.is_admin());

-- System can insert payments (via service role or server)
CREATE POLICY "payments_insert_system"
  ON public.payments FOR INSERT
  WITH CHECK (TRUE);

-- Use security definer function to prevent infinite recursion
-- Admins can update payments
CREATE POLICY "payments_update_admin"
  ON public.payments FOR UPDATE
  USING (public.is_admin());

-- ============================================
-- ANALYTICS TABLE POLICIES
-- ============================================

-- Advertisers can view their own analytics
CREATE POLICY "analytics_select_own"
  ON public.analytics FOR SELECT
  USING (advertiser_id = auth.uid());

-- Use security definer function to prevent infinite recursion
-- Admins can view all analytics
CREATE POLICY "analytics_select_admin"
  ON public.analytics FOR SELECT
  USING (public.is_admin());

-- Public can insert analytics (QR scans are anonymous)
CREATE POLICY "analytics_insert_public"
  ON public.analytics FOR INSERT
  WITH CHECK (TRUE);

-- ============================================
-- LANDING_PAGES TABLE POLICIES
-- ============================================

-- Anyone can view published landing pages
CREATE POLICY "landing_pages_select_published"
  ON public.landing_pages FOR SELECT
  USING (is_published = TRUE);

-- Advertisers can view their own landing pages
CREATE POLICY "landing_pages_select_own"
  ON public.landing_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ad_spots
      WHERE id = ad_spot_id AND advertiser_id = auth.uid()
    )
  );

-- Use security definer function to prevent infinite recursion
-- Admins can view all landing pages
CREATE POLICY "landing_pages_select_admin"
  ON public.landing_pages FOR SELECT
  USING (public.is_admin());

-- Use security definer function to prevent infinite recursion
-- Admins can insert landing pages
CREATE POLICY "landing_pages_insert_admin"
  ON public.landing_pages FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins and advertisers can update their own landing pages
CREATE POLICY "landing_pages_update_own"
  ON public.landing_pages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.ad_spots
      WHERE id = ad_spot_id AND advertiser_id = auth.uid()
    )
  );

-- Use security definer function to prevent infinite recursion
-- Admins can update any landing page
CREATE POLICY "landing_pages_update_admin"
  ON public.landing_pages FOR UPDATE
  USING (public.is_admin());
