-- ─────────────────────────────────────────────────────────────────────────────
-- place_drafts — staging area for half-finished admin listings ("Save as Draft").
--
-- A draft is NEVER written to a live category table (schools, cafes, …), so it
-- can never leak to the public site, search, or sitemap. `payload` holds the
-- exact column-shaped object the category form would have inserted; `category`
-- is the admin route segment (e.g. "cafes", "mini-zoo") used to resume editing
-- at /admin/<category>/new?draft=<id> and to insert into the right table on
-- publish.
--
-- Access: RLS is enabled with NO policies, so only the service-role client
-- (used by the admin server actions in src/app/admin/actions.ts) can touch it —
-- same trust model as the category tables' admin writes.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.place_drafts (
  id         uuid primary key default gen_random_uuid(),
  category   text not null,
  name       text,
  payload    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists place_drafts_updated_at_idx
  on public.place_drafts (updated_at desc);

alter table public.place_drafts enable row level security;
-- No policies on purpose: service role bypasses RLS; anon/authenticated get nothing.
