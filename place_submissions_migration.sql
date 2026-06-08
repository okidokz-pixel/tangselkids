-- ============================================================
-- place_submissions migration
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- 1. Table
CREATE TABLE IF NOT EXISTS place_submissions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status        TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'approved', 'rejected')),

  -- Core
  name          TEXT        NOT NULL,
  category      TEXT        NOT NULL,
  area          TEXT        NOT NULL,
  address       TEXT,
  phone         TEXT,
  whatsapp      TEXT,
  description   TEXT,
  gmaps_url     TEXT,
  hours         TEXT,
  year_founded  INT,

  -- Social links
  instagram     TEXT,
  facebook      TEXT,
  tiktok        TEXT,
  youtube       TEXT,
  website       TEXT,

  -- Media (storage URLs)
  logo_url      TEXT,
  photos        JSONB,        -- string[]
  yt_videos     JSONB,        -- string[]

  -- Category-specific extras (schema varies per category)
  category_data JSONB,

  -- Admin review
  admin_notes   TEXT,
  reviewed_at   TIMESTAMPTZ
);

-- 2. Row-level security
ALTER TABLE place_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone (anon + authenticated) can INSERT a new submission.
-- Only the service-role key (supabaseAdmin) can SELECT/UPDATE — it bypasses RLS.
CREATE POLICY "public_can_insert" ON place_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 3. Storage bucket for uploaded photos
-- Creates a *public* bucket so photo URLs are viewable without auth.
INSERT INTO storage.buckets (id, name, public)
VALUES ('place-submissions', 'place-submissions', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload into the bucket (server uses service-role, this covers browser direct uploads if ever needed)
CREATE POLICY "public_can_upload_place_submissions"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'place-submissions');

-- Allow anyone to view objects in the bucket
CREATE POLICY "public_can_view_place_submissions"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'place-submissions');
