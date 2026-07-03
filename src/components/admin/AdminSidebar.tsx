"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, Inbox, Star, MessageCircle, FileText, LineChart,
  BadgeCheck, FilePen,
  type LucideIcon,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getDraftsCount } from "@/app/admin/actions";
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
  const [loggingOut, setLoggingOut] = useState(false);
  const [draftCount, setDraftCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    getDraftsCount()
      .then((n) => { if (alive) setDraftCount(n); })
      .catch(() => {});
    return () => { alive = false; };
  }, [pathname]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      // Local scope: clears the session cookies without a server-side revoke call.
      // Race it against a short timeout — @supabase/ssr's browser client runs auth
      // ops through the Web Locks API, and that await can hang indefinitely (stuck
      // on "Keluar…"). The cookie clear happens fast; we just don't wait forever.
      const supabase = getSupabaseBrowserClient();
      await Promise.race([
        supabase.auth.signOut({ scope: "local" }),
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);
    } catch {
      // Ignore — we redirect regardless so the admin never gets stuck.
    }
    // Hard redirect so middleware re-runs with the cleared cookies and confirms
    // the sign-out (a soft router.push can leave the server session in place).
    window.location.href = "/admin/login";
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
        <Link
          href="/admin/drafts"
          className={isActive("/admin/drafts") ? "active" : ""}
          onClick={onNavigate}
          style={{ paddingLeft: 12, color: "#b45309", fontWeight: 600 }}
        >
          <FilePen size={16} strokeWidth={1.8} style={{ color: "#d97706" }} />
          <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Drafts{draftCount != null ? ` (${draftCount})` : ""}
          </span>
        </Link>
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
