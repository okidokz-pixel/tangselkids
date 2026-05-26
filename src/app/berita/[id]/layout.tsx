import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

const SITE_URL = "https://tangselkids.com";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;

  const { data } = await supabase
    .from("articles")
    .select("title, excerpt, cover_image_url, slug")
    .or(`slug.eq.${id},id.eq.${id}`)
    .eq("is_published", true)
    .maybeSingle();

  if (!data) return { title: "Artikel | TangselKids" };

  const description = data.excerpt ?? "Baca artikel parenting dan tips untuk orang tua di TangselKids.";
  const pageUrl = `${SITE_URL}/berita/${data.slug ?? id}`;

  return {
    title: data.title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: data.title,
      description,
      url: pageUrl,
      siteName: "TangselKids",
      locale: "id_ID",
      type: "article",
      images: data.cover_image_url ? [{ url: data.cover_image_url, alt: data.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description,
      images: data.cover_image_url ? [data.cover_image_url] : undefined,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
