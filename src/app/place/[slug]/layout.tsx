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

type Category = typeof TABLES[number]["category"];

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

async function getEnrichment(slug: string, category: Category) {
  if (category === "school") {
    const { data } = await supabase
      .from("schools")
      .select("curriculum, grades, kategori_bahasa, teaching_language, price_min, price_max, uang_pangkal_min, uang_pangkal_max")
      .eq("slug", slug)
      .maybeSingle();
    return data ?? null;
  }
  if (category === "learning-center") {
    const { data } = await supabase
      .from("learning_centers")
      .select("teaching_language, price_min, price_max")
      .eq("slug", slug)
      .maybeSingle();
    return data ?? null;
  }
  if (category === "daycare") {
    const { data } = await supabase
      .from("daycares")
      .select("price_min, price_max, has_accreditation")
      .eq("slug", slug)
      .maybeSingle();
    return data ?? null;
  }
  if (category === "clinic") {
    const { data } = await supabase
      .from("clinics")
      .select("price_min, price_max")
      .eq("slug", slug)
      .maybeSingle();
    return data ?? null;
  }
  if (category === "playground" || category === "swimming-pool" || category === "mini-zoo") {
    const tableMap: Record<string, string> = {
      playground:     "playgrounds",
      "swimming-pool": "swimming_pools",
      "mini-zoo":     "mini_zoo",
    };
    const { data } = await supabase
      .from(tableMap[category])
      .select("price_min, price_max")
      .eq("slug", slug)
      .maybeSingle();
    return data ?? null;
  }
  return null;
}

function formatRp(n: number | null | undefined) {
  if (!n) return null;
  return "Rp " + n.toLocaleString("id-ID");
}

function priceRange(min: number | null | undefined, max: number | null | undefined, suffix = "") {
  const lo = formatRp(min);
  const hi = formatRp(max);
  if (!lo) return null;
  const range = lo === hi || !hi ? lo : `${lo} – ${hi}`;
  return suffix ? `${range} ${suffix}` : range;
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
    ? (place.logo_url.startsWith("http") ? place.logo_url : `${BUCKET}/school-logo/${place.logo_url}`)
    : place.photo_1 ?? undefined;

  const pageUrl = `${SITE_URL}/place/${slug}`;

  return {
    title: place.name,
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
  const enrichment = place ? await getEnrichment(slug, place.category) : null;

  const CATEGORY_HREF: Record<string, string> = {
    school:            "/schools",
    "learning-center": "/learning-centers",
    daycare:           "/daycare",
    playground:        "/playgrounds",
    clinic:            "/clinics",
    cafe:              "/cafes",
    "mini-zoo":        "/mini-zoo",
    "swimming-pool":   "/swimming-pools",
    bookstore:         "/bookstores",
    other:             "/others",
  };

  const CATEGORY_NAME: Record<string, string> = {
    school:            "Sekolah",
    "learning-center": "Tempat Kursus",
    daycare:           "Daycare",
    playground:        "Playground",
    clinic:            "Klinik Anak",
    cafe:              "Kafe Ramah Anak",
    "mini-zoo":        "Mini Zoo",
    "swimming-pool":   "Kolam Renang",
    bookstore:         "Toko Buku",
    other:             "Lainnya",
  };

  const categoryHref = CATEGORY_HREF[place?.category ?? ""] ?? "/explore";
  const categoryName = CATEGORY_NAME[place?.category ?? ""] ?? "Explore";

  const logoUrl = place?.logo_url
    ? (place.logo_url.startsWith("http") ? place.logo_url : `${BUCKET}/school-logo/${place.logo_url}`)
    : undefined;

  // Build additional properties from enrichment data
  const additionalProps: { "@type": string; name: string; value: string }[] = [];

  if (enrichment) {
    const e = enrichment as Record<string, unknown>;

    if (e.curriculum) {
      additionalProps.push({ "@type": "PropertyValue", name: "Kurikulum", value: String(e.curriculum) });
    }
    if (Array.isArray(e.grades) && e.grades.length > 0) {
      additionalProps.push({ "@type": "PropertyValue", name: "Jenjang", value: (e.grades as string[]).join(", ") });
    }
    if (Array.isArray(e.kategori_bahasa) && e.kategori_bahasa.length > 0) {
      additionalProps.push({ "@type": "PropertyValue", name: "Bahasa Pengantar", value: (e.kategori_bahasa as string[]).join(", ") });
    } else if (e.teaching_language) {
      additionalProps.push({ "@type": "PropertyValue", name: "Bahasa Pengantar", value: String(e.teaching_language) });
    }
    const spp = priceRange(e.price_min as number, e.price_max as number, "/ bulan");
    if (spp) additionalProps.push({ "@type": "PropertyValue", name: "SPP", value: spp });

    const pangkal = priceRange(e.uang_pangkal_min as number, e.uang_pangkal_max as number);
    if (pangkal) additionalProps.push({ "@type": "PropertyValue", name: "Uang Pangkal", value: pangkal });
  }

  const placeLd = place
    ? {
        "@context": "https://schema.org",
        "@type": place.category === "school" ? "School" : "LocalBusiness",
        name: place.name,
        description: place.about?.slice(0, 300) ?? undefined,
        address: { "@type": "PostalAddress", addressRegion: "Banten", addressCountry: "ID" },
        url: `${SITE_URL}/place/${slug}`,
        ...(logoUrl ? { logo: logoUrl } : {}),
        ...(additionalProps.length > 0 ? { additionalProperty: additionalProps } : {}),
      }
    : null;

  const breadcrumbLd = place
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: categoryName, item: `${SITE_URL}${categoryHref}` },
          { "@type": "ListItem", position: 3, name: place.name, item: `${SITE_URL}/place/${slug}` },
        ],
      }
    : null;

  return (
    <>
      {placeLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(placeLd) }} />
      )}
      {breadcrumbLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      )}
      {children}
    </>
  );
}
