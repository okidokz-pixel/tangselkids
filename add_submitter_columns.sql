-- Run this in Supabase SQL Editor
-- Adds submitter identity columns to place_submissions

ALTER TABLE place_submissions
  ADD COLUMN IF NOT EXISTS submitter_name  TEXT,
  ADD COLUMN IF NOT EXISTS submitter_phone TEXT;
