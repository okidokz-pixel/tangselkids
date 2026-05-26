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
  const [schools, articles, featuredSchools] = await Promise.all([
    supabaseAdmin.from("schools").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("articles").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("schools").select("*", { count: "exact", head: true }).eq("is_featured", true),
  ]);
  return {
    schools: schools.count ?? 0,
    articles: articles.count ?? 0,
    featuredSchools: featuredSchools.count ?? 0,
  };
}
