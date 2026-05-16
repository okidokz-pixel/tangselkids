import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

const SITE_URL = "https://tangselkids.com";
const BUCKET   = "https://szyujzbnfkkqwoeuyjwg.supabase.co/storage/v1/object/public";

const TABLES = [
  { table: "schools",          category: "school" },
  { table: "learning_centers", category: "learning-center" },
  { table: "daycares",         category: "daycare" },
  { table: "playgrounds",      category: "playground" },
  { table: "clinics",          category: "clinic" },
  { table: "cafes",            category: "cafe" },
  { table: "mini_zoo",         category: "mini-zoo" },
  { table: "swimming_pools",   category: "swimming-pool" },
  { table: "bookstores",       category: "bookstore" },
  { table: "others",           category: "other" },
] as const;

async function getPlaceBySlug(slug: string) {
  for (const { table, category } of TABLES) {
    const { data } = await supabase
      .from(table)
      .select("name, about, area, logo_url, photo_1, slug")
      .eq("slug", slug)
      .maybeSingle();
    if (data) return { ...data, category };
  }
  return null;
}

export async function generateStaticParams() {
  const results = await Promise.all(
    TABLES.map(async ({ table }) => {
      const { data } = await supabase
        .from(table)
        .select("slug")
        .not("slug", "is", null);
      return (data ?? []).map((r) => ({ slug: r.slug as string })).filter((r) => r.slug);
    }),
  );
  return results.flat();
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);

  if (!place) {
    return {
      title: "TangselKids",
      description: "Hyperlocal directory for parents in Tangerang Selatan, Indonesia",
    };
  }

  const description = place.about
    ? place.about.slice(0, 155).replace(/\s\S*$/, "…")
    : `${place.name} — ${place.area ?? "Tangsel"}. Temukan informasi lengkap di TangselKids.`;

  const ogImage = place.logo_url
    ? `${BUCKET}/school-logo/${place.logo_url}`
    : place.photo_1 ?? undefined;

  const pageUrl = `${SITE_URL}/place/${slug}`;

  return {
    title: `${place.name} | TangselKids`,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: place.name,
      description,
      url: pageUrl,
      siteName: "TangselKids",
      images: ogImage ? [{ url: ogImage, width: 800, height: 600, alt: place.name }] : undefined,
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: place.name,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function PlaceSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);

  const jsonLd = place
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": place.category === "school" ? "School" : "LocalBusiness",
        name: place.name,
        description: place.about?.slice(0, 300) ?? undefined,
        address: {
          "@type": "PostalAddress",
          addressRegion: "Banten",
          addressCountry: "ID",
        },
        url: `${SITE_URL}/place/${slug}`,
        ...(place.logo_url
          ? { logo: `${BUCKET}/school-logo/${place.logo_url}` }
          : {}),
      })
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      )}
      {children}
    </>
  );
}
