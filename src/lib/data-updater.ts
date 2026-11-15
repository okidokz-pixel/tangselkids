import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "./supabase-admin";

/**
 * Data Updater — turn a screenshot (sent via Telegram) into a proposed edit for a
 * school listing. Vision OCR via Claude (Haiku, cheap), then match the school and
 * build a preview patch + a DB patch. Follows the fee standard (Biaya Awal etc.).
 */

const VISION_MODEL = "claude-haiku-4-5";

export type Proposal = {
  kind: "fees" | "contact" | "address" | "curriculum" | "photo" | "unknown";
  schoolNameGuess: string | null;
  summary: string;
  // field payloads (only the relevant one is set)
  fees?: Record<string, unknown> | null;
  tahun?: string | null;
  contact?: { phone?: string; whatsapp?: string; email?: string; website?: string; instagram?: string } | null;
  address?: string | null;
  curriculum?: string | null;
};

const SYSTEM = `You read Indonesian school fee sheets / info screenshots and extract structured data for a Tangerang Selatan school directory. Reply with ONLY one JSON object, no prose.

Detect the "kind":
- "fees" — a fee/biaya sheet. Extract "fees" (our format below) and "tahun" (e.g. "2027/2028" if shown).
- "contact" — phone/WhatsApp/email/website/IG. Extract "contact".
- "address" — a street address. Extract "address" (full string).
- "curriculum" — curriculum/kurikulum info. Extract "curriculum" (short string).
- "photo" — a building/campus/activity photo (not a document). No data to extract.
- "unknown" — can't tell.

Always include "school_name" (read the school's name from the image; null if none) and "summary" (one short Indonesian line describing what this updates).

Fees format ("fees"): { intro?, estimasi(bool), rows:[{label, amount, note?, section, group?}], rowsNote?, catatan? }
- amount is FREE TEXT exactly as printed (keep "Rp", dots, ranges with "–", "/ bulan").
- section is ONE of: "Biaya Awal" (one-time: pendaftaran, uang pangkal/enrollment, formulir, deposit, seragam), "Biaya Bulanan (SPP)" (monthly tuition), "Biaya per Term" (per-term tuition), "Biaya per Tahun" (annual: buku, materi, kegiatan), "Biaya Lain" (misc).
- group (optional): when several rows are the same fee split by a variant (per entry grade, Internal/External), put the COMMON part in group and the VARIANT in label.
- estimasi=true ONLY if the sheet says it's an estimate; else false.
- Do NOT include bank account numbers or the standard disclaimer in catatan.
- Keep each amount short.

JSON shape: {"school_name": "...", "kind": "...", "summary": "...", "fees": {...}|null, "tahun": "..."|null, "contact": {...}|null, "address": "..."|null, "curriculum": "..."|null}`;

export async function analyzeImage(base64: string, mime: string, caption?: string): Promise<Proposal | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const client = new Anthropic();
  try {
    const msg = await client.messages.create({
      model: VISION_MODEL,
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mime as "image/jpeg", data: base64 } },
          { type: "text", text: `Extract the data as JSON.${caption ? ` Hint from sender: "${caption}".` : ""}` },
        ],
      }],
    });
    const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const j = JSON.parse(m[0]);
    return {
      kind: ["fees", "contact", "address", "curriculum", "photo"].includes(j.kind) ? j.kind : "unknown",
      schoolNameGuess: j.school_name ?? null,
      summary: j.summary ?? "Perubahan data",
      fees: j.fees ?? null,
      tahun: j.tahun ?? null,
      contact: j.contact ?? null,
      address: j.address ?? null,
      curriculum: j.curriculum ?? null,
    };
  } catch (e) {
    console.error("[data-updater] vision failed:", e);
    return null;
  }
}

export type SchoolMatch = { slug: string; name: string };

/** Find the best school match by name/alias. Returns up to `limit` candidates. */
export async function matchSchools(nameGuess: string, limit = 5): Promise<SchoolMatch[]> {
  const q = (nameGuess || "").trim();
  if (!q) return [];
  const words = q.split(/\s+/).filter((w) => w.length >= 3).slice(0, 4);
  try {
    // Try a few significant words as ORed ilike on name + aliases.
    const ors = words.flatMap((w) => [`name.ilike.*${w}*`, `search_aliases.ilike.*${w}*`]).join(",");
    const { data } = await supabaseAdmin
      .from("schools").select("slug,name")
      .or(ors || `name.ilike.*${q}*`)
      .limit(limit * 3);
    const rows = (data ?? []) as { slug: string; name: string }[];
    // Rank by how many query words appear in the name.
    const ql = q.toLowerCase();
    rows.sort((a, b) => scoreName(b.name, ql, words) - scoreName(a.name, ql, words));
    return rows.slice(0, limit).map((r) => ({ slug: r.slug, name: r.name }));
  } catch (e) {
    console.error("[data-updater] match failed:", e);
    return [];
  }
}

function scoreName(name: string, ql: string, words: string[]): number {
  const nl = name.toLowerCase();
  let s = 0;
  for (const w of words) if (nl.includes(w.toLowerCase())) s += 2;
  if (nl.includes(ql)) s += 5;
  return s;
}

/** Build the preview patch (camelCase Place fields) + DB patch (snake_case columns). */
export function buildPatches(p: Proposal): { placePatch: Record<string, unknown>; dbPatch: Record<string, unknown> } {
  const placePatch: Record<string, unknown> = {};
  const dbPatch: Record<string, unknown> = {};
  if (p.kind === "fees" && p.fees) {
    placePatch.feeDetails = p.fees;
    dbPatch.fee_details = p.fees;
    if (p.tahun) { placePatch.tahunBiaya = p.tahun; dbPatch.tahun_biaya = p.tahun; }
  } else if (p.kind === "contact" && p.contact) {
    const c = p.contact;
    for (const [k, col] of [["phone", "phone"], ["whatsapp", "whatsapp"], ["email", "email"], ["website", "website"], ["instagram", "instagram"]] as const) {
      if (c[k]) { placePatch[k] = c[k]; dbPatch[col] = c[k]; }
    }
  } else if (p.kind === "address" && p.address) {
    placePatch.address = p.address; dbPatch.address = p.address;
  } else if (p.kind === "curriculum" && p.curriculum) {
    placePatch.curriculum = p.curriculum; dbPatch.curriculum = p.curriculum;
  }
  return { placePatch, dbPatch };
}
