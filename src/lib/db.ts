import { supabase } from "./supabase";
import { places as mockPlaces, type Place } from "./mockData";

// ── Table routing ────────────────────────────────────────────────────────────
const TABLE: Record<Place["category"], string> = {
  school:            "schools",
  "learning-center": "learning_centers",
  daycare:           "daycares",
  playground:        "playgrounds",
  clinic:            "clinics",
  cafe:              "cafes",
  "mini-zoo":        "mini_zoo",
  "swimming-pool":   "swimming_pools",
  bookstore:         "bookstores",
  other:             "others",
};

const ICON: Record<Place["category"], string> = {
  school:            "🏫",
  "learning-center": "📚",
  daycare:           "🍼",
  playground:        "🎠",
  clinic:            "🏥",
  cafe:              "☕",
  "mini-zoo":        "🦁",
  "swimming-pool":   "🏊",
  bookstore:         "📖",
  other:             "⭐",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any, category: Place["category"]): Place {
  const photoColumns = ["photo_1","photo_2","photo_3","photo_4","photo_5",
                        "photo_6","photo_7","photo_8","photo_9","photo_10"];
  const photos = photoColumns
    .map((c) => row[c])
    .filter((v): v is string => !!v);

  const videoColumns = ["video_1","video_2","video_3","video_4"];
  const videos = videoColumns
    .map((c) => row[c])
    .filter((v): v is string => !!v);

  const firstPhoto = photos[0] ?? row.image_url ?? `https://picsum.photos/seed/${row.id}/800/500`;

  const base: Place = {
    id:             row.id,
    slug:           row.slug           ?? undefined,
    category,
    name:           row.name,
    area:           row.area ?? "",
    locationDetail: row.location_detail ?? undefined,
    address:        row.address    ?? undefined,
    lat:            row.latitude   ?? undefined,
    lng:            row.longitude  ?? undefined,
    rating:         row.google_rating ?? 0,
    reviews:        0,
    ageRange:       "",
    hours:          row.hours ?? "",
    description:    row.about ?? "",
    phone:          row.phone ?? "",
    whatsapp:       row.whatsapp   ?? undefined,
    email:          row.email      ?? undefined,
    priceMin:       row.price_min  ?? 0,
    priceMax:       row.price_max  ?? row.price_min ?? 0,
    isFeatured:     row.is_featured ?? false,
    icon:           ICON[category],
    logo:           row.logo_url        ?? undefined,
    facilities:     row.facilities      ?? undefined,
    extracurriculars: row.extracurriculars ?? undefined,
    feeImageUrl:    row.fee_image_url   ?? undefined,
    photo:          firstPhoto,
    photos:         photos.length > 0 ? photos : undefined,
    videos:         videos.length > 0 ? videos : undefined,
    instagram:      normalizeSocial(row.instagram, "instagram"),
    facebook:       normalizeSocial(row.facebook,  "facebook"),
    tiktok:         normalizeSocial(row.tiktok,    "tiktok"),
    website:        normalizeSocial(row.website,   "website"),
    youtube:        row.youtube ?? undefined,
    yearFounded:    row.year_founded ?? undefined,
  };

  switch (category) {
    case "school":
      return {
        ...base,
        slug:                   row.slug                ?? undefined,
        curriculum:             row.curriculum          ?? undefined,
        curriculumCategory:     row.curriculum_category ?? undefined,
        grades:                 (row.grades as import("./mockData").Grade[] | null) ?? undefined,
        uangPangkalMin:         row.uang_pangkal_min    ?? undefined,
        uangPangkalMax:         row.uang_pangkal_max    ?? undefined,
        annualFeeMin:           row.annual_fee_min      ?? undefined,
        annualFeeMax:           row.annual_fee_max      ?? undefined,
        tahunBiaya:             row.tahun_biaya         ?? undefined,
        bahasa:                 (row.kategori_bahasa as string[] | null) ?? undefined,
        teachingLanguageDisplay: row.teaching_language  ?? undefined,
        studentsPerClass:       row.students_per_class  ?? undefined,
        jadwalPendaftaran:      row.jadwal_pendaftaran  ?? undefined,
        priceMin:               row.price_min ?? 0,
        priceMax:               row.price_max ?? row.price_min ?? 0,
      };

    case "learning-center":
      return {
        ...base,
        courseTypes:          (row.course_types as string[] | null) ?? undefined,
        ageGroups:            (row.age_groups   as string[] | null) ?? undefined,
        freeTrial:            row.free_trial             ?? undefined,
        teacherStudentRatio:  row.teacher_student_ratio  ?? undefined,
        teachingLanguage:     row.teaching_language      ?? undefined,
        priceMin:             row.price_min ?? 0,
        priceMax:             row.price_max ?? row.price_min ?? 0,
      };

    case "daycare":
      return {
        ...base,
        daycareAgeGroups: (row.age_groups as string[] | null) ?? undefined,
        carerChildRatio:  row.carer_child_ratio ?? undefined,
        daycareMethod:    row.method            ?? undefined,
        hasCctv:          row.has_cctv          ?? undefined,
        hasAccreditation: row.has_accreditation ?? undefined,
        priceMin:         row.price_min ?? 0,
        priceMax:         row.price_max ?? row.price_min ?? 0,
      };

    case "playground":
      return {
        ...base,
        playgroundType: normalizePlaygroundType(row.playground_type),
        priceMin:       row.price_min ?? 0,
        priceMax:       row.price_max ?? row.price_min ?? 0,
      };

    case "clinic":
      return {
        ...base,
        clinicServices: (row.services as string[] | null) ?? undefined,
        priceMin:       row.price_min ?? 0,
        priceMax:       row.price_max ?? row.price_min ?? 0,
      };

    case "cafe":
      return {
        ...base,
        priceCategory: row.price_category ?? undefined,
        priceMin:      0,
        priceMax:      0,
      };

    case "mini-zoo":
      return {
        ...base,
        priceMin: row.price_min ?? 0,
        priceMax: row.price_max ?? row.price_min ?? 0,
      };

    case "swimming-pool":
      return {
        ...base,
        priceMin: row.price_min ?? 0,
        priceMax: row.price_max ?? row.price_min ?? 0,
      };

    default:
      return base;
  }
}

function normalizeSocial(
  v: string | null | undefined,
  platform: "instagram" | "facebook" | "tiktok" | "website",
): string | undefined {
  if (!v) return undefined;
  const s = v.trim();
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const handle = s.replace(/^@/, "");
  switch (platform) {
    case "instagram": return `https://instagram.com/${handle}`;
    case "facebook":  return `https://facebook.com/${handle}`;
    case "tiktok":    return `https://tiktok.com/@${handle}`;
    case "website":   return `https://${handle}`;
  }
}

function normalizePlaygroundType(v: string | null): "indoor" | "outdoor" | undefined {
  if (!v) return undefined;
  const l = v.toLowerCase();
  if (l.includes("indoor") && l.includes("outdoor")) return "indoor";
  if (l.includes("outdoor")) return "outdoor";
  if (l.includes("indoor"))  return "indoor";
  return undefined;
}

// ── Window-level cache (survives Turbopack HMR module re-init + router cache misses) ─
// Unlike module-level variables, window persists until a hard browser refresh.
type TKCache = {
  categories: Record<string, Place[]>;
  counts: Partial<Record<string, number>> | null;
  allPlaces: Place[] | null;
};

function wc(): TKCache {
  if (typeof window === "undefined") return { categories: {}, counts: null, allPlaces: null };
  const w = window as unknown as { __TK_CACHE__?: TKCache };
  if (!w.__TK_CACHE__) w.__TK_CACHE__ = { categories: {}, counts: null, allPlaces: null };
  return w.__TK_CACHE__!;
}

/** Synchronous read — returns [] if not yet fetched. Use as useState lazy initializer. */
export function getCachedCategory(category: Place["category"]): Place[] {
  return wc().categories[category] ?? [];
}
export function getCachedCounts(): Partial<Record<Place["category"], number>> {
  return wc().counts ?? {};
}
export function getCachedAllPlaces(): Place[] {
  return wc().allPlaces ?? [];
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function fetchPlacesByCategory(category: Place["category"]): Promise<Place[]> {
  const { data, error } = await supabase
    .from(TABLE[category])
    .select("*")
    .order("is_featured", { ascending: false })
    .order("name",        { ascending: true });
  if (error || !data) return [];
  const result = data.map((row) => mapRow(row, category));
  wc().categories[category] = result;
  return result;
}

export async function fetchPlaceById(id: string): Promise<Place | null> {
  const categories = Object.keys(TABLE) as Place["category"][];
  const results = await Promise.all(
    categories.map(async (category) => {
      const { data } = await supabase
        .from(TABLE[category])
        .select("*")
        .eq("id", id)
        .maybeSingle();
      return data ? mapRow(data, category) : null;
    }),
  );
  return results.find(Boolean) ?? mockPlaces.find(p => p.id === id) ?? null;
}

export async function fetchPlaceBySlug(slug: string): Promise<Place | null> {
  const categories = Object.keys(TABLE) as Place["category"][];
  const results = await Promise.all(
    categories.map(async (category) => {
      const { data } = await supabase
        .from(TABLE[category])
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      return data ? mapRow(data, category) : null;
    }),
  );
  return results.find(Boolean) ?? null;
}

export async function fetchAllSlugs(): Promise<{ slug: string; category: Place["category"] }[]> {
  const categories = Object.keys(TABLE) as Place["category"][];
  const results = await Promise.all(
    categories.map(async (category) => {
      const { data } = await supabase
        .from(TABLE[category])
        .select("slug")
        .not("slug", "is", null);
      return (data ?? [])
        .map((r) => ({ slug: r.slug as string, category }))
        .filter((r) => r.slug);
    }),
  );
  return results.flat();
}

export async function fetchPlacesByIds(ids: string[]): Promise<Place[]> {
  if (ids.length === 0) return [];
  const results = await Promise.all(ids.map(fetchPlaceById));
  return results.filter((p): p is Place => p !== null);
}

export async function fetchAllPlaces(): Promise<Place[]> {
  const categories = Object.keys(TABLE) as Place["category"][];
  const results = await Promise.all(categories.map(fetchPlacesByCategory));
  const flat = results.flat();
  wc().allPlaces = flat;
  return flat;
}

export async function fetchCategoryCounts(): Promise<Partial<Record<Place["category"], number>>> {
  const categories = Object.keys(TABLE) as Place["category"][];
  const entries = await Promise.all(
    categories.map(async (category) => {
      const { count } = await supabase
        .from(TABLE[category])
        .select("*", { count: "exact", head: true });
      return [category, count ?? 0] as [Place["category"], number];
    }),
  );
  const result = Object.fromEntries(entries);
  wc().counts = result;
  return result;
}

export async function fetchAreaCounts(
  category: Place["category"],
): Promise<{ bintaro: number; bsd: number; all: number }> {
  const table = TABLE[category];
  const [bintaroRes, bsdRes, allRes] = await Promise.all([
    supabase.from(table).select("*", { count: "exact", head: true })
      .or("area.eq.Bintaro,area.eq.Bintaro/BSD"),
    supabase.from(table).select("*", { count: "exact", head: true })
      .or("area.eq.BSD,area.eq.Bintaro/BSD"),
    supabase.from(table).select("*", { count: "exact", head: true }),
  ]);
  return {
    bintaro: bintaroRes.count ?? 0,
    bsd:     bsdRes.count    ?? 0,
    all:     allRes.count    ?? 0,
  };
}
