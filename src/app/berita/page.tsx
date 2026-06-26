"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { fetchPublishedArticles, type DbArticle } from "@/lib/articles-db";
import { BottomNav } from "@/components/BottomNav";
import { ActionButton } from "@/components/ActionButton";
import { useLang } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { PremiumBadge } from "@/components/PremiumBadge";
import { OptimizedImage } from "@/components/OptimizedImage";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch { return ""; }
}

export default function BeritaPage() {
  const router = useRouter();
  const { t } = useLang();
  useAuth();

  const [dbArticles, setDbArticles] = useState<DbArticle[]>([]);

  useEffect(() => {
    fetchPublishedArticles().then(setDbArticles);
  }, []);

  const totalCount = dbArticles.length;

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
                {t.newsArticlesAvailable(totalCount)}
              </p>
            </div>
          </div>
          <PremiumBadge />
        </div>
      </div>

      {/* Article list */}
      <div style={{ padding: "20px 16px 8px" }}>
        <div style={{ borderTop: "1px solid rgba(15,23,42,0.18)" }}>

          {/* Supabase (admin-managed) articles first */}
          {dbArticles.map((a) => (
            <Link key={a.id} href={`/berita/${a.slug}`} style={{
              padding: "14px 0",
              borderBottom: "1px solid rgba(15,23,42,0.08)",
              display: "flex", gap: 12, alignItems: "flex-start",
              textDecoration: "none", color: "inherit",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, color: "var(--tk-accent, #c47a14)", letterSpacing: 0.7 }}>
                  ARTIKEL
                </div>
                <div style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  fontSize: 16, fontWeight: 700, color: "#0e1d4f",
                  letterSpacing: -0.2, marginTop: 4, lineHeight: 1.2,
                }}>
                  {a.title}
                </div>
                {a.excerpt && (
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, lineHeight: 1.4,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {a.excerpt}
                  </div>
                )}
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                  {a.published_at ? formatDate(a.published_at) : ""}
                </div>
              </div>
              {a.cover_image_url && (
                <OptimizedImage src={a.cover_image_url} alt="" width={72} height={72} sizes="72px" style={{
                  width: 72, height: 72, objectFit: "cover", borderRadius: 4,
                  border: "1px solid rgba(15,23,42,0.08)", flexShrink: 0,
                }} />
              )}
            </Link>
          ))}

        </div>
      </div>

      <BottomNav active="explore" />
    </div>
  );
}
