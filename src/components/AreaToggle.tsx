"use client";
import { useLang } from "@/context/LanguageContext";

export type AreaFilter = "all" | "bintaro" | "bsd";

interface Props {
  value: AreaFilter;
  onChange: (v: AreaFilter) => void;
}

// Uses label + hidden radio for 100% iOS tap reliability
export function AreaToggle({ value, onChange }: Props) {
  const { t } = useLang();

  const options: { v: AreaFilter; label: string }[] = [
    { v: "all",     label: t.areaAll     },
    { v: "bintaro", label: t.areaBintaro },
    { v: "bsd",     label: t.areaBSD     },
  ];

  return (
    <div style={{
      display: "inline-flex",
      background: "#f1f5f9",
      borderRadius: 12,
      padding: 3,
      gap: 2,
    }}>
      {options.map((o) => (
        <label
          key={o.v}
          style={{
            display: "block",
            cursor: "pointer",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          <input
            type="radio"
            name="area-toggle"
            value={o.v}
            checked={value === o.v}
            onChange={() => onChange(o.v)}
            style={{
              position: "absolute",
              width: 1, height: 1,
              padding: 0, margin: -1,
              overflow: "hidden",
              clip: "rect(0,0,0,0)",
              border: 0,
              opacity: 0,
            }}
          />
          <span style={{
            display: "block",
            padding: "5px 14px",
            borderRadius: 9,
            fontSize: 12,
            fontWeight: 700,
            whiteSpace: "nowrap",
            background: value === o.v ? "var(--tk-accent, #2e8a5a)" : "transparent",
            color: value === o.v ? "#fff" : "#6b7280",
            boxShadow: value === o.v ? "0 1px 4px rgba(15,23,42,0.12)" : "none",
            transition: "background 0.15s, color 0.15s",
          }}>
            {o.label}
          </span>
        </label>
      ))}
    </div>
  );
}
