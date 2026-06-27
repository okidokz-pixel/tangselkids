import { getGaStats, fetchGaRange } from "@/lib/ga-data";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { getRegistrationStats } from "@/app/admin/actions";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const registrations = await getRegistrationStats().catch(() => null);

  let stats, initial;
  try {
    // stats → realtime/today banner; initial → all period-dependent sections at the default 7-day window
    [stats, initial] = await Promise.all([
      getGaStats(),
      fetchGaRange("6daysAgo", "today", { start: "13daysAgo", end: "7daysAgo" }),
    ]);
  } catch {
    return (
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--ink)", margin: "0 0 12px" }}>Analytics</h1>
        <div style={{ background: "var(--down-soft)", border: "1px solid var(--down)", borderRadius: 12, padding: "20px 24px", color: "var(--down)", fontSize: 14 }}>
          Gagal memuat data dari Google Analytics. Pastikan service account sudah diberi akses ke properti GA4.
        </div>
      </div>
    );
  }

  return <AnalyticsDashboard stats={stats} initial={initial} registrations={registrations} />;
}
