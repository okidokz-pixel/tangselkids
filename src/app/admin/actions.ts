"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { createAdminServerClient } from "@/lib/supabase-server";
import { isAdminEmail } from "@/lib/adminEmails";
import type { EnrichmentResult, GoogleEnrichment } from "@/lib/enrichment";
import { hasAnthropicKey, improveDescription, translateFields } from "@/lib/ai";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function assertAdmin() {
  const supabase = await createAdminServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  // Being logged-in is NOT enough — public users share this auth pool.
  // The email must be on the ADMIN_EMAILS allowlist.
  if (!user || !isAdminEmail(user.email)) throw new Error("Unauthorized");
  return user;
}

// ── Schools ──────────────────────────────────────────────────────────────────

export async function getSchools() {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("schools")
    .select("id,name,slug,area,jenjang,is_featured,logo_url,photo_1")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getSchool(id: string) {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("schools")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function saveSchool(id: string | null, payload: Record<string, unknown>) {
  await assertAdmin();

  if (id) {
    const { error } = await supabaseAdmin
      .from("schools")
      .update(payload)
      .eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabaseAdmin
      .from("schools")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    revalidatePath("/schools");
    revalidatePath("/admin/schools");
    redirect(`/admin/schools/${data.id}`);
  }

  revalidatePath("/schools");
  revalidatePath(`/place/${payload.slug}`);
  revalidatePath("/admin/schools");
}

export async function deleteSchool(id: string) {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("schools").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/schools");
  revalidatePath("/admin/schools");
  redirect("/admin/schools");
}

export async function toggleSchoolFeatured(id: string, value: boolean) {
  await assertAdmin();
  const { error } = await supabaseAdmin
    .from("schools")
    .update({ is_featured: value })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/schools");
  revalidatePath("/schools");
}

// ── Learning Centers ──────────────────────────────────────────────────────────

export async function getLearningCenters() {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("learning_centers")
    .select("id,name,slug,area,course_types,is_featured,logo_url,photo_1")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getLearningCenter(id: string) {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("learning_centers")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function saveLearningCenter(id: string | null, payload: Record<string, unknown>) {
  await assertAdmin();

  if (id) {
    const { error } = await supabaseAdmin
      .from("learning_centers")
      .update(payload)
      .eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabaseAdmin
      .from("learning_centers")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    revalidatePath("/learning-centers");
    revalidatePath("/admin/learning-centers");
    redirect(`/admin/learning-centers/${data.id}`);
  }

  revalidatePath("/learning-centers");
  revalidatePath(`/place/${payload.slug}`);
  revalidatePath("/admin/learning-centers");
}

export async function deleteLearningCenter(id: string) {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("learning_centers").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/learning-centers");
  revalidatePath("/admin/learning-centers");
  redirect("/admin/learning-centers");
}

export async function toggleLearningCenterFeatured(id: string, value: boolean) {
  await assertAdmin();
  const { error } = await supabaseAdmin
    .from("learning_centers")
    .update({ is_featured: value })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/learning-centers");
  revalidatePath("/learning-centers");
}

// ── Daycares ─────────────────────────────────────────────────────────────────

export async function getDaycares() {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("daycares")
    .select("id,name,slug,area,is_featured,logo_url,photo_1")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getDaycare(id: string) {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("daycares")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function saveDaycare(id: string | null, payload: Record<string, unknown>) {
  await assertAdmin();

  if (id) {
    const { error } = await supabaseAdmin.from("daycares").update(payload).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabaseAdmin.from("daycares").insert(payload).select("id").single();
    if (error) throw error;
    revalidatePath("/daycare");
    revalidatePath("/admin/daycares");
    redirect(`/admin/daycares/${data.id}`);
  }

  revalidatePath("/daycare");
  revalidatePath(`/place/${payload.slug}`);
  revalidatePath("/admin/daycares");
}

export async function deleteDaycare(id: string) {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("daycares").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/daycare");
  revalidatePath("/admin/daycares");
  redirect("/admin/daycares");
}

export async function toggleDaycareFeatured(id: string, value: boolean) {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("daycares").update({ is_featured: value }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/daycares");
  revalidatePath("/daycare");
}

// ── Playgrounds ───────────────────────────────────────────────────────────────

export async function getPlaygrounds() {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("playgrounds")
    .select("id,name,slug,area,playground_type,playground_type_raw,is_featured,logo_url,photo_1")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getPlayground(id: string) {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("playgrounds")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function savePlayground(id: string | null, payload: Record<string, unknown>) {
  await assertAdmin();

  if (id) {
    const { error } = await supabaseAdmin.from("playgrounds").update(payload).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabaseAdmin.from("playgrounds").insert(payload).select("id").single();
    if (error) throw error;
    revalidatePath("/playgrounds");
    revalidatePath("/admin/playgrounds");
    redirect(`/admin/playgrounds/${data.id}`);
  }

  revalidatePath("/playgrounds");
  revalidatePath(`/place/${payload.slug}`);
  revalidatePath("/admin/playgrounds");
}

export async function deletePlayground(id: string) {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("playgrounds").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/playgrounds");
  revalidatePath("/admin/playgrounds");
  redirect("/admin/playgrounds");
}

export async function togglePlaygroundFeatured(id: string, value: boolean) {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("playgrounds").update({ is_featured: value }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/playgrounds");
  revalidatePath("/playgrounds");
}

// ── Clinics ───────────────────────────────────────────────────────────────────

export async function getClinics() {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("clinics")
    .select("id,name,slug,area,is_featured,logo_url,photo_1")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getClinic(id: string) {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("clinics")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function saveClinic(id: string | null, payload: Record<string, unknown>) {
  await assertAdmin();

  if (id) {
    const { error } = await supabaseAdmin.from("clinics").update(payload).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabaseAdmin.from("clinics").insert(payload).select("id").single();
    if (error) throw error;
    revalidatePath("/clinics");
    revalidatePath("/admin/clinics");
    redirect(`/admin/clinics/${data.id}`);
  }

  revalidatePath("/clinics");
  revalidatePath(`/place/${payload.slug}`);
  revalidatePath("/admin/clinics");
}

export async function deleteClinic(id: string) {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("clinics").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/clinics");
  revalidatePath("/admin/clinics");
  redirect("/admin/clinics");
}

export async function toggleClinicFeatured(id: string, value: boolean) {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("clinics").update({ is_featured: value }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/clinics");
  revalidatePath("/clinics");
}

// ── Cafes ─────────────────────────────────────────────────────────────────────

export async function getCafes() {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("cafes")
    .select("id,name,slug,area,is_featured,logo_url,photo_1")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getCafe(id: string) {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("cafes")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function saveCafe(id: string | null, payload: Record<string, unknown>) {
  await assertAdmin();

  if (id) {
    const { error } = await supabaseAdmin.from("cafes").update(payload).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabaseAdmin.from("cafes").insert(payload).select("id").single();
    if (error) throw error;
    revalidatePath("/cafes");
    revalidatePath("/admin/cafes");
    redirect(`/admin/cafes/${data.id}`);
  }

  revalidatePath("/cafes");
  revalidatePath(`/place/${payload.slug}`);
  revalidatePath("/admin/cafes");
}

export async function deleteCafe(id: string) {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("cafes").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/cafes");
  revalidatePath("/admin/cafes");
  redirect("/admin/cafes");
}

export async function toggleCafeFeatured(id: string, value: boolean) {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("cafes").update({ is_featured: value }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/cafes");
  revalidatePath("/cafes");
}

// ── Mini Zoo ──────────────────────────────────────────────────────────────────

export async function getMiniZoos() {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("mini_zoo")
    .select("id,name,slug,area,is_featured,logo_url,photo_1")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getMiniZoo(id: string) {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("mini_zoo")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function saveMiniZoo(id: string | null, payload: Record<string, unknown>) {
  await assertAdmin();

  if (id) {
    const { error } = await supabaseAdmin.from("mini_zoo").update(payload).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabaseAdmin.from("mini_zoo").insert(payload).select("id").single();
    if (error) throw error;
    revalidatePath("/mini-zoo");
    revalidatePath("/admin/mini-zoo");
    redirect(`/admin/mini-zoo/${data.id}`);
  }

  revalidatePath("/mini-zoo");
  revalidatePath(`/place/${payload.slug}`);
  revalidatePath("/admin/mini-zoo");
}

export async function deleteMiniZoo(id: string) {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("mini_zoo").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/mini-zoo");
  revalidatePath("/admin/mini-zoo");
  redirect("/admin/mini-zoo");
}

export async function toggleMiniZooFeatured(id: string, value: boolean) {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("mini_zoo").update({ is_featured: value }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/mini-zoo");
  revalidatePath("/mini-zoo");
}

// ── Swimming Pools ────────────────────────────────────────────────────────────

export async function getSwimmingPools() {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("swimming_pools")
    .select("id,name,slug,area,is_featured,logo_url,photo_1")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getSwimmingPool(id: string) {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("swimming_pools")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function saveSwimmingPool(id: string | null, payload: Record<string, unknown>) {
  await assertAdmin();

  if (id) {
    const { error } = await supabaseAdmin.from("swimming_pools").update(payload).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabaseAdmin.from("swimming_pools").insert(payload).select("id").single();
    if (error) throw error;
    revalidatePath("/swimming-pools");
    revalidatePath("/admin/swimming-pools");
    redirect(`/admin/swimming-pools/${data.id}`);
  }

  revalidatePath("/swimming-pools");
  revalidatePath(`/place/${payload.slug}`);
  revalidatePath("/admin/swimming-pools");
}

export async function deleteSwimmingPool(id: string) {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("swimming_pools").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/swimming-pools");
  revalidatePath("/admin/swimming-pools");
  redirect("/admin/swimming-pools");
}

export async function toggleSwimmingPoolFeatured(id: string, value: boolean) {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("swimming_pools").update({ is_featured: value }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/swimming-pools");
  revalidatePath("/swimming-pools");
}

// ── Bookstores ────────────────────────────────────────────────────────────────

export async function getBookstores() {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("bookstores")
    .select("id,name,slug,area,is_featured,logo_url,photo_1")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getBookstore(id: string) {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("bookstores")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function saveBookstore(id: string | null, payload: Record<string, unknown>) {
  await assertAdmin();

  if (id) {
    const { error } = await supabaseAdmin.from("bookstores").update(payload).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabaseAdmin.from("bookstores").insert(payload).select("id").single();
    if (error) throw error;
    revalidatePath("/bookstores");
    revalidatePath("/admin/bookstores");
    redirect(`/admin/bookstores/${data.id}`);
  }

  revalidatePath("/bookstores");
  revalidatePath(`/place/${payload.slug}`);
  revalidatePath("/admin/bookstores");
}

export async function deleteBookstore(id: string) {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("bookstores").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/bookstores");
  revalidatePath("/admin/bookstores");
  redirect("/admin/bookstores");
}

export async function toggleBookstoreFeatured(id: string, value: boolean) {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("bookstores").update({ is_featured: value }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/bookstores");
  revalidatePath("/bookstores");
}

// ── Articles ─────────────────────────────────────────────────────────────────

export async function getArticles() {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("articles")
    .select("id,title,slug,is_published,published_at,created_at,cover_image_url")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getArticle(id: string) {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function saveArticle(id: string | null, payload: Record<string, unknown>) {
  await assertAdmin();

  if (id) {
    const { error } = await supabaseAdmin
      .from("articles")
      .update(payload)
      .eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabaseAdmin
      .from("articles")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    revalidatePath("/berita");
    revalidatePath("/admin/articles");
    redirect(`/admin/articles/${data.id}`);
  }

  revalidatePath("/berita");
  revalidatePath(`/berita/${payload.slug}`);
  revalidatePath("/admin/articles");
}

export async function deleteArticle(id: string) {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("articles").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/berita");
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

// ── Dashboard stats ───────────────────────────────────────────────────────────

export async function getDashboardStats() {
  await assertAdmin();
  const tables = [
    "schools", "learning_centers", "daycares", "playgrounds",
    "clinics", "cafes", "mini_zoo", "swimming_pools", "bookstores",
  ] as const;

  const [results, featuredResults, articles] = await Promise.all([
    Promise.all(tables.map((t) => supabaseAdmin.from(t).select("*", { count: "exact", head: true }))),
    Promise.all(tables.map((t) => supabaseAdmin.from(t).select("*", { count: "exact", head: true }).eq("is_featured", true))),
    supabaseAdmin.from("articles").select("*", { count: "exact", head: true }),
  ]);

  return {
    articles: articles.count ?? 0,
    categories: tables.map((table, i) => ({
      table,
      total: results[i].count ?? 0,
      featured: featuredResults[i].count ?? 0,
    })),
  };
}

// ── Place Submissions ─────────────────────────────────────────────────────────

export async function getSubmissions(status?: string) {
  await assertAdmin();
  let query = supabaseAdmin
    .from("place_submissions")
    .select("id,name,category,area,status,created_at,submitter_name,submitter_phone")
    .order("created_at", { ascending: false });
  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getSubmission(id: string) {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("place_submissions")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateSubmissionStatus(
  id: string,
  status: "pending" | "approved" | "rejected",
  admin_notes?: string,
) {
  await assertAdmin();
  const { error } = await supabaseAdmin
    .from("place_submissions")
    .update({ status, admin_notes: admin_notes ?? null, reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${id}`);
}

/**
 * Look this submission up on Google Maps and return objective data — rating,
 * coordinates, address, phone, hours, website — to fill the gaps a submitter
 * left blank. Read-only: it never writes; the admin reviews first.
 *
 * Reuses GOOGLE_MAPS_API_KEY and the legacy Places web service (same key + APIs
 * as /api/places and /api/geocode). The key must NOT have an HTTP-referrer
 * restriction — server calls have no referrer, so Google rejects referrer-locked
 * keys. Since this key is only ever used server-side, restrict it by API
 * (Places API + Geocoding API), not by referrer.
 */
export async function enrichSubmissionFromGoogle(id: string): Promise<EnrichmentResult> {
  await assertAdmin();

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return { ok: false, error: "GOOGLE_MAPS_API_KEY is not set on the server." };

  const { data: sub, error } = await supabaseAdmin
    .from("place_submissions")
    .select("name, area, address")
    .eq("id", id)
    .single();
  if (error || !sub) return { ok: false, error: "Submission not found." };

  const query = [sub.name, sub.address, sub.area, "Tangerang Selatan"]
    .filter(Boolean)
    .join(", ");

  // 1) Text Search → best-matching place_id + rating, coords, address.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let search: any;
  try {
    const r = await fetch(
      "https://maps.googleapis.com/maps/api/place/textsearch/json" +
        `?query=${encodeURIComponent(query)}&language=id&region=id&key=${key}`,
      { cache: "no-store" },
    );
    search = await r.json();
  } catch {
    return { ok: false, error: "Could not reach Google Places API." };
  }

  if (search.status !== "OK" || !search.results?.length) {
    const hint =
      search.status === "REQUEST_DENIED"
        ? " (the key likely has an HTTP-referrer restriction — remove it; this key is server-only)"
        : "";
    return {
      ok: false,
      error: `Google Places: ${search.status ?? "unknown"}${search.error_message ? " — " + search.error_message : ""}${hint}`,
    };
  }
  const top = search.results[0];

  // 2) Place Details → phone, website, opening hours, canonical maps URL.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let det: any = {};
  try {
    const r = await fetch(
      "https://maps.googleapis.com/maps/api/place/details/json" +
        `?place_id=${encodeURIComponent(top.place_id)}` +
        "&fields=formatted_phone_number,international_phone_number,website,opening_hours,url" +
        `&language=id&key=${key}`,
      { cache: "no-store" },
    );
    const j = await r.json();
    if (j.status === "OK") det = j.result ?? {};
  } catch {
    /* details are optional — keep the Text Search data */
  }

  const data: GoogleEnrichment = {
    placeId: top.place_id,
    name: top.name ?? sub.name,
    formattedAddress: top.formatted_address ?? null,
    rating: typeof top.rating === "number" ? top.rating : null,
    userRatingCount: typeof top.user_ratings_total === "number" ? top.user_ratings_total : null,
    lat: top.geometry?.location?.lat ?? null,
    lng: top.geometry?.location?.lng ?? null,
    phone: det.formatted_phone_number ?? det.international_phone_number ?? null,
    website: det.website ?? null,
    hours: det.opening_hours?.weekday_text?.join("\n") ?? null,
    googleMapsUri: det.url ?? null,
  };

  return { ok: true, data };
}

/**
 * Write selected enriched values into the submission's own columns. The UI only
 * ever sends fields the submitter left blank, so this never overwrites user data.
 */
export async function applySubmissionEnrichment(
  id: string,
  patch: { address?: string; phone?: string; hours?: string; website?: string },
) {
  await assertAdmin();
  const clean = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => typeof v === "string" && v.trim() !== ""),
  );
  if (Object.keys(clean).length === 0) return;

  const { error } = await supabaseAdmin
    .from("place_submissions")
    .update(clean)
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/admin/submissions/${id}`);
}

// ── AI assist (Claude) ────────────────────────────────────────────────────────

/** Rewrite/expand an Indonesian description into ~4 clean paragraphs. */
export async function aiImproveDescription(input: {
  text: string;
  name?: string;
  category?: string;
  paragraphs?: number;
}): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  await assertAdmin();
  if (!hasAnthropicKey()) {
    return { ok: false, error: "ANTHROPIC_API_KEY is not set on the server. Add a Claude API key to enable AI assist." };
  }
  if (!input.text?.trim()) return { ok: false, error: "Write a short draft first, then Improve." };
  try {
    const text = await improveDescription(input);
    return text ? { ok: true, text } : { ok: false, error: "No text returned from Claude." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "AI request failed." };
  }
}

/** Translate a map of Indonesian fields to English (same keys back). */
export async function aiTranslateFields(
  fields: Record<string, string>,
): Promise<{ ok: true; data: Record<string, string> } | { ok: false; error: string }> {
  await assertAdmin();
  if (!hasAnthropicKey()) {
    return { ok: false, error: "ANTHROPIC_API_KEY is not set on the server. Add a Claude API key to enable AI assist." };
  }
  try {
    const data = await translateFields(fields);
    if (Object.keys(data).length === 0) return { ok: false, error: "Nothing to translate — fill the Indonesian fields first." };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "AI request failed." };
  }
}

/** Editable top-level columns on a submission (admin can fix/fill these by hand). */
const SUBMISSION_EDITABLE = [
  "name", "area", "address", "phone", "whatsapp", "gmaps_url", "hours", "year_founded",
  "description", "instagram", "facebook", "tiktok", "youtube", "website",
  "category_data", "yt_videos",
];

/** Update a submission's editable fields. Empty strings become null. */
export async function updateSubmissionFields(id: string, patch: Record<string, unknown>) {
  await assertAdmin();
  const clean: Record<string, unknown> = {};
  for (const k of SUBMISSION_EDITABLE) {
    if (!(k in patch)) continue;
    let v: unknown = patch[k];
    if (typeof v === "string") { v = v.trim(); if (v === "") v = null; }
    if (k === "year_founded") v = v ? Number(v) : null;
    clean[k] = v ?? null;
  }
  if (Object.keys(clean).length === 0) return;
  const { error } = await supabaseAdmin.from("place_submissions").update(clean).eq("id", id);
  if (error) throw error;
  revalidatePath(`/admin/submissions/${id}`);
}

export async function deleteSubmission(id: string) {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("place_submissions").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/submissions");
}

export async function getPendingSubmissionsCount(): Promise<number> {
  try {
    await assertAdmin();
    const { count } = await supabaseAdmin
      .from("place_submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    return count ?? 0;
  } catch {
    return 0;
  }
}

// ── App Users (profiles) ──────────────────────────────────────────────────────

export async function getAppUsers() {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id,phone,name,tier,lifetime,premium_expires_at,dob,address,kids,avatar_url,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAppUser(id: string) {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateAppUser(
  id: string,
  payload: {
    name?: string;
    address?: string | null;
    dob?: string | null;
    tier?: "free" | "premium";
    lifetime?: boolean;
    premium_expires_at?: string | null;
  },
) {
  await assertAdmin();
  const { error } = await supabaseAdmin
    .from("profiles")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
}

export async function deleteAppUser(id: string) {
  await assertAdmin();
  // Deleting from auth.users cascades to profiles via FK
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) throw error;
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

// ── Feedback ──────────────────────────────────────────────────────────────────

export async function getAdminFeedback() {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("feedback")
    .select("id,user_id,topic,message,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function deleteFeedback(id: string) {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("feedback").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/feedback");
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function getAdminReviews() {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("user_id,place_id,place_name,place_icon,place_category,reviewer_name,rating,comment,is_published,created_at")
    .order("is_published", { ascending: true })   // pending (false) first
    .order("created_at",   { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function approveReview(userId: string, placeId: string) {
  await assertAdmin();
  const { error } = await supabaseAdmin
    .from("reviews")
    .update({ is_published: true })
    .eq("user_id", userId)
    .eq("place_id", placeId);
  if (error) throw error;
  revalidatePath("/admin/reviews");
}

export async function deleteReview(userId: string, placeId: string) {
  await assertAdmin();
  const { error } = await supabaseAdmin
    .from("reviews")
    .delete()
    .eq("user_id", userId)
    .eq("place_id", placeId);
  if (error) throw error;
  revalidatePath("/admin/reviews");
}

export async function getAppUsersCount(): Promise<number> {
  try {
    await assertAdmin();
    const { count } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true });
    return count ?? 0;
  } catch {
    return 0;
  }
}

// ── Dashboard: approval queue counts ──────────────────────────────────────────

/** Reviews awaiting moderation (is_published = false). */
export async function getPendingReviewsCount(): Promise<number> {
  try {
    await assertAdmin();
    const { count } = await supabaseAdmin
      .from("reviews")
      .select("user_id", { count: "exact", head: true })
      .eq("is_published", false);
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** Visitor feedback in the inbox. Feedback has no status column, so every row
 *  counts as something to read. */
export async function getFeedbackCount(): Promise<number> {
  try {
    await assertAdmin();
    const { count } = await supabaseAdmin
      .from("feedback")
      .select("id", { count: "exact", head: true });
    return count ?? 0;
  } catch {
    return 0;
  }
}

// ── Dashboard: recent activity feed ───────────────────────────────────────────

export type ActivityEvent = {
  type: "submission" | "review" | "feedback" | "user" | "article";
  who: string;
  act: string;
  tag: string;
  tone: "primary" | "gold" | "berry" | "teal" | "sky";
  at: string; // ISO timestamp
};

const SUBMISSION_CATEGORY_LABELS: Record<string, string> = {
  schools: "Sekolah",
  learning_centers: "Tempat Kursus",
  daycares: "Daycares",
  playgrounds: "Playgrounds",
  clinics: "Klinik",
  cafes: "Kafe",
  mini_zoo: "Mini Zoo",
  swimming_pools: "Kolam Renang",
  bookstores: "Toko Buku",
};

function stars(rating: number | null): string {
  const n = Math.max(0, Math.min(5, Math.round(rating ?? 0)));
  return "★".repeat(n) + "☆".repeat(5 - n);
}

/**
 * Builds a unified "last 24h" activity feed by unioning the newest rows from
 * the tables that carry their own timestamps. There is no dedicated audit log,
 * so this reconstructs activity from the source records themselves.
 */
export async function getRecentActivity(limit = 8): Promise<ActivityEvent[]> {
  try {
    await assertAdmin();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [subs, revs, fbk, users, arts] = await Promise.all([
      supabaseAdmin
        .from("place_submissions")
        .select("name,category,created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabaseAdmin
        .from("reviews")
        .select("reviewer_name,place_name,rating,created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabaseAdmin
        .from("feedback")
        .select("topic,created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabaseAdmin
        .from("profiles")
        .select("name,created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabaseAdmin
        .from("articles")
        .select("title,published_at")
        .eq("is_published", true)
        .gte("published_at", since)
        .order("published_at", { ascending: false })
        .limit(limit),
    ]);

    const events: ActivityEvent[] = [];

    for (const s of subs.data ?? []) {
      events.push({
        type: "submission",
        who: s.name ?? "Tempat baru",
        act: "mengirim listing baru",
        tag: SUBMISSION_CATEGORY_LABELS[s.category] ?? "Submission",
        tone: "primary",
        at: s.created_at,
      });
    }
    for (const r of revs.data ?? []) {
      events.push({
        type: "review",
        who: r.reviewer_name ?? "Pengunjung",
        act: `menulis review ${stars(r.rating)} untuk ${r.place_name ?? "sebuah tempat"}`,
        tag: "Review",
        tone: "gold",
        at: r.created_at,
      });
    }
    for (const f of fbk.data ?? []) {
      events.push({
        type: "feedback",
        who: "Pengunjung",
        act: `mengirim feedback${f.topic ? ` · ${f.topic}` : ""}`,
        tag: "Feedback",
        tone: "berry",
        at: f.created_at,
      });
    }
    for (const u of users.data ?? []) {
      events.push({
        type: "user",
        who: u.name ?? "Pengguna baru",
        act: "mendaftar sebagai pengguna",
        tag: "User",
        tone: "teal",
        at: u.created_at,
      });
    }
    for (const a of arts.data ?? []) {
      events.push({
        type: "article",
        who: "Admin",
        act: `menerbitkan artikel “${a.title ?? "tanpa judul"}”`,
        tag: "Artikel",
        tone: "sky",
        at: a.published_at,
      });
    }

    return events
      .filter((e) => e.at)
      .sort((a, b) => +new Date(b.at) - +new Date(a.at))
      .slice(0, limit);
  } catch {
    return [];
  }
}

// ── Claims ────────────────────────────────────────────────────────────────────

const CLAIM_TABLE: Record<string, string> = {
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

export async function getClaims(status?: string) {
  await assertAdmin();
  let q = supabaseAdmin
    .from("place_claims")
    .select("*")
    .order("created_at", { ascending: false });
  if (status && status !== "all") q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getPendingClaimsCount() {
  await assertAdmin();
  const { count } = await supabaseAdmin
    .from("place_claims")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  return count ?? 0;
}

export async function approveClaim(id: string) {
  await assertAdmin();
  const { data: claim, error: claimErr } = await supabaseAdmin
    .from("place_claims").select("*").eq("id", id).single();
  if (claimErr || !claim) throw new Error("Claim not found");

  const table = CLAIM_TABLE[claim.category];
  if (!table) throw new Error(`Unknown category: ${claim.category}`);

  const { error: placeErr } = await supabaseAdmin
    .from(table).update({ is_verified: true }).eq("slug", claim.place_slug);
  if (placeErr) throw placeErr;

  const { error: updateErr } = await supabaseAdmin
    .from("place_claims")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (updateErr) throw updateErr;

  revalidatePath(`/place/${claim.place_slug}`);
  revalidatePath("/admin/claims");
}

export async function rejectClaim(id: string, notes?: string) {
  await assertAdmin();
  const { error } = await supabaseAdmin
    .from("place_claims")
    .update({ status: "rejected", admin_notes: notes ?? null, reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/claims");
}

export async function getClaimDocumentUrl(path: string) {
  await assertAdmin();
  const { data, error } = await supabaseAdmin.storage
    .from("claim-documents")
    .createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}
