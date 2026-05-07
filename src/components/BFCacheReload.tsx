"use client";
import { useEffect } from "react";

/**
 * Force a full reload on certain back-navigation events that leave the app
 * in a half-initialized state.
 *
 * We listen for TWO events:
 *
 * 1. `pageshow` with `event.persisted === true` — fires when the page is
 *    restored from the browser's BFCache (Chrome desktop in particular).
 *
 * 2. `popstate` — fires when the user clicks the browser's back/forward
 *    button. Next.js App Router intercepts this and tries to do a "soft"
 *    navigation that preserves React component instances. In some cases
 *    that leaves `useEffect([], ...)` data fetches stale (showing 0/empty
 *    counts), modal `useState` stuck open (silently blocking clicks), and
 *    `setTimeout` chains frozen.
 *
 * A hard reload is heavy-handed but bulletproof. We use a window-scoped
 * flag (cleared by the reload itself) to de-dupe popstate, since popstate
 * can fire multiple times for a single user-initiated back action.
 */
export function BFCacheReload() {
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };

    let reloading = false;
    const onPopState = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };

    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return null;
}
