import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { kvGet, kvSet, kvDel, kvGetJSON, kvSetJSON } from "@/lib/kv";
import { authorizeOwner, sendMessage, answerCallback, editMessageText, downloadFile } from "@/lib/telegram";
import { analyzeImage, matchSchools, buildPatches, uploadSchoolPhoto, nextPhotoSlot, type Proposal } from "@/lib/data-updater";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://tangselkids.com").replace(/\/$/, "");

type PendingEdit = {
  token: string; kind: string; slug: string; schoolName: string;
  summary: string; placePatch: Record<string, unknown>; dbPatch: Record<string, unknown>; createdAt: string;
};

function rnd(): string { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); }

async function proposeEdit(chatId: number, p: Proposal, match: { slug: string; name: string }, caption?: string) {
  let placePatch: Record<string, unknown>;
  let dbPatch: Record<string, unknown>;
  let summary = p.summary || "Perubahan data";

  if (p.kind === "photo") {
    if (!p.photoUrl) { await sendMessage(chatId, "Foto tidak tersedia lagi. Kirim ulang."); return; }
    const slot = await nextPhotoSlot(match.slug);
    if (!slot) {
      await sendMessage(chatId, `<b>${match.name}</b> sudah punya 10 foto (maksimal). Hapus salah satu lewat admin dulu, lalu kirim lagi.`);
      return;
    }
    placePatch = { photos: [...slot.existing, p.photoUrl] };
    dbPatch = { [slot.column]: p.photoUrl };
    summary = `Tambah 1 foto baru (akan jadi foto #${slot.existing.length + 1})`;
  } else {
    const built = buildPatches(p);
    placePatch = built.placePatch; dbPatch = built.dbPatch;
    if (Object.keys(dbPatch).length === 0) {
      await sendMessage(chatId, `Saya mengenali <b>${match.name}</b> tapi belum bisa menyusun perubahannya dari gambar ini. Coba kirim ulang yang lebih jelas, atau tambahkan keterangan.`);
      return;
    }
  }

  const token = rnd();
  const pe: PendingEdit = {
    token, kind: p.kind, slug: match.slug, schoolName: match.name,
    summary, placePatch, dbPatch, createdAt: new Date().toISOString(),
  };
  await kvSetJSON(`pe:${token}`, pe);
  const previewUrl = `${SITE}/place/${match.slug}?preview=${token}`;
  const kindLabel: Record<string, string> = { fees: "Biaya", contact: "Kontak", address: "Alamat", curriculum: "Kurikulum", photo: "Foto" };
  await sendMessage(
    chatId,
    `📝 <b>${match.name}</b>\nUsulan update <b>${kindLabel[p.kind] ?? p.kind}</b>:\n${p.summary}\n\n👀 Lihat di halaman asli (sebelum diterapkan):`,
    [
      [{ text: "👀 Buka pratinjau", url: previewUrl }],
      [{ text: "✅ Terapkan", callback_data: `ok:${token}` }, { text: "❌ Batal", callback_data: `no:${token}` }],
    ],
  );
}

async function handleMessage(msg: Record<string, unknown>) {
  const chat = msg.chat as { id: number };
  const from = msg.from as { id: number; username?: string } | undefined;
  const chatId = chat.id;
  if (!(await authorizeOwner(from, chatId))) {
    await sendMessage(chatId, "Bot ini privat.");
    return;
  }

  const text = (msg.text as string | undefined) ?? (msg.caption as string | undefined);
  if (typeof text === "string" && text.trim().startsWith("/start")) {
    await sendMessage(chatId, "👋 <b>TangselKids Data Updater</b> siap.\n\nKirim:\n• <b>Screenshot biaya / kontak / alamat / kurikulum</b> → saya OCR & susun perubahannya.\n• <b>Foto sekolah</b> (gedung/kelas/kegiatan) → saya tambahkan ke galeri. <i>Beri caption nama sekolahnya</i>, karena foto biasanya tidak memuat nama.\n\nSemua perubahan dikirim balik sebagai link pratinjau di halaman asli + tombol Terapkan/Batal. Tidak ada yang live tanpa persetujuanmu.");
    return;
  }

  // Photos come as `photo` (array of sizes) or image `document`.
  const photos = msg.photo as { file_id: string }[] | undefined;
  const doc = msg.document as { file_id: string; mime_type?: string } | undefined;
  const fileId = photos?.length ? photos[photos.length - 1].file_id : (doc?.mime_type?.startsWith("image/") ? doc.file_id : undefined);

  if (!fileId) {
    if (text) await sendMessage(chatId, "Kirim <b>gambar</b> (screenshot biaya / foto info). Keterangan teks saja belum cukup.");
    return;
  }

  await sendMessage(chatId, "⏳ Membaca gambar…");
  const file = await downloadFile(fileId);
  if (!file) { await sendMessage(chatId, "Gagal mengunduh gambar. Coba lagi."); return; }

  const p = await analyzeImage(file.base64, file.mime, text);
  if (!p) { await sendMessage(chatId, "Gagal membaca gambar (OCR). Coba kirim ulang yang lebih jelas."); return; }

  if (p.kind === "photo") {
    const nameGuess = (p.schoolNameGuess || text || "").trim();
    if (!nameGuess) {
      await sendMessage(chatId, "📷 Foto diterima, tapi saya tidak tahu ini sekolah mana (foto biasanya tidak memuat nama). Kirim ulang fotonya dengan <b>keterangan/caption nama sekolah</b>, mis. \"TK Al Kautsar Bintaro\".");
      return;
    }
    const url = await uploadSchoolPhoto(file.base64, file.mime);
    if (!url) { await sendMessage(chatId, "Gagal mengunggah foto ke penyimpanan. Coba lagi."); return; }
    p.photoUrl = url;
    const matches = await matchSchools(nameGuess);
    if (matches.length === 0) {
      await sendMessage(chatId, `Tidak menemukan sekolah "${nameGuess}". Kirim ulang foto dengan keterangan nama sekolah yang benar.`);
      return;
    }
    if (matches.length === 1 || scoreGap(matches)) { await proposeEdit(chatId, p, matches[0], text); return; }
    const token = rnd();
    await kvSetJSON(`pp:${token}`, { proposal: p, caption: text });
    await sendMessage(chatId, `Foto ini untuk sekolah mana?`, matches.map((m) => [{ text: m.name, callback_data: `pick:${token}:${m.slug}` }]));
    return;
  }
  if (p.kind === "unknown") {
    await sendMessage(chatId, "Saya belum yakin isi gambar ini. Tambahkan keterangan (mis. nama sekolah + jenis data) lalu kirim ulang.");
    return;
  }

  const nameGuess = p.schoolNameGuess || text || "";
  const matches = await matchSchools(nameGuess);
  if (matches.length === 0) {
    await sendMessage(chatId, `Tidak menemukan sekolah yang cocok untuk "${nameGuess}". Balas dengan nama sekolah yang benar + kirim ulang gambarnya.`);
    return;
  }
  if (matches.length === 1 || scoreGap(matches)) {
    await proposeEdit(chatId, p, matches[0], text);
    return;
  }
  // Ambiguous → let the owner pick. Stash the proposal keyed by a token; buttons carry the choice.
  const token = rnd();
  await kvSetJSON(`pp:${token}`, { proposal: p, caption: text });
  await sendMessage(chatId, `Sekolah mana yang dimaksud?`, matches.map((m) => [{ text: m.name, callback_data: `pick:${token}:${m.slug}` }]));
}

function scoreGap(matches: { slug: string; name: string }[]): boolean {
  return matches.length >= 2 && matches[0].name.length > 0; // keep it simple: if top exists, allow single-shot
}

async function handleCallback(cq: Record<string, unknown>) {
  const id = cq.id as string;
  const from = cq.from as { id: number; username?: string };
  const message = cq.message as { chat: { id: number }; message_id: number } | undefined;
  const data = (cq.data as string) || "";
  const chatId = message?.chat.id ?? from.id;
  if (!(await authorizeOwner(from, chatId))) { await answerCallback(id, "Tidak diizinkan"); return; }

  if (data.startsWith("pick:")) {
    const [, token, slug] = data.split(":");
    const stash = await kvGetJSON<{ proposal: Proposal; caption?: string }>(`pp:${token}`);
    await kvDel(`pp:${token}`);
    if (!stash) { await answerCallback(id, "Kedaluwarsa"); return; }
    const { data: row } = await supabaseAdmin.from("schools").select("slug,name").eq("slug", slug).maybeSingle();
    await answerCallback(id);
    if (row) await proposeEdit(chatId, stash.proposal, { slug: row.slug as string, name: row.name as string }, stash.caption);
    return;
  }

  if (data.startsWith("apub:") || data.startsWith("adel:")) {
    const aid = data.slice(5);
    if (data.startsWith("adel:")) {
      await supabaseAdmin.from("articles").delete().eq("id", aid);
      await answerCallback(id, "Dibuang");
      if (message) await editMessageText(chatId, message.message_id, "🗑️ Draf artikel dibuang.");
      return;
    }
    const { data: art, error } = await supabaseAdmin.from("articles")
      .update({ is_published: true, published_at: new Date().toISOString() })
      .eq("id", aid).select("slug,title").single();
    await answerCallback(id, error ? "Gagal" : "Terbit ✅");
    if (error || !art) { if (message) await editMessageText(chatId, message.message_id, `⚠️ Gagal menerbitkan: ${error?.message ?? "not found"}`); return; }
    if (message) await editMessageText(chatId, message.message_id, `✅ Terbit: <b>${art.title}</b>\n${SITE}/berita/${art.slug}`);
    return;
  }

  if (data.startsWith("ok:") || data.startsWith("no:")) {
    const token = data.slice(3);
    const pe = await kvGetJSON<PendingEdit>(`pe:${token}`);
    if (!pe) { await answerCallback(id, "Usulan kedaluwarsa"); return; }
    if (data.startsWith("no:")) {
      await kvDel(`pe:${token}`);
      await answerCallback(id, "Dibatalkan");
      if (message) await editMessageText(chatId, message.message_id, `❌ <b>${pe.schoolName}</b> — dibatalkan.\n${pe.summary}`);
      return;
    }
    // Apply
    try {
      const { error } = await supabaseAdmin.from("schools").update(pe.dbPatch).eq("slug", pe.slug);
      await kvDel(`pe:${token}`);
      if (error) { await answerCallback(id, "Gagal menyimpan"); if (message) await editMessageText(chatId, message.message_id, `⚠️ Gagal menyimpan: ${error.message}`); return; }
      await answerCallback(id, "Diterapkan ✅");
      if (message) await editMessageText(chatId, message.message_id, `✅ <b>${pe.schoolName}</b> — diterapkan & live.\n${pe.summary}\n\n${SITE}/place/${pe.slug}`);
    } catch (e) {
      await answerCallback(id, "Error");
      console.error("[tg apply]", e);
    }
    return;
  }

  await answerCallback(id);
}

export async function POST(req: NextRequest) {
  // Optional webhook secret (set when we register the webhook; stored in KV).
  const secret = await kvGet("bot:webhook_secret");
  if (secret && req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ ok: true }); // ignore spoofed calls quietly
  }

  let update: Record<string, unknown>;
  try { update = await req.json(); } catch { return NextResponse.json({ ok: true }); }

  // Dedupe retries by update_id.
  const uid = String(update.update_id ?? "");
  if (uid) {
    const last = await kvGet("bot:last_update");
    if (last === uid) return NextResponse.json({ ok: true });
    await kvSet("bot:last_update", uid);
  }

  try {
    if (update.message) await handleMessage(update.message as Record<string, unknown>);
    else if (update.callback_query) await handleCallback(update.callback_query as Record<string, unknown>);
  } catch (e) {
    console.error("[tg webhook]", e);
  }
  return NextResponse.json({ ok: true });
}
