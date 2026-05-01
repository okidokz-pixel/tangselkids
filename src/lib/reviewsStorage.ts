export type UserReview = {
  placeId:   string;
  placeName: string;
  placeIcon: string;
  name:      string;
  rating:    number;
  comment:   string;
  date:      string; // e.g. "Apr 2026"
};

const KEY = "userReviews";

export function getReviews(): UserReview[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveReview(review: UserReview): void {
  if (typeof window === "undefined") return;
  const existing = getReviews().filter((r) => r.placeId !== review.placeId);
  existing.unshift(review);
  localStorage.setItem(KEY, JSON.stringify(existing));
}

export function getReviewForPlace(placeId: string): UserReview | undefined {
  return getReviews().find((r) => r.placeId === placeId);
}
