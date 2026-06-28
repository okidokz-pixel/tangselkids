"use client";
import { useEffect, useState } from "react";
import { Link2, Check, Share2 } from "lucide-react";

function Round({ bg, label, href, onClick, children }: {
  bg: string; label: string; href?: string; onClick?: () => void; children: React.ReactNode;
}) {
  const style: React.CSSProperties = {
    width: 42, height: 42, borderRadius: 999, background: bg, color: "#fff",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    border: "none", cursor: "pointer", flexShrink: 0, textDecoration: "none",
    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
  };
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} style={style}>{children}</a>
  ) : (
    <button type="button" aria-label={label} title={label} onClick={onClick} style={style}>{children}</button>
  );
}

export function ShareButtons({ title, url }: { title: string; url?: string }) {
  const [pageUrl, setPageUrl] = useState(url ?? "");
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (!url && typeof window !== "undefined") {
      setPageUrl(window.location.origin + window.location.pathname);
    }
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, [url]);

  const u = encodeURIComponent(pageUrl);
  const t = encodeURIComponent(title);

  function copy() {
    navigator.clipboard?.writeText(pageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function nativeShare() {
    navigator.share?.({ title, url: pageUrl }).catch(() => {});
  }

  return (
    <div>
      <p style={{ fontFamily: "var(--font-jakarta),sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "#94a3b8", margin: "0 0 10px" }}>
        Bagikan artikel ini
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {/* WhatsApp */}
        <Round bg="#25D366" label="Bagikan ke WhatsApp" href={`https://wa.me/?text=${t}%20${u}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </Round>
        {/* Facebook */}
        <Round bg="#1877F2" label="Bagikan ke Facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${u}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        </Round>
        {/* X / Twitter */}
        <Round bg="#000" label="Bagikan ke X" href={`https://twitter.com/intent/tweet?text=${t}&url=${u}`}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </Round>
        {/* Telegram */}
        <Round bg="#229ED9" label="Bagikan ke Telegram" href={`https://t.me/share/url?url=${u}&text=${t}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M21.94 4.3 2.9 11.64c-1.3.52-1.29 1.25-.24 1.57l4.88 1.52 1.88 5.78c.23.63.11.88.77.88.51 0 .73-.23 1.01-.5l2.44-2.37 5.08 3.75c.94.52 1.61.25 1.84-.87l3.34-15.74c.34-1.37-.52-1.99-1.96-1.34Z"/></svg>
        </Round>
        {/* Copy link */}
        <Round bg={copied ? "#16a34a" : "#64748b"} label="Salin tautan" onClick={copy}>
          {copied ? <Check size={20} strokeWidth={2.5} /> : <Link2 size={19} strokeWidth={2.2} />}
        </Round>
        {/* Native share (mobile) */}
        {canNativeShare && (
          <Round bg="#0e1d4f" label="Bagikan lainnya" onClick={nativeShare}>
            <Share2 size={19} strokeWidth={2.2} />
          </Round>
        )}
      </div>
    </div>
  );
}
