import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const SITE_URL = "https://tangselkids.com";

const TABLES = [
  "schools", "learning_centers", "daycares", "playgrounds",
  "clinics", "cafes", "mini_zoo", "swimming_pools", "bookstores",
] as const;

const STATIC_ROUTES = [
  "/", "/schools", "/learning-centers", "/daycare", "/playgrounds",
  "/clinics", "/cafes", "/mini-zoo", "/swimming-pools", "/bookstores",
  "/explore", "/berita", "/about",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const static_entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1.0 : 0.8,
  }));

  const legal_entries: MetadataRoute.Sitemap = ["/terms", "/privacy"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  const [slugResults, articlesData] = await Promise.all([
    Promise.all(
      TABLES.map(async (table) => {
        const { data } = await supabase
          .from(table)
          .select("slug, id");
        return (data ?? []).map((r) => r.slug ?? r.id as string).filter(Boolean);
      }),
    ),
    supabase
      .from("articles")
      .select("slug, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false }),
  ]);

  const place_entries: MetadataRoute.Sitemap = slugResults.flat().map((slug) => ({
    url: `${SITE_URL}/place/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const article_entries: MetadataRoute.Sitemap = (articlesData.data ?? []).map((a) => ({
    url: `${SITE_URL}/berita/${a.slug}`,
    lastModified: a.published_at ? new Date(a.published_at) : undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...static_entries, ...legal_entries, ...place_entries, ...article_entries];
}
