import { NextRequest, NextResponse } from "next/server";
import { kvGetJSON } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Returns the proposed (not-yet-applied) change for a pending-edit token, so the
 * place page can render itself WITH the proposal overlaid (`/place/[slug]?preview=`).
 * Token is unguessable; it only reveals a change the owner just created.
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const pe = await kvGetJSON<{ slug: string; summary: string; kind: string; placePatch: Record<string, unknown> }>(`pe:${token}`);
  if (!pe) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, slug: pe.slug, summary: pe.summary, kind: pe.kind, placePatch: pe.placePatch });
}
