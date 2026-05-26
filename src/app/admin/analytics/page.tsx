export const metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0e1d4f", margin: 0 }}>Analytics</h1>
        <p style={{ fontSize: 14, color: "#6b7280", marginTop: 6 }}>Traffic and engagement data.</p>
      </div>

      <div style={{
        background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb",
        padding: "48px 32px", textAlign: "center", maxWidth: 560,
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0e1d4f", margin: "0 0 10px" }}>
          Analytics Coming Soon
        </h2>
        <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, margin: "0 0 24px" }}>
          Plug in your Google Analytics or Facebook Pixel tracking codes to see traffic data here.
          Once connected, this dashboard will display page views, unique visitors, top pages, and referral sources.
        </p>

        <div style={{ background: "#f9fafb", borderRadius: 10, padding: "16px 20px", textAlign: "left", marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>To set up tracking:</div>
          <ol style={{ fontSize: 13, color: "#6b7280", paddingLeft: 18, margin: 0, lineHeight: 1.8 }}>
            <li>Get your Google Analytics 4 Measurement ID (G-XXXXXXXXXX)</li>
            <li>Or get your Facebook Pixel ID</li>
            <li>Provide the ID — we&apos;ll wire it into the site layout immediately</li>
          </ol>
        </div>

        <div style={{ fontSize: 12, color: "#9ca3af" }}>
          This panel will auto-populate once a tracker is connected.
        </div>
      </div>
    </div>
  );
}
