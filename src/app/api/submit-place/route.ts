import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  // Max 6 submissions per minute per IP — stops spam flooding the admin inbox.
  const limited = rateLimit(request, { limit: 6, windowMs: 60_000, key: "submit-place" });
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, category, area } = body;
  if (!name || !category || !area) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const payload = {
    name:          String(name).trim(),
    category:      String(category),
    area:          String(area),
    address:       body.address       ? String(body.address)       : null,
    phone:         body.phone         ? String(body.phone)         : null,
    whatsapp:      body.whatsapp      ? String(body.whatsapp)      : null,
    description:   body.description   ? String(body.description)   : null,
    gmaps_url:     body.gmaps_url     ? String(body.gmaps_url)     : null,
    hours:         body.hours         ? String(body.hours)         : null,
    year_founded:  body.year_founded  ? Number(body.year_founded)  : null,
    instagram:     body.instagram     ? String(body.instagram)     : null,
    facebook:      body.facebook      ? String(body.facebook)      : null,
    tiktok:        body.tiktok        ? String(body.tiktok)        : null,
    youtube:       body.youtube       ? String(body.youtube)       : null,
    website:       body.website       ? String(body.website)       : null,
    logo_url:        body.logo_url        ? String(body.logo_url)        : null,
    photos:          Array.isArray(body.photos)    ? body.photos    : [],
    yt_videos:       Array.isArray(body.yt_videos) ? body.yt_videos : [],
    category_data:   body.category_data ?? null,
    submitter_name:  body.submitter_name  ? String(body.submitter_name)  : null,
    submitter_phone: body.submitter_phone ? String(body.submitter_phone) : null,
    status:          "pending",
  };

  const { error } = await supabaseAdmin.from("place_submissions").insert(payload);

  if (error) {
    console.error("place_submissions insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
