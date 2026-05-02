"use client";
import React, { useRef } from "react";

const DRAG_THRESHOLD = 8; // px — same as DragClickGuard

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
 *
 * Drag guard: onTouchStart records the finger position. onTouchEnd checks the
 * distance — if the finger moved more than DRAG_THRESHOLD pixels (i.e. the user
 * was scrolling, not tapping), the action is suppressed. This prevents scroll
 * gestures from accidentally triggering buttons, complementing the global
 * DragClickGuard (which only cancels the synthetic click event, not touchEnd).
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
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  return (
    <button
      type="button"
      onClick={onClick}
      onTouchStart={(e) => {
        const t = e.touches[0];
        touchStart.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        if (touchStart.current) {
          const t = e.changedTouches[0];
          const dx = Math.abs(t.clientX - touchStart.current.x);
          const dy = Math.abs(t.clientY - touchStart.current.y);
          touchStart.current = null;
          if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) return; // was a scroll — ignore
        }
        e.preventDefault();
        onClick();
      }}
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
