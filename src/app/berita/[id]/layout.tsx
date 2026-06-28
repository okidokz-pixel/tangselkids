import type { Metadata } from "next";
import { cache } from "react";
import { supabase } from "@/lib/supabase";

const SITE_URL = "https://tangselkids.com";

// Deduped within a single request — used by both generateMetadata and the layout.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getArticle = cache(async (id: string) => {
  // `id` is usually a slug. Only match the uuid `id` column when it's actually a
  // uuid — comparing the uuid column to a slug string makes Postgres error out
  // (and silently kills the metadata + JSON-LD).
  const query = supabase
    .from("articles")
    .select("title, excerpt, cover_image_url, slug, published_at")
    .eq("is_published", true);
  const { data } = await (UUID_RE.test(id)
    ? query.or(`slug.eq.${id},id.eq.${id}`)
    : query.eq("slug", id)
  ).maybeSingle();
  return data;
});

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;
  const data = await getArticle(id);

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
      publishedTime: data.published_at ?? undefined,
      modifiedTime: data.published_at ?? undefined,
      authors: ["TangselKids"],
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

export default async function Layout(
  { children, params }: { children: React.ReactNode; params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = await getArticle(id);

  // Article structured data (BlogPosting) for rich results.
  const jsonLd = data && {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: data.title,
    description: data.excerpt ?? undefined,
    image: data.cover_image_url ? [data.cover_image_url] : undefined,
    datePublished: data.published_at ?? undefined,
    dateModified: data.published_at ?? undefined,
    author: { "@type": "Organization", name: "TangselKids", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "TangselKids",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/admin-logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/berita/${data.slug ?? id}` },
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
