import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artikel & Tips Parenting",
  description: "Artikel parenting, tips memilih sekolah, tumbuh kembang anak, dan informasi terkini untuk orang tua di Tangerang Selatan dari TangselKids.",
  openGraph: {
    title: "Artikel & Tips Parenting | TangselKids",
    description: "Artikel parenting, tips memilih sekolah, tumbuh kembang anak, dan informasi terkini untuk orang tua di Tangerang Selatan.",
    locale: "id_ID",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
