"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft, FileText, ShieldCheck } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useLang } from "@/context/LanguageContext";
import { legalContent } from "@/lib/legalContent";

/**
 * Full-page renderer for the Terms and Privacy documents.
 * Renders the same source text used by the in-app consent modal
 * (src/lib/legalContent.ts), but at a public, crawlable URL — required
 * for Midtrans onboarding and linkable from anywhere in the app.
 */
export function LegalDocView({ doc }: { doc: "terms" | "privacy" }) {
  const router = useRouter();
  const { lang, t } = useLang();

  const title = doc === "terms" ? t.legalTermsTitle : t.legalPrivacyTitle;
  const Icon  = doc === "terms" ? FileText : ShieldCheck;
  const body  = doc === "terms" ? legalContent[lang].terms : legalContent[lang].privacy;

  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#fff", paddingBottom: 100 }}>

      {/* Header */}
      <div style={{
        padding: "52px 20px 24px",
        background: "linear-gradient(135deg, #1f6b43 0%, #2e8a5a 100%)",
        borderRadius: "0 0 32px 32px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={() => router.back()}
            onTouchEnd={(e) => { e.preventDefault(); router.back(); }}
            style={{
              width: 36, height: 36, borderRadius: 999, border: "none", cursor: "pointer",
              background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
            } as React.CSSProperties}
          >
            <ChevronLeft size={20} color="white" />
          </button>
          <div>
            <h1 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon size={20} /> {title}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2, fontFamily: "var(--font-jakarta), sans-serif" }}>
              {t.legalLastUpdated}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 20px 48px" }}>
        {body.split("\n").map((line, i) => {
          const s = line.trim();
          if (!s) return <div key={i} style={{ height: 6 }} />;

          // Numbered section header: "1. ABOUT..." or "10. LIMIT..."
          if (/^\d+\.\s+[A-Z]/.test(s) && s === s.toUpperCase()) {
            return <p key={i} style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 700, fontSize: 13, color: "#0f172a", margin: "18px 0 4px", letterSpacing: 0.2 }}>{s}</p>;
          }
          // ALL-CAPS section title: "RINGKASAN", "SUMMARY", etc.
          if (s.length > 3 && s === s.toUpperCase() && /[A-Z]/.test(s) && !/^\d+\.\d+/.test(s)) {
            return <p key={i} style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 700, fontSize: 13, color: "#0f172a", margin: "18px 0 4px", letterSpacing: 0.2 }}>{s}</p>;
          }
          // Subsection: "1.1 ..." "4.2 ..."
          if (/^\d+\.\d+\s/.test(s)) {
            return <p key={i} style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 600, fontSize: 12.5, color: "#1e293b", margin: "8px 0 1px" }}>{s}</p>;
          }
          // Emoji or bullet list item
          if (/^[•✅🔒📱🚫📊🗑️✉️🇮🇩♾️⭐]/.test(s)) {
            return <p key={i} style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12.5, color: "#374151", margin: "3px 0 3px 6px", lineHeight: 1.55 }}>{s}</p>;
          }
          return <p key={i} style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 12.5, color: "#475569", margin: "3px 0", lineHeight: 1.6 }}>{s}</p>;
        })}
      </div>

      <BottomNav active="profile" />
    </div>
  );
}
