"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { OptimizedImage } from "@/components/OptimizedImage";
import { getPlaygrounds, togglePlaygroundFeatured } from "../actions";

type PG = Awaited<ReturnType<typeof getPlaygrounds>>[number];

export default function AdminPlaygroundsPage() {
  const [items, setItems] = useState<PG[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("all");
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getPlaygrounds().then((data) => { setItems(data); setLoading(false); });
  }, []);

  function handleFeaturedToggle(id: string, current: boolean) {
    setItems((prev) => prev.map((s) => s.id === id ? { ...s, is_featured: !current } : s));
    startTransition(async () => { await togglePlaygroundFeatured(id, !current); });
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
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0e1d4f", margin: 0 }}>Playgrounds</h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
            {loading ? "Loading…" : `${filtered.length} of ${items.length} playgrounds`}
          </p>
        </div>
        <Link href="/admin/playgrounds/new"
          style={{ padding: "10px 20px", borderRadius: 8, background: "#0e1d4f", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          + Add Playground
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
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
          <input type="checkbox" checked={filterFeatured} onChange={(e) => setFilterFeatured(e.target.checked)} />
          Featured only
        </label>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "clip" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Tipe</th>
              <th style={thStyle}>Area</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Featured</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>No results.</td></tr>
            ) : filtered.map((pg) => (
              <tr key={pg.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ ...tdStyle, maxWidth: 280 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {pg.photo_1 || pg.logo_url ? (
                      <OptimizedImage src={(pg.logo_url || pg.photo_1) as string} alt="" width={36} height={36} sizes="36px"
                        style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid #e5e7eb" }} />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#e6f4ed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🎠</div>
                    )}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{pg.name}</div>
                      {pg.slug && <div style={{ fontSize: 12, color: "#9ca3af" }}>/{pg.slug}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ ...tdStyle, fontSize: 12, color: "#6b7280" }}>
                  {(pg.playground_type_raw || pg.playground_type) ?? <span style={{ color: "#d1d5db" }}>—</span>}
                </td>
                <td style={{ ...tdStyle, fontSize: 13, color: "#6b7280" }}>{pg.area || "—"}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <button type="button" onClick={() => handleFeaturedToggle(pg.id, pg.is_featured ?? false)}
                    disabled={isPending}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, opacity: isPending ? 0.5 : 1 }}
                    title={pg.is_featured ? "Remove from featured" : "Mark as featured"}>
                    {pg.is_featured ? "⭐" : "☆"}
                  </button>
                </td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <Link href={`/admin/playgrounds/${pg.id}`}
                      style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: "#e6f4ed", color: "#2e8a5a", textDecoration: "none" }}>
                      Edit
                    </Link>
                    {pg.slug && (
                      <a href={`/place/${pg.slug}`} target="_blank" rel="noopener noreferrer"
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
