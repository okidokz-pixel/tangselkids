"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import "./admin-theme.css";

export function AdminShell({ children, fontClass = "" }: { children: React.ReactNode; fontClass?: string }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isLogin = pathname === "/admin/login";
  const isDashboard = pathname === "/admin";

  if (isLogin) {
    return <div className={fontClass}>{children}</div>;
  }

  return (
    <div className={`admin-warm app ${fontClass} ${drawerOpen ? "drawer-open" : ""}`}>
      <div className="mobile-backdrop" onClick={() => setDrawerOpen(false)} />
      <AdminSidebar onNavigate={() => setDrawerOpen(false)} />
      <div className="main">
        {/* Mobile-only chrome (desktop tool, but keep it reachable) */}
        <div className="mobile-topbar">
          <span className="mt-brand">Tangsel<span style={{ color: "var(--primary)" }}>.</span>Kids</span>
          <button className="mt-toggle" aria-label="Menu" onClick={() => setDrawerOpen((v) => !v)}>
            {drawerOpen ? "✕" : "☰"}
          </button>
        </div>

        {isDashboard ? (
          children
        ) : (
          <div className="content" style={{ paddingTop: 28 }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
