import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAdminEmail } from "@/lib/adminEmails";
import { fetchPageViews } from "@/lib/ga-data";

/**
 * Admin-only: return GA pageviews/visitors for one page. Accepts a full URL, a
 * path, or a bare slug, matched as a CONTAINS filter on pagePath.
 */
export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    { cookies: { getAll() { return request.cookies.getAll(); }, setAll() {} } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let q = "";
  try { const b = await request.json(); q = typeof b?.q === "string" ? b.q.trim() : ""; } catch { /* ignore */ }
  if (!q) return NextResponse.json({ error: "Masukkan URL atau slug." }, { status: 400 });

  // Normalise a full URL / path / bare slug down to a path fragment.
  let needle = q;
  try { if (needle.includes("://")) needle = new URL(needle).pathname; } catch { /* not a URL */ }
  needle = needle.split("?")[0].replace(/\/+$/, "").trim();
  if (!needle) needle = q;

  try {
    const data = await fetchPageViews(needle);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[page-views] GA lookup failed:", err);
    return NextResponse.json({ error: "Gagal mengambil data GA." }, { status: 500 });
  }
}
