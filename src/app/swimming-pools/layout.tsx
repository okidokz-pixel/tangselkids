import type { Metadata } from "next";

const SITE_URL = "https://tangselkids.com";

export const metadata: Metadata = {
  title: "Kolam Renang Anak di Tangerang Selatan",
  description: "Daftar kolam renang anak di Bintaro dan BSD. Cek harga tiket, kedalaman kolam, fasilitas, dan jam buka di TangselKids.",
  openGraph: {
    title: "Kolam Renang Anak di Tangerang Selatan | TangselKids",
    description: "Daftar kolam renang anak di Bintaro dan BSD. Cek harga tiket, kedalaman kolam, fasilitas, dan jam buka.",
    locale: "id_ID",
    type: "website",
  },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Kolam Renang Anak di Tangerang Selatan", item: `${SITE_URL}/swimming-pools` },
  ],
};

const collectionLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Kolam Renang Anak di Tangerang Selatan",
  description: "Daftar kolam renang anak di Bintaro dan BSD. Cek harga tiket, kedalaman kolam, fasilitas, dan jam buka.",
  url: `${SITE_URL}/swimming-pools`,
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
