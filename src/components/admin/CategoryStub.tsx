export function CategoryStub({ label, icon }: { label: string; icon: string }) {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0e1d4f", margin: 0 }}>
          {icon} {label}
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", marginTop: 6 }}>Manage {label} listings.</p>
      </div>

      <div style={{
        background: "#fff", borderRadius: 16, border: "1.5px dashed #d1d5db",
        padding: "48px 32px", textAlign: "center", maxWidth: 480,
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#374151", margin: "0 0 10px" }}>
          {label} — Coming Soon
        </h2>
        <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
          This category is not yet active. Once data is added to the{" "}
          <code style={{ background: "#f3f4f6", borderRadius: 4, padding: "1px 6px", fontSize: 13 }}>
            {label.toLowerCase().replace(/\s+/g, "_")}
          </code>{" "}
          table, full editing will be enabled here.
        </p>
      </div>
    </div>
  );
}
