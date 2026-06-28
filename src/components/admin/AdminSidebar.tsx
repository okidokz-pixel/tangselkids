"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, Inbox, Star, MessageCircle, FileText, LineChart,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase-browser";
import { AdminLogo } from "./AdminLogo";

const NAV_MAIN: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Dashboard",   href: "/admin",             icon: LayoutDashboard },
  { label: "Users",       href: "/admin/users",       icon: Users },
  { label: "Submissions", href: "/admin/submissions",  icon: Inbox },
  { label: "Claims",      href: "/admin/claims",        icon: BadgeCheck },
  { label: "Reviews",     href: "/admin/reviews",       icon: Star },
  { label: "Feedback",    href: "/admin/feedback",     icon: MessageCircle },
  { label: "Articles",    href: "/admin/articles",     icon: FileText },
  { label: "Analytics",   href: "/admin/analytics",    icon: LineChart },
];

const NAV_CATEGORIES = [
  { label: "Sekolah", href: "/admin/schools" },
  { label: "Tempat Kursus", href: "/admin/learning-centers" },
  { label: "Daycares", href: "/admin/daycares" },
  { label: "Playgrounds", href: "/admin/playgrounds" },
  { label: "Klinik Tumbuh Kembang", href: "/admin/clinics" },
  { label: "Kafe Ramah Anak", href: "/admin/cafes" },
  { label: "Mini Zoo", href: "/admin/mini-zoo" },
  { label: "Kolam Renang", href: "/admin/swimming-pools" },
  { label: "Toko Buku & Alat Tulis", href: "/admin/bookstores" },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createAdminClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand">
        <AdminLogo height={38} fallback={<div className="brand-mark">T</div>} />
        <div>
          <div className="brand-name">Tangsel<span className="dot">.</span>Kids</div>
          <div className="brand-sub">Admin</div>
        </div>
      </div>

      <div className="nav-group-label">Menu</div>
      <nav className="nav">
        {NAV_MAIN.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className={isActive(href) ? "active" : ""} onClick={onNavigate}>
            <Icon size={17} strokeWidth={1.7} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="nav-group-label">Kategori</div>
      <nav className="nav">
        {NAV_CATEGORIES.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={isActive(href) ? "active" : ""}
            onClick={onNavigate}
            style={{ paddingLeft: 12 }}
          >
            <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {label}
            </span>
          </Link>
        ))}
      </nav>

      {/* Workspace / logout */}
      <div className="sidebar-foot">
        <button className="workspace" onClick={handleLogout} disabled={loggingOut} type="button">
          <div className="ws-avatar">N</div>
          <div className="ws-meta">
            <div className="ws-name">Admin</div>
            <div className="ws-role">{loggingOut ? "Keluar…" : "Log out"}</div>
          </div>
        </button>
      </div>
    </aside>
  );
}
