# GradFolio — Setup Guide

## 1. Install dependencies

```bash
npm install
```

## 2. Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Copy your **Project URL** and **Anon Key** from Settings → API.

## 3. Environment variables

Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_ADMIN_EMAIL=admin@gradfolio.com
```

> Change `NEXT_PUBLIC_ADMIN_EMAIL` to any email you'll use for the admin account.

## 4. Run the database schema

1. Open Supabase Dashboard → SQL Editor
2. Paste and run the contents of `supabase/schema.sql`

This creates all tables, RLS policies, and seeds 14 sample tasks.

## 5. Create the Storage bucket

1. Supabase Dashboard → Storage → New Bucket
2. Name: `submissions`
3. Set to **Public**
4. Add a policy: allow authenticated users to upload

```sql
-- Run in SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions', 'submissions', true);

CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'submissions');

CREATE POLICY "Public can view submission files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'submissions');
```

## 6. Create the admin account

Sign up at `/login` using the email you set as `NEXT_PUBLIC_ADMIN_EMAIL`.

> If email confirmation is enabled in Supabase, confirm it first, then sign in.

## 7. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## User Flow

1. **New user** → `/` → Sign Up → `/onboarding` → select field + major → `/tasks`
2. **Submit task** → `/tasks/[id]` → submit → `/dashboard`
3. **Admin** → `/admin` → pick submission → `/admin/submissions/[id]` → score + feedback

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **TypeScript**
- **Supabase** (Auth + PostgreSQL + Storage)
