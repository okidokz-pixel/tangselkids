-- ============================================================
-- TangselKids Auth Migration
-- Run this entire file in the Supabase SQL Editor (once).
-- Creates: profiles, reviews, notes tables + RLS + avatar bucket.
-- Alters:  saved_places — adds user_id column.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. PROFILES
--    One row per auth.users entry. Auto-created by trigger below.
--    tier/lifetime/premium_expires_at are dormant for now (soft launch = free only).
--    Users may NOT update tier columns from the client — only service role can.
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id                   UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone                TEXT        UNIQUE,
  name                 TEXT,
  address              TEXT,
  address_lat          DOUBLE PRECISION,
  address_lng          DOUBLE PRECISION,
  dob                  DATE,
  kids                 JSONB       NOT NULL DEFAULT '[]',   -- matches Kid[] = {name, dob, gender?}[]
  avatar_url           TEXT,                                -- Supabase Storage path (replaces base64)
  tier                 TEXT        NOT NULL DEFAULT 'free'
                                   CHECK (tier IN ('free', 'premium')),
  lifetime             BOOLEAN     NOT NULL DEFAULT false,
  premium_expires_at   TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on any change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$;

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create a free profile whenever a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, phone)
  VALUES (NEW.id, NEW.phone)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: read own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can only update safe columns — NOT tier/lifetime/premium_expires_at.
-- (Column-level privilege sits on top of RLS.)
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT  UPDATE (name, address, address_lat, address_lng, dob, kids, avatar_url, phone)
  ON public.profiles TO authenticated;


-- ────────────────────────────────────────────────────────────
-- 2. SAVED PLACES
--    Already exists keyed by user_phone. We add user_id for
--    the new auth flow. Old phone-keyed rows are left intact.
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.saved_places (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_phone  TEXT,                                         -- legacy (pre-auth) rows
  user_id     UUID  REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id    TEXT  NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, place_id)
);

-- Add user_id if the table already existed without it
ALTER TABLE public.saved_places
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Unique constraint for new rows (safe to run if it already exists under another name)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'saved_places_user_id_place_id_key'
  ) THEN
    ALTER TABLE public.saved_places ADD CONSTRAINT saved_places_user_id_place_id_key
      UNIQUE (user_id, place_id);
  END IF;
END $$;

ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_places: own rows"
  ON public.saved_places FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- 3. REVIEWS
--    Replaces localStorage reviewsStorage.ts.
--    One review per user per place. Public-readable (for future
--    aggregation); only the author can write.
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reviews (
  id             UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id       TEXT  NOT NULL,
  place_name     TEXT,
  place_icon     TEXT,
  place_category TEXT,
  reviewer_name  TEXT,
  rating         INT   NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        TEXT,
  is_published   BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, place_id)
);

CREATE OR REPLACE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews: public read"
  ON public.reviews FOR SELECT
  USING (is_published = true);

CREATE POLICY "reviews: own write"
  ON public.reviews FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- 4. NOTES
--    Replaces localStorage notesStorage.ts.
--    Fully private — only the owner can read or write.
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notes (
  id             UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id       TEXT  NOT NULL,
  place_name     TEXT,
  place_category TEXT,
  place_icon     TEXT,
  note_text      TEXT  NOT NULL,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, place_id)
);

CREATE OR REPLACE TRIGGER notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes: own rows"
  ON public.notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- 5. AVATAR STORAGE BUCKET
--    Public bucket — URLs are embeddable anywhere.
--    Each user writes only to their own folder: avatars/{user_id}/*
-- ────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "avatars: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars: owner upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars: owner update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars: owner delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- ────────────────────────────────────────────────────────────
-- Done.
-- Next step: in Supabase Dashboard → Authentication → Providers
-- → Phone, enable it and add test numbers for development:
--   e.g. +628111111111 with OTP 123456
-- ────────────────────────────────────────────────────────────
