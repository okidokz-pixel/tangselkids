import { NextRequest, NextResponse } from "next/server";

const KEY = process.env.GOOGLE_MAPS_API_KEY!;

/**
 * GET /api/places?q=...          → Google Places Autocomplete predictions
 * GET /api/places?place_id=...   → Google Place Details (returns lat/lng + address)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q       = searchParams.get("q");
  const placeId = searchParams.get("place_id");

  if (placeId) {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${encodeURIComponent(placeId)}` +
      `&fields=geometry,formatted_address` +
      `&language=id` +
      `&key=${KEY}`,
      { next: { revalidate: 0 } }
    );
    const data = await res.json();
    return NextResponse.json(data);
  }

  if (q) {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
      `?input=${encodeURIComponent(q)}` +
      `&components=country:id` +
      `&language=id` +
      `&key=${KEY}`,
      { next: { revalidate: 0 } }
    );
    const data = await res.json();
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Missing q or place_id" }, { status: 400 });
}
