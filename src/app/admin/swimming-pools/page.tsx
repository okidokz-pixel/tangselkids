"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { getSwimmingPools, toggleSwimmingPoolFeatured } from "../actions";

type Pool = Awaited<ReturnType<typeof getSwimmingPools>>[number];

export default function SwimmingPoolsPage() {
  const [items, setItems] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("all");
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getSwimmingPools().then((data) => { setItems(data); setLoading(false); });
  }, []);

  function handleFeaturedToggle(id: string, current: boolean) {
    setItems((prev) => prev.map((s) => s.id === id ? { ...s, is_featured: !current } : s));
    startTransition(async () => { await toggleSwimmingPoolFeatured(id, !current); });
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
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0e1d4f", margin: 0 }}>Kolam Renang</h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
            {loading ? "Loading…" : `${filtered.length} of ${items.length} kolam`}
          </p>
        </div>
        <Link href="/admin/swimming-pools/new"
          style={{ padding: "10px 20px", borderRadius: 8, background: "#0e1d4f", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          + Add Kolam Renang
        </Link>
      </div>

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

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "clip" }}>
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
            ) : filtered.map((sp) => (
              <tr key={sp.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ ...tdStyle, maxWidth: 300 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {sp.photo_1 || sp.logo_url ? (
                      <img src={(sp.logo_url || sp.photo_1) as string} alt=""
                        style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid #e5e7eb" }} />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🏊</div>
                    )}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{sp.name}</div>
                      {sp.slug && <div style={{ fontSize: 12, color: "#9ca3af" }}>/{sp.slug}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ ...tdStyle, fontSize: 13, color: "#6b7280" }}>{sp.area || "—"}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <button type="button" onClick={() => handleFeaturedToggle(sp.id, sp.is_featured ?? false)}
                    disabled={isPending}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, opacity: isPending ? 0.5 : 1 }}
                    title={sp.is_featured ? "Remove from featured" : "Mark as featured"}>
                    {sp.is_featured ? "⭐" : "☆"}
                  </button>
                </td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <Link href={`/admin/swimming-pools/${sp.id}`}
                      style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: "#dbeafe", color: "#1e40af", textDecoration: "none" }}>
                      Edit
                    </Link>
                    {sp.slug && (
                      <a href={`/place/${sp.slug}`} target="_blank" rel="noopener noreferrer"
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
