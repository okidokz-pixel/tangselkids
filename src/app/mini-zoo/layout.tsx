import type { Metadata } from "next";

const SITE_URL = "https://tangselkids.com";

export const metadata: Metadata = {
  title: "Mini Zoo & Wisata Edukasi Anak di Tangerang Selatan",
  description: "Rekomendasi mini zoo dan wisata edukasi anak di Bintaro dan BSD. Cek harga tiket, koleksi hewan, dan fasilitas di TangselKids.",
  openGraph: {
    title: "Mini Zoo di Tangerang Selatan | TangselKids",
    description: "Rekomendasi mini zoo dan wisata edukasi anak di Bintaro dan BSD. Cek harga tiket, koleksi hewan, dan fasilitas.",
    locale: "id_ID",
    type: "website",
  },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Mini Zoo & Wisata Edukasi Anak di Tangerang Selatan", item: `${SITE_URL}/mini-zoo` },
  ],
};

const collectionLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Mini Zoo & Wisata Edukasi Anak di Tangerang Selatan",
  description: "Rekomendasi mini zoo dan wisata edukasi anak di Bintaro dan BSD. Cek harga tiket, koleksi hewan, dan fasilitas.",
  url: `${SITE_URL}/mini-zoo`,
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
