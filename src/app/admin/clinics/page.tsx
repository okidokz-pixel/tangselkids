"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Copy } from "lucide-react";
import { getClinics, toggleClinicFeatured } from "../actions";

type Clinic = Awaited<ReturnType<typeof getClinics>>[number];

export default function ClinicsPage() {
  const [items, setItems] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("all");
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getClinics().then((data) => { setItems(data); setLoading(false); });
  }, []);

  function handleFeaturedToggle(id: string, current: boolean) {
    setItems((prev) => prev.map((s) => s.id === id ? { ...s, is_featured: !current } : s));
    startTransition(async () => { await toggleClinicFeatured(id, !current); });
  }

  const filtered = items.filter((s) => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    const matchArea = filterArea === "all" || (s.area ?? "").includes(filterArea);
    const matchFeatured = !filterFeatured || s.is_featured;
    return matchSearch && matchArea && matchFeatured;
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0e1d4f", margin: 0 }}>Klinik Tumbuh Kembang</h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
            {loading ? "Loading…" : `${filtered.length} of ${items.length} klinik`}
          </p>
        </div>
        <Link href="/admin/clinics/new"
          style={{ padding: "10px 20px", borderRadius: 8, background: "#0e1d4f", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          + Add Klinik
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…"
          style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid #d1d5db", fontSize: 13, outline: "none", minWidth: 220 }} />
        <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #d1d5db", fontSize: 13, outline: "none", background: "#fff" }}>
          <option value="all">All Areas</option>
          <option value="Bintaro">Bintaro</option>
          <option value="BSD">BSD</option>
          <option value="Tangerang">Tangerang</option>
          <option value="All">All</option>
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
          <input type="checkbox" checked={filterFeatured} onChange={(e) => setFilterFeatured(e.target.checked)} />
          Featured only
        </label>
      </div>

      {/* Table */}
      <div className="admin-table-wrap" style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Area</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Featured</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>No results.</td></tr>
            ) : filtered.map((cl) => (
              <tr key={cl.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ ...tdStyle, maxWidth: 300 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {cl.photo_1 || cl.logo_url ? (
                      <OptimizedImage src={(cl.logo_url || cl.photo_1) as string} alt="" width={36} height={36} sizes="36px"
                        style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid #e5e7eb" }} />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#e6f0fd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🏥</div>
                    )}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{cl.name}</div>
                      {cl.slug && <div style={{ fontSize: 12, color: "#9ca3af" }}>/{cl.slug}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ ...tdStyle, fontSize: 13, color: "#6b7280" }}>{cl.area || "—"}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <button type="button" onClick={() => handleFeaturedToggle(cl.id, cl.is_featured ?? false)}
                    disabled={isPending}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, opacity: isPending ? 0.5 : 1 }}
                    title={cl.is_featured ? "Remove from featured" : "Mark as featured"}>
                    {cl.is_featured ? "⭐" : "☆"}
                  </button>
                </td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
                    <Link href={`/admin/clinics/new?duplicate=${cl.id}`}
                      title="Duplicate"
                      style={{ display: "inline-flex", alignItems: "center", padding: "5px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: "#f3f4f6", color: "#374151", textDecoration: "none" }}>
                      <Copy size={14} />
                    </Link>
                    <Link href={`/admin/clinics/${cl.id}`}
                      style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: "#e6f0fd", color: "#1d4ed8", textDecoration: "none" }}>
                      Edit
                    </Link>
                    {cl.slug && (
                      <a href={`/place/${cl.slug}`} target="_blank" rel="noopener noreferrer"
                        style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: "#f3f4f6", color: "#374151", textDecoration: "none" }}>
                        View ↗
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#6b7280", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.04em" };
const tdStyle: React.CSSProperties = { padding: "12px 16px", fontSize: 14, color: "#374151", verticalAlign: "middle" };
