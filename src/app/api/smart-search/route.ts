import { NextRequest, NextResponse } from "next/server";
import { parseSearchQuery, buildResultsUrl, hasAnthropicKey } from "@/lib/searchParse";

/**
 * Smart search — turns a natural-language query ("TK di Pamulang dengan SPP di
 * bawah 1 juta") into a /schools URL with the filters pre-applied. Called only
 * when the user submits the search box (Enter / tap), never per-keystroke.
 */
export async function POST(request: NextRequest) {
  let query = "";
  try {
    const body = await request.json();
    query = typeof body?.query === "string" ? body.query.trim() : "";
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!query) return NextResponse.json({ error: "Empty query" }, { status: 400 });
  if (!hasAnthropicKey()) {
    // Graceful fallback: no key configured → let the client keep its plain search.
    return NextResponse.json({ structured: false, url: null, intent: null });
  }

  try {
    const intent = await parseSearchQuery(query);
    const url = buildResultsUrl(intent);
    return NextResponse.json({ structured: url !== null, url, intent });
  } catch (err) {
    console.error("[smart-search] parse failed:", err);
    return NextResponse.json({ structured: false, url: null, intent: null });
  }
}
