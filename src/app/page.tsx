import type { Metadata } from "next";
import Link from "next/link";
import HomeClient from "./HomeClient";

const SITE_URL = "https://tangselkids.com";

export const metadata: Metadata = {
  title: "Direktori Sekolah dan Tempat Les/Kursus Anak di Bintaro & BSD",
  description:
    "TangselKids — direktori hyperlokal untuk orang tua di Tangerang Selatan. Temukan & bandingkan sekolah, daycare, tempat kursus, playground, dan klinik anak terbaik di Bintaro dan BSD.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Direktori Sekolah dan Tempat Les/Kursus Anak di Bintaro & BSD | TangselKids",
    description:
      "TangselKids — direktori hyperlokal untuk orang tua di Tangerang Selatan. Temukan & bandingkan sekolah, daycare, tempat kursus, playground, dan klinik anak terbaik di Bintaro dan BSD.",
    url: SITE_URL,
    siteName: "TangselKids",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "TangselKids — Direktori Anak Bintaro & BSD" }],
  },
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "TangselKids",
  url: SITE_URL,
  description:
    "Direktori hyperlokal untuk orang tua di Tangerang Selatan — temukan sekolah, daycare, tempat bermain, klinik anak, dan lebih banyak lagi.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/explore?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TangselKids",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  description:
    "Direktori hyperlokal untuk orang tua di Tangerang Selatan — sekolah, daycare, playground, klinik anak, dan lebih banyak lagi di Bintaro dan BSD.",
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Tangerang Selatan",
  },
};

const CATEGORIES = [
  { href: "/schools",          label: "Sekolah di Tangerang Selatan" },
  { href: "/learning-centers", label: "Tempat Kursus & Les Anak" },
  { href: "/daycare",          label: "Daycare Bintaro & BSD" },
  { href: "/playgrounds",      label: "Playground & Tempat Bermain Anak" },
  { href: "/clinics",          label: "Klinik Anak Tangerang Selatan" },
  { href: "/cafes",            label: "Kafe Ramah Anak" },
  { href: "/mini-zoo",         label: "Mini Zoo & Wisata Edukasi Anak" },
  { href: "/swimming-pools",   label: "Kolam Renang Anak" },
  { href: "/bookstores",       label: "Toko Buku Anak" },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />

      {/* Crawlable category nav — always in SSR HTML for Googlebot */}
      <nav aria-label="Kategori" style={{
        position: "absolute", width: 1, height: 1,
        overflow: "hidden", clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap", border: 0,
      }}>
        <ul>
          {CATEGORIES.map(({ href, label }) => (
            <li key={href}>
              <Link href={href}>{label}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <HomeClient />
    </>
  );
}
