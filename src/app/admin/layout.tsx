import { Newsreader, Hanken_Grotesk } from "next/font/google";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = { title: { default: "Admin", template: "%s | Admin" } };

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell fontClass={`${newsreader.variable} ${hanken.variable}`}>
      {children}
    </AdminShell>
  );
}
