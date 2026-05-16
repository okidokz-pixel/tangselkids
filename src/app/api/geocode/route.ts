import { NextRequest, NextResponse } from "next/server";

const KEY = process.env.GOOGLE_MAPS_API_KEY!;

/**
 * GET /api/geocode?lat=...&lng=...  → Google reverse geocode (coords → address)
 */
export async function GET(req: NextRequest) {
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
