import { supabase } from "./supabase";

export type DbArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: object | null;
  cover_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
};

export async function fetchPublishedArticles(): Promise<DbArticle[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("id,title,slug,excerpt,cover_image_url,is_published,published_at,created_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  if (error || !data) return [];
  return data as DbArticle[];
}

export async function fetchArticleBySlug(slug: string): Promise<DbArticle | null> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as DbArticle;
}
