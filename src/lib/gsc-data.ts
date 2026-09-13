import { JWT } from "google-auth-library";
import { unstable_cache } from "next/cache";

/**
 * Google Search Console — the ONLY source of real Google search *keywords*
 * (GA4 never receives them). Reuses the GA service account, which must be added
 * as a user on the GSC property and have the Search Console API enabled in its
 * Cloud project. Reads are cached and fail soft (return null) so a GSC hiccup
 * never breaks the analytics page.
 */

export type GscQuery = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;      // 0–1
  position: number; // avg position
};

export type SearchConsoleStats = {
  queries: GscQuery[];
  totalClicks: number;
  totalImpressions: number;
  startDate: string;
  endDate: string;
};

const SITE_URL = process.env.GSC_SITE_URL || "sc-domain:tangselkids.com";

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function accessToken(): Promise<string | null> {
  const email = process.env.GA_CLIENT_EMAIL;
  const key = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) return null;
  const jwt = new JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  const { token } = await jwt.getAccessToken();
  return token ?? null;
}

async function fetchSearchConsole(): Promise<SearchConsoleStats | null> {
  try {
    const token = await accessToken();
    if (!token) return null;

    // GSC data lags ~2 days; use a trailing 28-day window that ends there.
    const end = new Date(Date.now() - 2 * 864e5);
    const start = new Date(end.getTime() - 27 * 864e5);
    const startDate = ymd(start);
    const endDate = ymd(end);

    const res = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate, dimensions: ["query"], rowLimit: 25 }),
      },
    );
    if (!res.ok) {
      console.error("[gsc] query failed:", res.status, (await res.text().catch(() => "")).slice(0, 200));
      return null;
    }
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = data.rows ?? [];
    const queries: GscQuery[] = rows.map((r) => ({
      query: r.keys?.[0] ?? "",
      clicks: Number(r.clicks ?? 0),
      impressions: Number(r.impressions ?? 0),
      ctr: Number(r.ctr ?? 0),
      position: Number(r.position ?? 0),
    }));
    return {
      queries,
      totalClicks: queries.reduce((s, q) => s + q.clicks, 0),
      totalImpressions: queries.reduce((s, q) => s + q.impressions, 0),
      startDate,
      endDate,
    };
  } catch (e) {
    console.error("[gsc] fetch error:", e);
    return null;
  }
}

/** Cached 1h — GSC data only updates daily, so no need to hit it often. */
export const getSearchConsole = unstable_cache(fetchSearchConsole, ["gsc-queries"], { revalidate: 3600 });
