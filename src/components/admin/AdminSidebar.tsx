"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createAdminClient } from "@/lib/supabase-browser";

const NAV_MAIN = [
  { label: "Dashboard",   href: "/admin" },
  { label: "Users",       href: "/admin/users" },
  { label: "Submissions", href: "/admin/submissions" },
  { label: "Reviews",     href: "/admin/reviews" },
  { label: "Feedback",    href: "/admin/feedback" },
  { label: "Articles",    href: "/admin/articles" },
  { label: "Analytics",   href: "/admin/analytics" },
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

// Sidebar colour tokens
const C = {
  bg: "linear-gradient(160deg, #0a2018 0%, #1f6b43 60%, #2e8a5a 100%)",
  solidBg: "#1f6b43",
  activeBg: "rgba(255,255,255,0.18)",
  activeText: "#ffffff",
  inactiveText: "rgba(255,255,255,0.70)",
  sectionLabel: "rgba(255,255,255,0.45)",
  divider: "rgba(255,255,255,0.15)",
  hoverBg: "rgba(255,255,255,0.08)",
};

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

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

  const sidebarContent = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
      {/* Logo */}
      <div style={{ padding: "16px 20px 14px", borderBottom: `1px solid ${C.divider}` }}>
        {!logoError ? (
          <div style={{ background: "#fff", borderRadius: 10, padding: "8px 12px", display: "inline-block" }}>
            <img
              src="https://szyujzbnfkkqwoeuyjwg.supabase.co/storage/v1/object/public/zzz/tangselkids-logo.png"
              alt="TangselKids"
              onError={() => setLogoError(true)}
              style={{ height: 36, width: "auto", objectFit: "contain", display: "block" }}
            />
          </div>
        ) : (
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#ffffff", letterSpacing: "-0.02em" }}>
              TangselKids
            </div>
            <div style={{ fontSize: 11, color: C.sectionLabel, marginTop: 2, fontWeight: 500 }}>
              Admin Dashboard
            </div>
          </div>
        )}
      </div>

      {/* Main nav */}
      <nav style={{ padding: "12px 8px", flex: 1, overflowY: "auto" }}>
        <div style={{ marginBottom: 4 }}>
          {NAV_MAIN.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: isActive(item.href) ? 600 : 400,
                color: isActive(item.href) ? C.activeText : C.inactiveText,
                background: isActive(item.href) ? C.activeBg : "transparent",
                textDecoration: "none",
                marginBottom: 2,
                transition: "background 0.1s",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div style={{ margin: "12px 8px 8px", fontSize: 11, fontWeight: 600, color: C.sectionLabel, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Kategori
        </div>

        {NAV_CATEGORIES.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "7px 12px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: isActive(item.href) ? 600 : 400,
              color: isActive(item.href) ? C.activeText : C.inactiveText,
              background: isActive(item.href) ? C.activeBg : "transparent",
              textDecoration: "none",
              marginBottom: 1,
            }}
          >
            <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px 8px", borderTop: `1px solid ${C.divider}` }}>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "8px 12px", borderRadius: 8,
            fontSize: 14, color: "rgba(255,120,120,0.9)", background: "transparent",
            border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit",
          }}
        >
          <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>↩</span>
          {loggingOut ? "Logging out…" : "Log Out"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        style={{
          width: 220, minWidth: 220, height: "100vh",
          position: "sticky", top: 0,
          background: C.bg,
          display: "flex", flexDirection: "column",
        }}
        className="hidden-mobile"
      >
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div
        style={{
          display: "none",
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          background: C.bg, borderBottom: `1px solid ${C.divider}`,
          padding: "12px 16px", alignItems: "center", justifyContent: "space-between",
        }}
        className="mobile-topbar"
      >
        <div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>TangselKids Admin</div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "rgba(255,255,255,0.8)" }}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.5)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 45,
          width: 240, background: C.bg, boxShadow: "2px 0 16px rgba(0,0,0,0.3)",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          display: "none",
        }}
        className="mobile-drawer"
      >
        {sidebarContent}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .mobile-topbar { display: flex !important; }
          .mobile-drawer { display: block !important; }
        }
      `}</style>
    </>
  );
}
