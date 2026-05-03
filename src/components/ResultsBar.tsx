"use client";
import { SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import { ActionButton } from "./ActionButton";

export function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5,
      background: "var(--tk-accent-pale, #e6f4ed)", borderRadius: 999, padding: "5px 8px 5px 12px",
      fontSize: 12.5, fontWeight: 600, color: "var(--tk-ink, #0e1d4f)" }}>
      {label}
      <ActionButton onClick={onRemove} ariaLabel="Remove filter" style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--tk-accent, #2e8a5a)", borderRadius: 999, width: 17, height: 17, flexShrink: 0 }}>
        <X size={9} color="white" strokeWidth={3} />
      </ActionButton>
    </div>
  );
}

export function FilterSortBar({
  onOpenFilter, activeFilterCount, sortBy, onToggleSort, sortLabel,
}: {
  onOpenFilter: () => void;
  activeFilterCount: number;
  sortBy: "rating" | "price";
  onToggleSort: () => void;
  sortLabel: string;
  filterLabel?: string;
  clearAllLabel?: string;
}) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <ActionButton onClick={onOpenFilter} style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "10px 16px", borderRadius: 999,
        background: "var(--tk-accent, #2e8a5a)", color: "#fff", fontWeight: 700, fontSize: 13.5, flexShrink: 0 }}>
        <SlidersHorizontal size={14} strokeWidth={2.5} />
        Filter
        {activeFilterCount > 0 && (
          <span style={{ background: "#f59e0b", color: "#fff", borderRadius: 999, minWidth: 20, height: 20,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 800, padding: "0 5px" }}>
            {activeFilterCount}
          </span>
        )}
      </ActionButton>
      <ActionButton onClick={onToggleSort} style={{
        display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 999,
        background: "#fff", color: "#374151", fontWeight: 600, fontSize: 13.5, border: "1.5px solid #e2e8f0" }}>
        <ArrowUpDown size={14} strokeWidth={2.5} />
        {sortLabel}
        <span style={{ fontSize: 11, color: "var(--tk-accent, #2e8a5a)", fontWeight: 700 }}>
          {sortBy === "rating" ? "★" : "↑Rp"}
        </span>
      </ActionButton>
    </div>
  );
}
