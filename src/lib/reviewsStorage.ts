import { getSupabaseBrowserClient } from "./supabase-browser";

export type UserReview = {
  placeId:       string;
  placeName:     string;
  placeIcon:     string;
  placeCategory?: string;
  name:          string;   // reviewer display name
  rating:        number;
  comment:       string;
  date:          string;   // e.g. "Apr 2026"
  isPublished?:  boolean;  // set by admin — undefined = unknown (legacy local-only)
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

/** Retrieve the review for a specific place (localStorage) */
export function getReviewForPlace(placeId: string): UserReview | undefined {
  return lsGet().find(r => r.placeId === placeId);
}

/**
 * Save a review.
 * Writes to localStorage immediately; also upserts to Supabase when userId supplied.
 */
export async function saveReview(review: UserReview, userId?: string): Promise<void> {
  // Local cache
  const existing = lsGet().filter(r => r.placeId !== review.placeId);
  lsSet([review, ...existing]);

  // Supabase persistence
  if (userId) {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.from("reviews").upsert(
        {
          user_id:        userId,
          place_id:       review.placeId,
          place_name:     review.placeName,
          place_icon:     review.placeIcon,
          place_category: review.placeCategory ?? null,
          reviewer_name:  review.name,
          rating:         review.rating,
          comment:        review.comment,
          is_published:   false,
        },
        { onConflict: "user_id,place_id" }
      );
    } catch (e) {
      console.error("[reviewsStorage] Supabase upsert failed:", e);
    }
  }
}

/**
 * Sync reviews from Supabase into localStorage on login.
 * Does not overwrite existing local reviews that aren't in Supabase yet.
 */
export async function syncReviewsFromRemote(userId: string): Promise<void> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", userId);
    if (!data?.length) return;

    const remote: UserReview[] = data.map((r: Record<string, unknown>) => ({
      placeId:       r.place_id,
      placeName:     r.place_name     ?? "",
      placeIcon:     r.place_icon     ?? "📍",
      placeCategory: r.place_category ?? undefined,
      name:          r.reviewer_name  ?? "",
      rating:        r.rating,
      comment:       r.comment        ?? "",
      date:          new Date(r.created_at as string).toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
      isPublished:   r.is_published as boolean ?? false,
    }));

    // Merge: remote wins for places where both exist
    const local = lsGet().filter(l => !remote.find(r => r.placeId === l.placeId));
    lsSet([...remote, ...local]);
  } catch {}
}
