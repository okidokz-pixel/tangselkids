"use client";

export function SkeletonCard() {
  return (
    <div style={{
      display: "flex", borderRadius: 18, overflow: "clip",
      background: "#fff", border: "1px solid #e2e8f0",
      boxShadow: "0 1px 0 rgba(15,23,42,0.04), 0 6px 16px rgba(15,23,42,0.06)",
      minHeight: 96,
    }}>
      <div className="sk-line" style={{ width: 96, flexShrink: 0, borderRadius: 0 }} />
      <div style={{ flex: 1, padding: "14px 14px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
        <div className="sk-line" style={{ height: 14, width: "72%", borderRadius: 6 }} />
        <div className="sk-line" style={{ height: 11, width: "48%", borderRadius: 6 }} />
        <div className="sk-line" style={{ height: 11, width: "32%", borderRadius: 6 }} />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <>
      <style>{`
        @keyframes sk-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .sk-line {
          background: linear-gradient(90deg, #e2e8f0 25%, #edf2f7 50%, #e2e8f0 75%);
          background-size: 800px 100%;
          animation: sk-shimmer 1.4s ease-in-out infinite;
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </>
  );
}
