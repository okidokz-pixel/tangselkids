import { NextRequest, NextResponse } from "next/server";
import { fetchDailyStatsSummary } from "@/lib/ga-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Read-only daily stats summary for an external monitoring bot.
 * Not linked from the admin UI — for automated polling only.
 * Auth: header `x-internal-key` must match INTERNAL_REPORT_KEY (set in Vercel env vars).
 * Fails closed: if INTERNAL_REPORT_KEY isn't configured, every request is rejected.
 */
function authorized(req: NextRequest): boolean {
  const key = process.env.INTERNAL_REPORT_KEY;
  if (!key) return false;
  return req.headers.get("x-internal-key") === key;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await fetchDailyStatsSummary();
    return NextResponse.json(summary);
  } catch (err) {
    console.error("daily-stats error", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
