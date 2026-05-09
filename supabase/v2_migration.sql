-- =============================================
-- V2 Migration
-- Run in Supabase Dashboard → SQL Editor
-- =============================================

-- 1. Add new profile fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status   ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_tasks_field_major    ON public.tasks(field, major);

-- 3. Ensure all profile RLS policies are correct
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR auth.email() = 'ibrahimnaimi12@gmail.com'
  );

CREATE POLICY "profiles_insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 4. Verify columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;
