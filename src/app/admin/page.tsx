import Link from "next/link";
import {
  Inbox, Star, MessageCircle, ArrowRight, UserPlus, FileText,
  ChevronUp, ChevronDown, Plus, Pencil, LineChart, Check, BadgeCheck,
  type LucideIcon,
} from "lucide-react";
import {
  getDashboardStats, getPendingSubmissionsCount,
  getPendingReviewsCount, getFeedbackCount, getRecentActivity,
  getPendingClaimsCount, getRegistrationStats,
  type ActivityEvent,
} from "./actions";
import { getGaStats } from "@/lib/ga-data";

export const metadata = { title: "Dashboard" };

const CATEGORY_META: Record<string, { label: string; href: string }> = {
  schools:          { label: "Sekolah",               href: "/admin/schools" },
  learning_centers: { label: "Tempat Kursus",          href: "/admin/learning-centers" },
  daycares:         { label: "Daycares",               href: "/admin/daycares" },
  playgrounds:      { label: "Playgrounds",            href: "/admin/playgrounds" },
  clinics:          { label: "Klinik Tumbuh Kembang",  href: "/admin/clinics" },
  cafes:            { label: "Kafe Ramah Anak",        href: "/admin/cafes" },
  mini_zoo:         { label: "Mini Zoo",               href: "/admin/mini-zoo" },
  swimming_pools:   { label: "Kolam Renang",           href: "/admin/swimming-pools" },
  bookstores:       { label: "Toko Buku & Alat Tulis", href: "/admin/bookstores" },
};

function num(n: number) {
  return n.toLocaleString("id-ID");
}

const FEED_ICONS: Record<ActivityEvent["type"], LucideIcon> = {
  submission: Inbox,
  review: Star,
  feedback: MessageCircle,
  user: UserPlus,
  article: FileText,
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return "kemarin";
}

export default async function AdminDashboard() {
  const [stats, ga, pendingSubmissions, pendingReviews, feedbackCount, pendingClaims, activity, reg] =
    await Promise.all([
      getDashboardStats(),
      getGaStats().catch(() => null),
      getPendingSubmissionsCount(),
      getPendingReviewsCount(),
      getFeedbackCount(),
      getPendingClaimsCount(),
      getRecentActivity(8),
      getRegistrationStats().catch(() => null),
    ]);

  const totalEntries = stats.categories.reduce((s, c) => s + c.total, 0);
  const totalFeatured = stats.categories.reduce((s, c) => s + c.featured, 0);

  const attn = [
    { lab: "Submissions", n: pendingSubmissions, tone: "primary" as const, href: "/admin/submissions", icon: Inbox },
    { lab: "Claims",      n: pendingClaims,      tone: "teal"    as const, href: "/admin/claims",      icon: BadgeCheck },
    { lab: "Reviews",     n: pendingReviews,     tone: "gold"    as const, href: "/admin/reviews",     icon: Star },
    { lab: "Feedback",    n: feedbackCount,      tone: "berry"   as const, href: "/admin/feedback",    icon: MessageCircle },
  ];

  return (
    <>
      {/* ============== TOP BAR ============== */}
      <div className="topbar">
        <div className="topbar-inner">
          <div>
            <p className="eyebrow"><span className="num">—</span>TangselKids · Internal</p>
            <h1 className="page-title">Dashboard</h1>
            <div className="page-meta">
              <span className="txt">Overview semua kategori.</span>
            </div>
          </div>
          <div className="topbar-actions">
            <span className="realtime-pill"><span className="dot" />Realtime</span>
          </div>
        </div>
      </div>

      <div className="content">

        {/* ===== PERLU TINDAKAN ===== */}
        <section className="section" style={{ paddingTop: 26 }}>
          <div className="attn-panel">
            <div className="attn-grid">
              {attn.map((a) => {
                const has = a.n > 0;
                const Icon = has ? a.icon : Check;
                const tintBg = has ? `var(--${a.tone}-soft)` : "var(--teal-soft)";
                const tintCol = has
                  ? `var(--${a.tone}${a.tone === "primary" ? "-deep" : ""})`
                  : "var(--teal)";
                return (
                  <Link key={a.lab} href={a.href} className={`attn-card ${has ? "has" : ""}`}>
                    <span className="ic" style={{ background: tintBg, color: tintCol }}>
                      <Icon size={20} strokeWidth={1.7} />
                    </span>
                    <span className="body">
                      <span className="lab">{a.lab}</span>
                      <span className="ct tnum">
                        {a.n}
                        <small>{has ? "menunggu approval" : "tidak ada antrean"}</small>
                      </span>
                    </span>
                    <span className="go"><ArrowRight size={18} strokeWidth={2} /></span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== STATISTIK PENGUNJUNG ===== */}
        <section className="section">
          <div className="stat-label">
            <p className="eyebrow">Statistik Pengunjung</p>
            {!ga && <span className="note">Data GA tidak tersedia</span>}
          </div>
          {ga ? (
            <div className="grid g-6">
              <Kpi label="Aktif sekarang" value={ga.activeUsers} variant="live">
                <span className="delta-cap">memantau realtime</span>
              </Kpi>
              <Kpi label="Users hari ini" value={ga.today.users}>
                <Delta mode="abs" cur={ga.today.users} prev={ga.yesterday.users} caption="vs kemarin" />
              </Kpi>
              <Kpi label="Sessions hari ini" value={ga.today.sessions}>
                <Delta mode="abs" cur={ga.today.sessions} prev={ga.yesterday.sessions} caption="vs kemarin" />
              </Kpi>
              <Kpi label="Pageviews hari ini" value={ga.today.pageviews}>
                <Delta mode="pct" cur={ga.today.pageviews} prev={ga.yesterday.pageviews} caption="vs kemarin" />
              </Kpi>
              <Kpi label="Users 7 hari" value={ga.week.users} variant="accent">
                <Delta mode="pct" cur={ga.week.users} prev={ga.prevWeek.users} caption="vs mgg lalu" />
              </Kpi>
              <Kpi label="Pageviews 7 hari" value={ga.week.pageviews} variant="accent">
                <Delta mode="pct" cur={ga.week.pageviews} prev={ga.prevWeek.pageviews} caption="vs mgg lalu" />
              </Kpi>
            </div>
          ) : (
            <div className="card card-pad" style={{ color: "var(--muted)", fontSize: 13.5 }}>
              Statistik pengunjung gagal dimuat. Pastikan service account Google Analytics
              sudah diberi akses ke properti GA4.
            </div>
          )}
        </section>

        {/* ===== PENGGUNA TERDAFTAR ===== */}
        {reg && (
          <section className="section">
            <div className="stat-label">
              <p className="eyebrow">Pengguna Terdaftar</p>
              <Link href="/admin/users" className="note" style={{ textDecoration: "none" }}>Lihat semua →</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              <Kpi label="Total terdaftar" value={reg.total} variant="accent">
                <span className="delta-cap">akun dengan profil lengkap</span>
              </Kpi>
              <Kpi label="Daftar hari ini" value={reg.today}>
                <Delta mode="abs" cur={reg.today} prev={reg.yesterday} caption="vs kemarin" />
              </Kpi>
              <Kpi label="Daftar 7 hari" value={reg.last7} variant="accent">
                <Delta mode="pct" cur={reg.last7} prev={reg.prev7} caption="vs mgg lalu" />
              </Kpi>
            </div>
          </section>
        )}

        {/* ===== DATA SINGKAT ===== */}
        <section className="section">
          <div className="stat-label">
            <p className="eyebrow">Data Singkat</p>
          </div>
          <div className="data-row" style={ga ? undefined : { gridTemplateColumns: "1fr" }}>
            {/* Konten */}
            <div className="card card-pad">
              <div className="card-head" style={{ marginBottom: 14 }}>
                <div className="card-title">Konten</div>
                <div className="card-note">
                  <b className="tnum" style={{ color: "var(--ink)" }}>{num(totalEntries)}</b> entries ·{" "}
                  <b className="tnum" style={{ color: "var(--gold)" }}>{num(totalFeatured)}</b> featured
                </div>
              </div>
              <div className="cat-grid">
                {stats.categories.map((cat) => {
                  const meta = CATEGORY_META[cat.table];
                  if (!meta) return null;
                  return (
                    <Link key={cat.table} href={meta.href} className="cat-tile">
                      <span className="nm">{meta.label}</span>
                      <span className="cnt tnum">{num(cat.total)}</span>
                      <span className={`feat${cat.featured ? "" : " none"}`}>
                        <Star size={11} fill="currentColor" strokeWidth={1.5} />
                        {cat.featured} featured
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Halaman Teratas */}
            {ga && (
              <div className="card card-pad">
                <div className="card-head" style={{ marginBottom: 14 }}>
                  <div className="card-title">Halaman Teratas</div>
                  <div className="card-note">7 hari · views</div>
                </div>
                <div className="pages">
                  {ga.topPages.slice(0, 9).map((p, i) => (
                    <div className="row" key={i}>
                      <span className="rk tnum">{i + 1}</span>
                      <span className={`path ${p.path === "/" ? "home" : ""}`} title={p.path}>{p.path}</span>
                      <span className="v tnum">{num(p.views)}</span>
                    </div>
                  ))}
                </div>
                <div className="pages-foot">
                  <Link href="/admin/analytics" className="linkmore">
                    Lihat analytics lengkap
                    <ArrowRight strokeWidth={2} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ===== AKTIVITAS TERBARU ===== */}
        <section className="section">
          <div className="stat-label">
            <p className="eyebrow">Aktivitas Terbaru</p>
            <span className="note">24 jam terakhir</span>
          </div>
          <div className="card card-pad">
            {activity.length === 0 ? (
              <div className="feed-empty">Belum ada aktivitas dalam 24 jam terakhir.</div>
            ) : (
              <div className="feed">
                {activity.map((f, i) => {
                  const Icon = FEED_ICONS[f.type];
                  const col = `var(--${f.tone}${f.tone === "primary" ? "-deep" : ""})`;
                  return (
                    <div className="ev" key={i}>
                      <span className="evdot" style={{ background: `var(--${f.tone}-soft)`, color: col }}>
                        <Icon size={17} strokeWidth={1.8} />
                      </span>
                      <span className="txt">
                        <b>{f.who}</b> {f.act}
                        <span className="sub"><span className="evtag">{f.tag}</span></span>
                      </span>
                      <span className="meta">{timeAgo(f.at)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ===== QUICK ACTIONS ===== */}
        <section className="section">
          <div className="section-head" style={{ marginBottom: 13 }}>
            <h2 style={{ fontSize: 18 }}>Quick Actions</h2>
          </div>
          <div className="qa-row">
            <Link href="/admin/schools/new" className="qa">
              <span className="ic" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>
                <Plus strokeWidth={1.8} />
              </span>
              Tambah Sekolah
            </Link>
            <Link href="/admin/articles/new" className="qa">
              <span className="ic" style={{ background: "var(--teal-soft)", color: "var(--teal)" }}>
                <Pencil strokeWidth={1.8} />
              </span>
              Tulis Artikel
            </Link>
            <Link href="/admin/analytics" className="qa">
              <span className="ic" style={{ background: "var(--sky-soft)", color: "var(--sky)" }}>
                <LineChart strokeWidth={1.8} />
              </span>
              Lihat Analytics
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}

function Kpi({
  label, value, variant, children,
}: {
  label: string; value: number; variant?: "live" | "accent"; children: React.ReactNode;
}) {
  return (
    <div className={`card kpi-sm ${variant ?? ""}`}>
      <div className="label">
        {variant === "live" && <span className="pulse"><i /></span>}
        <span className="t">{label}</span>
      </div>
      <div className="value tnum">{num(value)}</div>
      <div className="foot">{children}</div>
    </div>
  );
}

function Delta({
  mode, cur, prev, caption,
}: {
  mode: "abs" | "pct"; cur: number; prev: number; caption: string;
}) {
  let up = true;
  let text: string | null = null;

  if (mode === "abs") {
    const d = cur - prev;
    up = d >= 0;
    text = `${up ? "+" : ""}${d}`;
  } else {
    if (prev > 0) {
      const p = ((cur - prev) / prev) * 100;
      up = p >= 0;
      text = `${up ? "+" : ""}${Math.round(p)}%`;
    }
  }

  if (text === null) {
    // No baseline to compare against (e.g. zero yesterday) — show caption only.
    return <span className="delta-cap">{caption}</span>;
  }

  return (
    <>
      <span className={`delta ${up ? "up" : "down"}`}>
        {up ? <ChevronUp /> : <ChevronDown />}
        {text}
      </span>
      <span className="delta-cap">{caption}</span>
    </>
  );
}
