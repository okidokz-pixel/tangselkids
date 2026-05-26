import type { Metadata } from "next";

const SITE_URL = "https://tangselkids.com";

export const metadata: Metadata = {
  title: "Kafe Ramah Anak di Tangerang Selatan",
  description: "Rekomendasi kafe dan restoran ramah anak di Bintaro dan BSD — lengkap dengan area bermain, menu anak, dan suasana keluarga di TangselKids.",
  openGraph: {
    title: "Kafe Ramah Anak di Tangerang Selatan | TangselKids",
    description: "Rekomendasi kafe dan restoran ramah anak di Bintaro dan BSD — lengkap dengan area bermain, menu anak, dan suasana keluarga.",
    locale: "id_ID",
    type: "website",
  },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Kafe Ramah Anak di Tangerang Selatan", item: `${SITE_URL}/cafes` },
  ],
};

const collectionLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Kafe Ramah Anak di Tangerang Selatan",
  description: "Rekomendasi kafe dan restoran ramah anak di Bintaro dan BSD — lengkap dengan area bermain, menu anak, dan suasana keluarga.",
  url: `${SITE_URL}/cafes`,
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
