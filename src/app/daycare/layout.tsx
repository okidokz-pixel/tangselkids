import type { Metadata } from "next";

const SITE_URL = "https://tangselkids.com";

export const metadata: Metadata = {
  title: "Daycare di Tangerang Selatan",
  description: "Cari daycare terpercaya di Bintaro dan BSD untuk si kecil. Lihat fasilitas, harga bulanan, rasio pengasuh, dan metode perawatan di TangselKids.",
  openGraph: {
    title: "Daycare di Tangerang Selatan | TangselKids",
    description: "Cari daycare terpercaya di Bintaro dan BSD untuk si kecil. Lihat fasilitas, harga bulanan, rasio pengasuh, dan metode perawatan.",
    locale: "id_ID",
    type: "website",
  },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Daycare di Tangerang Selatan", item: `${SITE_URL}/daycare` },
  ],
};

const collectionLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Daycare di Tangerang Selatan",
  description: "Cari daycare terpercaya di Bintaro dan BSD untuk si kecil. Lihat fasilitas, harga bulanan, rasio pengasuh, dan metode perawatan.",
  url: `${SITE_URL}/daycare`,
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
