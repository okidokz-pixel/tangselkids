/**
 * Objective place data fetched from Google Places (New) to help an admin fill the
 * gaps in a user submission before turning it into a live listing. Shared between
 * the server action that fetches it and the admin UI that displays it.
 */
export type GoogleEnrichment = {
  placeId: string;
  name: string;
  formattedAddress: string | null;
  rating: number | null;
  userRatingCount: number | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  website: string | null;
  /** Opening hours, one line per day (joined with "\n"). */
  hours: string | null;
  googleMapsUri: string | null;
};

export type EnrichmentResult =
  | { ok: true; data: GoogleEnrichment }
  | { ok: false; error: string };
