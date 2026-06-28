"use client";
import { useState } from "react";

/**
 * Admin brand logo. Renders /admin-logo.png; if that file isn't present yet,
 * falls back to the provided node (so the admin never shows a broken image).
 * Drop the logo image at: public/admin-logo.png
 */
export function AdminLogo({ height = 30, fallback }: { height?: number; fallback: React.ReactNode }) {
  const [ok, setOk] = useState(true);
  if (!ok) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/admin-logo.png"
      alt="TangselKids"
      height={height}
      style={{ height, width: "auto", display: "block", flexShrink: 0 }}
      onError={() => setOk(false)}
    />
  );
}
