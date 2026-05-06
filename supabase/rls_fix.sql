-- =============================================
-- RLS FIX — Run this if submissions are not saving
-- Execute in Supabase Dashboard → SQL Editor
-- =============================================

-- Verify RLS is enabled on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SUBMISSIONS — drop and recreate all policies
-- =============================================

DROP POLICY IF EXISTS "Users can view own submissions; admin can view all" ON public.submissions;
DROP POLICY IF EXISTS "Users can insert their own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admin can update submission status" ON public.submissions;
DROP POLICY IF EXISTS "submissions_select" ON public.submissions;
DROP POLICY IF EXISTS "submissions_insert" ON public.submissions;
DROP POLICY IF EXISTS "submissions_update" ON public.submissions;

-- Users can read their own submissions; admin reads all
CREATE POLICY "submissions_select"
  ON public.submissions FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.email() = 'ibrahimnaimi12@gmail.com'
  );

-- Users can insert — auth.uid() MUST match user_id
CREATE POLICY "submissions_insert"
  ON public.submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can update status
CREATE POLICY "submissions_update"
  ON public.submissions FOR UPDATE
  USING (
    auth.email() = 'ibrahimnaimi12@gmail.com'
  );

-- =============================================
-- REVIEWS — drop and recreate all policies
-- =============================================

DROP POLICY IF EXISTS "Users can view reviews of their own submissions" ON public.reviews;
DROP POLICY IF EXISTS "Admin can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admin can update reviews" ON public.reviews;
DROP POLICY IF EXISTS "reviews_select" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert" ON public.reviews;
DROP POLICY IF EXISTS "reviews_update" ON public.reviews;

CREATE POLICY "reviews_select"
  ON public.reviews FOR SELECT
  USING (
    auth.email() = 'ibrahimnaimi12@gmail.com'
    OR EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = reviews.submission_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "reviews_insert"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.email() = 'ibrahimnaimi12@gmail.com');

CREATE POLICY "reviews_update"
  ON public.reviews FOR UPDATE
  USING (auth.email() = 'ibrahimnaimi12@gmail.com');

-- =============================================
-- VERIFY — check policies are active
-- =============================================
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
