import { NextRequest, NextResponse } from "next/server";
import { generateDraft } from "@/lib/article-writer";
import { kvSetJSON } from "@/lib/kv";
import { notifyOwnerTelegram } from "@/lib/telegram";
import { sendAlertEmail } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Article Writer cron (3×/week). Drafts a search-relevant article grounded in the
 * real listings, saves it UNPUBLISHED, and sends the owner a Telegram preview link
 * + Publish/Discard buttons. Nothing goes live without a tap.
 */

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://tangselkids.com").replace(/\/$/, "");

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const draft = await generateDraft();
  if (!draft) {
    await sendAlertEmail("🟠 TangselKids: gagal membuat draf artikel", "Article Writer tidak menghasilkan draf kali ini (cek ANTHROPIC_API_KEY / kredit API).");
    return NextResponse.json({ ok: false });
  }

  const token = Math.random().toString(36).slice(2, 12);
  await kvSetJSON(`ap:${token}`, { id: draft.id, slug: draft.slug });
  const previewUrl = `${SITE}/berita/${draft.slug}?preview=${token}`;

  const sent = await notifyOwnerTelegram(
    `📰 <b>Draf artikel baru</b>\n<b>${draft.title}</b>\n\n👀 Pratinjau di halaman asli:`,
    [
      [{ text: "👀 Buka pratinjau", url: previewUrl }],
      [{ text: "✅ Terbitkan", callback_data: `apub:${draft.id}` }, { text: "🗑️ Buang", callback_data: `adel:${draft.id}` }],
    ],
  );
  if (!sent) {
    await sendAlertEmail("📰 TangselKids: draf artikel siap", `"${draft.title}" tersimpan sebagai draf. Pratinjau: ${previewUrl}\n(Telegram belum tersambung — /start bot-nya untuk tombol Terbitkan.)`);
  }

  return NextResponse.json({ ok: true, id: draft.id, slug: draft.slug, title: draft.title });
}
