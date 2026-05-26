import type { Metadata } from "next";

const SITE_URL = "https://tangselkids.com";

export const metadata: Metadata = {
  title: "Klinik Anak di Tangerang Selatan",
  description: "Daftar klinik anak dan dokter spesialis anak di Bintaro dan BSD. Cek layanan, estimasi biaya konsultasi, dan jam praktik di TangselKids.",
  openGraph: {
    title: "Klinik Anak di Tangerang Selatan | TangselKids",
    description: "Daftar klinik anak dan dokter spesialis anak di Bintaro dan BSD. Cek layanan, estimasi biaya konsultasi, dan jam praktik.",
    locale: "id_ID",
    type: "website",
  },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Klinik Anak di Tangerang Selatan", item: `${SITE_URL}/clinics` },
  ],
};

const collectionLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Klinik Anak di Tangerang Selatan",
  description: "Daftar klinik anak dan dokter spesialis anak di Bintaro dan BSD. Cek layanan, estimasi biaya konsultasi, dan jam praktik.",
  url: `${SITE_URL}/clinics`,
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
