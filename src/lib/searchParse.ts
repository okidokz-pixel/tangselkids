import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Natural-language → structured school filters, for the homepage smart search.
 * Turns queries like "TK di Pamulang dengan SPP di bawah 1 juta" into filters the
 * /schools page already understands (grade, area, location, price ceilings, etc.).
 *
 * Server-only. Reads ANTHROPIC_API_KEY (the same Console key the admin translate
 * feature uses). Uses Haiku — cheap + fast, ideal for this extraction task.
 * Only runs on explicit submit (never per-keystroke), so cost stays negligible.
 */
const MODEL = "claude-haiku-4-5";

export type Category =
  | "school" | "learning-center" | "daycare" | "playground" | "clinic"
  | "cafe" | "mini-zoo" | "swimming-pool" | "bookstore";

export type SearchIntent = {
  category: Category | null;           // which listing the parent wants
  jenjang: string | null;              // Preschool | TK | SD | SMP | SMA | SMK (schools only)
  area: "bintaro" | "bsd" | "tangerang" | null; // broad area group only
  location: string | null;             // specific kecamatan/neighborhood (e.g. "Pamulang")
  sppMax: number | null;               // monthly fee ceiling, rupiah (schools only)
  sppMin: number | null;               // monthly fee floor, rupiah (schools only)
  uangPangkalMax: number | null;       // enrollment fee ceiling, rupiah (schools only)
  curriculum: string[];                // e.g. ["Cambridge","IB","Play-Based"] (schools only)
  bahasa: string[];                    // e.g. ["Inggris"] (schools only)
  playgroundType: "indoor" | "outdoor" | null; // playground only
  free: boolean;                       // "gratis" — playground only (for now)
  keywords: string | null;             // leftover free text (e.g. a place name)
};

// Category → its listing page path.
const CATEGORY_PATH: Record<Category, string> = {
  school: "/schools",
  "learning-center": "/learning-centers",
  daycare: "/daycare",
  playground: "/playgrounds",
  clinic: "/clinics",
  cafe: "/cafes",
  "mini-zoo": "/mini-zoo",
  "swimming-pool": "/swimming-pools",
  bookstore: "/bookstores",
};

export function hasAnthropicKey(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

function stripFences(s: string): string {
  return s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

const SYSTEM = `You extract structured school-search filters from an Indonesian (or mixed ID/EN) sentence typed by a parent on TangselKids, a children's directory for the Greater Tangerang area (Tangerang Selatan + Kota Tangerang), Indonesia.

Return ONLY a JSON object with these exact keys (no markdown, no commentary):
{
  "category": one of "school" | "learning-center" | "daycare" | "playground" | "clinic" | "cafe" | "mini-zoo" | "swimming-pool" | "bookstore", or null,
  "jenjang": one of "Preschool" | "TK" | "SD" | "SMP" | "SMA" | "SMK", or null,
  "area": one of "bintaro" | "bsd" | "tangerang", or null,
  "location": a specific neighborhood/kecamatan string (e.g. "Pamulang", "Serpong", "Cipondoh"), or null,
  "sppMax": monthly tuition (SPP) ceiling in rupiah as a number, or null,
  "sppMin": monthly tuition floor in rupiah as a number, or null,
  "uangPangkalMax": enrollment-fee (uang pangkal) ceiling in rupiah as a number, or null,
  "curriculum": array of curriculum/pedagogy keywords mentioned (schools only), else [],
  "bahasa": array of any of ["Indonesia","Inggris","Arab","Mandarin","Jerman","Jepang"] mentioned, else [],
  "playgroundType": "indoor" | "outdoor" (playground only), or null,
  "free": true if the parent wants free/"gratis" places (mainly playgrounds), else false,
  "keywords": leftover meaningful text such as a place name, else null
}

Rules:
- CATEGORY: infer which listing the parent wants:
  - "school": mentions "sekolah", a jenjang (TK/SD/SMP/SMA/SMK/preschool/playgroup), or a school curriculum (Cambridge/IB/nasional/montessori).
  - "learning-center": "kursus", "les", "bimbel", "bimbingan belajar", "tempat belajar", "english course", "math"/"coding"/"musik"/"seni" class, "sanggar".
  - "daycare": "daycare", "penitipan anak", "tempat penitipan", "TPA", "childcare".
  - "playground": "playground", "tempat main", "taman bermain", "playpark", "arena bermain".
  - "clinic": "klinik", "dokter anak", "pediatri", "tumbuh kembang", "terapi anak", "imunisasi", "vaksin".
  - "cafe": "kafe", "cafe", "restoran/tempat makan ramah anak".
  - "mini-zoo": "kebun binatang", "mini zoo", "petting zoo", "kontak hewan".
  - "swimming-pool": "kolam renang", "berenang", "swimming", "les renang".
  - "bookstore": "toko buku", "bookstore", "toko alat tulis".
  If none is clear but a jenjang/curriculum/SPP is present, use "school". Otherwise null.
- The school-only fields (jenjang, sppMax, sppMin, uangPangkalMax, curriculum, bahasa) apply ONLY when category is "school" — leave them null/[] for other categories.
- jenjang synonyms: "playgroup"/"KB"/"paud" -> "Preschool"; "SMA"/"SMU" -> "SMA"; "SMK"/"vokasi" -> "SMK". Only set jenjang if a school LEVEL is named.
- Money: "juta"/"jt" = 1000000, "ribu"/"rb"/"k" = 1000. "di bawah"/"kurang dari"/"maksimal"/"under" -> a max. "di atas"/"minimal"/"lebih dari" -> a min. "gratis" -> sppMax 0. "SPP"/"per bulan"/"bulanan" = monthly (sppMax/sppMin). "uang pangkal"/"uang masuk"/"pangkal" = uangPangkalMax.
- AREA vs LOCATION: If the parent names a BROAD area — "Bintaro", "BSD", or "Tangerang" — set "area" (bintaro/bsd/tangerang) and leave "location" null. If they name a SPECIFIC neighborhood/kecamatan (Pamulang, Serpong, Ciputat, Cipondoh, Karawaci, Ciledug, Alam Sutera, etc.), set "location" to that name and leave "area" null.
- Do not invent values not implied by the text. Use null / [] when unsure.
- "curriculum": include ANY curriculum, pedagogy, or teaching-method keyword the parent mentions. Use these canonical short forms for the well-known ones: "cambridge" -> "Cambridge"; "ib"/"international baccalaureate" -> "IB"; "islam"/"islami"/"agama islam" -> "Islam"; "kristen"/"katolik"/"christian"/"katholik" -> "Kristen"; "nasional"/"kurikulum merdeka"/"kurikulum nasional" -> "Nasional"; "montessori" -> "Montessori". For other methods, emit the phrase as written (e.g. "play-based"/"play based" -> "Play-Based"; "reggio" -> "Reggio"; "waldorf" -> "Waldorf"; "bilingual" -> "Bilingual"; "steam" -> "STEAM"). Do NOT map a bare "internasional" to any specific curriculum (ambiguous) — leave curriculum empty unless a named framework/method is given.
- "playgroundType": for playground queries, "indoor" or "outdoor" if the parent says so, else null. "free": true if they ask for gratis/free.

Examples:
"TK di pamulang dengan SPP di bawah 1 juta" -> {"category":"school","jenjang":"TK","area":null,"location":"Pamulang","sppMax":1000000,"sppMin":null,"uangPangkalMax":null,"curriculum":[],"bahasa":[],"keywords":null}
"SD kurikulum IB di BSD" -> {"category":"school","jenjang":"SD","area":"bsd","location":null,"sppMax":null,"sppMin":null,"uangPangkalMax":null,"curriculum":["IB"],"bahasa":[],"keywords":null}
"daycare di serpong" -> {"category":"daycare","jenjang":null,"area":null,"location":"Serpong","sppMax":null,"sppMin":null,"uangPangkalMax":null,"curriculum":[],"bahasa":[],"keywords":null}
"les bahasa inggris di bintaro" -> {"category":"learning-center","jenjang":null,"area":"bintaro","location":null,"sppMax":null,"sppMin":null,"uangPangkalMax":null,"curriculum":[],"bahasa":[],"keywords":null}
"klinik tumbuh kembang anak di BSD" -> {"category":"clinic","jenjang":null,"area":"bsd","location":null,"sppMax":null,"sppMin":null,"uangPangkalMax":null,"curriculum":[],"bahasa":[],"keywords":null}
"playground di tangerang" -> {"category":"playground","jenjang":null,"area":"tangerang","location":null,"sppMax":null,"sppMin":null,"uangPangkalMax":null,"curriculum":[],"bahasa":[],"keywords":null}`;

/** Parse a free-text query into structured school filters. */
export async function parseSearchQuery(query: string): Promise<SearchIntent> {
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: SYSTEM,
    messages: [{ role: "user", content: query.slice(0, 400) }],
  });

  const raw = stripFences(textOf(message));
  let p: Record<string, unknown>;
  try {
    p = JSON.parse(raw);
  } catch {
    return emptyIntent();
  }

  const CATEGORIES = Object.keys(CATEGORY_PATH);
  const JENJANG = ["Preschool", "TK", "SD", "SMP", "SMA", "SMK"];
  const AREA = ["bintaro", "bsd", "tangerang"];
  const BAHASA = ["Indonesia", "Inggris", "Arab", "Mandarin", "Jerman", "Jepang"];

  const num = (v: unknown): number | null =>
    typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : null;
  const oneOf = (v: unknown, list: string[]): string | null =>
    typeof v === "string" && list.includes(v) ? v : null;
  const arrOf = (v: unknown, list: string[]): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && list.includes(x)) : [];
  // Free-form string list (curriculum) — accept any short keyword the model emits.
  const strArr = (v: unknown): string[] =>
    Array.isArray(v)
      ? v.filter((x): x is string => typeof x === "string" && !!x.trim() && x.length <= 40)
         .map((x) => x.trim()).slice(0, 6)
      : [];

  return {
    category: oneOf(p.category, CATEGORIES) as Category | null,
    jenjang: oneOf(p.jenjang, JENJANG),
    area: oneOf(p.area, AREA) as SearchIntent["area"],
    location: typeof p.location === "string" && p.location.trim() ? p.location.trim() : null,
    sppMax: num(p.sppMax),
    sppMin: num(p.sppMin),
    uangPangkalMax: num(p.uangPangkalMax),
    curriculum: strArr(p.curriculum),
    bahasa: arrOf(p.bahasa, BAHASA),
    playgroundType: oneOf(p.playgroundType, ["indoor", "outdoor"]) as SearchIntent["playgroundType"],
    free: p.free === true,
    keywords: typeof p.keywords === "string" && p.keywords.trim() ? p.keywords.trim() : null,
  };
}

function emptyIntent(): SearchIntent {
  return {
    category: null, jenjang: null, area: null, location: null, sppMax: null, sppMin: null,
    uangPangkalMax: null, curriculum: [], bahasa: [], playgroundType: null, free: false, keywords: null,
  };
}

function hasSchoolSignal(i: SearchIntent): boolean {
  return !!(i.jenjang || i.sppMax != null || i.sppMin != null ||
    i.uangPangkalMax != null || i.curriculum.length || i.bahasa.length);
}

/** Build a /schools URL that pre-applies the parsed filters. */
function buildSchoolsUrl(i: SearchIntent): string {
  const p = new URLSearchParams();
  if (i.jenjang) p.set("grade", i.jenjang);
  if (i.area) p.set("area", i.area);
  if (i.location) p.set("loc", i.location);
  if (i.sppMax != null) p.set("sppMax", String(i.sppMax));
  if (i.sppMin != null) p.set("sppMin", String(i.sppMin));
  if (i.uangPangkalMax != null) p.set("upMax", String(i.uangPangkalMax));
  if (i.curriculum.length) p.set("cur", i.curriculum.join(","));
  if (i.bahasa.length) p.set("bhs", i.bahasa.join(","));
  p.set("view", "results");
  return `/schools?${p.toString()}`;
}

/** Build a non-school category listing URL (area + location + a few per-category filters). */
function buildCategoryUrl(category: Category, i: SearchIntent): string {
  const p = new URLSearchParams();
  if (i.area) p.set("area", i.area);
  if (i.location) p.set("loc", i.location);
  if (category === "playground") {
    if (i.playgroundType) p.set("type", i.playgroundType);
    if (i.free) p.set("price", "gratis");
  }
  p.set("view", "results");
  return `${CATEGORY_PATH[category]}?${p.toString()}`;
}

/**
 * Resolve the parsed intent to a results URL, or null when it isn't a routable
 * structured query (e.g. a bare place name → keep the plain search/dropdown).
 */
export function buildResultsUrl(i: SearchIntent): string | null {
  // A leftover proper name (e.g. "Cikal", "Ora et Labora") means the parent is
  // looking for one specific place — let the plain keyword dropdown handle it,
  // rather than dumping them onto a filtered category list.
  if (i.keywords) return null;
  if (i.category === "school" || (!i.category && hasSchoolSignal(i))) return buildSchoolsUrl(i);
  if (i.category) return buildCategoryUrl(i.category, i);
  return null;
}
