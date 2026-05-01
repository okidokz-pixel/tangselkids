"use client";
import { useEffect, useRef } from "react";

/**
 * FilterSheet
 * ─────────────────────────────────────────────────────────────
 * A bottom sheet that slides up from the bottom of the screen.
 * Follows iOS WebKit touch rules:
 *   • No transform on position:fixed elements
 *   • Uses bottom: 0 / bottom: -100vh for show/hide
 *   • No backdrop-filter
 *
 * Props
 *   open         – whether the sheet is visible
 *   onClose      – called when backdrop or X is tapped
 *   title        – sheet heading text
 *   onApply      – called when "Apply" button is tapped
 *   onReset      – called when "Reset" button is tapped
 *   applyLabel   – label for the apply button (default "Apply")
 *   resetLabel   – label for the reset button (default "Reset")
 *   children     – filter controls rendered inside the scroll area
 */

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  onApply: () => void;
  onReset: () => void;
  applyLabel?: string;
  resetLabel?: string;
  children: React.ReactNode;
};

export function FilterSheet({
  open, onClose, title, onApply, onReset,
  applyLabel = "Apply",
  resetLabel = "Reset",
  children,
}: Props) {
  // Lock body scroll while sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop — semi-transparent overlay, no backdrop-filter */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.45)",
          zIndex: 100,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.28s ease",
        }}
      />

      {/* Sheet panel — always at bottom:0, expands via maxHeight (no transform, iOS-safe) */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 101,
          maxHeight: open ? "85vh" : 0,
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          borderRadius: "24px 24px 0 0",
          boxShadow: open ? "0 -8px 40px rgba(15,23,42,0.14)" : "none",
          transition: "max-height 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
          overflow: "clip",          // clip not hidden — iOS touch rule
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 20px 14px",
          borderBottom: "1px solid #f1f5f9",
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontSize: 18,
            fontWeight: 700,
            color: "#0f172a",
          }}>
            {title}
          </span>

          {/* Close × button */}
          <button
            onClick={onClose}
            onTouchEnd={(e) => { e.preventDefault(); onClose(); }}
            style={{
              width: 32, height: 32,
              borderRadius: 16,
              border: "none",
              background: "#f1f5f9",
              color: "#64748b",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
              flexShrink: 0,
              fontSize: 18,
              fontWeight: 500,
            }}
            aria-label="Close filter"
          >
            ×
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "clip",
          padding: "16px 20px",
          WebkitOverflowScrolling: "touch",
        }}>
          {children}
        </div>

        {/* Footer — Apply / Reset */}
        <div style={{
          display: "flex",
          gap: 10,
          padding: "14px 20px",
          paddingBottom: "max(14px, env(safe-area-inset-bottom))",
          borderTop: "1px solid #f1f5f9",
          flexShrink: 0,
          background: "#fff",
        }}>
          {/* Reset */}
          <button
            onClick={onReset}
            onTouchEnd={(e) => { e.preventDefault(); onReset(); }}
            style={{
              flex: 1,
              padding: "13px 0",
              borderRadius: 14,
              border: "1.5px solid #e2e8f0",
              background: "#fff",
              color: "#475569",
              fontFamily: "var(--font-jakarta), system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {resetLabel}
          </button>

          {/* Apply */}
          <button
            onClick={onApply}
            onTouchEnd={(e) => { e.preventDefault(); onApply(); }}
            style={{
              flex: 2,
              padding: "13px 0",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #1A3A6C, #2563EB)",
              color: "#fff",
              fontFamily: "var(--font-jakarta), system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {applyLabel}
          </button>
        </div>
      </div>
    </>
  );
}
