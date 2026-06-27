"use client";

import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { GaStats, RangeStats } from "@/lib/ga-data";
import { getRangeStats } from "@/app/admin/analytics/actions";

type Range = "today" | "yesterday" | "7d" | "30d" | "all" | "custom";

type RegistrationStats = {
  total: number; today: number; yesterday: number;
  last7: number; prev7: number;
  daily: { date: string; count: number }[];
};

function pct(current: number, prev: number) {
  if (prev === 0) return null;
  return ((current - prev) / prev) * 100;
}

function fmt(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

function Trend({ current, prev }: { current: number; prev: number }) {
  const change = pct(current, prev);
  if (change === null) return null;
  const up = change >= 0;
  return (
    <span style={{
      fontSize: 12, fontWeight: 600,
      color: up ? "var(--up)" : "var(--down)",
      background: up ? "var(--teal-soft)" : "var(--down-soft)",
      padding: "2px 8px", borderRadius: 20,
      display: "inline-flex", alignItems: "center", gap: 3,
    }}>
      {up ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
    </span>
  );
}

function KpiCard({ label, value, current, prev, sub, showTrend = true }: {
  label: string; value: string; current: number; prev: number; sub: string; showTrend?: boolean;
}) {
  return (
    <div style={{ background: "var(--surface)", borderRadius: 14, padding: "20px 24px", border: "1px solid var(--line)", flex: 1, minWidth: 140, boxShadow: "var(--shadow-sm)" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 8 }}>{value}</div>
      {showTrend && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Trend current={current} prev={prev} />
          <span style={{ fontSize: 11, color: "var(--muted)" }}>vs {sub}</span>
        </div>
      )}
    </div>
  );
}

const PATH_TITLES: Record<string, string> = {
  "/":                        "Beranda",
  "/schools":                 "Sekolah",
  "/learning-centers":        "Tempat Kursus",
  "/daycare":                 "Daycare",
  "/daycare-playgrounds":     "Daycare & Playground",
  "/playgrounds":             "Playground",
  "/clinics":                 "Klinik Tumbuh Kembang",
  "/cafes":                   "Kafe Ramah Anak",
  "/mini-zoo":                "Mini Zoo",
  "/swimming-pools":          "Kolam Renang",
  "/bookstores":              "Toko Buku & Alat Tulis",
  "/berita":                  "Berita",
  "/explore":                 "Jelajahi",
  "/compare":                 "Bandingkan",
  "/about":                   "Tentang Kami",
  "/feedback":                "Feedback",
  "/help":                    "Bantuan",
  "/privacy":                 "Kebijakan Privasi",
  "/terms":                   "Syarat & Ketentuan",
  "/saved":                   "Tersimpan",
  "/profile":                 "Profil",
  "/my-notes":                "Catatan Saya",
  "/my-reviews":              "Review Saya",
  "/onboarding":              "Onboarding",
  "/upgrade":                 "Upgrade",
  "/payment":                 "Pembayaran",
  "/others":                  "Lainnya",
  "/list-your-place":         "Daftarkan Tempat",
  "/list-your-place/submitted": "Daftarkan Tempat · Terkirim",
  "/list-your-place/upsell":  "Daftarkan Tempat · Upgrade",
};

const PATH_PREFIXES: [string, string][] = [
  ["/place/",        "Detail Tempat"],
  ["/berita/",       "Berita · Artikel"],
  ["/claim/",        "Klaim Tempat"],
  ["/write-review/", "Tulis Review"],
  ["/schools/",      "Sekolah · Detail"],
  ["/learning-centers/", "Kursus · Detail"],
];

function pathToTitle(path: string): string {
  if (PATH_TITLES[path]) return PATH_TITLES[path];
  for (const [prefix, title] of PATH_PREFIXES) {
    if (path.startsWith(prefix)) return title;
  }
  return path;
}

const COUNTRY_FLAGS: Record<string, string> = {
  "Indonesia": "🇮🇩", "United States": "🇺🇸", "Singapore": "🇸🇬",
  "Malaysia": "🇲🇾", "Australia": "🇦🇺", "United Kingdom": "🇬🇧",
  "Netherlands": "🇳🇱", "Germany": "🇩🇪", "Japan": "🇯🇵",
  "India": "🇮🇳", "Canada": "🇨🇦", "France": "🇫🇷",
};

// GA4 dayOfWeek: 0=Sun, 1=Mon … 6=Sat — reorder to Mon–Sun for display
const WEEKDAY_ORDER  = [1, 2, 3, 4, 5, 6, 0];
const WEEKDAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function fmtDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

const CHART_PRIMARY = "#155F39"; // --primary-deep
const CHART_TEAL    = "#2C8779"; // --teal

const RANGES: { key: Range; label: string }[] = [
  { key: "today",     label: "Hari Ini" },
  { key: "yesterday", label: "Kemarin" },
  { key: "7d",        label: "7 Hari" },
  { key: "30d",       label: "30 Hari" },
  { key: "all",       label: "Semua" },
  { key: "custom",    label: "📅 Kustom" },
];

const DEVICE_COLORS: Record<string, string> = {
  mobile: "var(--sky)", desktop: "var(--primary-deep)", tablet: "var(--gold)",
};

const cardStyle = {
  background: "var(--surface)",
  borderRadius: 14,
  border: "1px solid var(--line)",
  boxShadow: "var(--shadow-sm)",
} as const;

const dateInputStyle = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid var(--line)",
  background: "var(--surface)",
  color: "var(--ink)",
  fontSize: 13,
  fontWeight: 500,
  outline: "none",
  cursor: "pointer",
  fontFamily: "inherit",
} as const;

// ── Range → GA date config ──────────────────────────────────────────────────
function isoAddDays(iso: string, n: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

type RangeConfig = {
  start: string; end: string;
  prev: { start: string; end: string } | null;
  note: string;      // subtitle period label
  prevNote: string | null; // trend comparison label
};

function rangeConfig(key: Range, pickerStart: string, pickerEnd: string): RangeConfig {
  switch (key) {
    case "today":
      return { start: "today", end: "today", prev: { start: "yesterday", end: "yesterday" }, note: "hari ini", prevNote: "kemarin" };
    case "yesterday":
      return { start: "yesterday", end: "yesterday", prev: { start: "2daysAgo", end: "2daysAgo" }, note: "kemarin", prevNote: "2 hari lalu" };
    case "7d":
      return { start: "6daysAgo", end: "today", prev: { start: "13daysAgo", end: "7daysAgo" }, note: "7 hari", prevNote: "7 hari lalu" };
    case "30d":
      return { start: "29daysAgo", end: "today", prev: { start: "59daysAgo", end: "30daysAgo" }, note: "30 hari", prevNote: "30 hari lalu" };
    case "all":
      return { start: "2024-01-01", end: "today", prev: null, note: "semua waktu", prevNote: null };
    case "custom": {
      const len = Math.round((Date.parse(pickerEnd) - Date.parse(pickerStart)) / 86400000) + 1;
      const prevEnd = isoAddDays(pickerStart, -1);
      const prevStart = isoAddDays(prevEnd, -(len - 1));
      return { start: pickerStart, end: pickerEnd, prev: { start: prevStart, end: prevEnd }, note: `${pickerStart} – ${pickerEnd}`, prevNote: "periode sebelumnya" };
    }
  }
}

export function AnalyticsDashboard({ stats, initial, registrations }: { stats: GaStats; initial: RangeStats; registrations: RegistrationStats | null }) {
  const [range, setRange] = useState<Range>("7d");
  const [data, setData] = useState<RangeStats>(initial);
  const [periodNote, setPeriodNote] = useState("7 hari");
  const [prevNote, setPrevNote] = useState<string | null>("7 hari lalu");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerStart, setPickerStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [pickerEnd, setPickerEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  const totalDeviceSessions = data.deviceBreakdown.reduce((s, d) => s + d.sessions, 0);
  const totalCountrySessions = data.countryBreakdown.reduce((s, d) => s + d.sessions, 0);
  const totalPageViews = data.topPages.reduce((s, p) => s + p.views, 0);

  const kpi = data.kpi;
  const prevKpi = data.prevKpi;

  const chartData = data.dailyData.map((d) => ({
    date: d.date.slice(5),
    pageviews: d.pageviews,
    users: d.users,
  }));

  async function loadRange(key: Range, cfg: RangeConfig) {
    setLoading(true);
    setError(null);
    try {
      const fresh = await getRangeStats(cfg.start, cfg.end, cfg.prev);
      setData(fresh);
      setRange(key);
      setPeriodNote(cfg.note);
      setPrevNote(cfg.prevNote);
      return true;
    } catch {
      setError("Gagal memuat data. Coba lagi.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  function handleRangeClick(key: Range) {
    if (key === "custom") {
      setPickerOpen((v) => !v);
      return;
    }
    setPickerOpen(false);
    if (key === range) return;
    void loadRange(key, rangeConfig(key, pickerStart, pickerEnd));
  }

  async function handleApply() {
    if (!pickerStart || !pickerEnd || pickerStart > pickerEnd) return;
    const ok = await loadRange("custom", rangeConfig("custom", pickerStart, pickerEnd));
    if (ok) setPickerOpen(false);
  }

  const isCustomActive = range === "custom";

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", margin: 0 }}>Analytics</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            Data real-time · Google Analytics 4 · diperbarui setiap 5 menit
          </p>
        </div>
        <a href="https://analytics.google.com/analytics/web/" target="_blank" rel="noopener noreferrer"
          style={{ padding: "9px 18px", borderRadius: 10, background: "var(--primary)", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
          Buka GA4 ↗
        </a>
      </div>

      {/* Range filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: pickerOpen ? 12 : 20, flexWrap: "wrap" }}>
        {RANGES.map(r => {
          const active = range === r.key || (r.key === "custom" && pickerOpen);
          return (
            <button
              key={r.key}
              onClick={() => handleRangeClick(r.key)}
              disabled={loading}
              style={{
                padding: "7px 18px", borderRadius: 999, fontSize: 13, fontWeight: 600,
                border: "none", cursor: loading ? "wait" : "pointer",
                background: active ? "var(--primary)" : "var(--paper-2)",
                color:      active ? "#fff"           : "var(--ink-2)",
              }}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {/* Date range picker */}
      {pickerOpen && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
          padding: "14px 18px", background: "var(--paper-2)",
          borderRadius: 12, border: "1px solid var(--line)", marginBottom: 20,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Dari</span>
          <input
            type="date"
            value={pickerStart}
            max={pickerEnd || todayStr}
            onChange={(e) => setPickerStart(e.target.value)}
            style={dateInputStyle}
          />
          <span style={{ fontSize: 13, color: "var(--muted)" }}>—</span>
          <input
            type="date"
            value={pickerEnd}
            min={pickerStart}
            max={todayStr}
            onChange={(e) => setPickerEnd(e.target.value)}
            style={dateInputStyle}
          />
          <button
            onClick={handleApply}
            disabled={loading || !pickerStart || !pickerEnd || pickerStart > pickerEnd}
            style={{
              padding: "7px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: "var(--primary)", color: "#fff", border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Memuat…" : "Terapkan"}
          </button>
          {error && <span style={{ fontSize: 12, color: "var(--down)" }}>{error}</span>}
          {isCustomActive && (
            <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 4 }}>
              Aktif: {periodNote}
            </span>
          )}
        </div>
      )}

      {/* Active users banner (always realtime / today — independent of period) */}
      <div style={{
        background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-deep) 100%)",
        borderRadius: 16, padding: "20px 28px", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%", background: "var(--teal-soft)",
            boxShadow: "0 0 0 4px rgba(219,237,232,0.35)",
          }} />
          <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, fontWeight: 500 }}>Pengunjung aktif sekarang</span>
        </div>
        <div style={{ fontSize: 48, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
          {stats.activeUsers}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 28 }}>
          {[
            { label: "Unique User Hari Ini", value: fmt(stats.today.users) },
            { label: "Sessions hari ini", value: fmt(stats.today.sessions) },
            { label: "Pageviews hari ini", value: fmt(stats.today.pageviews) },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{item.value}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Registrasi Pengguna (independent of the GA range selector) ── */}
      {registrations && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <p className="eyebrow" style={{ marginBottom: 2 }}>Registrasi Pengguna</p>
            <p style={{ fontSize: 13, color: "var(--ink-2)", margin: 0 }}>
              Akun baru yang menyelesaikan registrasi · 30 hari terakhir
            </p>
          </div>

          <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
            <KpiCard label="Total Terdaftar" value={fmt(registrations.total)} current={0} prev={0} sub="" showTrend={false} />
            <KpiCard label="Daftar Hari Ini" value={fmt(registrations.today)} current={registrations.today} prev={registrations.yesterday} sub="kemarin" />
            <KpiCard label="Daftar 7 Hari" value={fmt(registrations.last7)} current={registrations.last7} prev={registrations.prev7} sub="minggu lalu" />
          </div>

          <div style={{ ...cardStyle, padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>Registrasi per Hari</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Akun baru · 30 hari terakhir</div>
              </div>
            </div>
            {registrations.daily.every((d) => d.count === 0) ? (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 13 }}>
                Belum ada registrasi dalam 30 hari terakhir
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={registrations.daily.map((d) => ({ date: d.date.slice(5), count: d.count }))} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gRegs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_PRIMARY} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={CHART_PRIMARY} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1E8DA" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#998C7C" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#998C7C" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid var(--line)", fontSize: 12, background: "var(--surface)" }}
                    labelStyle={{ fontWeight: 600, color: "var(--ink)" }}
                  />
                  <Area type="monotone" dataKey="count" name="Registrasi" stroke={CHART_PRIMARY} strokeWidth={2} fill="url(#gRegs)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* ── Everything below responds to the selected period ── */}
      <div style={{ position: "relative" }}>
        {loading && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 20,
            display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 60,
          }}>
            <div style={{
              background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--shadow)",
              borderRadius: 999, padding: "8px 20px", fontSize: 13, color: "var(--ink-2)", fontWeight: 600,
            }}>
              Memuat data {periodNote}…
            </div>
          </div>
        )}

        <div style={{ opacity: loading ? 0.4 : 1, transition: "opacity .2s", pointerEvents: loading ? "none" : "auto" }}>

          {/* KPI cards */}
          <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
            <KpiCard
              label="Unique Users"
              value={fmt(kpi.users)}
              current={kpi.users}
              prev={prevKpi?.users ?? 0}
              sub={prevNote ?? "—"}
              showTrend={!!prevKpi}
            />
            <KpiCard
              label="Sessions"
              value={fmt(kpi.sessions)}
              current={kpi.sessions}
              prev={prevKpi?.sessions ?? 0}
              sub={prevNote ?? "—"}
              showTrend={!!prevKpi}
            />
            <KpiCard
              label="Pageviews"
              value={fmt(kpi.pageviews)}
              current={kpi.pageviews}
              prev={prevKpi?.pageviews ?? 0}
              sub={prevNote ?? "—"}
              showTrend={!!prevKpi}
            />
          </div>

          {/* Engagement section */}
          {(() => {
            const eng = data.engagement;
            const prev = data.prevEngagement;
            const byDay = Object.fromEntries(data.weekdayDurations.map((d) => [d.day, d.avgDuration]));
            const maxDur = Math.max(...WEEKDAY_ORDER.map((d) => byDay[d] ?? 0), 1);

            function EngTrend({ cur, prv, invert = false }: { cur: number; prv: number | undefined; invert?: boolean }) {
              if (!prv) return null;
              const change = ((cur - prv) / prv) * 100;
              const positive = invert ? change <= 0 : change >= 0;
              return (
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: positive ? "var(--up)" : "var(--down)",
                  background: positive ? "var(--teal-soft)" : "var(--down-soft)",
                  padding: "2px 8px", borderRadius: 20,
                  display: "inline-flex", alignItems: "center", gap: 3,
                }}>
                  {change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
                </span>
              );
            }

            const kpis = [
              { label: "Avg. Time on Site", value: fmtDuration(eng.avgDuration), trend: <EngTrend cur={eng.avgDuration} prv={prev?.avgDuration} /> },
              { label: "Pages / Session",   value: eng.pagesPerSession.toFixed(1), trend: <EngTrend cur={eng.pagesPerSession} prv={prev?.pagesPerSession} /> },
              { label: "Return Rate",       value: `${(eng.returnRate * 100).toFixed(0)}%`, trend: <EngTrend cur={eng.returnRate} prv={prev?.returnRate} /> },
              { label: "Bounce Rate",       value: `${(eng.bounceRate * 100).toFixed(0)}%`, trend: <EngTrend cur={eng.bounceRate} prv={prev?.bounceRate} invert /> },
            ];

            return (
              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 14 }}>
                  <p className="eyebrow" style={{ marginBottom: 2 }}>Engagement</p>
                  <p style={{ fontSize: 13, color: "var(--ink-2)", margin: 0 }}>Kualitas kunjungan — bukan hanya jumlahnya · {periodNote}</p>
                </div>

                <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
                  {kpis.map((k) => (
                    <div key={k.label} style={{ ...cardStyle, flex: 1, minWidth: 140, padding: "18px 22px" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>{k.label}</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 8 }}>{k.value}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {k.trend}
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>vs {prevNote ?? "—"}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ ...cardStyle, padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>Rata-rata Waktu per Hari</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>Detik per sesi · {periodNote}</div>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 120 }}>
                    {WEEKDAY_ORDER.map((day, i) => {
                      const dur = byDay[day] ?? 0;
                      const ratio = dur / maxDur;
                      const barH = Math.max(Math.round(ratio * 80), 4);
                      const isTop = dur === maxDur && dur > 0;
                      return (
                        <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: isTop ? "var(--gold)" : "var(--ink-2)" }}>
                            {fmtDuration(dur)}
                          </div>
                          <div style={{
                            width: "100%", height: barH,
                            borderRadius: "6px 6px 0 0",
                            background: isTop ? "var(--gold)" : "var(--gold-soft)",
                            transition: "height .3s",
                          }} />
                          <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{WEEKDAY_LABELS[i]}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Chart + Countries */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, marginBottom: 16 }}>
            <div style={{ ...cardStyle, padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>Tren Traffic</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                    Pageviews & Unique Users · {periodNote}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--ink-2)" }}>
                    <span style={{ width: 10, height: 3, background: CHART_PRIMARY, borderRadius: 2, display: "inline-block" }} /> Pageviews
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--ink-2)" }}>
                    <span style={{ width: 10, height: 3, background: CHART_TEAL, borderRadius: 2, display: "inline-block" }} /> Users
                  </span>
                </div>
              </div>
              {chartData.length === 0 ? (
                <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 13 }}>
                  Tidak ada data grafik untuk rentang ini
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gPageviews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_PRIMARY} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={CHART_PRIMARY} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_TEAL} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={CHART_TEAL} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1E8DA" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#998C7C" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10, fill: "#998C7C" }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "1px solid var(--line)", fontSize: 12, background: "var(--surface)" }}
                      labelStyle={{ fontWeight: 600, color: "var(--ink)" }}
                    />
                    <Area type="monotone" dataKey="pageviews" stroke={CHART_PRIMARY} strokeWidth={2} fill="url(#gPageviews)" dot={false} />
                    <Area type="monotone" dataKey="users" stroke={CHART_TEAL} strokeWidth={2} fill="url(#gUsers)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Countries */}
            <div style={{ ...cardStyle, padding: "20px 20px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>Negara</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Sessions · {periodNote}</div>
              {data.countryBreakdown.length === 0 ? (
                <div style={{ fontSize: 13, color: "var(--muted)", padding: "8px 0" }}>Tidak ada data.</div>
              ) : data.countryBreakdown.map((c, i) => {
                const pctVal = totalCountrySessions > 0 ? (c.sessions / totalCountrySessions) * 100 : 0;
                return (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: "var(--ink-2)", display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{COUNTRY_FLAGS[c.country] ?? "🌍"}</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>{c.country}</span>
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", flexShrink: 0 }}>{pctVal.toFixed(0)}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: "var(--line-soft)" }}>
                      <div style={{ height: "100%", borderRadius: 3, background: "var(--primary)", width: `${pctVal}%`, opacity: 0.7 + (0.3 * (1 - i / 6)) }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Top pages */}
            <div style={{ ...cardStyle, padding: "16px 20px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>Halaman Teratas</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>{periodNote} · pageviews</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {data.topPages.filter((p) => p.path !== "/" && !p.path.startsWith("/admin") && !p.path.startsWith("/place/")).slice(0, 10).map((p, i) => {
                  const pctVal = totalPageViews > 0 ? (p.views / totalPageViews) * 100 : 0;
                  const title = pathToTitle(p.path);
                  return (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
                          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{p.path}</div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{fmt(p.views)}</span>
                          <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 4 }}>{pctVal.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div style={{ height: 5, borderRadius: 3, background: "var(--line-soft)" }}>
                        <div style={{ height: "100%", borderRadius: 3, background: "var(--teal)", width: `${pctVal}%`, opacity: 0.7 + (0.3 * (1 - i / 8)) }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Traffic sources */}
              <div style={{ ...cardStyle, padding: "16px 20px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>Sumber Traffic</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Sessions · {periodNote}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {(() => {
                    const total = data.topSources.reduce((s, r) => s + r.sessions, 0);
                    return data.topSources.slice(0, 5).map((s, i) => {
                      const pctVal = total > 0 ? (s.sessions / total) * 100 : 0;
                      const name = s.source === "(direct)" ? "Direct" : s.source;
                      return (
                        <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                            <span style={{ fontSize: 13, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{name}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", flexShrink: 0 }}>{pctVal.toFixed(0)}%</span>
                          </div>
                          <div style={{ height: 5, borderRadius: 3, background: "var(--line-soft)" }}>
                            <div style={{ height: "100%", borderRadius: 3, background: "var(--primary)", width: `${pctVal}%`, opacity: 0.7 + (0.3 * (1 - i / 5)) }} />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Device breakdown */}
              <div style={{ ...cardStyle, padding: "16px 20px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>Device</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>Sessions · {periodNote}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.deviceBreakdown.map((d, i) => {
                    const pctVal = totalDeviceSessions > 0 ? (d.sessions / totalDeviceSessions) * 100 : 0;
                    const color = DEVICE_COLORS[d.device] ?? "var(--muted)";
                    return (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ fontSize: 13, color: "var(--ink-2)", textTransform: "capitalize", display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
                            {d.device}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{pctVal.toFixed(0)}%</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: "var(--line-soft)" }}>
                          <div style={{ height: "100%", borderRadius: 3, background: color, width: `${pctVal}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Search terms + Registration funnel */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>

            {/* Top search terms */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ ...cardStyle, padding: "20px 24px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>Kata Pencarian Teratas</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>{periodNote} · pencarian dari hero search</div>
                {data.topSearchTerms.length === 0 ? (
                  <div style={{ fontSize: 13, color: "var(--muted)", padding: "8px 0" }}>Belum ada data — mulai terkumpul setelah deploy.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {data.topSearchTerms.map((t, i) => {
                      const max = data.topSearchTerms[0]?.count ?? 1;
                      const pct = (t.count / max) * 100;
                      return (
                        <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                            <span style={{ fontSize: 13, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.term}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", flexShrink: 0, marginLeft: 12 }}>{t.count}<span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>×</span></span>
                          </div>
                          <div style={{ height: 5, borderRadius: 3, background: "var(--line-soft)" }}>
                            <div style={{ height: "100%", borderRadius: 3, background: "var(--teal)", width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* No results / demand gaps */}
              <div style={{ ...cardStyle, padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 16 }}>△</span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>Pencarian Tanpa Hasil — Demand Gaps</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>{periodNote} · kata yang dicari tapi tidak ditemukan</div>
                {data.noResultsTerms.length === 0 ? (
                  <div style={{ fontSize: 13, color: "var(--muted)", padding: "8px 0" }}>Belum ada data — mulai terkumpul setelah deploy.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {data.noResultsTerms.map((t, i) => (
                      <div key={i} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "9px 14px", borderRadius: 8,
                        background: "var(--paper-2)", border: "1px solid var(--line-soft)",
                      }}>
                        <span style={{ fontSize: 13, color: "var(--ink-2)", fontStyle: "italic" }}>&ldquo;{t.term}&rdquo;</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--down)", flexShrink: 0, marginLeft: 12 }}>
                          {t.count}<span style={{ fontSize: 11, fontWeight: 400 }}>×</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Registration funnel */}
            <div style={{ ...cardStyle, padding: "20px 24px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>Funnel Registrasi & Login</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 24 }}>{periodNote} · events dari app</div>
              {data.registrationFunnel.every((r) => r.count === 0) ? (
                <div style={{ fontSize: 13, color: "var(--muted)", padding: "8px 0" }}>Belum ada data — mulai terkumpul setelah deploy.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {data.registrationFunnel.map((step, i) => {
                    const prev = i > 0 ? data.registrationFunnel[i - 1].count : null;
                    const dropPct = prev && prev > 0 ? ((prev - step.count) / prev * 100) : null;
                    const isRegistration = i < 3;
                    const barColor = isRegistration ? "var(--primary)" : "var(--sky)";
                    const max = Math.max(...data.registrationFunnel.map((r) => r.count), 1);
                    const showDivider = i === 3;
                    return (
                      <div key={i}>
                        {showDivider && (
                          <div style={{ borderTop: "1px dashed var(--line)", margin: "16px 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", background: "var(--surface)", paddingRight: 8 }}>Login</span>
                          </div>
                        )}
                        {i === 0 && (
                          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Registrasi</div>
                        )}
                        <div style={{ marginBottom: i === 2 ? 0 : 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontSize: 13, color: "var(--ink-2)" }}>{step.event}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 12 }}>
                              {dropPct !== null && step.count > 0 && (
                                <span style={{ fontSize: 11, color: "var(--down)", fontWeight: 600 }}>−{dropPct.toFixed(0)}%</span>
                              )}
                              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{step.count.toLocaleString("id-ID")}</span>
                            </div>
                          </div>
                          <div style={{ height: 7, borderRadius: 4, background: "var(--line-soft)" }}>
                            <div style={{ height: "100%", borderRadius: 4, background: barColor, width: `${(step.count / max) * 100}%`, transition: "width .4s" }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Top place pages */}
          {data.topPlaces.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ ...cardStyle, padding: "20px 24px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>Tempat Paling Banyak Dikunjungi</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>{periodNote} · pageviews halaman /place</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 32px" }}>
                  {data.topPlaces.map((p, i) => {
                    const total = data.topPlaces.reduce((s, r) => s + r.views, 0);
                    const pctVal = total > 0 ? (p.views / total) * 100 : 0;
                    return (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {i + 1}. {p.title || p.path}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{p.path}</div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{fmt(p.views)}</span>
                            <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 4 }}>{pctVal.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div style={{ height: 5, borderRadius: 3, background: "var(--line-soft)" }}>
                          <div style={{ height: "100%", borderRadius: 3, background: "var(--primary)", width: `${pctVal}%`, opacity: 0.65 + (0.35 * (1 - i / 10)) }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
