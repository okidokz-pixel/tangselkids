"use client";
import { useState, useRef, useEffect } from "react";
import { X, Search, MapPin, Loader, Navigation } from "lucide-react";
import { ActionButton } from "./ActionButton";

interface Prediction {
  place_id: string;
  description: string;
}

interface SelectedPlace {
  address: string;
  lat: number;
  lng: number;
}

interface Props {
  initialAddress?: string;
  onConfirm: (address: string, lat: number, lng: number) => void;
  onClose: () => void;
  zIndex?: number;
}

export function MapPicker({ initialAddress, onConfirm, onClose, zIndex = 300 }: Props) {
  const [query,         setQuery]         = useState(initialAddress ?? "");
  const [predictions,   setPredictions]   = useState<Prediction[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [gpsLoading,    setGpsLoading]    = useState(false);
  const [selected,      setSelected]      = useState<SelectedPlace | null>(null);
  const [error,         setError]         = useState("");
  const inputRef   = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // ── Autocomplete search ───────────────────────────────────────────────────
  function search(q: string) {
    if (!q.trim() || q.trim().length < 3) { setPredictions([]); return; }
    setLoading(true);
    setError("");
    fetch(`/api/places?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then((data) => {
        if (data.status === "OK" || data.status === "ZERO_RESULTS") {
          const preds: Prediction[] = (data.predictions ?? []).map((p: { place_id: string; description: string }) => ({
            place_id: p.place_id,
            description: p.description,
          }));
          setPredictions(preds);
          if (preds.length === 0) setError("Alamat tidak ditemukan. Coba kata kunci lain.");
        } else {
          setError("Gagal mencari. Cek koneksi internet.");
        }
      })
      .catch(() => setError("Gagal mencari. Cek koneksi internet."))
      .finally(() => setLoading(false));
  }

  function handleInputChange(val: string) {
    setQuery(val);
    setSelected(null);
    setPredictions([]);
    setError("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 500);
  }

  // ── Pick a prediction → fetch coords ─────────────────────────────────────
  async function handleSelect(pred: Prediction) {
    setDetailLoading(true);
    setError("");
    setPredictions([]);
    setQuery(pred.description);
    try {
      const res  = await fetch(`/api/places?place_id=${encodeURIComponent(pred.place_id)}`);
      const data = await res.json();
      if (data.status === "OK" && data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        setSelected({
          address: data.result.formatted_address ?? pred.description,
          lat,
          lng,
        });
      } else {
        setError("Gagal memuat detail lokasi. Coba pilih lagi.");
      }
    } catch {
      setError("Gagal memuat detail lokasi.");
    }
    setDetailLoading(false);
  }

  // ── GPS → reverse geocode ─────────────────────────────────────────────────
  function handleGPS() {
    if (!navigator.geolocation) { setError("GPS tidak tersedia di perangkat ini."); return; }
    setGpsLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        try {
          const res  = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
          const data = await res.json();
          const address =
            data.results?.[0]?.formatted_address ??
            `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setSelected({ address, lat, lng });
          setQuery(address);
          setPredictions([]);
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
    onConfirm(selected.address, selected.lat, selected.lng);
  }

  // Strip trailing ", Indonesia" from Google's description for cleaner display
  function shortDesc(desc: string) {
    return desc.replace(/,\s*Indonesia$/, "");
  }

  const mapSrc = selected
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${selected.lng - 0.006},${selected.lat - 0.006},${selected.lng + 0.006},${selected.lat + 0.006}&layer=mapnik&marker=${selected.lat},${selected.lng}`
    : null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: zIndex,
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
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px 0" }}>
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
            {loading || detailLoading
              ? <Loader size={16} color="#94a3b8" style={{ animation: "rs-spin 1s linear infinite", flexShrink: 0 }} />
              : <Search size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
            }
            <input
              ref={inputRef}
              type="text"
              placeholder="Cari alamat, nama jalan, perumahan…"
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
                onClick={() => { setQuery(""); setPredictions([]); setSelected(null); setError(""); }}
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
              ? <><Loader size={13} style={{ animation: "rs-spin 1s linear infinite" }} /> Mencari lokasi…</>
              : <><Navigation size={13} /> Gunakan Lokasiku</>
            }
          </ActionButton>

          {/* Powered by Google */}
          <p style={{
            margin: "8px 0 0", fontSize: 10.5, color: "#94a3b8",
            fontFamily: "var(--font-jakarta), sans-serif",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            Powered by Google Maps
          </p>
        </div>

        {/* Scrollable results */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 20px 0" }}>
          {error && (
            <p style={{
              fontSize: 12.5, color: "#ef4444",
              fontFamily: "var(--font-jakarta), sans-serif",
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

          {/* Prediction list */}
          {predictions.map((pred, i) => (
            <ActionButton
              key={pred.place_id || i}
              onClick={() => handleSelect(pred)}
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
                {shortDesc(pred.description)}
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
