import type { Metadata } from "next";

const SITE_URL = "https://tangselkids.com";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Syarat & Ketentuan penggunaan TangselKids — direktori fasilitas anak di Bintaro, BSD, dan Tangerang Selatan, termasuk ketentuan akun, keanggotaan Premium, dan pembayaran.",
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    title: "Syarat & Ketentuan | TangselKids",
    description: "Syarat & Ketentuan penggunaan layanan TangselKids.",
    url: `${SITE_URL}/terms`,
    siteName: "TangselKids",
    locale: "id_ID",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
