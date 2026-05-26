import type { Metadata } from "next";

const SITE_URL = "https://tangselkids.com";

export const metadata: Metadata = {
  title: "Tempat Kursus & Les Anak di Tangerang Selatan",
  description: "Temukan tempat kursus dan les anak di Bintaro dan BSD — bahasa Inggris, matematika, musik, seni, coding, dan lebih banyak lagi di TangselKids.",
  openGraph: {
    title: "Kursus & Les Anak di Tangerang Selatan | TangselKids",
    description: "Temukan tempat kursus dan les anak di Bintaro dan BSD — bahasa Inggris, matematika, musik, seni, coding, dan lebih banyak lagi.",
    locale: "id_ID",
    type: "website",
  },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Tempat Kursus & Les Anak di Tangerang Selatan", item: `${SITE_URL}/learning-centers` },
  ],
};

const collectionLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Tempat Kursus & Les Anak di Tangerang Selatan",
  description: "Temukan tempat kursus dan les anak di Bintaro dan BSD — bahasa Inggris, matematika, musik, seni, coding, dan lebih banyak lagi.",
  url: `${SITE_URL}/learning-centers`,
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
