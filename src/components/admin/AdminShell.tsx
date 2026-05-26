"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb" }}>
      <AdminSidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <main style={{ flex: 1, padding: "32px 32px 64px" }} className="admin-main">
          {children}
        </main>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .admin-main { padding: 80px 16px 48px !important; }
        }
      `}</style>
    </div>
  );
}
