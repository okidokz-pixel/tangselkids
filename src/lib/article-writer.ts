import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "./supabase-admin";
import { getSearchConsole } from "./gsc-data";

/**
 * Article Writer — picks a fresh, search-relevant topic and drafts an Indonesian
 * article grounded in the real listings + real Google search demand. Produces a
 * Tiptap-JSON body, links real listings, and reuses a listing photo as the cover.
 * Saves as an UNPUBLISHED draft for the owner to approve.
 */

const MODEL = "claude-sonnet-4-6";

type Block = { type: "h2" | "p" | "ul"; text?: string; items?: string[] };
type Draft = { title: string; excerpt: string; category: string; blocks: Block[]; featured: string[] };

function slugify(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 70);
}

function toTiptap(blocks: Block[], extra: TNode[]): TNode {
  const content: TNode[] = [];
  for (const b of blocks) {
    if (b.type === "h2") content.push({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: b.text ?? "" }] });
    else if (b.type === "p") content.push({ type: "paragraph", content: [{ type: "text", text: b.text ?? "" }] });
    else if (b.type === "ul") content.push({ type: "bulletList", content: (b.items ?? []).map((it) => ({ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: it }] }] })) });
  }
  content.push(...extra);
  return { type: "doc", content };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TNode = Record<string, any>;

async function gather() {
  const [gsc, schoolsRes, artsRes] = await Promise.all([
    getSearchConsole().catch(() => null),
    supabaseAdmin.from("schools").select("name,slug,area,jenjang,curriculum").limit(60),
    supabaseAdmin.from("articles").select("title").order("created_at", { ascending: false }).limit(40),
  ]);
  const queries = (gsc?.queries ?? []).slice(0, 25).map((q) => q.query);
  const schools = (schoolsRes.data ?? []) as { name: string; slug: string; area: string; jenjang: string; curriculum: string }[];
  const titles = (artsRes.data ?? []).map((a) => a.title as string);
  return { queries, schools, titles };
}

export async function generateDraft(): Promise<{ id: string; slug: string; title: string } | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const { queries, schools, titles } = await gather();
  const client = new Anthropic();

  const schoolList = schools.map((s) => `${s.name} [${s.slug}] (${s.area}, ${s.jenjang}, ${s.curriculum || "-"})`).join("\n");
  const prompt = `Kamu penulis konten untuk TangselKids — direktori sekolah & tempat anak di Tangerang Selatan (Bintaro, BSD, Ciputat, dll).

Tulis SATU artikel baru berbahasa Indonesia, ramah untuk orang tua, 600–900 kata, yang menargetkan permintaan pencarian nyata dan mengacu ke listing nyata di bawah.

Pencarian Google teratas (pakai sebagai inspirasi topik): ${queries.join(", ") || "(tidak tersedia)"}

Judul artikel yang SUDAH ADA (JANGAN mengulang topik ini): ${titles.join(" | ") || "(belum ada)"}

Listing nyata yang bisa kamu sebut/rekomendasikan (gunakan slug persis untuk "featured"):
${schoolList}

Balas HANYA JSON:
{"title":"...","excerpt":"ringkasan 1 kalimat","category":"Sekolah|Pendidikan|Parenting|Tips Orang Tua|Aktivitas|Tumbuh Kembang","blocks":[{"type":"h2|p|ul","text":"...","items":["..."]}],"featured":["slug1","slug2","slug3"]}
- Pilih topik yang belum ada di daftar judul.
- 5–9 blocks, campur h2 dan p, boleh satu ul.
- "featured": 3–5 slug sekolah RELEVAN dari daftar di atas (persis).
- Jangan mengarang fakta/angka spesifik yang tidak kamu ketahui; bicara umum & arahkan pembaca ke listing.`;

  let draft: Draft;
  try {
    const msg = await client.messages.create({ model: MODEL, max_tokens: 3000, messages: [{ role: "user", content: prompt }] });
    const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    draft = JSON.parse(m[0]);
  } catch (e) { console.error("[article] generation failed:", e); return null; }

  if (!draft.title || !Array.isArray(draft.blocks)) return null;

  // Featured listings → "Lihat juga" links + pick a cover image from the first with photos.
  const featuredSlugs = (draft.featured ?? []).filter((s) => schools.some((x) => x.slug === s)).slice(0, 5);
  let cover: string | null = null;
  const linkItems: TNode[] = [];
  if (featuredSlugs.length) {
    const { data: feat } = await supabaseAdmin.from("schools")
      .select("name,slug,photo_1,photo_2").in("slug", featuredSlugs);
    const rows = (feat ?? []) as { name: string; slug: string; photo_1?: string; photo_2?: string }[];
    for (const r of rows) { if (!cover && (r.photo_1 || r.photo_2)) cover = r.photo_1 || r.photo_2 || null; }
    if (rows.length) {
      linkItems.push({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Lihat Juga" }] });
      linkItems.push({ type: "bulletList", content: rows.map((r) => ({
        type: "listItem", content: [{ type: "paragraph", content: [
          { type: "text", text: r.name, marks: [{ type: "link", attrs: { href: `https://tangselkids.com/place/${r.slug}` } }] },
        ] }],
      })) });
    }
  }

  const body = toTiptap(draft.blocks, linkItems);
  let slug = slugify(draft.title);
  // ensure unique slug
  const { data: exists } = await supabaseAdmin.from("articles").select("id").eq("slug", slug).maybeSingle();
  if (exists) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const { data: inserted, error } = await supabaseAdmin.from("articles").insert({
    title: draft.title,
    slug,
    excerpt: draft.excerpt ?? null,
    body,
    cover_image_url: cover,
    is_published: false,
  }).select("id,slug,title").single();

  if (error) { console.error("[article] insert failed:", error.message); return null; }
  return { id: inserted.id as string, slug: inserted.slug as string, title: inserted.title as string };
}
