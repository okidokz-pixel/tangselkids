import Link from "next/link";
import { getDashboardStats } from "./actions";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Total Sekolah", value: stats.schools, href: "/admin/schools", color: "#eff2fa", accent: "#0e1d4f", icon: "🏫" },
    { label: "Featured Sekolah", value: stats.featuredSchools, href: "/admin/schools?featured=true", color: "#fef3c7", accent: "#b45309", icon: "⭐" },
    { label: "Total Tempat Kursus", value: stats.learningCenters, href: "/admin/learning-centers", color: "#e6f4ed", accent: "#2e8a5a", icon: "📚" },
    { label: "Featured Tempat Kursus", value: stats.featuredLC, href: "/admin/learning-centers", color: "#fef3c7", accent: "#b45309", icon: "⭐" },
    { label: "Total Articles", value: stats.articles, href: "/admin/articles", color: "#f0fdf4", accent: "#15803d", icon: "📝" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0e1d4f", margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: "#6b7280", marginTop: 6 }}>Welcome back. Here's a quick overview.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 40 }}>
        {cards.map((c) => (
          <Link key={c.label} href={c.href} style={{ textDecoration: "none" }}>
            <div style={{
              background: c.color, borderRadius: 12, padding: "20px 24px",
              border: `1px solid ${c.accent}22`, cursor: "pointer",
              transition: "transform 0.1s, box-shadow 0.1s",
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: c.accent }}>{c.value}</div>
              <div style={{ fontSize: 13, color: c.accent, fontWeight: 500, marginTop: 4 }}>{c.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#374151", marginBottom: 12 }}>Quick Actions</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <QuickAction href="/admin/schools/new" label="Add New School" icon="🏫" />
          <QuickAction href="/admin/articles/new" label="Write New Article" icon="✏️" />
          <QuickAction href="/admin/analytics" label="View Analytics" icon="📊" />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 18px", borderRadius: 10,
        background: "#fff", border: "1.5px solid #e5e7eb",
        fontSize: 14, fontWeight: 500, color: "#374151",
        cursor: "pointer",
      }}>
        <span>{icon}</span>
        {label}
      </div>
    </Link>
  );
}
