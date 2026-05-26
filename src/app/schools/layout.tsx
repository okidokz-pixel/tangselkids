import type { Metadata } from "next";

const SITE_URL = "https://tangselkids.com";

export const metadata: Metadata = {
  title: "Sekolah di Tangerang Selatan",
  description: "Temukan daftar lengkap sekolah di Bintaro dan BSD — TK, SD, SMP, SMA. Bandingkan kurikulum, biaya SPP, dan fasilitas di TangselKids.",
  openGraph: {
    title: "Sekolah di Tangerang Selatan | TangselKids",
    description: "Temukan daftar lengkap sekolah di Bintaro dan BSD — TK, SD, SMP, SMA. Bandingkan kurikulum, biaya SPP, dan fasilitas.",
    locale: "id_ID",
    type: "website",
  },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Sekolah di Tangerang Selatan", item: `${SITE_URL}/schools` },
  ],
};

const collectionLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Sekolah di Tangerang Selatan",
  description: "Temukan daftar lengkap sekolah di Bintaro dan BSD — TK, SD, SMP, SMA. Bandingkan kurikulum, biaya SPP, dan fasilitas.",
  url: `${SITE_URL}/schools`,
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
