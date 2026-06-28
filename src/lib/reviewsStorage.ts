import { getSupabaseBrowserClient } from "./supabase-browser";

export type ReviewRelationship =
  | "murid_sekarang" | "alumni" | "pernah_ikut" | "ortu_calon_murid";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type UserReview = {
  placeId:       string;
  placeName:     string;
  placeIcon:     string;
  placeCategory?: string;
  name:          string;   // reviewer first name (public display)
  rating:        number;
  relationship?: ReviewRelationship | null;
  liked:         string;   // required main field
  improve?:      string;
  suggestion?:   string;
  isAnonymous?:  boolean;
  date:          string;   // e.g. "Apr 2026"
  status?:       ReviewStatus;
};

const LS_KEY = "userReviews";

// ── localStorage helpers ──────────────────────────────────────────────────────

function lsGet(): UserReview[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}

function lsSet(reviews: UserReview[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(reviews));
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Retrieve all saved reviews (localStorage, instant) */
export function getReviews(): UserReview[] {
  return lsGet();
}

/** Retrieve the current user's own review for a place (localStorage cache) */
export function getReviewForPlace(placeId: string): UserReview | undefined {
  return lsGet().find(r => r.placeId === placeId);
}

/**
 * Insert a structured review as `pending`. Uses the LIVE authenticated session
 * (so the insert satisfies the RLS `user_id = auth.uid()` check even after a
 * token refresh), and only caches to localStorage AFTER a confirmed DB write —
 * so a failed submit never leaves a phantom "already reviewed" state.
 */
export async function saveReview(review: UserReview): Promise<{ error?: string }> {
  try {
    const supabase = getSupabaseBrowserClient();
    // Require a LIVE session — the RLS insert check is user_id = auth.uid(), so a
    // stale cached login (valid-looking UI but no real session) must NOT attempt
    // the insert with a context id, or it fails RLS with a confusing message.
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return { error: "Sesi kamu sudah berakhir. Refresh halaman & login lagi, lalu kirim ulang reviewnya." };
    }

    const { error } = await supabase.from("reviews").insert({
      user_id:               user.id,
      place_id:              review.placeId,
      place_name:            review.placeName,
      place_icon:            review.placeIcon,
      place_category:        review.placeCategory ?? null,
      reviewer_name:         review.name,
      rating:                review.rating,
      reviewer_relationship: review.relationship ?? null,
      liked:                 review.liked,
      improve:               review.improve?.trim() || null,
      suggestion:            review.suggestion?.trim() || null,
      is_anonymous:          review.isAnonymous ?? false,
      status:                "pending",
    });
    if (error) {
      console.error("[saveReview] insert failed:", error);
      return { error: error.message };
    }

    // Cache only after the DB confirms the insert.
    const existing = lsGet().filter(r => r.placeId !== review.placeId);
    lsSet([{ ...review, status: "pending" }, ...existing]);
    return {};
  } catch (e) {
    console.error("[saveReview] unexpected:", e);
    return { error: e instanceof Error ? e.message : "Gagal mengirim review." };
  }
}

/** Map a Supabase reviews row → UserReview. */
function mapRow(r: Record<string, unknown>): UserReview {
  return {
    placeId:       r.place_id as string,
    placeName:     (r.place_name as string)     ?? "",
    placeIcon:     (r.place_icon as string)     ?? "📍",
    placeCategory: (r.place_category as string) ?? undefined,
    name:          (r.reviewer_name as string)  ?? "",
    rating:        r.rating as number,
    relationship:  (r.reviewer_relationship as ReviewRelationship) ?? null,
    liked:         (r.liked as string)      ?? "",
    improve:       (r.improve as string)    ?? undefined,
    suggestion:    (r.suggestion as string) ?? undefined,
    isAnonymous:   (r.is_anonymous as boolean) ?? false,
    date:          new Date(r.created_at as string).toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
    status:        (r.status as ReviewStatus) ?? "pending",
  };
}

/**
 * Fetch the signed-in user's own review for a place straight from the DB
 * (authoritative — RLS lets users read their own rows regardless of status).
 * Returns null for guests or when no review exists. This is the source of
 * truth for "have I already reviewed", NOT localStorage.
 */
export async function fetchMyReviewForPlace(placeId: string): Promise<UserReview | null> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", user.id)
      .eq("place_id", placeId)
      .maybeSingle();
    return data ? mapRow(data) : null;
  } catch {
    return null;
  }
}

/**
 * Sync the current user's own reviews from Supabase into localStorage on login,
 * so their pending/approved status is reflected on place pages.
 */
export async function syncReviewsFromRemote(userId: string): Promise<void> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", userId);
    if (!data?.length) return;

    const remote: UserReview[] = data.map(mapRow);

    // Merge: remote wins for places where both exist
    const local = lsGet().filter(l => !remote.find(r => r.placeId === l.placeId));
    lsSet([...remote, ...local]);
  } catch {}
}

/** Human label for a relationship value (public badge + admin). */
export function relationshipLabel(rel?: ReviewRelationship | null): string | null {
  switch (rel) {
    case "murid_sekarang":  return "Murid sekarang";
    case "alumni":          return "Alumni";
    case "pernah_ikut":     return "Pernah ikut kelas";
    case "ortu_calon_murid": return "Ortu calon murid";
    default: return null;
  }
}
