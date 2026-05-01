"use client";
import React from "react";

/**
 * iOS-safe action button.
 *
 * Why a plain <button> with onClick + onTouchEnd:
 * - The <label> + hidden <input type="radio"> pattern works for SELECTION chips
 *   (where the radio's checked state matches the post-tap state) but is unreliable
 *   for ACTION buttons whose state never changes.
 * - <button> with onClick + onTouchEnd + touchAction: manipulation was the pattern
 *   that the user confirmed worked on iOS Safari & Chrome.
 * - onTouchEnd fires before onClick on iOS — calling preventDefault() then invoking
 *   the handler bypasses React's synthetic-onClick edge cases.
 */
export function ActionButton({
  onClick,
  children,
  style,
  ariaLabel,
}: {
  onClick: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onTouchEnd={(e) => { e.preventDefault(); onClick(); }}
      aria-label={ariaLabel}
      style={{
        background: "transparent", border: "none", padding: 0, margin: 0,
        font: "inherit", color: "inherit", textAlign: "inherit", cursor: "pointer",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        WebkitUserSelect: "none", userSelect: "none",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
