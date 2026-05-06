-- ============================================================
-- TangselKids – Supabase Schema
-- Run this in the Supabase SQL Editor (Project → SQL Editor)
-- ============================================================

-- SCHOOLS --------------------------------------------------------
CREATE TABLE IF NOT EXISTS schools (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name                text        NOT NULL,
  google_rating       numeric,
  address             text,
  latitude            numeric,
  longitude           numeric,
  phone               text,
  whatsapp            text,
  email               text,
  hours               text,
  -- free filters
  grades              text[],            -- e.g. {"Preschool","TK","SD"}
  curriculum          text,              -- full detail, shown on detail page
  curriculum_category text,              -- filter value: Nasional, Cambridge, IB…
  teaching_language   text,              -- filter value
  -- premium filters
  uang_pangkal        text,              -- display string e.g. "~Rp 5.000.000"
  uang_pangkal_min    numeric,           -- parsed for filter
  spp_per_month       text,              -- display string
  price_min           numeric,           -- parsed SPP min for filter
  students_per_class  integer,
  has_computer_lab    boolean,
  has_pool            boolean,
  -- social / meta
  instagram           text,
  facebook            text,
  tiktok              text,
  website             text,
  year_founded        integer,
  area                text,              -- 'Bintaro' | 'BSD' | 'Bintaro/BSD'
  location_detail     text,              -- neighbourhood e.g. "Gading Serpong"
  image_url           text,
  is_featured         boolean     DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

-- DAYCARES -------------------------------------------------------
CREATE TABLE IF NOT EXISTS daycares (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name                text        NOT NULL,
  google_rating       numeric,
  address             text,
  latitude            numeric,
  longitude           numeric,
  phone               text,
  whatsapp            text,
  email               text,
  hours               text,
  -- free filter
  age_groups          text[],            -- {"Bayi","Toddler","Balita","Usia 4+"}
  -- premium filters
  price_per_month     text,
  price_min           numeric,
  carer_child_ratio   text,
  method              text,
  has_cctv            boolean,
  has_accreditation   boolean,
  -- social / meta
  instagram           text,
  facebook            text,
  tiktok              text,
  website             text,
  year_founded        integer,
  area                text,
  location_detail     text,
  image_url           text,
  is_featured         boolean     DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

-- LEARNING CENTERS -----------------------------------------------
CREATE TABLE IF NOT EXISTS learning_centers (
  id                    uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name                  text        NOT NULL,
  google_rating         numeric,
  address               text,
  latitude              numeric,
  longitude             numeric,
  phone                 text,
  whatsapp              text,
  email                 text,
  hours                 text,
  -- free filters
  course_types          text[],          -- {"Bahasa Inggris","Musik & Vokal",…}
  age_groups            text[],          -- {"Toddler","Kids","Tween","Teen"}
  -- premium filters
  price_estimate        text,
  price_min             numeric,
  free_trial            boolean,
  teacher_student_ratio text,
  teaching_language     text,
  -- social / meta
  instagram             text,
  facebook              text,
  tiktok                text,
  website               text,
  year_founded          integer,
  area                  text,
  location_detail       text,
  image_url             text,
  is_featured           boolean     DEFAULT false,
  created_at            timestamptz DEFAULT now()
);

-- PLAYGROUNDS ----------------------------------------------------
CREATE TABLE IF NOT EXISTS playgrounds (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name            text        NOT NULL,
  google_rating   numeric,
  address         text,
  latitude        numeric,
  longitude       numeric,
  phone           text,
  whatsapp        text,
  email           text,
  hours           text,
  -- free filters
  price_ticket    text,
  price_min       numeric,
  price_max       numeric,
  playground_type text,                  -- 'Indoor' | 'Outdoor' | 'Indoor & Outdoor'
  -- social / meta
  instagram       text,
  facebook        text,
  tiktok          text,
  website         text,
  year_founded    integer,
  area            text,
  location_detail text,
  image_url       text,
  is_featured     boolean     DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

-- CLINICS --------------------------------------------------------
CREATE TABLE IF NOT EXISTS clinics (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name            text        NOT NULL,
  google_rating   numeric,
  address         text,
  latitude        numeric,
  longitude       numeric,
  phone           text,
  whatsapp        text,
  email           text,
  hours           text,
  -- free filters
  services        text[],                -- {"Terapi Wicara","Fisioterapi",…}
  price_estimate  text,
  price_min       numeric,
  -- social / meta
  instagram       text,
  facebook        text,
  tiktok          text,
  website         text,
  year_founded    integer,
  area            text,
  location_detail text,
  image_url       text,
  is_featured     boolean     DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

-- CAFES ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS cafes (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name            text        NOT NULL,
  google_rating   numeric,
  address         text,
  latitude        numeric,
  longitude       numeric,
  phone           text,
  whatsapp        text,
  email           text,
  hours           text,
  -- free filter
  price_per_person  text,               -- display string
  price_category    text,               -- filter value: '<Rp50rb' | 'Rp50–100rb' | '>Rp100rb'
  child_features    text,
  -- social / meta
  instagram       text,
  facebook        text,
  tiktok          text,
  website         text,
  year_founded    integer,
  area            text,
  location_detail text,
  image_url       text,
  is_featured     boolean     DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

-- MINI ZOO -------------------------------------------------------
CREATE TABLE IF NOT EXISTS mini_zoo (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name            text        NOT NULL,
  google_rating   numeric,
  address         text,
  latitude        numeric,
  longitude       numeric,
  phone           text,
  whatsapp        text,
  email           text,
  hours           text,
  -- free filters
  price_ticket    text,
  price_min       numeric,
  price_max       numeric,
  animals         text,
  -- social / meta
  instagram       text,
  facebook        text,
  tiktok          text,
  website         text,
  year_founded    integer,
  area            text,
  location_detail text,
  image_url       text,
  is_featured     boolean     DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

-- SWIMMING POOLS -------------------------------------------------
CREATE TABLE IF NOT EXISTS swimming_pools (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name            text        NOT NULL,
  google_rating   numeric,
  address         text,
  latitude        numeric,
  longitude       numeric,
  phone           text,
  whatsapp        text,
  email           text,
  hours           text,
  -- free filter
  price_ticket    text,
  price_min       numeric,
  facilities      text,
  -- social / meta
  instagram       text,
  facebook        text,
  tiktok          text,
  website         text,
  year_founded    integer,
  area            text,
  location_detail text,
  image_url       text,
  is_featured     boolean     DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

-- BOOKSTORES -----------------------------------------------------
CREATE TABLE IF NOT EXISTS bookstores (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name            text        NOT NULL,
  google_rating   numeric,
  address         text,
  latitude        numeric,
  longitude       numeric,
  phone           text,
  whatsapp        text,
  email           text,
  hours           text,
  specialization  text,
  -- social / meta
  instagram       text,
  facebook        text,
  tiktok          text,
  website         text,
  year_founded    integer,
  area            text,
  location_detail text,
  image_url       text,
  is_featured     boolean     DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

-- OTHERS ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS others (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name            text        NOT NULL,
  google_rating   numeric,
  address         text,
  latitude        numeric,
  longitude       numeric,
  phone           text,
  whatsapp        text,
  email           text,
  hours           text,
  price_ticket    text,
  price_min       numeric,
  price_max       numeric,
  type            text,
  -- social / meta
  instagram       text,
  facebook        text,
  tiktok          text,
  website         text,
  year_founded    integer,
  area            text,
  location_detail text,
  image_url       text,
  is_featured     boolean     DEFAULT false,
  created_at      timestamptz DEFAULT now()
);
