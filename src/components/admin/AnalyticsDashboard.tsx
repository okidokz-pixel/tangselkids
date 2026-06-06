"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import type { GaStats } from "@/lib/ga-data";

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
      color: up ? "#16a34a" : "#dc2626",
      background: up ? "#f0fdf4" : "#fef2f2",
      padding: "2px 8px", borderRadius: 20,
      display: "inline-flex", alignItems: "center", gap: 3,
    }}>
      {up ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
    </span>
  );
}

function KpiCard({ label, value, current, prev, sub }: {
  label: string; value: string; current: number; prev: number; sub: string;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", border: "1px solid #e5e7eb", flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "#0e1d4f", letterSpacing: "-0.02em", marginBottom: 8 }}>{value}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Trend current={current} prev={prev} />
        <span style={{ fontSize: 11, color: "#9ca3af" }}>vs {sub}</span>
      </div>
    </div>
  );
}

const COUNTRY_FLAGS: Record<string, string> = {
  "Indonesia": "🇮🇩", "United States": "🇺🇸", "Singapore": "🇸🇬",
  "Malaysia": "🇲🇾", "Australia": "🇦🇺", "United Kingdom": "🇬🇧",
  "Netherlands": "🇳🇱", "Germany": "🇩🇪", "Japan": "🇯🇵",
  "India": "🇮🇳", "Canada": "🇨🇦", "France": "🇫🇷",
};

export function AnalyticsDashboard({ stats }: { stats: GaStats }) {
  const totalDeviceSessions = stats.deviceBreakdown.reduce((s, d) => s + d.sessions, 0);
  const totalCountrySessions = stats.countryBreakdown.reduce((s, d) => s + d.sessions, 0);
  const totalPageViews = stats.topPages.reduce((s, p) => s + p.views, 0);

  const chartData = stats.dailyData.map((d) => ({
    date: d.date.slice(5),
    pageviews: d.pageviews,
    users: d.users,
  }));

  const DEVICE_COLORS: Record<string, string> = {
    mobile: "#6366f1", desktop: "#0e1d4f", tablet: "#22c55e",
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0e1d4f", margin: 0 }}>Analytics</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            Data real-time · Google Analytics 4 · diperbarui setiap 5 menit
          </p>
        </div>
        <a href="https://analytics.google.com/analytics/web/" target="_blank" rel="noopener noreferrer"
          style={{ padding: "9px 18px", borderRadius: 10, background: "#0e1d4f", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
          Buka GA4 ↗
        </a>
      </div>

      {/* Active users banner */}
      <div style={{
        background: "linear-gradient(135deg, #0e1d4f 0%, #1a3a6e 100%)",
        borderRadius: 16, padding: "20px 28px", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%", background: "#22c55e",
            boxShadow: "0 0 0 4px rgba(34,197,94,0.25)",
          }} />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 500 }}>Pengunjung aktif sekarang</span>
        </div>
        <div style={{ fontSize: 48, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
          {stats.activeUsers}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 28 }}>
          {[
            { label: "Users hari ini", value: fmt(stats.today.users) },
            { label: "Sessions hari ini", value: fmt(stats.today.sessions) },
            { label: "Pageviews hari ini", value: fmt(stats.today.pageviews) },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{item.value}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <KpiCard label="Users" value={fmt(stats.week.users)} current={stats.week.users} prev={stats.prevWeek.users} sub="7 hari lalu" />
        <KpiCard label="Sessions" value={fmt(stats.week.sessions)} current={stats.week.sessions} prev={stats.prevWeek.sessions} sub="7 hari lalu" />
        <KpiCard label="Pageviews" value={fmt(stats.week.pageviews)} current={stats.week.pageviews} prev={stats.prevWeek.pageviews} sub="7 hari lalu" />
        <KpiCard label="Users (30h)" value={fmt(stats.month.users)} current={stats.month.users} prev={stats.prevMonth.users} sub="30 hari lalu" />
        <KpiCard label="Pageviews (30h)" value={fmt(stats.month.pageviews)} current={stats.month.pageviews} prev={stats.prevMonth.pageviews} sub="30 hari lalu" />
      </div>

      {/* Chart + Countries */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, marginBottom: 16 }}>
        {/* Area chart */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0e1d4f" }}>Tren Traffic</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Pageviews & Users · 30 hari terakhir</div>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#6b7280" }}>
                <span style={{ width: 10, height: 3, background: "#0e1d4f", borderRadius: 2, display: "inline-block" }} /> Pageviews
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#6b7280" }}>
                <span style={{ width: 10, height: 3, background: "#6366f1", borderRadius: 2, display: "inline-block" }} /> Users
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gPageviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0e1d4f" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0e1d4f" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                labelStyle={{ fontWeight: 600, color: "#0e1d4f" }}
              />
              <Area type="monotone" dataKey="pageviews" stroke="#0e1d4f" strokeWidth={2} fill="url(#gPageviews)" dot={false} />
              <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} fill="url(#gUsers)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Countries */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px 20px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0e1d4f", marginBottom: 4 }}>Negara</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>Sessions · 30 hari</div>
          {stats.countryBreakdown.map((c, i) => {
            const pctVal = totalCountrySessions > 0 ? (c.sessions / totalCountrySessions) * 100 : 0;
            return (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
                    <span>{COUNTRY_FLAGS[c.country] ?? "🌍"}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>{c.country}</span>
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0e1d4f", flexShrink: 0 }}>{pctVal.toFixed(0)}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: "#f3f4f6" }}>
                  <div style={{ height: "100%", borderRadius: 3, background: "#0e1d4f", width: `${pctVal}%`, opacity: 0.7 + (0.3 * (1 - i / 6)) }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Top pages */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "clip" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0e1d4f" }}>Halaman Teratas</span>
            <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 8 }}>7 hari · pageviews</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {stats.topPages.slice(0, 8).map((p, i) => {
                const pctVal = totalPageViews > 0 ? (p.views / totalPageViews) * 100 : 0;
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                    <td style={{ padding: "10px 20px", fontSize: 12, color: "#374151", maxWidth: 200 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={p.path}>{p.path}</div>
                      <div style={{ height: 3, borderRadius: 2, background: "#f3f4f6", marginTop: 5 }}>
                        <div style={{ height: "100%", borderRadius: 2, background: "#6366f1", width: `${pctVal}%` }} />
                      </div>
                    </td>
                    <td style={{ padding: "10px 20px 10px 0", textAlign: "right", fontSize: 13, fontWeight: 700, color: "#0e1d4f", whiteSpace: "nowrap" }}>
                      {fmt(p.views)}
                      <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400, marginLeft: 4 }}>{pctVal.toFixed(0)}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Traffic sources bar chart */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "16px 20px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0e1d4f", marginBottom: 4 }}>Sumber Traffic</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 14 }}>Sessions · 7 hari</div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={stats.topSources.slice(0, 5).map((s) => ({
                name: s.source === "(direct)" ? "Direct" : s.source.length > 12 ? s.source.slice(0, 12) + "…" : s.source,
                sessions: s.sessions,
              }))} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} width={65} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Bar dataKey="sessions" fill="#0e1d4f" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Device breakdown */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "16px 20px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0e1d4f", marginBottom: 4 }}>Device</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 14 }}>Sessions · 30 hari</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {stats.deviceBreakdown.map((d, i) => {
                const pctVal = totalDeviceSessions > 0 ? (d.sessions / totalDeviceSessions) * 100 : 0;
                const color = DEVICE_COLORS[d.device] ?? "#9ca3af";
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: "#374151", textTransform: "capitalize", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
                        {d.device}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0e1d4f" }}>{pctVal.toFixed(0)}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "#f3f4f6" }}>
                      <div style={{ height: "100%", borderRadius: 3, background: color, width: `${pctVal}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
