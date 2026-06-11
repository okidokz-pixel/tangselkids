import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

const KEY = process.env.GOOGLE_MAPS_API_KEY!;

/**
 * GET /api/geocode?lat=...&lng=...  → Google reverse geocode (coords → address)
 */
export async function GET(req: NextRequest) {
  // Max 60/min per IP — generous for real map-pin dragging, but caps a script
  // hammering the paid Google Maps API on our key.
  const limited = rateLimit(req, { limit: 60, windowMs: 60_000, key: "geocode" });
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
  }

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json` +
    `?latlng=${lat},${lng}` +
    `&language=id` +
    `&key=${KEY}`,
    { next: { revalidate: 0 } }
  );
  const data = await res.json();
  return NextResponse.json(data);
}
