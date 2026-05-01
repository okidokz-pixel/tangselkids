"use client";
import { useRouter } from "next/navigation";
import { use } from "react";
import { ChevronLeft, Clock, ArrowLeft } from "lucide-react";
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

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const article = articles.find(a => a.id === id);

  if (!article) {
    return (
      <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#f8fafc",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "0 24px", gap: 16 }}>
        <span style={{ fontSize: 48 }}>📰</span>
        <p style={{ fontFamily: "var(--font-fraunces),Georgia,serif", fontSize: 20, fontWeight: 600,
          color: "#1e3a5f", textAlign: "center", margin: 0 }}>
          Artikel tidak ditemukan
        </p>
        <ActionButton
          onClick={() => router.back()}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
            borderRadius: 12, background: "#1d4ed8", color: "#fff",
            fontSize: 13, fontWeight: 700 }}>
          <ArrowLeft size={14} />
          Kembali
        </ActionButton>
      </div>
    );
  }

  const catStyle = CATEGORY_COLORS[article.category] ?? { bg: "#e8eaef", color: "#64748b" };

  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#f8fafc", paddingBottom: 110 }}>

      {/* ── Hero image with overlaid header ──────────────────────────── */}
      <div style={{ position: "relative", height: 280 }}>

        {/* Photo */}
        <img
          src={article.photo}
          alt={article.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />

        {/* Dark gradient overlay — top for back button, bottom for title */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.70) 100%)",
        }} />

        {/* Back button — top left */}
        <div style={{ position: "absolute", top: 44, left: 20 }}>
          <ActionButton
            onClick={() => router.back()}
            style={{
              width: 36, height: 36, borderRadius: 999,
              background: "rgba(0,0,0,0.32)", display: "inline-flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <ChevronLeft size={20} color="white" />
          </ActionButton>
        </div>

        {/* Category chip — top right */}
        <div style={{ position: "absolute", top: 50, right: 20 }}>
          <span style={{
            display: "inline-block", padding: "4px 10px", borderRadius: 999,
            fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4,
            background: "rgba(0,0,0,0.32)", color: "rgba(255,255,255,0.92)",
          }}>
            {article.category}
          </span>
        </div>

        {/* Title + meta — bottom of image */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 20px" }}>
          <h1 style={{
            margin: "0 0 10px",
            fontFamily: "var(--font-fraunces),Georgia,serif",
            fontSize: 22, fontWeight: 600, letterSpacing: -0.4,
            lineHeight: 1.25, color: "#fff",
          }}>
            {article.title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{article.emoji}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
              {article.date}
            </span>
            <span style={{ width: 3, height: 3, borderRadius: 999, background: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
            <span style={{ display: "flex", alignItems: "center", gap: 4,
              fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
              <Clock size={11} strokeWidth={2} color="rgba(255,255,255,0.75)" />
              {article.readTime}
            </span>
          </div>
        </div>
      </div>

      {/* ── Article body ─────────────────────────────────────────────── */}
      <div style={{ padding: "24px 20px 8px" }}>

        {/* Summary / lead */}
        <div style={{
          background: catStyle.bg, borderRadius: 16, padding: "14px 16px",
          marginBottom: 24, borderLeft: `3px solid ${catStyle.color}`,
        }}>
          <p style={{
            margin: 0,
            fontFamily: "var(--font-jakarta),sans-serif",
            fontSize: 13.5, color: catStyle.color, fontWeight: 600,
            lineHeight: 1.6,
          }}>
            {article.summary}
          </p>
        </div>

        {/* Content paragraphs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {article.content.map((para, i) => (
            <p key={i} style={{
              margin: 0,
              fontFamily: "var(--font-jakarta),sans-serif",
              fontSize: 14, color: "#374151", lineHeight: 1.75,
            }}>
              {para}
            </p>
          ))}
        </div>

        {/* Bottom category tag */}
        <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, letterSpacing: 0.4,
            textTransform: "uppercase" }}>Topik</span>
          <div style={{ marginTop: 8 }}>
            <span style={{
              display: "inline-block", padding: "5px 12px", borderRadius: 999,
              fontSize: 12, fontWeight: 700,
              background: catStyle.bg, color: catStyle.color,
            }}>
              {article.category}
            </span>
          </div>
        </div>

        {/* Back button */}
        <ActionButton
          onClick={() => router.back()}
          style={{
            marginTop: 24, width: "100%", padding: "14px 0",
            borderRadius: 14, background: "#f1f5f9",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontSize: 13.5, fontWeight: 700, color: "#475569",
          }}
        >
          <ArrowLeft size={15} strokeWidth={2.5} />
          Kembali ke Artikel
        </ActionButton>

      </div>

      <BottomNav active="explore" />
    </div>
  );
}
