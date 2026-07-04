"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Copy } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import { getSchools, toggleSchoolFeatured } from "../actions";

type School = Awaited<ReturnType<typeof getSchools>>[number];

const JENJANG_COLORS: Record<string, string> = {
  Preschool: "#fef3c7", TK: "#fce7f3", SD: "#eff2fa", SMP: "#f0fdf4", SMA: "#fef2f2", SMK: "#eef2ff",
};

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("all");
  const [filterJenjang, setFilterJenjang] = useState("all");
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("featured") === "true") setFilterFeatured(true);
    }
  }, []);

  useEffect(() => {
    getSchools().then((data) => { setSchools(data); setLoading(false); });
  }, []);

  function handleFeaturedToggle(id: string, current: boolean) {
    setSchools((prev) => prev.map((s) => s.id === id ? { ...s, is_featured: !current } : s));
    startTransition(async () => {
      await toggleSchoolFeatured(id, !current);
    });
  }

  const filtered = schools.filter((s) => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    const areaWide = s.area === "All" || s.area === "Semua Area" || s.area === "Bintaro/BSD";
    const matchArea = filterArea === "all" || s.area === filterArea
      || (filterArea === "Bintaro"   && s.area?.includes("Bintaro"))
      || (filterArea === "BSD"       && s.area?.includes("BSD"))
      || (filterArea === "Tangerang" && s.area === "Tangerang")
      || (filterArea !== "all" && filterArea !== "All" && areaWide);
    const matchJenjang = filterJenjang === "all" || s.jenjang === filterJenjang;
    const matchFeatured = !filterFeatured || s.is_featured;
    return matchSearch && matchArea && matchJenjang && matchFeatured;
  });

  const areas = ["all", "Bintaro", "BSD", "Tangerang", "All"];
  const jenjangs = ["all", "Preschool", "TK", "SD", "SMP", "SMA", "SMK"];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0e1d4f", margin: 0 }}>
            {filterFeatured ? "⭐ Featured Schools" : "Schools"}
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
            {loading ? "Loading…" : `${filtered.length} of ${schools.length} schools`}
            {filterFeatured && <button onClick={() => setFilterFeatured(false)} style={{ marginLeft: 10, fontSize: 12, color: "#6b7280", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Show all</button>}
          </p>
        </div>
        <Link
          href="/admin/schools/new"
          style={{
            padding: "10px 20px", borderRadius: 8, background: "#0e1d4f", color: "#fff",
            fontSize: 14, fontWeight: 600, textDecoration: "none",
          }}
        >
          + Add School
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search schools…"
          style={{
            padding: "8px 14px", borderRadius: 8, border: "1.5px solid #d1d5db",
            fontSize: 13, outline: "none", minWidth: 220,
          }}
        />
        <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #d1d5db", fontSize: 13, outline: "none", background: "#fff" }}>
          {areas.map((a) => <option key={a} value={a}>{a === "all" ? "All Areas" : a}</option>)}
        </select>
        <select value={filterJenjang} onChange={(e) => setFilterJenjang(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #d1d5db", fontSize: 13, outline: "none", background: "#fff" }}>
          {jenjangs.map((j) => <option key={j} value={j}>{j === "all" ? "All Jenjang" : j}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="admin-table-wrap" style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={thStyle}>School</th>
              <th style={thStyle}>Jenjang</th>
              <th style={thStyle}>Area</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Featured</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>No schools found.</td></tr>
            ) : filtered.map((school) => (
              <tr key={school.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ ...tdStyle, maxWidth: 280 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {school.photo_1 || school.logo_url ? (
                      <OptimizedImage
                        src={(school.logo_url || school.photo_1) as string}
                        alt=""
                        width={36}
                        height={36}
                        sizes="36px"
                        style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid #e5e7eb" }}
                      />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#eff2fa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🏫</div>
                    )}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{school.name}</div>
                      {school.slug && <div style={{ fontSize: 12, color: "#9ca3af" }}>/{school.slug}</div>}
                    </div>
                  </div>
                </td>
                <td style={tdStyle}>
                  {school.jenjang ? (
                    <span style={{
                      padding: "2px 8px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                      background: JENJANG_COLORS[school.jenjang] ?? "#f3f4f6", color: "#374151",
                    }}>
                      {school.jenjang}
                    </span>
                  ) : <span style={{ color: "#d1d5db" }}>—</span>}
                </td>
                <td style={{ ...tdStyle, fontSize: 13, color: "#6b7280" }}>{school.area || "—"}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => handleFeaturedToggle(school.id, school.is_featured ?? false)}
                    disabled={isPending}
                    style={{
                      background: "none", border: "none", cursor: "pointer", fontSize: 18,
                      opacity: isPending ? 0.5 : 1,
                    }}
                    title={school.is_featured ? "Remove from featured" : "Mark as featured"}
                  >
                    {school.is_featured ? "⭐" : "☆"}
                  </button>
                </td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
                    <Link href={`/admin/schools/new?duplicate=${school.id}`}
                      title="Duplicate (e.g. for another jenjang)"
                      style={{ display: "inline-flex", alignItems: "center", padding: "5px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: "#f3f4f6", color: "#374151", textDecoration: "none" }}>
                      <Copy size={14} />
                    </Link>
                    <Link href={`/admin/schools/${school.id}`}
                      style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: "#eff2fa", color: "#0e1d4f", textDecoration: "none" }}>
                      Edit
                    </Link>
                    {school.slug && (
                      <a href={`/place/${school.slug}`} target="_blank" rel="noopener noreferrer"
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
