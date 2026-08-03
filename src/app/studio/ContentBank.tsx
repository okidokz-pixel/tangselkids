"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// ── shared shape both banks normalise into ──────────────────────────────────
export type BankBlock = { label: string; text: string; copyText: string; hashtags?: string };
export type BankMedia = { type: "image" | "video"; url: string; label: string };
export type BankPost = {
  format: string;
  title?: string;
  threadHint?: boolean;
  blocks: BankBlock[];
  brief?: string;
  media?: BankMedia[];
};

const css = `
  .cb{max-width:600px;margin:0 auto;padding:20px 16px 72px;font-family:var(--font-jakarta),system-ui,sans-serif;color:#132339}
  .cb-brand{display:flex;align-items:baseline;gap:7px;font-family:var(--font-fraunces),Georgia,serif;font-size:24px;font-weight:700;letter-spacing:-.5px}
  .cb-brand .k{color:#2e8a5a}
  .cb-sub{font-size:12.5px;color:#5d6b7b;margin:3px 0 16px;font-weight:500}
  .cb-prog{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px;font-size:13px;font-weight:700;color:#132339;font-variant-numeric:tabular-nums}
  .cb-prog b{color:#2e8a5a}
  .cb-prog .pct{font-size:12px;color:#5d6b7b;font-weight:600}
  .cb-bar{height:7px;border-radius:99px;background:#e7e1d4;overflow:hidden;margin-bottom:20px}
  .cb-bar>i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#2e8a5a,#16a34a);transition:width .4s cubic-bezier(.32,.72,0,1)}
  .cb-card{background:#fff;border:1px solid #e7e1d4;border-radius:20px;box-shadow:0 4px 18px rgba(19,35,60,.06);padding:18px 16px 16px}
  .cb-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px}
  .cb-eyebrow{font-size:10.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#8a97a5}
  .cb-badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;padding:5px 11px;border-radius:99px;background:#e6f3ec;color:#0e5c39;border:1px solid rgba(46,138,90,.3);white-space:nowrap}
  .cb-title{font-family:var(--font-fraunces),Georgia,serif;font-size:21px;font-weight:700;color:#132339;margin:8px 0 2px;line-height:1.25}
  .cb-hint{display:flex;gap:9px;font-size:12.5px;color:#5d6b7b;line-height:1.45;background:#f7edd6;border:1px solid rgba(185,121,27,.34);border-radius:13px;padding:10px 12px;margin:14px 0 2px}
  .cb-hint b{color:#b9791b;font-weight:800}
  .cb-blocks{display:flex;flex-direction:column;gap:14px;margin-top:16px}
  .cb-block{border:1px solid #e7e1d4;border-radius:15px;overflow:hidden;background:#faf8f2;transition:border-color .2s}
  .cb-block.done{border-color:rgba(22,163,74,.55)}
  .cb-bhead{display:flex;align-items:center;justify-content:space-between;padding:9px 13px;border-bottom:1px solid #e7e1d4}
  .cb-blbl{font-size:10.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#8a97a5;display:flex;align-items:center;gap:7px}
  .cb-tick{color:#16a34a;font-weight:900;opacity:0;transform:scale(.6);transition:.2s}
  .cb-block.done .cb-tick{opacity:1;transform:scale(1)}
  .cb-btext{padding:13px;font-size:14.5px;line-height:1.6;white-space:pre-wrap;word-wrap:break-word;color:#1e2a3a}
  .cb-tags{display:block;margin-top:12px;padding-top:12px;border-top:1px dashed #e7e1d4;color:#2e8a5a;font-weight:600;font-size:13px;line-height:1.5}
  .cb-copy{-webkit-appearance:none;appearance:none;cursor:pointer;font-family:inherit;width:100%;border:none;padding:12px;font-size:14px;font-weight:800;color:#fff;background:#2e8a5a;display:flex;align-items:center;justify-content:center;gap:8px;transition:background .15s,transform .05s;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
  .cb-copy:active{transform:scale(.99)} .cb-copy.copied{background:#16a34a}
  .cb-brief{margin-top:16px;background:#eef6fb;border:1px solid #cfe4f0;border-radius:15px;padding:14px 15px}
  .cb-brief h4{font-family:var(--font-jakarta),sans-serif;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#2563a8;margin:0 0 8px}
  .cb-brief pre{font-family:var(--font-jakarta),sans-serif;font-size:13.5px;line-height:1.6;color:#1e2a3a;white-space:pre-wrap;word-wrap:break-word;margin:0}
  .cb-media{margin-top:18px;display:flex;flex-direction:column;gap:14px}
  .cb-mhead{font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#8a97a5}
  .cb-mnote{font-size:12px;color:#5d6b7b;line-height:1.45;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:11px;padding:9px 11px}
  .cb-mnote b{color:#15803d}
  .cb-mitem{border:1px solid #e7e1d4;border-radius:14px;overflow:hidden;background:#fff}
  .cb-mlbl{font-size:11px;font-weight:700;color:#5d6b7b;padding:8px 12px;border-bottom:1px solid #f0ece2;display:flex;justify-content:space-between;align-items:center}
  .cb-mlbl a{color:#2e8a5a;font-weight:700;text-decoration:none;font-size:12px}
  .cb-mitem img,.cb-mitem video{display:block;width:100%;height:auto}
  .cb-actions{display:flex;flex-direction:column;gap:10px;margin-top:22px}
  .cb-btn{-webkit-appearance:none;appearance:none;cursor:pointer;font-family:inherit;border:none;border-radius:16px;padding:16px;font-size:15.5px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:8px;touch-action:manipulation;-webkit-tap-highlight-color:transparent;transition:transform .05s,filter .15s}
  .cb-btn:active{transform:scale(.99)}
  .cb-next{color:#fff;background:linear-gradient(135deg,#1f6b43,#2e8a5a);box-shadow:0 8px 22px rgba(46,138,90,.34)}
  .cb-back{background:transparent;color:#5d6b7b;font-weight:700;font-size:13.5px;padding:8px}
  .cb-foot{text-align:center;font-size:11.5px;color:#8a97a5;margin-top:20px;line-height:1.5}
  .cb-foot a{color:#8a97a5}
  .cb-done{text-align:center;padding:34px 18px}
  .cb-done .em{font-size:52px}
  .cb-done h2{font-family:var(--font-fraunces),Georgia,serif;font-size:24px;margin:14px 0 8px;color:#132339}
  .cb-done p{color:#5d6b7b;font-size:14px;margin:0 0 22px}
  .cb button:focus-visible{outline:2.5px solid #2e8a5a;outline-offset:2px}
`;

function copyToClip(text: string, done: () => void) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallback(text, done));
  } else fallback(text, done);
}
function fallback(text: string, done: () => void) {
  const ta = document.createElement("textarea");
  ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "absolute"; ta.style.left = "-9999px";
  document.body.appendChild(ta); ta.select();
  try { document.execCommand("copy"); done(); } catch { /* ignore */ }
  document.body.removeChild(ta);
}

export function ContentBank({
  posts, storageKey, brand, subtitle, homeHref, doneNext,
}: {
  posts: BankPost[]; storageKey: string; brand: string; subtitle: string; homeHref: string; doneNext: string;
}) {
  const [idx, setIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const v = parseInt(localStorage.getItem(storageKey) || "0", 10);
      if (!isNaN(v)) setIdx(Math.max(0, Math.min(v, posts.length)));
    } catch { /* ignore */ }
    setMounted(true);
  }, [storageKey, posts.length]);
  const save = (n: number) => { try { localStorage.setItem(storageKey, String(n)); } catch { /* ignore */ } };
  const total = posts.length;
  const pct = Math.round(Math.min(idx, total) / total * 100);

  if (!mounted) {
    return (
      <div style={{ background: "#f7f4ec", minHeight: "100vh" }}>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div className="cb">
          <div className="cb-brand"><span>Tangsel</span><span className="k">Kids</span></div>
          <div className="cb-sub">{subtitle}</div>
          <div className="cb-card" style={{ textAlign: "center", color: "#8a97a5", padding: "44px 18px" }}>Memuat…</div>
        </div>
      </div>
    );
  }

  function copyBlock(id: string, text: string) {
    copyToClip(text, () => {
      setCopied((c) => ({ ...c, [id]: true }));
      setTimeout(() => setCopied((c) => ({ ...c, [id]: false })), 1600);
    });
  }
  function advance(delta: number) {
    const n = Math.max(0, Math.min(idx + delta, total));
    setIdx(n); save(n); setCopied({});
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div style={{ background: "#f7f4ec", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="cb">
        <div className="cb-brand"><span>Tangsel</span><span className="k">Kids</span></div>
        <div className="cb-sub">{subtitle}</div>

        <div className="cb-prog">
          <span>{idx >= total ? <>Semua <b>{total}</b> selesai</> : <>Post <b>{idx + 1}</b> / {total}</>}</span>
          <span className="pct">{pct}% selesai</span>
        </div>
        <div className="cb-bar"><i style={{ width: `${pct}%` }} /></div>

        {idx >= total ? (
          <div className="cb-card cb-done">
            <div className="em">🎉</div>
            <h2>Semua {total} post selesai!</h2>
            <p>Kerja bagus. Satu putaran penuh sudah tayang.</p>
            <button className="cb-btn cb-next" onClick={() => advance(-idx)}>↺ Mulai lagi dari awal</button>
          </div>
        ) : (
          <Post
            post={posts[idx]} idx={idx} total={total} copied={copied}
            onCopy={copyBlock} onNext={() => advance(1)} onBack={idx > 0 ? () => advance(-1) : null}
            doneNext={doneNext}
          />
        )}

        <div className="cb-foot">
          Progres tersimpan otomatis di HP ini. · <Link href={homeHref}>← Menu konten</Link>
        </div>
      </div>
    </div>
  );
}

function Post({
  post, idx, total, copied, onCopy, onNext, onBack, doneNext,
}: {
  post: BankPost; idx: number; total: number; copied: Record<string, boolean>;
  onCopy: (id: string, text: string) => void; onNext: () => void; onBack: (() => void) | null; doneNext: string;
}) {
  return (
    <div className="cb-card">
      <div className="cb-top">
        <span className="cb-eyebrow">Berikutnya untuk diposting</span>
        <span className="cb-badge">✦ {post.format}</span>
      </div>
      {post.title && <div className="cb-title">{post.title}</div>}

      {post.threadHint && (
        <div className="cb-hint">
          <b>Cara utas:&nbsp;</b>
          <span>posting Bagian 1 dulu, lalu BALAS postinganmu sendiri dengan Bagian 2, dst.</span>
        </div>
      )}

      {/* copyable text blocks */}
      {post.blocks.length > 0 && (
        <div className="cb-blocks">
          {post.blocks.map((b, i) => {
            const id = `${idx}-${i}`;
            return (
              <div key={i} className={"cb-block" + (copied[id] ? " done" : "")}>
                <div className="cb-bhead">
                  <span className="cb-blbl">{b.label}<span className="cb-tick">✓</span></span>
                </div>
                <div className="cb-btext">
                  {b.text}
                  {b.hashtags && <span className="cb-tags">{b.hashtags}</span>}
                </div>
                <button className={"cb-copy" + (copied[id] ? " copied" : "")}
                  onClick={() => onCopy(id, b.copyText)}>
                  {copied[id] ? "✓ Tersalin" : (b.hashtags ? "Salin teks + hashtag" : "Salin teks")}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* story brief */}
      {post.brief && (
        <div className="cb-brief">
          <h4>Panduan Story — bikin manual di IG</h4>
          <pre>{post.brief}</pre>
        </div>
      )}

      {/* media */}
      {post.media && post.media.length > 0 && (
        <div className="cb-media">
          <div className="cb-mhead">Media ({post.media.length})</div>
          <div className="cb-mnote">
            📲 <b>Simpan ke HP:</b> tekan &amp; tahan gambar → <b>&ldquo;Tambah ke Foto&rdquo;</b>.
            Untuk video, tap <b>Buka</b> lalu bagikan → <b>Simpan Video</b>.
          </div>
          {post.media.map((m, i) => (
            <div key={i} className="cb-mitem">
              <div className="cb-mlbl">
                <span>{m.label}</span>
                <a href={m.url} target="_blank" rel="noopener noreferrer">Buka ↗</a>
              </div>
              {m.type === "image"
                ? <img src={m.url} alt={m.label} loading="lazy" />
                : <video src={m.url} controls playsInline preload="metadata" />}
            </div>
          ))}
        </div>
      )}

      <div className="cb-actions">
        <button className="cb-btn cb-next" onClick={onNext}>
          {idx === total - 1 ? "Tandai selesai — beres! ✓" : doneNext}
        </button>
        {onBack && <button className="cb-btn cb-back" onClick={onBack}>← Kembali ke post sebelumnya</button>}
      </div>
    </div>
  );
}
