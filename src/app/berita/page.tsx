"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Clock, ArrowRight } from "lucide-react";
import { articles } from "@/lib/articles";
import { BottomNav } from "@/components/BottomNav";
import { ActionButton } from "@/components/ActionButton";

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  "Parenting":       { bg: "#fde9c8", color: "#b45309" },
  "Sekolah":         { bg: "#dbeafe", color: "#1d4ed8" },
  "Aktivitas":       { bg: "#d4ead7", color: "#15803d" },
  "Tumbuh Kembang":  { bg: "#fce7f3", color: "#be185d" },
  "Tips Orang Tua":  { bg: "#ede9fe", color: "#7c3aed" },
  "Pendidikan":      { bg: "#dbeafe", color: "#1d4ed8" },
  "Kesehatan":       { bg: "#d1fae5", color: "#065f46" },
  "Review":          { bg: "#f3dccb", color: "#c47a14" },
};

function CategoryChip({ category }: { category: string }) {
  const style = CATEGORY_COLORS[category] ?? { bg: "#e8eaef", color: "#64748b" };
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px", borderRadius: 999,
      fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
      background: style.bg, color: style.color,
      whiteSpace: "nowrap",
    }}>
      {category}
    </span>
  );
}

export default function BeritaPage() {
  const router = useRouter();

  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#f8fafc", paddingBottom: 110 }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(150deg,#1e3a5f 0%,#1d4ed8 55%,#3b82f6 100%)",
        borderRadius: "0 0 28px 28px", padding: "44px 20px 22px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ActionButton
            onClick={() => router.back()}
            style={{
              width: 36, height: 36, borderRadius: 999, flexShrink: 0,
              background: "rgba(255,255,255,0.18)", display: "inline-flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <ChevronLeft size={20} color="white" />
          </ActionButton>
          <div>
            <h1 style={{
              margin: 0,
              fontFamily: "var(--font-fraunces),Georgia,serif",
              fontSize: 26, fontWeight: 600, letterSpacing: -0.5, lineHeight: 1, color: "#fff",
            }}>
              Berita & Artikel
            </h1>
            <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.6)", fontSize: 12,
              fontFamily: "var(--font-jakarta),sans-serif" }}>
              {articles.length} artikel tersedia
            </p>
          </div>
        </div>
      </div>

      {/* Article list */}
      <div style={{ padding: "20px 16px 8px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {articles.map((article) => (
            <Link key={article.id} href={`/berita/${article.id}`} style={{ textDecoration: "none", display: "block" }}>
              <div style={{
                background: "#fff",
                borderRadius: 20,
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 0 rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.06)",
                padding: 16,
                display: "flex", gap: 14, alignItems: "flex-start",
              }}>
                {/* Emoji thumbnail */}
                <div style={{
                  width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                  background: "#f1f5f9",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28,
                }}>
                  {article.emoji}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <CategoryChip category={article.category} />
                  </div>
                  <p style={{
                    margin: "0 0 6px",
                    fontFamily: "var(--font-fraunces),Georgia,serif",
                    fontSize: 14.5, fontWeight: 600, color: "#1e3a5f",
                    lineHeight: 1.3, letterSpacing: -0.2,
                  }}>
                    {article.title}
                  </p>
                  <p style={{
                    margin: "0 0 8px",
                    fontFamily: "var(--font-jakarta),sans-serif",
                    fontSize: 12, color: "#64748b", lineHeight: 1.55,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  } as React.CSSProperties}>
                    {article.summary}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "var(--font-jakarta),sans-serif",
                      fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                      {article.date}
                    </span>
                    <span style={{ width: 3, height: 3, borderRadius: 999, background: "#cbd5e1", flexShrink: 0 }} />
                    <span style={{ display: "flex", alignItems: "center", gap: 3,
                      fontFamily: "var(--font-jakarta),sans-serif",
                      fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                      <Clock size={10} strokeWidth={2} />
                      {article.readTime}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ flexShrink: 0, paddingTop: 18 }}>
                  <ArrowRight size={16} color="#cbd5e1" strokeWidth={2} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <BottomNav active="explore" />
    </div>
  );
}
