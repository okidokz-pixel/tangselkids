"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRegisterSheet } from "@/context/RegisterSheetContext";
import { useLang } from "@/context/LanguageContext";
import { ActionButton } from "./ActionButton";

/**
 * Contextual registration nudge — fires ONCE for a guest after they've viewed
 * their Nth distinct SCHOOL (implicit high-intent research signal). Dismissible,
 * never blocks browsing, never shown to registered users. Counts distinct
 * schools in localStorage; taps the existing RegisterSheet with contextual copy.
 */
const VIEWED_KEY = "tk_viewed_schools";
const SHOWN_KEY  = "tk_reg_nudge_shown";
const THRESHOLD  = 4;    // show on the 4th distinct school
const DELAY_MS   = 2500; // let them start reading first

export function RegisterNudge({ category, id }: { category?: string; id?: string }) {
  const { isRegistered, loaded } = useAuth();
  const { openRegisterSheet } = useRegisterSheet();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (category !== "school" || !id) return;
    if (!loaded || isRegistered) return;               // wait for auth; skip members
    if (typeof window === "undefined") return;
    if (localStorage.getItem(SHOWN_KEY)) return;

    let viewed: string[] = [];
    try { viewed = JSON.parse(localStorage.getItem(VIEWED_KEY) || "[]"); } catch { viewed = []; }
    if (!viewed.includes(id)) {
      viewed.push(id);
      localStorage.setItem(VIEWED_KEY, JSON.stringify(viewed));
    }
    if (viewed.length < THRESHOLD) return;

    const timer = setTimeout(() => {
      if (localStorage.getItem(SHOWN_KEY)) return;      // race guard
      localStorage.setItem(SHOWN_KEY, "1");
      setOpen(true);
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, [category, id, loaded, isRegistered]);

  if (!open) return null;

  const c = lang === "id"
    ? {
        title: "Sudah lihat beberapa sekolah 👀",
        sub: "Daftar gratis untuk simpan sekolah favoritmu dan bandingkan nanti — biar nggak hilang.",
        cta: "Daftar Gratis",
        later: "Nanti saja",
        sheetTitle: "Simpan sekolah favoritmu",
        sheetSub: "Buat akun gratis untuk menyimpan & membandingkan sekolah pilihanmu.",
      }
    : {
        title: "Looked at a few schools 👀",
        sub: "Sign up free to save your favourite schools and compare them later — so you don't lose track.",
        cta: "Sign Up Free",
        later: "Maybe later",
        sheetTitle: "Save your favourite schools",
        sheetSub: "Create a free account to save & compare the schools you like.",
      };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(0,0,0,0.45)", animation: "sheet-fade-in 0.25s ease both" }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "#fff", borderRadius: "24px 24px 0 0",
          padding: "20px 20px 44px", maxWidth: 448, margin: "0 auto",
          animation: "sheet-slide-up 0.38s cubic-bezier(0.32, 0.72, 0, 1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: 36, height: 4, borderRadius: 999, background: "#e2e8f0", margin: "0 auto 24px" }} />
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 999,
            background: "linear-gradient(135deg, #2e8a5a, #1f6b43)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
          }}>🎓</div>
        </div>
        <p style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 20, fontWeight: 700, color: "#0e1d4f", textAlign: "center", margin: "0 0 10px" }}>
          {c.title}
        </p>
        <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: 13, color: "#64748b", lineHeight: 1.6, textAlign: "center", margin: "0 0 28px", padding: "0 8px" }}>
          {c.sub}
        </p>
        <ActionButton
          onClick={() => { setOpen(false); openRegisterSheet({ title: c.sheetTitle, subtitle: c.sheetSub }); }}
          style={{
            width: "100%", padding: "17px 0", borderRadius: 16, border: "none",
            background: "linear-gradient(135deg, #2e8a5a, #1f6b43)", color: "#fff",
            fontFamily: "var(--font-jakarta), sans-serif", fontSize: 16, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
            boxShadow: "0 4px 16px rgba(46,138,90,0.35)",
          }}
        >
          {c.cta}
          <span style={{ display: "inline-block", fontSize: 20, lineHeight: 1, animation: "rail-nudge 1.4s ease-in-out infinite" }}>→</span>
        </ActionButton>
        <ActionButton
          onClick={() => setOpen(false)}
          style={{
            width: "100%", marginTop: 12, padding: "13px 0", borderRadius: 16,
            background: "transparent", color: "#94a3b8",
            fontFamily: "var(--font-jakarta), sans-serif", fontSize: 14, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {c.later}
        </ActionButton>
      </div>
    </div>
  );
}
