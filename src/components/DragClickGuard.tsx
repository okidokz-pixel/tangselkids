"use client";
import { useEffect } from "react";

/**
 * Prevents accidental link/button activations caused by touch-scroll gestures.
 * Tracks touchstart → touchmove distance and cancels the synthetic click event
 * if the finger moved more than DRAG_THRESHOLD pixels before lifting.
 */
export function DragClickGuard() {
  useEffect(() => {
    const DRAG_THRESHOLD = 8; // px — any movement beyond this is a scroll
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      isDragging = false;
    }

    function onTouchMove(e: TouchEvent) {
      const t = e.touches[0];
      const dx = Math.abs(t.clientX - startX);
      const dy = Math.abs(t.clientY - startY);
      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
        isDragging = true;
      }
    }

    function onClickCapture(e: MouseEvent) {
      if (isDragging) {
        e.stopPropagation();
        e.preventDefault();
        isDragging = false;
      }
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove",  onTouchMove,  { passive: true });
    document.addEventListener("click",      onClickCapture, true); // capture phase

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove",  onTouchMove);
      document.removeEventListener("click",      onClickCapture, true);
    };
  }, []);

  return null;
}
