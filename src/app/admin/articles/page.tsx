"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { OptimizedImage } from "@/components/OptimizedImage";
import { getArticles } from "../actions";

type Article = Awaited<ReturnType<typeof getArticles>>[number];

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    getArticles().then((data) => { setArticles(data); setLoading(false); });
  }, []);

  const filtered = articles.filter((a) => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || (filterStatus === "published" ? a.is_published : !a.is_published);
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0e1d4f", margin: 0 }}>Articles</h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
            {loading ? "Loading…" : `${filtered.length} of ${articles.length} articles`}
          </p>
        </div>
        <Link href="/admin/articles/new"
          style={{ padding: "10px 20px", borderRadius: 8, background: "#0e1d4f", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          + New Article
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles…"
          style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid #d1d5db", fontSize: 13, outline: "none", minWidth: 220 }} />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #d1d5db", fontSize: 13, outline: "none", background: "#fff" }}>
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "clip" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={thStyle}>Article</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Published</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>No articles found.</td></tr>
            ) : filtered.map((article) => (
              <tr key={article.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ ...tdStyle, maxWidth: 400 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {article.cover_image_url ? (
                      <OptimizedImage src={article.cover_image_url} alt="" width={48} height={36} sizes="48px" style={{ width: 48, height: 36, borderRadius: 6, objectFit: "cover", flexShrink: 0, border: "1px solid #e5e7eb" }} />
                    ) : (
                      <div style={{ width: 48, height: 36, borderRadius: 6, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📝</div>
                    )}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{article.title}</div>
                      {article.slug && <div style={{ fontSize: 12, color: "#9ca3af" }}>/berita/{article.slug}</div>}
                    </div>
                  </div>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: article.is_published ? "#f0fdf4" : "#f3f4f6",
                    color: article.is_published ? "#15803d" : "#6b7280",
                  }}>
                    {article.is_published ? "Published" : "Draft"}
                  </span>
                </td>
                <td style={{ ...tdStyle, fontSize: 13, color: "#6b7280" }}>
                  {article.published_at ? new Date(article.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <Link href={`/admin/articles/${article.id}`}
                      style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: "#eff2fa", color: "#0e1d4f", textDecoration: "none" }}>
                      Edit
                    </Link>
                    {article.is_published && article.slug && (
                      <a href={`/berita/${article.slug}`} target="_blank" rel="noopener noreferrer"
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
