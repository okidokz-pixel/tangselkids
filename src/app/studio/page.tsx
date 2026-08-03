import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Studio Konten — TangselKids",
  robots: { index: false, follow: false },
};

const sans = "var(--font-jakarta), system-ui, sans-serif";
const serif = "var(--font-fraunces), Georgia, serif";

const IgGlyph = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="2.2" y="2.2" width="19.6" height="19.6" rx="5.6" stroke="#fff" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="4.3" stroke="#fff" strokeWidth="1.8" />
    <circle cx="17.4" cy="6.6" r="1.25" fill="#fff" />
  </svg>
);

const ThreadsGlyph = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden fill="#fff">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.85 13.85 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.32.145 1.49.7 2.58 1.761 3.15 3.07.795 1.82.868 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.235-11.421c-.196 0-.394.006-.594.018-1.6.09-2.598.859-2.535 1.958.066 1.15 1.335 1.686 2.556 1.62 1.122-.062 2.585-.497 2.83-3.404a8.03 8.03 0 0 0-2.263-.192Z" />
  </svg>
);

function Card({ href, name, count, glyph, bg, sub }: {
  href: string; name: string; count: string; glyph: React.ReactNode; bg: string; sub: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: bg, borderRadius: 22, padding: "22px 20px",
        display: "flex", alignItems: "center", gap: 16,
        boxShadow: "0 10px 26px rgba(19,35,60,0.14)",
      }}>
        <div style={{
          width: 58, height: 58, borderRadius: 16, flexShrink: 0,
          background: "rgba(255,255,255,0.16)", border: "1.5px solid rgba(255,255,255,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {glyph}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{name}</div>
          <div style={{ fontFamily: sans, fontSize: 12.5, color: "rgba(255,255,255,0.78)", marginTop: 2 }}>{count}</div>
          <div style={{ fontFamily: sans, fontSize: 11.5, color: "rgba(255,255,255,0.6)", marginTop: 1 }}>{sub}</div>
        </div>
        <div style={{ fontSize: 22, color: "rgba(255,255,255,0.8)", flexShrink: 0 }}>→</div>
      </div>
    </Link>
  );
}

export default function StudioHubPage() {
  return (
    <div style={{ background: "#f7f4ec", minHeight: "100vh" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 18px 72px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 7, fontFamily: serif,
          fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px", color: "#132339" }}>
          <span>Tangsel</span><span style={{ color: "#2e8a5a" }}>Kids</span>
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 27, fontWeight: 700, color: "#132339",
          margin: "18px 0 6px", letterSpacing: "-0.01em" }}>
          Studio Konten
        </h1>
        <p style={{ fontFamily: sans, fontSize: 14, color: "#5d6b7b", margin: "0 0 26px", lineHeight: 1.55 }}>
          Pilih platform. Tiap postingan tinggal salin & posting, lalu tandai selesai —
          besok tinggal buka lagi, post berikutnya sudah siap.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card
            href="/studio/instagram" name="Instagram" count="28 postingan · 4 minggu"
            sub="Carousel, single, reel & story — lengkap sama gambar/video"
            glyph={<IgGlyph />}
            bg="linear-gradient(135deg, #feda75 0%, #fa7e1e 26%, #d62976 60%, #962fbf 88%)"
          />
          <Card
            href="/studio/threads" name="Threads" count="30 postingan"
            sub="Utas & postingan tunggal — tinggal salin caption"
            glyph={<ThreadsGlyph />}
            bg="linear-gradient(135deg, #1a1a1a, #2b2b2b)"
          />
        </div>

        <p style={{ fontFamily: sans, fontSize: 11.5, color: "#a3aeba", textAlign: "center", marginTop: 30 }}>
          Halaman internal TangselKids · progres tersimpan di HP ini
        </p>
      </div>
    </div>
  );
}
