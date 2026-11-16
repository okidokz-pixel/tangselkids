-- Run this once in the Supabase SQL editor to enable full OTP monitoring.
-- Schema matches the app code exactly: src/lib/otp-events.ts + src/lib/site-flags.ts.
-- Safe to re-run: it drops the (empty) tables first, so an earlier mismatched
-- version is replaced cleanly. Until these exist with THESE columns, OTP logging
-- fails silently and the guard/banner see no data.

-- ── 1) OTP telemetry (one row per send/verify attempt) ───────────────────────
-- otp-events.ts inserts {kind, ok, provider, detail} and queries select(kind,ok)
-- filtered by ts >= since.
drop table if exists public.otp_events cascade;
create table public.otp_events (
  id        bigint generated always as identity primary key,
  ts        timestamptz not null default now(),
  kind      text    not null,            -- 'send' | 'verify'
  ok        boolean not null,            -- success?
  provider  text,                        -- 'fazpass' | 'otpspace' | ...
  detail    text                         -- error code / note, if any
);
create index otp_events_ts_idx       on public.otp_events (ts desc);
create index otp_events_kind_ok_idx  on public.otp_events (kind, ok, ts desc);

-- ── 2) Site banner flag (drives the OTP announcement banner in layout.tsx) ────
-- site-flags.ts reads {bool_value, message, tone, source} where key='otp_banner'
-- and UPDATEs that row (never inserts) — so the row must be seeded below.
drop table if exists public.site_flags cascade;
create table public.site_flags (
  key         text primary key,
  bool_value  boolean     not null default false,
  message     text        not null default '',
  tone        text        not null default 'ok',    -- 'ok' (green) | 'warn' (amber)
  source      text        not null default 'manual',-- 'manual' | 'auto' (monitor-owned)
  updated_at  timestamptz not null default now()
);

-- Seed the banner row (off by default). The monitor/admin toggle this row.
insert into public.site_flags (key, bool_value, message, tone, source)
values ('otp_banner', false, '', 'ok', 'manual')
on conflict (key) do nothing;

-- RLS on: service role bypasses it (server-only); no public policies added.
alter table public.otp_events enable row level security;
alter table public.site_flags  enable row level security;
