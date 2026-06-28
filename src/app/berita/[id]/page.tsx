"use client";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { ChevronLeft, Clock } from "lucide-react";
import { articles, localizeArticle } from "@/lib/articles";
import { fetchArticleBySlug, type DbArticle } from "@/lib/articles-db";
import { tiptapToHtml } from "@/lib/tiptap-render";
import { BottomNav } from "@/components/BottomNav";
import { ActionButton } from "@/components/ActionButton";
import { useLang } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { PremiumBadge } from "@/components/PremiumBadge";
import { OptimizedImage } from "@/components/OptimizedImage";
import { ShareButtons } from "@/components/ShareButtons";

const SITE_URL = "https://tangselkids.com";

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  "Parenting":       { bg: "#fde9c8", color: "#b45309" },
  "Sekolah":         { bg: "#e6f4ed", color: "#2e8a5a" },
  "Aktivitas":       { bg: "#d4ead7", color: "#15803d" },
  "Tumbuh Kembang":  { bg: "#fce7f3", color: "#be185d" },
  "Tips Orang Tua":  { bg: "#ede9fe", color: "#7c3aed" },
  "Pendidikan":      { bg: "#e6f4ed", color: "#2e8a5a" },
  "Kesehatan":       { bg: "#d1fae5", color: "#065f46" },
  "Review":          { bg: "#f3dccb", color: "#c47a14" },
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  } catch { return ""; }
}

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { t, lang } = useLang();
  useAuth();

  const [dbArticle, setDbArticle] = useState<DbArticle | null | "loading">("loading");

  // Check static articles first (fast, synchronous)
  const staticRaw = articles.find((a) => a.id === id);

  useEffect(() => {
    // Only fetch from Supabase if not a known static article ID
    if (!staticRaw) {
      fetchArticleBySlug(id).then(setDbArticle);
    } else {
      setDbArticle(null);
    }
  }, [id, staticRaw]);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!staticRaw && dbArticle === "loading") {
    return (
      <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#f6f1e8",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#94a3b8", fontSize: 14 }}>Loading…</div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!staticRaw && !dbArticle) {
    return (
      <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#f6f1e8",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "0 24px", gap: 16 }}>
        <span style={{ fontSize: 48 }}>📰</span>
        <p style={{ fontFamily: "var(--font-fraunces),Georgia,serif", fontSize: 20, fontWeight: 600,
          color: "#0e1d4f", textAlign: "center", margin: 0 }}>
          {t.articleNotFound}
        </p>
        <ActionButton onClick={() => router.back()} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
          borderRadius: 12, background: "#2e8a5a", color: "#fff", fontSize: 13, fontWeight: 700 }}>
          <ChevronLeft size={14} />{t.articleBackBtn}
        </ActionButton>
      </div>
    );
  }

  // ── Supabase (admin-created) article ──────────────────────────────────────
  if (dbArticle && dbArticle !== "loading") {
    const bodyHtml = tiptapToHtml(dbArticle.body);
    return (
      <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#f6f1e8", paddingBottom: 110, paddingTop: 52 }}>
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, height: 52, zIndex: 50,
          background: "linear-gradient(160deg, #0a2018 0%, #1f6b43 60%, #2e8a5a 100%)",
        }}>
          <div style={{ maxWidth: 448, margin: "0 auto", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px" }}>
            <ActionButton onClick={() => router.back()} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "7px 12px", borderRadius: 999,
              background: "rgba(255,255,255,0.18)", color: "#fff",
              fontSize: 13, fontWeight: 700, border: "1px solid rgba(255,255,255,0.22)",
            }}>
              <ChevronLeft size={14} strokeWidth={2.5} color="#fff" />{t.articleBackBtn}
            </ActionButton>
            <PremiumBadge />
          </div>
        </div>

        {/* Hero image */}
        {dbArticle.cover_image_url && (
          <div style={{ position: "relative", height: 240 }}>
            <OptimizedImage src={dbArticle.cover_image_url} alt={dbArticle.title} fill priority
              sizes="(max-width: 480px) 100vw, 440px"
              style={{ objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.65) 100%)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 20px" }}>
              <h1 style={{ margin: "0 0 8px", fontFamily: "var(--font-fraunces),Georgia,serif",
                fontSize: 22, fontWeight: 600, letterSpacing: -0.4, lineHeight: 1.25, color: "#fff" }}>
                {dbArticle.title}
              </h1>
              {dbArticle.published_at && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
                  {formatDate(dbArticle.published_at)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* No cover — show title inline */}
        {!dbArticle.cover_image_url && (
          <div style={{ padding: "24px 20px 0" }}>
            <h1 style={{ margin: 0, fontFamily: "var(--font-fraunces),Georgia,serif",
              fontSize: 24, fontWeight: 700, color: "#0e1d4f", lineHeight: 1.25 }}>
              {dbArticle.title}
            </h1>
            {dbArticle.published_at && (
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>{formatDate(dbArticle.published_at)}</div>
            )}
          </div>
        )}

        {/* Excerpt */}
        {dbArticle.excerpt && (
          <div style={{ margin: "20px 20px 0", background: "#e6f4ed", borderRadius: 14,
            padding: "12px 16px", borderLeft: "3px solid #2e8a5a" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-jakarta),sans-serif",
              fontSize: 13.5, color: "#2e8a5a", fontWeight: 600, lineHeight: 1.6 }}>
              {dbArticle.excerpt}
            </p>
          </div>
        )}

        {/* Body */}
        <div style={{ padding: "20px 20px 8px" }}
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
          className="article-body"
        />

        <style>{`
          .article-body p { font-family: var(--font-jakarta),sans-serif; font-size: 14px; color: #374151; line-height: 1.75; margin: 0 0 14px; }
          .article-body h2 { font-family: var(--font-fraunces),Georgia,serif; font-size: 20px; font-weight: 700; color: #0e1d4f; margin: 24px 0 10px; }
          .article-body h3 { font-family: var(--font-fraunces),Georgia,serif; font-size: 17px; font-weight: 700; color: #0e1d4f; margin: 20px 0 8px; }
          .article-body img { max-width: 100%; border-radius: 10px; margin: 16px 0; }
          .article-body a { color: #2e8a5a; text-decoration: underline; }
          .article-body blockquote { border-left: 3px solid #d1d5db; padding-left: 14px; color: #6b7280; margin: 14px 0; }
          .article-body ul { list-style-type: disc; padding-left: 20px; margin: 8px 0 14px; }
          .article-body ol { list-style-type: decimal; padding-left: 20px; margin: 8px 0 14px; }
          .article-body li { font-family: var(--font-jakarta),sans-serif; font-size: 14px; color: #374151; line-height: 1.7; margin-bottom: 4px; }
        `}</style>

        <div style={{ padding: "8px 20px 24px", marginTop: 12, borderTop: "1px solid #e2e8f0" }}>
          <div style={{ paddingTop: 18 }}>
            <ShareButtons title={dbArticle.title} url={`${SITE_URL}/berita/${dbArticle.slug ?? id}`} />
          </div>
        </div>

        <BottomNav active="explore" />
      </div>
    );
  }

  // ── Static article ─────────────────────────────────────────────────────────
  const article = localizeArticle(staticRaw!, lang);
  const catStyle = CATEGORY_COLORS[staticRaw!.category] ?? { bg: "#e8eaef", color: "#64748b" };

  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#f6f1e8", paddingBottom: 110, paddingTop: 52 }}>
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 52, zIndex: 50,
        background: "linear-gradient(160deg, #0a2018 0%, #1f6b43 60%, #2e8a5a 100%)",
      }}>
        <div style={{ maxWidth: 448, margin: "0 auto", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px" }}>
          <ActionButton onClick={() => router.back()} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "7px 12px", borderRadius: 999,
            background: "rgba(255,255,255,0.18)", color: "#fff",
            fontSize: 13, fontWeight: 700, border: "1px solid rgba(255,255,255,0.22)",
          }}>
            <ChevronLeft size={14} strokeWidth={2.5} color="#fff" />{t.articleBackBtn}
          </ActionButton>
          <PremiumBadge />
        </div>
      </div>

      <div style={{ position: "relative", height: 280 }}>
        <OptimizedImage src={article.photo} alt={article.title} fill priority
          sizes="(max-width: 480px) 100vw, 440px"
          style={{ objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.70) 100%)" }} />
        <div style={{ position: "absolute", top: 14, right: 16 }}>
          <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 999,
            fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4,
            background: "rgba(0,0,0,0.32)", color: "rgba(255,255,255,0.92)" }}>
            {article.category}
          </span>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 20px" }}>
          <h1 style={{ margin: "0 0 10px", fontFamily: "var(--font-fraunces),Georgia,serif",
            fontSize: 22, fontWeight: 600, letterSpacing: -0.4, lineHeight: 1.25, color: "#fff" }}>
            {article.title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{article.emoji}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{article.date}</span>
            <span style={{ width: 3, height: 3, borderRadius: 999, background: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
            <span style={{ display: "flex", alignItems: "center", gap: 4,
              fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
              <Clock size={11} strokeWidth={2} color="rgba(255,255,255,0.75)" />{article.readTime}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 20px 8px" }}>
        <div style={{ background: catStyle.bg, borderRadius: 16, padding: "14px 16px",
          marginBottom: 24, borderLeft: `3px solid ${catStyle.color}` }}>
          <p style={{ margin: 0, fontFamily: "var(--font-jakarta),sans-serif",
            fontSize: 13.5, color: catStyle.color, fontWeight: 600, lineHeight: 1.6 }}>
            {article.summary}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {article.content.map((para, i) => (
            <p key={i} style={{ margin: 0, fontFamily: "var(--font-jakarta),sans-serif",
              fontSize: 14, color: "#374151", lineHeight: 1.75 }}>
              {para}
            </p>
          ))}
        </div>
        <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, letterSpacing: 0.4,
            textTransform: "uppercase" }}>{t.articleTopicLabel}</span>
          <div style={{ marginTop: 8 }}>
            <span style={{ display: "inline-block", padding: "5px 12px", borderRadius: 999,
              fontSize: 12, fontWeight: 700, background: catStyle.bg, color: catStyle.color }}>
              {article.category}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #e2e8f0" }}>
          <ShareButtons title={article.title} url={`${SITE_URL}/berita/${staticRaw!.id}`} />
        </div>
      </div>

      <BottomNav active="explore" />
    </div>
  );
}
