"use client";
import { useState, useRef, useEffect } from "react";
import { X, MapPin } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

const COVERAGE = {
  bintaro: ["Bintaro Jaya", "Pondok Aren", "Pesanggrahan", "Ciputat", "Ciputat Timur", "Pamulang"],
  bsd:     ["BSD City", "Serpong", "Serpong Utara", "Gading Serpong", "Alam Sutera", "Cisauk", "Pagedangan"],
};

export function AreaCoverageButton() {
  const { t } = useLang();
  const [show, setShow] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Force-close on browser back-nav and on tab refocus / BFCache restore.
  // The modal uses zIndex: 9000 — if it gets stuck open after a back-navigation
  // (which happens with the Next.js + Turbopack dev-mode router-cache bug), it
  // silently swallows every click on the page underneath. Belt-and-suspenders.
  useEffect(() => {
    const close = () => setShow(false);
    window.addEventListener("popstate", close);
    window.addEventListener("pageshow", close);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") close();
    });
    return () => {
      window.removeEventListener("popstate", close);
      window.removeEventListener("pageshow", close);
    };
  }, []);

  function handleTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }

  function handleTouchEnd(e: React.TouchEvent, action: () => void) {
    if (touchStart.current) {
      const t = e.changedTouches[0];
      const dx = Math.abs(t.clientX - touchStart.current.x);
      const dy = Math.abs(t.clientY - touchStart.current.y);
      touchStart.current = null;
      if (dx > 8 || dy > 8) return;
    }
    e.preventDefault();
    action();
  }

  return (
    <>
      {/* ? button */}
      <button
        type="button"
        onClick={() => setShow(true)}
        onTouchStart={handleTouchStart}
        onTouchEnd={(e) => handleTouchEnd(e, () => setShow(true))}
        aria-label="Lihat cakupan wilayah"
        style={{
          width: 26, height: 26, borderRadius: 999,
          background: "#dcfce7", border: "none",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          fontSize: 13, fontWeight: 800, color: "#16a34a",
          fontFamily: "Georgia, serif",
        }}
      >
        ?
      </button>

      {/* Coverage modal */}
      {show && (
        /* Backdrop doubles as flex-centering container — no transform needed */
        <div
          onClick={() => setShow(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={(e) => handleTouchEnd(e, () => setShow(false))}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9000,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 20px",
          }}
        >
          {/* Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: "20px 20px 24px",
              width: "100%",
              maxWidth: 390,
              boxShadow: "0 12px 48px rgba(0,0,0,0.28)",
              animation: "modal-pop-in 0.22s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            <style>{`
              @keyframes modal-pop-in {
                from { opacity: 0; transform: scale(0.92); }
                to   { opacity: 1; transform: scale(1); }
              }
            `}</style>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={20} color="#2e8a5a" strokeWidth={2} />
                <span style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  fontSize: 22, fontWeight: 700, color: "#0f172a",
                }}>
                  {t.coverageTitle}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShow(false)}
                onTouchStart={handleTouchStart}
                onTouchEnd={(e) => handleTouchEnd(e, () => setShow(false))}
                style={{
                  width: 30, height: 30, borderRadius: 999, border: "none",
                  background: "#f1f5f9", display: "flex", alignItems: "center",
                  justifyContent: "center", cursor: "pointer",
                  touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                }}
              >
                <X size={15} color="#64748b" />
              </button>
            </div>

            {/* Two columns */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {(["bintaro", "bsd"] as const).map((area) => (
                <div key={area} style={{
                  background: area === "bintaro" ? "#f0fdf4" : "#eff6ff",
                  borderRadius: 16, padding: "14px 14px 16px",
                  border: `1.5px solid ${area === "bintaro" ? "#bbf7d0" : "#bfdbfe"}`,
                }}>
                  <p style={{
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    fontSize: 18, fontWeight: 700,
                    color: area === "bintaro" ? "#166534" : "#1d4ed8",
                    margin: "0 0 10px",
                  }}>
                    {area === "bintaro" ? "Bintaro" : "BSD"}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {COVERAGE[area].map((name) => (
                      <span key={name} style={{
                        fontSize: 14,
                        color: area === "bintaro" ? "#15803d" : "#1d4ed8",
                        fontFamily: "var(--font-jakarta), sans-serif",
                        fontWeight: 500, lineHeight: 1.4,
                      }}>
                        · {name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
