import { getGaStats } from "@/lib/ga-data";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  let stats;
  try {
    stats = await getGaStats();
  } catch {
    return (
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0e1d4f", margin: "0 0 12px" }}>Analytics</h1>
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "20px 24px", color: "#dc2626", fontSize: 14 }}>
          Gagal memuat data dari Google Analytics. Pastikan service account sudah diberi akses ke properti GA4.
        </div>
      </div>
    );
  }

  return <AnalyticsDashboard stats={stats} />;
}
