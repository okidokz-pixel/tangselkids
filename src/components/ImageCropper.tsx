"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { Check, X, ZoomIn, ZoomOut } from "lucide-react";

interface Props {
  imageSrc: string;
  onConfirm: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

const SIZE = 280; // crop circle diameter in px

export function ImageCropper({ imageSrc, onConfirm, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement | null>(null);

  // Offset = how much the image centre is shifted from the circle centre
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [scale,   setScale]   = useState(1);
  const [ready,   setReady]   = useState(false);

  // ── Derived helpers ──────────────────────────────────────────────────────────
  const minScale = useCallback((img: HTMLImageElement) => {
    // Smallest scale that still fills the crop circle
    return Math.max(SIZE / img.naturalWidth, SIZE / img.naturalHeight);
  }, []);

  const clamp = useCallback((img: HTMLImageElement, ox: number, oy: number, sc: number) => {
    // Half the (scaled) image dimensions
    const hw = (img.naturalWidth  * sc) / 2;
    const hh = (img.naturalHeight * sc) / 2;
    const hr = SIZE / 2;
    // The centre of the crop circle must stay within the scaled image
    const cx = Math.min(Math.max(ox, -(hw - hr)), hw - hr);
    const cy = Math.min(Math.max(oy, -(hh - hr)), hh - hr);
    return { cx, cy };
  }, []);

  // ── Load image ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const s = minScale(img);
      setScale(s);
      setOffsetX(0);
      setOffsetY(0);
      setReady(true);
    };
    img.src = imageSrc;
  }, [imageSrc, minScale]);

  // ── Draw to canvas ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready || !imgRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = imgRef.current;

    ctx.clearRect(0, 0, SIZE, SIZE);
    const w = img.naturalWidth  * scale;
    const h = img.naturalHeight * scale;
    const x = SIZE / 2 - w / 2 + offsetX;
    const y = SIZE / 2 - h / 2 + offsetY;
    ctx.drawImage(img, x, y, w, h);
  }, [ready, offsetX, offsetY, scale]);

  // ── Touch / mouse drag ───────────────────────────────────────────────────────
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const lastPinchDist = useRef<number | null>(null);
  const lastPinchScale = useRef<number>(1);

  function getCenter(e: React.TouchEvent) {
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    return {
      cx: (t1.clientX + t2.clientX) / 2,
      cy: (t1.clientY + t2.clientY) / 2,
      dist: Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY),
    };
  }

  function onTouchStart(e: React.TouchEvent) {
    e.preventDefault();
    if (e.touches.length === 1) {
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, ox: offsetX, oy: offsetY };
      lastPinchDist.current = null;
    } else if (e.touches.length === 2) {
      dragStart.current = null;
      const { dist } = getCenter(e);
      lastPinchDist.current = dist;
      lastPinchScale.current = scale;
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    e.preventDefault();
    if (!imgRef.current) return;
    const img = imgRef.current;
    if (e.touches.length === 1 && dragStart.current) {
      const dx = e.touches[0].clientX - dragStart.current.x;
      const dy = e.touches[0].clientY - dragStart.current.y;
      const raw = { ox: dragStart.current.ox + dx, oy: dragStart.current.oy + dy };
      const { cx, cy } = clamp(img, raw.ox, raw.oy, scale);
      setOffsetX(cx);
      setOffsetY(cy);
    } else if (e.touches.length === 2 && lastPinchDist.current !== null) {
      const { dist } = getCenter(e);
      const ratio = dist / lastPinchDist.current;
      const newScale = Math.min(Math.max(lastPinchScale.current * ratio, minScale(img)), minScale(img) * 4);
      const { cx, cy } = clamp(img, offsetX, offsetY, newScale);
      setScale(newScale);
      setOffsetX(cx);
      setOffsetY(cy);
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (e.touches.length < 2) {
      lastPinchDist.current = null;
    }
    if (e.touches.length === 0) {
      dragStart.current = null;
    }
  }

  function adjustScale(delta: number) {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const newScale = Math.min(Math.max(scale + delta, minScale(img)), minScale(img) * 4);
    const { cx, cy } = clamp(img, offsetX, offsetY, newScale);
    setScale(newScale);
    setOffsetX(cx);
    setOffsetY(cy);
  }

  // ── Extract cropped circle ───────────────────────────────────────────────────
  function handleConfirm() {
    const src = canvasRef.current;
    if (!src) return;
    // Draw circular crop into a new canvas
    const out = document.createElement("canvas");
    out.width = SIZE;
    out.height = SIZE;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(src, 0, 0);
    onConfirm(out.toDataURL("image/jpeg", 0.9));
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.88)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 20, padding: "24px 20px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Title */}
      <p style={{
        color: "#fff", fontFamily: "var(--font-fraunces), Georgia, serif",
        fontSize: 18, fontWeight: 700, margin: 0,
      }}>
        Sesuaikan Foto
      </p>

      {/* Canvas crop area */}
      <div style={{ position: "relative", borderRadius: 999, overflow: "clip", flexShrink: 0 }}>
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          style={{ display: "block", touchAction: "none", userSelect: "none" }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
        {/* Circular overlay ring */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: 999,
          boxShadow: "inset 0 0 0 2.5px rgba(255,255,255,0.7), 0 0 0 9999px rgba(0,0,0,0.5)",
          pointerEvents: "none",
        }} />
      </div>

      <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, margin: 0, textAlign: "center" }}>
        Geser untuk memposisikan • Cubit untuk zoom
      </p>

      {/* Zoom controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={() => adjustScale(-0.1)}
          style={{
            width: 40, height: 40, borderRadius: 999,
            background: "rgba(255,255,255,0.18)", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", touchAction: "manipulation",
          }}
        >
          <ZoomOut size={18} color="white" />
        </button>
        <div style={{
          width: 120, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.2)",
          position: "relative",
        }}>
          {imgRef.current && (
            <div style={{
              position: "absolute", left: 0, top: 0, height: "100%", borderRadius: 999,
              background: "#3b82f6",
              width: `${((scale - minScale(imgRef.current)) / (minScale(imgRef.current) * 3)) * 100}%`,
            }} />
          )}
        </div>
        <button
          onClick={() => adjustScale(0.1)}
          style={{
            width: 40, height: 40, borderRadius: 999,
            background: "rgba(255,255,255,0.18)", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", touchAction: "manipulation",
          }}
        >
          <ZoomIn size={18} color="white" />
        </button>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 280 }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1, padding: "13px 0", borderRadius: 14,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "#fff", fontSize: 14, fontWeight: 600,
            cursor: "pointer", touchAction: "manipulation",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <X size={16} /> Batal
        </button>
        <button
          onClick={handleConfirm}
          style={{
            flex: 1, padding: "13px 0", borderRadius: 14,
            background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
            border: "none",
            color: "#fff", fontSize: 14, fontWeight: 700,
            cursor: "pointer", touchAction: "manipulation",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <Check size={16} /> Gunakan
        </button>
      </div>
    </div>
  );
}
