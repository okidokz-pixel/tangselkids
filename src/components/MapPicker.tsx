"use client";
import { useState, useRef, useEffect } from "react";
import { X, Search, MapPin, Loader, Navigation } from "lucide-react";
import { ActionButton } from "./ActionButton";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    suburb?: string;
    city_district?: string;
    city?: string;
    county?: string;
    state?: string;
  };
}

interface Props {
  initialAddress?: string;
  onConfirm: (address: string, lat: number, lng: number) => void;
  onClose: () => void;
}

export function MapPicker({ initialAddress, onConfirm, onClose }: Props) {
  const [query,      setQuery]      = useState(initialAddress ?? "");
  const [results,    setResults]    = useState<NominatimResult[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [selected,   setSelected]   = useState<NominatimResult | null>(null);
  const [error,      setError]      = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  function search(q: string) {
    if (!q.trim() || q.trim().length < 4) { setResults([]); return; }
    setLoading(true);
    setError("");
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=id&limit=6&addressdetails=1`,
      { headers: { "Accept-Language": "id" } }
    )
      .then(r => r.json())
      .then((data: NominatimResult[]) => {
        setResults(data);
        if (data.length === 0) setError("Alamat tidak ditemukan. Coba kata kunci lain.");
      })
      .catch(() => setError("Gagal mencari. Cek koneksi internet."))
      .finally(() => setLoading(false));
  }

  function handleInputChange(val: string) {
    setQuery(val);
    setSelected(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 600);
  }

  function handleGPS() {
    if (!navigator.geolocation) { setError("GPS tidak tersedia di perangkat ini."); return; }
    setGpsLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            { headers: { "Accept-Language": "id" } }
          );
          const data = await res.json();
          if (data.display_name) {
            const fakeResult: NominatimResult = {
              place_id: 0,
              display_name: data.display_name,
              lat: String(lat),
              lon: String(lng),
              address: data.address ?? {},
            };
            setSelected(fakeResult);
            setQuery(data.display_name);
            setResults([]);
          }
        } catch {
          setError("Gagal mendapatkan nama lokasi.");
        }
        setGpsLoading(false);
      },
      () => { setGpsLoading(false); setError("Akses lokasi ditolak atau waktu habis."); },
      { timeout: 10000 }
    );
  }

  function handleConfirm() {
    if (!selected) return;
    onConfirm(selected.display_name, parseFloat(selected.lat), parseFloat(selected.lon));
  }

  // Shorten display name for the result list
  function shortName(r: NominatimResult) {
    const parts = r.display_name.split(", ");
    return parts.slice(0, 4).join(", ");
  }

  const mapSrc = selected
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(selected.lon) - 0.006},${parseFloat(selected.lat) - 0.006},${parseFloat(selected.lon) + 0.006},${parseFloat(selected.lat) + 0.006}&layer=mapnik&marker=${selected.lat},${selected.lon}`
    : null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.50)",
        animation: "sheet-fade-in 0.2s ease both",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "#fff", borderRadius: "24px 24px 0 0",
          padding: "0 0 40px",
          maxWidth: 448, margin: "0 auto",
          maxHeight: "92dvh", display: "flex", flexDirection: "column",
          animation: "sheet-slide-up 0.38s cubic-bezier(0.32, 0.72, 0, 1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 999, background: "#e2e8f0", margin: "12px auto 0" }} />

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 20px 0",
        }}>
          <MapPin size={20} color="var(--tk-accent, #2e8a5a)" />
          <p style={{
            flex: 1, margin: 0,
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontSize: 17, fontWeight: 700, color: "var(--tk-ink, #0e1d4f)",
          }}>
            Pilih Alamat
          </p>
          <ActionButton onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 999,
            background: "#f1f5f9", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={16} color="#64748b" />
          </ActionButton>
        </div>

        {/* Search box */}
        <div style={{ padding: "16px 20px 0" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            border: "1.5px solid #e2e8f0", borderRadius: 14,
            background: "#f8fafc", padding: "0 12px",
          }}>
            {loading
              ? <Loader size={16} color="#94a3b8" style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
              : <Search size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
            }
            <input
              ref={inputRef}
              type="text"
              placeholder="Cari alamat, nama jalan, atau area…"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              style={{
                flex: 1, padding: "12px 0", border: "none", background: "transparent",
                fontSize: 14, outline: "none", color: "#0f172a",
                fontFamily: "var(--font-jakarta), sans-serif",
              }}
            />
            {query && (
              <ActionButton
                onClick={() => { setQuery(""); setResults([]); setSelected(null); setError(""); }}
                style={{ background: "none", border: "none", padding: 4, flexShrink: 0 }}
              >
                <X size={14} color="#94a3b8" />
              </ActionButton>
            )}
          </div>

          {/* GPS button */}
          <ActionButton
            onClick={handleGPS}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              marginTop: 10, padding: "7px 14px", borderRadius: 999,
              background: "var(--tk-accent-pale, #e6f4ed)", color: "var(--tk-accent, #2e8a5a)",
              fontSize: 12.5, fontWeight: 700,
              border: "1.5px solid #a7d4bc",
            }}
          >
            {gpsLoading
              ? <><Loader size={13} style={{ animation: "spin 1s linear infinite" }} /> Mencari lokasi…</>
              : <><Navigation size={13} /> Gunakan Lokasiku</>
            }
          </ActionButton>
        </div>

        {/* Scrollable results */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px 0" }}>
          {error && (
            <p style={{
              fontSize: 12.5, color: "#ef4444", fontFamily: "var(--font-jakarta), sans-serif",
              margin: "8px 0",
            }}>
              {error}
            </p>
          )}

          {/* Map preview for selected */}
          {mapSrc && (
            <div style={{ borderRadius: 14, overflow: "clip", marginBottom: 12, height: 160, border: "1.5px solid #e2e8f0" }}>
              <iframe
                src={mapSrc}
                width="100%"
                height="160"
                style={{ border: "none", display: "block", pointerEvents: "none" }}
                title="Peta lokasi"
              />
            </div>
          )}

          {/* Result list */}
          {results.map((r, i) => (
            <ActionButton
              key={r.place_id || i}
              onClick={() => {
                setSelected(r);
                setQuery(r.display_name);
                setResults([]);
              }}
              style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                width: "100%", padding: "12px 14px", borderRadius: 12,
                marginBottom: 6,
                background: "#f8fafc", border: "1.5px solid #e2e8f0",
                textAlign: "left",
              }}
            >
              <MapPin size={15} color="var(--tk-accent, #2e8a5a)" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{
                fontSize: 13, color: "#1e293b", lineHeight: 1.45,
                fontFamily: "var(--font-jakarta), sans-serif",
              }}>
                {shortName(r)}
              </span>
            </ActionButton>
          ))}
        </div>

        {/* Confirm button */}
        <div style={{ padding: "12px 20px 0" }}>
          <ActionButton
            onClick={handleConfirm}
            style={{
              width: "100%", padding: "15px 0", borderRadius: 16, border: "none",
              background: selected
                ? "linear-gradient(135deg, #1f6b43, #2e8a5a)"
                : "#e2e8f0",
              color: selected ? "#fff" : "#94a3b8",
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: 15, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <MapPin size={16} />
            {selected ? "Gunakan Alamat Ini" : "Pilih alamat dari hasil pencarian"}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
