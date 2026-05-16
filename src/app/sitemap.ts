import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const SITE_URL = "https://tangselkids.com";

const TABLES = [
  "schools", "learning_centers", "daycares", "playgrounds",
  "clinics", "cafes", "mini_zoo", "swimming_pools", "bookstores", "others",
] as const;

const STATIC_ROUTES = [
  "/", "/schools", "/learning-centers", "/daycare", "/playgrounds",
  "/clinics", "/cafes", "/mini-zoo", "/swimming-pools", "/bookstores",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const static_entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1.0 : 0.8,
  }));

  const slugResults = await Promise.all(
    TABLES.map(async (table) => {
      const { data } = await supabase
        .from(table)
        .select("slug, id")
        .order("is_featured", { ascending: false });
      return (data ?? []).map((r) => r.slug ?? r.id as string).filter(Boolean);
    }),
  );

  const place_entries: MetadataRoute.Sitemap = slugResults.flat().map((slug) => ({
    url: `${SITE_URL}/place/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...static_entries, ...place_entries];
}
