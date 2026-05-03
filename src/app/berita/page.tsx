"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { articles, localizeArticle } from "@/lib/articles";
import { BottomNav } from "@/components/BottomNav";
import { ActionButton } from "@/components/ActionButton";
import { useLang } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { PremiumBadge } from "@/components/PremiumBadge";

export default function BeritaPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  useAuth(); // needed for PremiumBadge

  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#f6f1e8", paddingBottom: 110 }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(160deg, #0a2018 0%, #1f6b43 60%, #2e8a5a 100%)",
        borderRadius: "0 0 28px 28px", padding: "44px 20px 22px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
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
                {t.newsPageTitle}
              </h1>
              <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.6)", fontSize: 12,
                fontFamily: "var(--font-jakarta),sans-serif" }}>
                {t.newsArticlesAvailable(articles.length)}
              </p>
            </div>
          </div>
          <PremiumBadge />
        </div>
      </div>

      {/* Article list */}
      <div style={{ padding: "20px 16px 8px" }}>
        <div style={{ borderTop: "1px solid rgba(15,23,42,0.18)" }}>
          {articles.map((article) => {
            const a = localizeArticle(article, lang);
            return (
              <Link key={a.id} href={`/berita/${a.id}`} style={{
                padding: "14px 0",
                borderBottom: "1px solid rgba(15,23,42,0.08)",
                display: "flex", gap: 12, alignItems: "flex-start",
                textDecoration: "none", color: "inherit",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 9.5, fontWeight: 800,
                    color: "var(--tk-accent, #c47a14)", letterSpacing: 0.7,
                  }}>
                    {a.category.toUpperCase()}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    fontSize: 16, fontWeight: 700, color: "#0e1d4f",
                    letterSpacing: -0.2, marginTop: 4, lineHeight: 1.2,
                  }}>
                    {a.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                    {a.date} · {a.readTime}
                  </div>
                </div>
                <img src={a.photo} alt="" style={{
                  width: 72, height: 72, objectFit: "cover", borderRadius: 4,
                  border: "1px solid rgba(15,23,42,0.08)", flexShrink: 0,
                }} />
              </Link>
            );
          })}
        </div>
      </div>

      <BottomNav active="explore" />
    </div>
  );
}
