import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendAlertEmail } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Daily backstop (Vercel Cron at 23:00 WIB → GET this route).
 * Compares today's new signups (WIB calendar day) against the trailing 14-day
 * average. If today is drastically below normal it emails you — the coarse net
 * that catches a silent OTP-delivery failure within 24h even at low traffic.
 * It only alerts; it never touches the banner (a quiet day isn't proof of an outage).
 */

const WIB_MS = 7 * 60 * 60 * 1000;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - 15 * 24 * 3600_000).toISOString();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("created_at")
    .gte("created_at", since);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const dayKey = (iso: string) =>
    new Date(new Date(iso).getTime() + WIB_MS).toISOString().slice(0, 10);
  const todayKey = new Date(Date.now() + WIB_MS).toISOString().slice(0, 10);

  const counts: Record<string, number> = {};
  for (const r of data ?? []) {
    const k = dayKey(r.created_at as string);
    counts[k] = (counts[k] ?? 0) + 1;
  }

  const today = counts[todayKey] ?? 0;
  const prev = Object.entries(counts)
    .filter(([k]) => k !== todayKey)
    .map(([, v]) => v);
  const avg = prev.length ? prev.reduce((a, b) => a + b, 0) / prev.length : 0;

  // Only meaningful with a real baseline; avoids crying wolf on a genuinely small site.
  const suspicious = avg >= 2 && today < avg * 0.2;
  if (suspicious) {
    await sendAlertEmail(
      "🟠 TangselKids: unusually low signups today",
      `Only ${today} new signup(s) today (WIB) vs a ~${avg.toFixed(1)}/day average over the ` +
        `last two weeks.\n\nThis can just be a quiet day — but it's also the fingerprint of a ` +
        `silent OTP-delivery failure. Worth a 30-second check that DAFTAR still works.`,
    );
  }

  return NextResponse.json({ today, avg: Number(avg.toFixed(2)), suspicious });
}
