import type { FeeDetails } from "@/lib/mockData";

/** Constant footer shown under every school's fee breakdown. */
const DISCLAIMER =
  "Data ini dikumpulkan melalui riset TangselKids dan tidak dijamin akurat 100%. Silakan hubungi pihak sekolah untuk data yang lebih akurat.";

const F = "var(--font-jakarta), sans-serif";

/**
 * Renders a structured, editable fee breakdown (replaces the uploaded fee image
 * for schools). Purely presentational — the login gate + collapsible live in the
 * place page. `tahun` is the fee reference year (e.g. "2025/2026"), shown by the
 * heading when available.
 */
export function FeeDetailsView({ details, tahun }: { details: FeeDetails; tahun?: string }) {
  const rows = details.rows ?? [];
  return (
    <div style={{ fontFamily: F }}>
      {details.intro && (
        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "#475569", margin: "0 0 12px" }}>
          {details.intro}
        </p>
      )}

      {/* Heading */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#166534" }}>Rincian Biaya</span>
        {details.estimasi && (
          <span
            style={{
              fontSize: 11, fontWeight: 700, color: "#92834b",
              background: "#fef7e0", border: "1px solid #f2e3ab",
              borderRadius: 999, padding: "1px 8px",
            }}
          >
            Estimasi
          </span>
        )}
        {tahun && (
          <span style={{ fontSize: 11.5, color: "#9ca3af", fontWeight: 500, marginLeft: "auto" }}>
            {tahun}
          </span>
        )}
      </div>

      {/* Rows */}
      {rows.length > 0 && (
        <div style={{ border: "1px solid #e9eef4", borderRadius: 12, overflow: "clip" }}>
          {rows.map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                gap: 12, padding: "10px 12px",
                borderTop: i === 0 ? "none" : "1px solid #eef2f6",
                background: i % 2 === 1 ? "#fbfdfc" : "#fff",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1f2a44" }}>{r.label}</div>
                {r.note && (
                  <div style={{ fontSize: 11.5, fontStyle: "italic", color: "#94a3b8", marginTop: 2 }}>
                    {r.note}
                  </div>
                )}
              </div>
              <div
                style={{
                  fontSize: 13.5, fontWeight: 800, color: "#15803d",
                  textAlign: "right", whiteSpace: "nowrap", flexShrink: 0,
                }}
              >
                {r.amount}
              </div>
            </div>
          ))}
        </div>
      )}

      {details.rowsNote && (
        <p style={{ fontSize: 11.5, fontStyle: "italic", lineHeight: 1.5, color: "#94a3b8", margin: "8px 2px 0" }}>
          {details.rowsNote}
        </p>
      )}

      {details.catatan && (
        <div style={{ marginTop: 12, background: "#f0fdf4", border: "1px solid #dcfce7", borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#166534", marginBottom: 3 }}>Catatan</div>
          <p style={{ fontSize: 12.5, lineHeight: 1.5, color: "#3f6b52", margin: 0 }}>{details.catatan}</p>
        </div>
      )}

      <p style={{ fontSize: 11, lineHeight: 1.5, color: "#a2acb8", margin: "12px 2px 0" }}>
        {DISCLAIMER}
      </p>
    </div>
  );
}
