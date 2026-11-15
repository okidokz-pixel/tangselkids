import { NextRequest, NextResponse } from "next/server";
import { kvGetJSON } from "@/lib/kv";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Returns a (possibly unpublished) draft article for a preview token, so the
 *  owner can see how it reads on the real article page before publishing. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const ref = await kvGetJSON<{ id: string; slug: string }>(`ap:${token}`);
  if (!ref) return NextResponse.json({ ok: false }, { status: 404 });
  const { data } = await supabaseAdmin
    .from("articles")
    .select("id,title,slug,excerpt,body,cover_image_url,is_published,published_at,created_at")
    .eq("id", ref.id)
    .maybeSingle();
  if (!data) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, article: data });
}
