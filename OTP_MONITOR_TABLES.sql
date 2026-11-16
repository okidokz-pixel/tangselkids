-- Run this once in the Supabase SQL editor to enable full OTP monitoring.
-- Until these exist, the OTP credit guard + hourly otp-health monitor + the
-- site OTP-outage banner all fall back to "no data" (no false alarms, but no
-- real telemetry either). Everything else (health monitor, Telegram bot,
-- article writer) already works without this.

-- 1) Per-attempt OTP telemetry (one row per send/verify attempt)
create table if not exists public.otp_events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  phone       text,
  channel     text,                 -- e.g. 'whatsapp', 'sms'
  kind        text not null,        -- 'send' | 'verify'
  status      text not null,        -- 'ok' | 'fail'
  error       text,                 -- provider error, if any
  meta        jsonb
);
create index if not exists otp_events_created_at_idx on public.otp_events (created_at desc);
create index if not exists otp_events_status_idx     on public.otp_events (status, created_at desc);

-- 2) Site-wide flags (drives the OTP-outage announcement banner)
create table if not exists public.site_flags (
  key         text primary key,     -- e.g. 'otp_banner'
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- RLS: keep these server-only (service role bypasses RLS; no public policies added).
alter table public.otp_events enable row level security;
alter table public.site_flags  enable row level security;
