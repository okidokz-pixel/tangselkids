import { NextRequest, NextResponse } from "next/server";
import { notifyOwner } from "@/lib/notify";
import { kvGet, kvSet } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Uptime/health monitor (Vercel Cron, every 6h). Pings the key pages and flags a
 * page only on a real server failure (5xx or no response) — a 3xx redirect (e.g.
 * /admin → /admin/login) is healthy. Would have caught the /admin 500. Alerts the
 * owner on a new failure and again when it recovers; stays quiet while unchanged.
 */

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://tangselkids.com").replace(/\/$/, "");

const CHECKS: { path: string; label: string }[] = [
  { path: "/", label: "Homepage" },
  { path: "/schools", label: "Sekolah list" },
  { path: "/admin", label: "Admin (gate)" },
  { path: "/admin/login", label: "Admin login" },
  { path: "/berita", label: "Artikel" },
  { path: "/place/mentari-intercultural-school-bintaro-sd-pondok-aren", label: "Place page" },
];

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

async function checkOne(path: string): Promise<{ ok: boolean; status: number | string }> {
  try {
    const res = await fetch(`${SITE}${path}`, { redirect: "manual", signal: AbortSignal.timeout(12000) });
    return { ok: res.status < 500, status: res.status };
  } catch (e) {
    return { ok: false, status: `ERR ${String(e).slice(0, 40)}` };
  }
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const results = await Promise.all(
    CHECKS.map(async (c) => ({ ...c, ...(await checkOne(c.path)) })),
  );
  const down = results.filter((r) => !r.ok);
  const downKey = down.map((d) => `${d.label}(${d.status})`).join(", ");

  const prev = (await kvGet("monitor:health_down")) ?? "";
  let action = "none";

  if (down.length && downKey !== prev) {
    action = "alerted_down";
    await notifyOwner(
      "🔴 TangselKids: halaman bermasalah",
      `Pemeriksaan kesehatan menemukan ${down.length} halaman bermasalah:\n\n` +
        down.map((d) => `• ${d.label} → ${d.status}\n  ${SITE}${d.path}`).join("\n") +
        `\n\nPemeriksaan berikutnya dalam 6 jam.`,
    );
  } else if (!down.length && prev) {
    action = "alerted_recovered";
    await notifyOwner("🟢 TangselKids: semua halaman normal kembali", "Semua halaman yang tadi bermasalah sudah pulih.");
  }

  await kvSet("monitor:health_down", downKey);

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    results: results.map((r) => ({ label: r.label, status: r.status, ok: r.ok })),
    down: down.length,
    action,
  });
}
