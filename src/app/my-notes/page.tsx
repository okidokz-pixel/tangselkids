"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { getAllNotes, type FacilityNote } from "@/lib/notesStorage";
import { ActionButton } from "@/components/ActionButton";
import { GuestGate } from "@/components/GuestGate";
import { useLang } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { PremiumBadge } from "@/components/PremiumBadge";
import Link from "next/link";

export default function MyNotesPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const { user, loaded } = useAuth();
  const [notes, setNotes] = useState<FacilityNote[]>([]);

  useEffect(() => {
    setNotes(getAllNotes());
  }, []);

  // ── Auth gate ─────────────────────────────────────────────────────────────────
  if (!loaded) {
    return (
      <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#2e8a5a", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <GuestGate
        title={t.myNotesPageTitle}
        emoji="📝"
        heading="Masuk dulu, yuk!"
        body="Catatan pribadimu tersimpan di akunmu. Masuk untuk melihat dan mengelolanya."
        active="profile"
      />
    );
  }

  return (
    <div style={{ maxWidth: 448, margin: "0 auto", minHeight: "100vh", background: "#f6f1e8" }}>

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
                margin: 0, fontFamily: "var(--font-fraunces),Georgia,serif",
                fontSize: 26, fontWeight: 600, letterSpacing: -0.5, lineHeight: 1, color: "#fff",
              }}>
                {t.myNotesPageTitle}
              </h1>
              {notes.length > 0 && (
                <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "var(--font-jakarta),sans-serif" }}>
                  {t.notesProfileSubtitle(notes.length)}
                </p>
              )}
            </div>
          </div>
          <PremiumBadge />
        </div>
      </div>

      <div style={{ padding: "20px 16px 40px" }}>

        {/* Empty state */}
        {notes.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
            <p style={{
              fontFamily: "var(--font-fraunces),Georgia,serif",
              fontSize: 18, fontWeight: 700, color: "#0e1d4f", marginBottom: 8,
            }}>
              {t.myNotesPageTitle}
            </p>
            <p style={{
              fontFamily: "var(--font-jakarta),sans-serif",
              fontSize: 13, color: "#94a3b8", lineHeight: 1.6,
            }}>
              {t.myNotesEmpty}
            </p>
          </div>
        )}

        {/* Note cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notes.map((note) => (
            <Link
              key={note.placeId}
              href={`/place/${note.placeId}`}
              style={{ textDecoration: "none" }}
            >
              <div style={{
                background: "#fff", borderRadius: 20,
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 0 rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.06)",
                padding: 16,
                display: "flex", alignItems: "flex-start", gap: 14,
              }}>
                <div style={{ fontSize: 26, flexShrink: 0, lineHeight: 1, marginTop: 1 }}>{note.placeIcon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{
                      fontFamily: "var(--font-jakarta),sans-serif",
                      fontWeight: 700, fontSize: 14, color: "#0e1d4f",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {note.placeName}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-jakarta),sans-serif",
                      fontSize: 11, color: "#94a3b8", flexShrink: 0, marginLeft: 8,
                    }}>
                      {new Date(note.updatedAt).toLocaleDateString(
                        lang === "en" ? "en-GB" : "id-ID",
                        { day: "numeric", month: "short" }
                      )}
                    </span>
                  </div>
                  <p style={{
                    fontFamily: "var(--font-jakarta),sans-serif",
                    fontSize: 11, color: "#64748b", margin: "0 0 8px",
                  }}>
                    {note.placeCategory}
                  </p>
                  <p style={{
                    fontFamily: "var(--font-jakarta),sans-serif",
                    fontSize: 13, color: "#4b5563", lineHeight: 1.55,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  } as React.CSSProperties}>
                    {note.noteText}
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: "#cbd5e1", flexShrink: 0, marginTop: 2 }} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
