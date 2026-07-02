"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { createAdminServerClient } from "@/lib/supabase-server";
import { isAdminEmail } from "@/lib/adminEmails";
import type { EnrichmentResult, GoogleEnrichment } from "@/lib/enrichment";
import { hasAnthropicKey, improveDescription, translateFields, generatePlaceDetails } from "@/lib/ai";
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

export async function saveSchool(id: string | null, payload: Record<string, unknown>, draftId?: string | null) {
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
    if (draftId) await supabaseAdmin.from("place_drafts").delete().eq("id", draftId);
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

export async function saveLearningCenter(id: string | null, payload: Record<string, unknown>, draftId?: string | null) {
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
    if (draftId) await supabaseAdmin.from("place_drafts").delete().eq("id", draftId);
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

export async function saveDaycare(id: string | null, payload: Record<string, unknown>, draftId?: string | null) {
  await assertAdmin();

  if (id) {
    const { error } = await supabaseAdmin.from("daycares").update(payload).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabaseAdmin.from("daycares").insert(payload).select("id").single();
    if (error) throw error;
    if (draftId) await supabaseAdmin.from("place_drafts").delete().eq("id", draftId);
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

export async function savePlayground(id: string | null, payload: Record<string, unknown>, draftId?: string | null) {
  await assertAdmin();

  if (id) {
    const { error } = await supabaseAdmin.from("playgrounds").update(payload).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabaseAdmin.from("playgrounds").insert(payload).select("id").single();
    if (error) throw error;
    if (draftId) await supabaseAdmin.from("place_drafts").delete().eq("id", draftId);
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

export async function saveClinic(id: string | null, payload: Record<string, unknown>, draftId?: string | null) {
  await assertAdmin();

  if (id) {
    const { error } = await supabaseAdmin.from("clinics").update(payload).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabaseAdmin.from("clinics").insert(payload).select("id").single();
    if (error) throw error;
    if (draftId) await supabaseAdmin.from("place_drafts").delete().eq("id", draftId);
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

export async function saveCafe(id: string | null, payload: Record<string, unknown>, draftId?: string | null) {
  await assertAdmin();

  if (id) {
    const { error } = await supabaseAdmin.from("cafes").update(payload).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabaseAdmin.from("cafes").insert(payload).select("id").single();
    if (error) throw error;
    if (draftId) await supabaseAdmin.from("place_drafts").delete().eq("id", draftId);
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

export async function saveMiniZoo(id: string | null, payload: Record<string, unknown>, draftId?: string | null) {
  await assertAdmin();

  if (id) {
    const { error } = await supabaseAdmin.from("mini_zoo").update(payload).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabaseAdmin.from("mini_zoo").insert(payload).select("id").single();
    if (error) throw error;
    if (draftId) await supabaseAdmin.from("place_drafts").delete().eq("id", draftId);
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

export async function saveSwimmingPool(id: string | null, payload: Record<string, unknown>, draftId?: string | null) {
  await assertAdmin();

  if (id) {
    const { error } = await supabaseAdmin.from("swimming_pools").update(payload).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabaseAdmin.from("swimming_pools").insert(payload).select("id").single();
    if (error) throw error;
    if (draftId) await supabaseAdmin.from("place_drafts").delete().eq("id", draftId);
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

export async function saveBookstore(id: string | null, payload: Record<string, unknown>, draftId?: string | null) {
  await assertAdmin();

  if (id) {
    const { error } = await supabaseAdmin.from("bookstores").update(payload).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabaseAdmin.from("bookstores").insert(payload).select("id").single();
    if (error) throw error;
    if (draftId) await supabaseAdmin.from("place_drafts").delete().eq("id", draftId);
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

// ── Place Drafts ──────────────────────────────────────────────────────────────
// Staging area for half-finished listings. Stored as a JSONB payload in the
// column shape the category form uses, so resuming just feeds it back as the
// form's `initial`. Never touches a live category table until published.

export type DraftRow = {
  id: string;
  category: string;
  name: string | null;
  updated_at: string;
};

/** Upsert a draft. Returns the draft id so the form can keep updating the same row. */
export async function saveDraft(input: {
  id?: string | null;
  category: string;
  name: string;
  payload: Record<string, unknown>;
}): Promise<string> {
  await assertAdmin();
  const row = {
    category: input.category,
    name: input.name?.trim() || "(tanpa nama)",
    payload: input.payload,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { error } = await supabaseAdmin.from("place_drafts").update(row).eq("id", input.id);
    if (error) throw error;
    revalidatePath("/admin/drafts");
    revalidatePath("/admin");
    return input.id;
  }

  const { data, error } = await supabaseAdmin
    .from("place_drafts")
    .insert(row)
    .select("id")
    .single();
  if (error) throw error;
  revalidatePath("/admin/drafts");
  revalidatePath("/admin");
  return data.id as string;
}

export async function getDrafts(): Promise<DraftRow[]> {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("place_drafts")
    .select("id,category,name,updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DraftRow[];
}

export async function getDraft(id: string) {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("place_drafts")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDraft(id: string) {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("place_drafts").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/drafts");
  revalidatePath("/admin");
}

export async function getDraftsCount(): Promise<number> {
  try {
    await assertAdmin();
    const { count } = await supabaseAdmin
      .from("place_drafts")
      .select("id", { count: "exact", head: true });
    return count ?? 0;
  } catch {
    return 0;
  }
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

/**
 * Resolve a pasted Google Maps link into { placeId, lat, lng } to auto-fill the
 * admin place forms. Handles short links (maps.app.goo.gl / goo.gl) by following
 * the redirect, then reads coordinates + name from the URL, and resolves the
 * canonical Place ID via the Places "Find Place From Text" endpoint.
 *
 * Reuses GOOGLE_MAPS_API_KEY (same key + APIs as /api/geocode and the submission
 * enricher). The key must NOT be HTTP-referrer restricted — server calls have no
 * referrer. Restrict it by API (Places API + Geocoding API) instead.
 */
export async function resolveGoogleMapsLink(link: string): Promise<{
  ok: boolean;
  placeId?: string;
  lat?: number;
  lng?: number;
  name?: string;
  error?: string;
}> {
  await assertAdmin();

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return { ok: false, error: "GOOGLE_MAPS_API_KEY belum diset di server." };

  let url = link.trim();
  if (!url) return { ok: false, error: "Tempel link Google Maps dulu." };

  // 1) Expand short links so we can read the coords/name out of the full URL.
  if (/(maps\.app\.goo\.gl|goo\.gl)/.test(url)) {
    try {
      const r = await fetch(url, { redirect: "follow" });
      url = r.url || url;
    } catch {
      /* keep the original URL and try to parse it as-is */
    }
  }

  // 2) Coordinates: "@lat,lng,zoom" or the "!3dlat!4dlng" data segment.
  let lat: number | undefined;
  let lng: number | undefined;
  const coord = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ?? url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (coord) {
    lat = parseFloat(coord[1]);
    lng = parseFloat(coord[2]);
  }

  // 3) Place name from the "/place/<name>/" segment.
  let name: string | undefined;
  const pm = url.match(/\/place\/([^/@]+)/);
  if (pm) {
    try { name = decodeURIComponent(pm[1].replace(/\+/g, " ")); }
    catch { name = pm[1].replace(/\+/g, " "); }
  }

  // 4) A place_id sometimes rides in the URL directly.
  let placeId: string | undefined;
  const direct = url.match(/query_place_id=([A-Za-z0-9_-]+)/) ?? url.match(/[?&]place_id=([A-Za-z0-9_-]+)/);
  if (direct) placeId = direct[1];

  // 5) No explicit place_id → resolve it from the name (biased by coords).
  if (!placeId) {
    const query = name ?? (lat != null && lng != null ? `${lat},${lng}` : null);
    if (!query) {
      return { ok: false, error: "Tidak bisa membaca nama/koordinat dari link. Pastikan ini link Google Maps yang valid (buka lokasinya di Maps, lalu Share → Copy link)." };
    }
    const params = new URLSearchParams({
      input: query,
      inputtype: "textquery",
      fields: "place_id,geometry,name",
      language: "id",
      key,
    });
    if (lat != null && lng != null) params.set("locationbias", `point:${lat},${lng}`);

    try {
      const r = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${params.toString()}`,
        { cache: "no-store" },
      );
      const j = await r.json();
      if (j.status === "OK" && j.candidates?.length) {
        const c = j.candidates[0];
        placeId = c.place_id;
        if (c.geometry?.location) { lat = c.geometry.location.lat; lng = c.geometry.location.lng; }
        name = c.name ?? name;
      } else {
        const hint = j.status === "REQUEST_DENIED"
          ? " (kemungkinan API key punya restriksi HTTP-referrer — hapus; key ini dipakai server-side)"
          : "";
        return { ok: false, error: `Google Places: ${j.status ?? "unknown"}${j.error_message ? " — " + j.error_message : ""}${hint}` };
      }
    } catch {
      return { ok: false, error: "Tidak bisa menghubungi Google Places API." };
    }
  } else if (lat == null || lng == null) {
    // Have a place_id but no coords → fetch details for geometry.
    try {
      const r = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=geometry,name&language=id&key=${key}`,
        { cache: "no-store" },
      );
      const j = await r.json();
      if (j.status === "OK" && j.result?.geometry?.location) {
        lat = j.result.geometry.location.lat;
        lng = j.result.geometry.location.lng;
        name = j.result.name ?? name;
      }
    } catch {
      /* keep the place_id we already have */
    }
  }

  if (!placeId) return { ok: false, error: "Tidak menemukan Place ID untuk link ini." };
  return { ok: true, placeId, lat, lng, name };
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

// ── Fill Data (Google Places + Claude auto-fill) ───────────────────────────────

/** Normalized result the admin place forms map onto their own setters. */
export type PlaceFillData = {
  googlePlaceId: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  hours: string | null;
  rating: number | null;
  about: string;
  facilities: string[];
  sources: string[]; // human-readable note of where data came from
};

/** Best-effort fetch of a website's visible text, for grounding the AI. */
async function fetchSiteText(url: string): Promise<string> {
  try {
    let u = url.trim();
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const r = await fetch(u, { signal: ctrl.signal, redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (compatible; TangselKidsBot/1.0)" } });
    clearTimeout(timer);
    if (!r.ok) return "";
    const html = await r.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);
  } catch {
    return "";
  }
}

/**
 * "Fill Data": from a few critical fields (name, address, Google Place ID,
 * Instagram), gather the rest. Google Places supplies the factual fields
 * (phone, website, hours, coordinates, rating); Claude writes the descriptive
 * fields (about, facilities) grounded in the place's website + Google summary.
 * The form fills only its EMPTY fields with this, and the admin reviews before
 * publishing — nothing is written to the database here.
 */
export async function aiFillPlaceData(input: {
  category: string;
  name: string;
  address?: string;
  googlePlaceId?: string;
  instagram?: string;
  website?: string;
}): Promise<{ ok: true; data: PlaceFillData } | { ok: false; error: string }> {
  await assertAdmin();

  if (!input.name?.trim()) return { ok: false, error: "Isi Nama dulu, lalu klik Fill Data." };

  const key = process.env.GOOGLE_MAPS_API_KEY;
  const sources: string[] = [];

  // ── 1) Google Places (factual) ──────────────────────────────────────────────
  let placeId = input.googlePlaceId?.trim() || "";
  let googleSummary = "";
  let googleTypes: string[] = [];
  const g: {
    address: string | null; phone: string | null; website: string | null;
    hours: string | null; lat: number | null; lng: number | null; rating: number | null;
  } = { address: null, phone: null, website: null, hours: null, lat: null, lng: null, rating: null };

  const detailFields =
    "formatted_phone_number,international_phone_number,website,opening_hours,url," +
    "geometry,formatted_address,rating,user_ratings_total,editorial_summary,types,name";

  if (key) {
    try {
      // Resolve a Place ID from name+address if none was supplied.
      if (!placeId) {
        const query = [input.name, input.address, "Tangerang Selatan"].filter(Boolean).join(", ");
        const r = await fetch(
          "https://maps.googleapis.com/maps/api/place/textsearch/json" +
            `?query=${encodeURIComponent(query)}&language=id&region=id&key=${key}`,
          { cache: "no-store" },
        );
        const j = await r.json();
        if (j.status === "OK" && j.results?.length) placeId = j.results[0].place_id;
      }

      if (placeId) {
        const r = await fetch(
          "https://maps.googleapis.com/maps/api/place/details/json" +
            `?place_id=${encodeURIComponent(placeId)}&fields=${detailFields}&language=id&key=${key}`,
          { cache: "no-store" },
        );
        const j = await r.json();
        if (j.status === "OK" && j.result) {
          const d = j.result;
          g.address = d.formatted_address ?? null;
          g.phone = d.formatted_phone_number ?? d.international_phone_number ?? null;
          g.website = d.website ?? null;
          g.hours = d.opening_hours?.weekday_text?.join("\n") ?? null;
          g.lat = d.geometry?.location?.lat ?? null;
          g.lng = d.geometry?.location?.lng ?? null;
          g.rating = typeof d.rating === "number" ? d.rating : null;
          googleSummary = d.editorial_summary?.overview ?? "";
          googleTypes = Array.isArray(d.types) ? d.types : [];
          sources.push("Google Places");
        }
      }
    } catch {
      /* Google is best-effort — keep going with whatever we have */
    }
  }

  // ── 2) Claude (descriptive), grounded in the website + Google summary ────────
  let about = "";
  let facilities: string[] = [];
  const websiteForAi = input.website?.trim() || g.website || "";
  if (hasAnthropicKey()) {
    try {
      const siteText = websiteForAi ? await fetchSiteText(websiteForAi) : "";
      const gen = await generatePlaceDetails({
        name: input.name,
        category: input.category,
        address: input.address || g.address || undefined,
        website: websiteForAi || undefined,
        instagram: input.instagram || undefined,
        googleSummary: googleSummary || undefined,
        googleTypes,
        siteText: siteText || undefined,
      });
      about = gen.about;
      facilities = gen.facilities;
      if (about || facilities.length) sources.push("Claude");
    } catch {
      /* AI is best-effort — return the Google data regardless */
    }
  }

  if (!key && !hasAnthropicKey()) {
    return { ok: false, error: "Belum ada GOOGLE_MAPS_API_KEY atau ANTHROPIC_API_KEY di server." };
  }

  return {
    ok: true,
    data: {
      googlePlaceId: placeId || null,
      address: g.address,
      latitude: g.lat,
      longitude: g.lng,
      phone: g.phone,
      website: g.website,
      hours: g.hours,
      rating: g.rating,
      about,
      facilities,
      sources,
    },
  };
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

/**
 * Registration stats for the dashboard + analytics: how many people completed
 * registration (profile has a name), grouped by WIB (UTC+7) calendar day.
 */
export async function getRegistrationStats() {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("created_at,name");
  if (error) throw error;

  const rows = (data ?? []).filter((r) => r.name && String(r.name).trim());

  const WIB_MS = 7 * 60 * 60 * 1000;
  const dayKey = (iso: string) =>
    new Date(new Date(iso).getTime() + WIB_MS).toISOString().slice(0, 10);
  const todayKey = new Date(Date.now() + WIB_MS).toISOString().slice(0, 10);

  const counts = new Map<string, number>();
  for (const r of rows) {
    if (!r.created_at) continue;
    const k = dayKey(r.created_at as string);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  // Last 30 days, oldest → newest, zero-filled.
  const base = new Date(todayKey + "T00:00:00Z").getTime();
  const daily: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(base - i * 86_400_000).toISOString().slice(0, 10);
    daily.push({ date: d, count: counts.get(d) ?? 0 });
  }

  const yesterdayKey = new Date(base - 86_400_000).toISOString().slice(0, 10);
  const last7 = daily.slice(-7).reduce((s, d) => s + d.count, 0);
  const prev7 = daily.slice(-14, -7).reduce((s, d) => s + d.count, 0);

  return {
    total:     rows.length,
    today:     counts.get(todayKey) ?? 0,
    yesterday: counts.get(yesterdayKey) ?? 0,
    last7,
    prev7,
    daily,
  };
}

// Directory tables → display label. saved_places stores only a bare place_id,
// so we resolve names by looking the id up across every category table.
const ACTIVITY_CATEGORY_TABLES: { table: string; label: string }[] = [
  { table: "schools",          label: "Sekolah" },
  { table: "learning_centers", label: "Tempat Kursus" },
  { table: "daycares",         label: "Daycare" },
  { table: "playgrounds",      label: "Playground" },
  { table: "clinics",          label: "Klinik" },
  { table: "cafes",            label: "Kafe" },
  { table: "mini_zoo",         label: "Mini Zoo" },
  { table: "swimming_pools",   label: "Kolam Renang" },
  { table: "bookstores",       label: "Toko Buku" },
  { table: "others",           label: "Lainnya" },
];

/** Per-user activity for the admin user-detail page: favorites, reviews, notes count. */
export async function getUserActivity(userId: string) {
  await assertAdmin();

  const [savedRes, reviewsRes, notesRes] = await Promise.all([
    supabaseAdmin.from("saved_places").select("place_id,created_at").eq("user_id", userId).order("created_at", { ascending: false }),
    supabaseAdmin.from("reviews").select("place_id,place_name,place_category,rating,status,liked,created_at").eq("user_id", userId).order("created_at", { ascending: false }),
    supabaseAdmin.from("notes").select("place_id", { count: "exact", head: true }).eq("user_id", userId),
  ]);

  const savedIds = (savedRes.data ?? []).map((r) => r.place_id as string);
  let favorites: { place_id: string; name: string; category: string; slug: string | null }[] = [];
  if (savedIds.length) {
    const lookups = await Promise.all(
      ACTIVITY_CATEGORY_TABLES.map(async ({ table, label }) => {
        const { data } = await supabaseAdmin.from(table).select("id,name,slug").in("id", savedIds);
        return (data ?? []).map((row) => ({
          place_id: row.id as string,
          name: (row.name as string) ?? "(tanpa nama)",
          category: label,
          slug: (row.slug as string) ?? null,
        }));
      }),
    );
    const byId = new Map(lookups.flat().map((f) => [f.place_id, f]));
    // Preserve saved order; show a placeholder for ids whose listing was removed.
    favorites = savedIds.map((id) => byId.get(id) ?? { place_id: id, name: "(listing tidak ditemukan)", category: "—", slug: null });
  }

  return {
    favorites,
    reviews: reviewsRes.data ?? [],
    notesCount: notesRes.count ?? 0,
  };
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
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = data ?? [];

  // Attach the submitter's name + phone (WhatsApp) from their profile.
  const ids = [...new Set(rows.map((r) => r.user_id).filter(Boolean))] as string[];
  let byId: Record<string, { name: string | null; phone: string | null }> = {};
  if (ids.length) {
    const { data: profs } = await supabaseAdmin
      .from("profiles")
      .select("id,name,phone")
      .in("id", ids);
    byId = Object.fromEntries((profs ?? []).map((p) => [p.id, { name: p.name, phone: p.phone }]));
  }

  return rows.map((r) => ({
    ...r,
    user_name: r.user_id ? byId[r.user_id]?.name ?? null : null,
    user_phone: r.user_id ? byId[r.user_id]?.phone ?? null : null,
  }));
}

export async function setFeedbackStatus(id: string, status: "new" | "resolved") {
  await assertAdmin();
  const { error } = await supabaseAdmin.from("feedback").update({ status }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/feedback");
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
    .select("user_id,place_id,place_name,place_icon,place_category,reviewer_name,rating,reviewer_relationship,liked,improve,suggestion,is_anonymous,status,reviewed_at,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = data ?? [];

  // Attach the submitter's REAL identity (name + phone) from their profile —
  // always available to admin, regardless of the is_anonymous (public) flag.
  const ids = [...new Set(rows.map((r) => r.user_id).filter(Boolean))] as string[];
  let byId: Record<string, { name: string | null; phone: string | null }> = {};
  if (ids.length) {
    const { data: profs } = await supabaseAdmin
      .from("profiles")
      .select("id,name,phone")
      .in("id", ids);
    byId = Object.fromEntries((profs ?? []).map((p) => [p.id, { name: p.name, phone: p.phone }]));
  }

  return rows.map((r) => ({
    ...r,
    real_name:  r.user_id ? byId[r.user_id]?.name ?? null : null,
    real_phone: r.user_id ? byId[r.user_id]?.phone ?? null : null,
  }));
}

export async function setReviewStatus(userId: string, placeId: string, status: "pending" | "approved" | "rejected") {
  await assertAdmin();
  const { error } = await supabaseAdmin
    .from("reviews")
    .update({ status, reviewed_at: status === "pending" ? null : new Date().toISOString() })
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

/** Reviews awaiting moderation (status = pending). */
export async function getPendingReviewsCount(): Promise<number> {
  try {
    await assertAdmin();
    const { count } = await supabaseAdmin
      .from("reviews")
      .select("user_id", { count: "exact", head: true })
      .eq("status", "pending");
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** Count of unresolved ("new") feedback for the nav badge. */
export async function getFeedbackCount(): Promise<number> {
  try {
    await assertAdmin();
    const { count } = await supabaseAdmin
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .eq("status", "new");
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
  const rows = data ?? [];

  // Attach the linked account's profile (name + phone) when the claim was
  // submitted by a signed-in user. Tolerates a missing user_id column.
  const ids = [...new Set(rows.map((r) => r.user_id).filter(Boolean))] as string[];
  let byId: Record<string, { name: string | null; phone: string | null }> = {};
  if (ids.length) {
    const { data: profs } = await supabaseAdmin
      .from("profiles")
      .select("id,name,phone")
      .in("id", ids);
    byId = Object.fromEntries((profs ?? []).map((p) => [p.id, { name: p.name, phone: p.phone }]));
  }

  return rows.map((r) => ({
    ...r,
    account_name:  r.user_id ? byId[r.user_id]?.name ?? null : null,
    account_phone: r.user_id ? byId[r.user_id]?.phone ?? null : null,
  }));
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

export async function deleteClaim(id: string) {
  await assertAdmin();
  const { data: claim } = await supabaseAdmin
    .from("place_claims").select("document_url,status,category,place_slug").eq("id", id).single();

  // Remove the uploaded verification document from storage too (best-effort).
  if (claim?.document_url) {
    await supabaseAdmin.storage.from("claim-documents").remove([claim.document_url]);
  }

  const { error } = await supabaseAdmin.from("place_claims").delete().eq("id", id);
  if (error) throw error;

  // If this was the approved claim that verified the place, revert the badge —
  // unless another approved claim still vouches for the same place.
  if (claim?.status === "approved" && claim.place_slug) {
    const { count } = await supabaseAdmin
      .from("place_claims")
      .select("id", { count: "exact", head: true })
      .eq("place_slug", claim.place_slug)
      .eq("status", "approved");
    if (!count) {
      const table = CLAIM_TABLE[claim.category];
      if (table) {
        await supabaseAdmin.from(table).update({ is_verified: false }).eq("slug", claim.place_slug);
        revalidatePath(`/place/${claim.place_slug}`);
      }
    }
  }

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
