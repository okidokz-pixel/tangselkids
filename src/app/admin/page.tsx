import Link from "next/link";
import { getDashboardStats } from "./actions";
import { getGaStats } from "@/lib/ga-data";

export const metadata = { title: "Dashboard" };

const CATEGORY_META: Record<string, { label: string; href: string }> = {
  schools:          { label: "Sekolah",               href: "/admin/schools" },
  learning_centers: { label: "Tempat Kursus",          href: "/admin/learning-centers" },
  daycares:         { label: "Daycares",               href: "/admin/daycares" },
  playgrounds:      { label: "Playgrounds",            href: "/admin/playgrounds" },
  clinics:          { label: "Klinik Tumbuh Kembang",  href: "/admin/clinics" },
  cafes:            { label: "Kafe Ramah Anak",        href: "/admin/cafes" },
  mini_zoo:         { label: "Mini Zoo",               href: "/admin/mini-zoo" },
  swimming_pools:   { label: "Kolam Renang",           href: "/admin/swimming-pools" },
  bookstores:       { label: "Toko Buku & Alat Tulis", href: "/admin/bookstores" },
};

function fmt(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export default async function AdminDashboard() {
  const [stats, ga] = await Promise.all([
    getDashboardStats(),
    getGaStats().catch(() => null),
  ]);

  const totalEntries = stats.categories.reduce((s, c) => s + c.total, 0);
  const totalFeatured = stats.categories.reduce((s, c) => s + c.featured, 0);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0e1d4f", margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: "#6b7280", marginTop: 6 }}>Overview semua kategori.</p>
      </div>

      {/* GA traffic strip */}
      {ga && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
          <TrafficCard label="Aktif sekarang" value={String(ga.activeUsers)} accent="#22c55e" live />
          <TrafficCard label="Users hari ini" value={fmt(ga.today.users)} accent="#0e1d4f" />
          <TrafficCard label="Sessions hari ini" value={fmt(ga.today.sessions)} accent="#0e1d4f" />
          <TrafficCard label="Pageviews hari ini" value={fmt(ga.today.pageviews)} accent="#0e1d4f" />
          <TrafficCard label="Users 7 hari" value={fmt(ga.week.users)} accent="#6366f1" />
          <TrafficCard label="Pageviews 7 hari" value={fmt(ga.week.pageviews)} accent="#6366f1" />
        </div>
      )}

      {/* Content summary + top pages side by side */}
      <div style={{ display: "grid", gridTemplateColumns: ga ? "1fr 1fr" : "1fr", gap: 20, marginBottom: 28, alignItems: "start" }}>

        {/* Category table */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "clip" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0e1d4f" }}>Konten</h2>
            <span style={{ fontSize: 12, color: "#6b7280" }}>{totalEntries} entries · {totalFeatured} featured</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {stats.categories.map((cat) => {
                const meta = CATEGORY_META[cat.table];
                if (!meta) return null;
                return (
                  <tr key={cat.table} style={{ borderBottom: "1px solid #f9fafb" }}>
                    <td style={{ padding: "10px 20px", fontSize: 13, color: "#374151" }}>
                      <Link href={meta.href} style={{ textDecoration: "none", color: "inherit", fontWeight: 500 }}>{meta.label}</Link>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontSize: 13, fontWeight: 700, color: "#0e1d4f" }}>{cat.total}</td>
                    <td style={{ padding: "10px 20px 10px 4px", textAlign: "right" }}>
                      {cat.featured > 0 ? (
                        <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 20, background: "#fef3c7", color: "#b45309", fontWeight: 600 }}>
                          ⭐ {cat.featured}
                        </span>
                      ) : <span style={{ fontSize: 12, color: "#e5e7eb" }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Top pages */}
        {ga && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "clip" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0e1d4f" }}>Halaman Teratas</h2>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>7 hari · views</span>
            </div>
            {ga.topPages.slice(0, 9).map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: i < 8 ? "1px solid #f9fafb" : "none" }}>
                <span style={{ fontSize: 12, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80%" }}
                  title={p.path}>{p.path}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#0e1d4f", flexShrink: 0, marginLeft: 8 }}>{fmt(p.views)}</span>
              </div>
            ))}
            <div style={{ padding: "10px 20px", borderTop: "1px solid #f3f4f6" }}>
              <Link href="/admin/analytics" style={{ fontSize: 12, color: "#6b7280", textDecoration: "none", fontWeight: 500 }}>
                Lihat analytics lengkap →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 12 }}>Quick Actions</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <QuickAction href="/admin/schools/new" label="Tambah Sekolah" />
          <QuickAction href="/admin/articles/new" label="Tulis Artikel" />
          <QuickAction href="/admin/analytics" label="Lihat Analytics" />
        </div>
      </div>
    </div>
  );
}

function TrafficCard({ label, value, accent, live }: { label: string; value: string; accent: string; live?: boolean }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        {live && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />}
        <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: accent, letterSpacing: "-0.02em" }}>{value}</div>
    </div>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{ padding: "9px 16px", borderRadius: 8, background: "#fff", border: "1.5px solid #e5e7eb", fontSize: 13, fontWeight: 500, color: "#374151" }}>
        {label}
      </div>
    </Link>
  );
}

