-- ── 1. place_claims table ────────────────────────────────────────────────────
create table place_claims (
  id                 uuid primary key default gen_random_uuid(),
  place_slug         text not null,
  place_name         text not null,
  category           text not null,
  claimant_name      text not null,
  claimant_role      text not null,
  claimant_email     text not null,
  claimant_whatsapp  text not null,
  document_url       text not null,   -- storage path: claim-documents/{slug}/{file}
  status             text not null default 'pending',  -- pending | approved | rejected
  admin_notes        text,
  created_at         timestamptz default now(),
  reviewed_at        timestamptz,
  reviewed_by        uuid references auth.users(id)
);

-- Prevent two approved claims for the same place
create unique index place_claims_approved_slug on place_claims (place_slug)
  where status = 'approved';

-- RLS: anyone can submit, only service role can read/update
alter table place_claims enable row level security;
create policy "public_insert_claims" on place_claims
  for insert with check (true);

-- ── 2. Add is_verified to all place tables ────────────────────────────────────
alter table schools          add column if not exists is_verified boolean not null default false;
alter table learning_centers add column if not exists is_verified boolean not null default false;
alter table daycares         add column if not exists is_verified boolean not null default false;
alter table playgrounds      add column if not exists is_verified boolean not null default false;
alter table clinics          add column if not exists is_verified boolean not null default false;
alter table cafes            add column if not exists is_verified boolean not null default false;
alter table mini_zoo         add column if not exists is_verified boolean not null default false;
alter table swimming_pools   add column if not exists is_verified boolean not null default false;
alter table bookstores       add column if not exists is_verified boolean not null default false;
alter table others           add column if not exists is_verified boolean not null default false;

-- ── 3. Storage bucket for claim documents ─────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('claim-documents', 'claim-documents', false)
on conflict (id) do nothing;

-- Anyone (anon) can upload — needed for unauthenticated claimants
create policy "public_upload_claim_docs"
  on storage.objects for insert
  with check (bucket_id = 'claim-documents');

-- No SELECT policy for anon/authenticated — only service role reads
