import type { Metadata } from "next";

const SITE_URL = "https://tangselkids.com";

export const metadata: Metadata = {
  title: "Playground & Tempat Bermain Anak di Tangerang Selatan",
  description: "Rekomendasi playground indoor dan outdoor di Bintaro dan BSD. Harga tiket, usia anak, dan ulasan orang tua di TangselKids.",
  openGraph: {
    title: "Playground Anak di Tangerang Selatan | TangselKids",
    description: "Rekomendasi playground indoor dan outdoor di Bintaro dan BSD. Harga tiket, usia anak, dan ulasan orang tua.",
    locale: "id_ID",
    type: "website",
  },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Playground & Tempat Bermain Anak di Tangerang Selatan", item: `${SITE_URL}/playgrounds` },
  ],
};

const collectionLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Playground & Tempat Bermain Anak di Tangerang Selatan",
  description: "Rekomendasi playground indoor dan outdoor di Bintaro dan BSD. Harga tiket, usia anak, dan ulasan orang tua.",
  url: `${SITE_URL}/playgrounds`,
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
