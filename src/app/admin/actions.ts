"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { createAdminServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function assertAdmin() {
  const supabase = await createAdminServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
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
