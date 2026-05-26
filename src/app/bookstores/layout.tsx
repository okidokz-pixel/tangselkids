import type { Metadata } from "next";

const SITE_URL = "https://tangselkids.com";

export const metadata: Metadata = {
  title: "Toko Buku Anak di Tangerang Selatan",
  description: "Temukan toko buku anak di Bintaro dan BSD — koleksi buku cerita, buku pelajaran, dan buku edukatif untuk anak di TangselKids.",
  openGraph: {
    title: "Toko Buku Anak di Tangerang Selatan | TangselKids",
    description: "Temukan toko buku anak di Bintaro dan BSD — koleksi buku cerita, buku pelajaran, dan buku edukatif untuk anak.",
    locale: "id_ID",
    type: "website",
  },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Toko Buku Anak di Tangerang Selatan", item: `${SITE_URL}/bookstores` },
  ],
};

const collectionLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Toko Buku Anak di Tangerang Selatan",
  description: "Temukan toko buku anak di Bintaro dan BSD — koleksi buku cerita, buku pelajaran, dan buku edukatif untuk anak.",
  url: `${SITE_URL}/bookstores`,
  isPartOf: { "@type": "WebSite", url: SITE_URL, name: "TangselKids" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      {children}
    </>
  );
}
