/* eslint-disable @typescript-eslint/no-explicit-any */
// Maps an approved place_submission into the `initial` shape the category admin
// forms expect, so "Create Listing" opens pre-filled. category_data already
// mirrors most listing columns; only a few keys need remapping per category.

type AnyRec = Record<string, any>;

const csv = (v: any) => (Array.isArray(v) ? v.join(", ") : (v ?? ""));

export function submissionToListingInitial(s: AnyRec, category: string): AnyRec {
  const cd: AnyRec = s.category_data ?? {};

  const out: AnyRec = {
    // Top-level submission fields → listing columns.
    name:       s.name ?? "",
    area:       s.area ?? "",
    address:    s.address ?? "",
    hours:      s.hours ?? "",
    year_founded: s.year_founded ?? "",
    phone:      s.phone ?? "",
    whatsapp:   s.whatsapp ?? "",
    website:    s.website ?? "",
    instagram:  s.instagram ?? "",
    facebook:   s.facebook ?? "",
    tiktok:     s.tiktok ?? "",
    youtube:    s.youtube ?? "",
    logo_url:   s.logo_url ?? "",
    about:      s.description ?? "", // submission "description" → listing "about"
  };

  // category_data largely mirrors listing columns (slug, location_detail, email,
  // curriculum, fees, fee_image_url, etc.) — merge it in directly.
  Object.assign(out, cd);

  // Media columns.
  (s.photos ?? []).slice(0, 10).forEach((p: string, i: number) => { out[`photo_${i + 1}`] = p; });
  (s.yt_videos ?? []).slice(0, 4).forEach((v: string, i: number) => { out[`video_${i + 1}`] = v; });

  // ── Category-specific remaps (submission key → form/listing key) ──
  if (category === "school") {
    // SchoolForm reads facilities/extracurriculars as comma strings, bahasa as
    // `kategori_bahasa`, and monthly SPP as price_min/max.
    out.facilities = csv(cd.facilities);
    out.extracurriculars = csv(cd.extracurriculars);
    if (cd.bahasa) out.kategori_bahasa = Array.isArray(cd.bahasa) ? cd.bahasa : [];
    if (cd.spp_min != null) out.price_min = cd.spp_min;
    if (cd.spp_max != null) out.price_max = cd.spp_max;
  }

  return out;
}
