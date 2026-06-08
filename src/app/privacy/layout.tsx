import type { Metadata } from "next";

const SITE_URL = "https://tangselkids.com";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan Privasi TangselKids — bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadimu sesuai UU Perlindungan Data Pribadi (UU PDP) Indonesia.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: "Kebijakan Privasi | TangselKids",
    description: "Bagaimana TangselKids mengumpulkan, menggunakan, dan melindungi data pribadimu.",
    url: `${SITE_URL}/privacy`,
    siteName: "TangselKids",
    locale: "id_ID",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
