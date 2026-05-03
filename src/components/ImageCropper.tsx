"use client";
import { useRef, useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

interface Props {
  imageSrc: string;
  onConfirm: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

const SIZE = 280; // crop circle diameter in px

export function ImageCropper({ imageSrc, onConfirm, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement | null>(null);
  const { t } = useLang();

  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [scale,   setScale]   = useState(1);
  const [minSc,   setMinSc]   = useState(1);
  const [ready,   setReady]   = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function calcMin(img: HTMLImageElement) {
    return Math.max(SIZE / img.naturalWidth, SIZE / img.naturalHeight);
  }

  function clamp(img: HTMLImageElement, ox: number, oy: number, sc: number) {
    const hw = (img.naturalWidth  * sc) / 2;
    const hh = (img.naturalHeight * sc) / 2;
    const hr = SIZE / 2;
    return {
      cx: Math.min(Math.max(ox, -(hw - hr)), hw - hr),
      cy: Math.min(Math.max(oy, -(hh - hr)), hh - hr),
    };
  }

  // ── Load image ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const s = calcMin(img);
      setMinSc(s);
      setScale(s);
      setOffsetX(0);
      setOffsetY(0);
      setReady(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // ── Draw ───────────────────────────────────────────────────────────────────
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

  // ── Drag via native listeners (avoids React passive/synthetic-event issues) ─
  // Use refs so event callbacks always see the latest values without stale closures.
  const offsetRef  = useRef({ x: 0, y: 0 });
  const scaleRef   = useRef(1);
  const dragRef    = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const pinchRef   = useRef<{ dist: number; sc: number } | null>(null);

  // Keep refs in sync
  useEffect(() => { offsetRef.current = { x: offsetX, y: offsetY }; }, [offsetX, offsetY]);
  useEffect(() => { scaleRef.current = scale; }, [scale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;

    function applyOffset(newOx: number, newOy: number) {
      const img = imgRef.current;
      if (!img) return;
      const { cx, cy } = clamp(img, newOx, newOy, scaleRef.current);
      offsetRef.current = { x: cx, y: cy };
      setOffsetX(cx);
      setOffsetY(cy);
    }

    function applyScale(newSc: number) {
      const img = imgRef.current;
      if (!img) return;
      const ms = calcMin(img);
      const sc = Math.min(Math.max(newSc, ms), ms * 4);
      const { cx, cy } = clamp(img, offsetRef.current.x, offsetRef.current.y, sc);
      scaleRef.current = sc;
      offsetRef.current = { x: cx, y: cy };
      setScale(sc);
      setOffsetX(cx);
      setOffsetY(cy);
    }

    // ── Touch ──────────────────────────────────────────────────────────────
    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      if (e.touches.length === 1) {
        dragRef.current = {
          sx: e.touches[0].clientX, sy: e.touches[0].clientY,
          ox: offsetRef.current.x,  oy: offsetRef.current.y,
        };
        pinchRef.current = null;
      } else if (e.touches.length === 2) {
        dragRef.current = null;
        pinchRef.current = {
          dist: Math.hypot(
            e.touches[1].clientX - e.touches[0].clientX,
            e.touches[1].clientY - e.touches[0].clientY,
          ),
          sc: scaleRef.current,
        };
      }
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      if (e.touches.length === 1 && dragRef.current) {
        applyOffset(
          dragRef.current.ox + (e.touches[0].clientX - dragRef.current.sx),
          dragRef.current.oy + (e.touches[0].clientY - dragRef.current.sy),
        );
      } else if (e.touches.length === 2 && pinchRef.current) {
        const dist = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY,
        );
        applyScale(pinchRef.current.sc * (dist / pinchRef.current.dist));
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (e.touches.length < 2) pinchRef.current = null;
      if (e.touches.length === 0) dragRef.current = null;
    }

    // ── Mouse (desktop) ────────────────────────────────────────────────────
    function onMouseDown(e: MouseEvent) {
      dragRef.current = {
        sx: e.clientX, sy: e.clientY,
        ox: offsetRef.current.x, oy: offsetRef.current.y,
      };
    }

    function onMouseMove(e: MouseEvent) {
      if (!dragRef.current) return;
      applyOffset(
        dragRef.current.ox + (e.clientX - dragRef.current.sx),
        dragRef.current.oy + (e.clientY - dragRef.current.sy),
      );
    }

    function onMouseUp() { dragRef.current = null; }

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove",  onTouchMove,  { passive: false });
    canvas.addEventListener("touchend",   onTouchEnd);
    canvas.addEventListener("mousedown",  onMouseDown);
    window.addEventListener("mousemove",  onMouseMove);
    window.addEventListener("mouseup",    onMouseUp);

    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove",  onTouchMove);
      canvas.removeEventListener("touchend",   onTouchEnd);
      canvas.removeEventListener("mousedown",  onMouseDown);
      window.removeEventListener("mousemove",  onMouseMove);
      window.removeEventListener("mouseup",    onMouseUp);
    };
  }, [ready]);

  // ── Slider ─────────────────────────────────────────────────────────────────
  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const img = imgRef.current;
    if (!img) return;
    const ms = calcMin(img);
    const newSc = ms + ms * 3 * (Number(e.target.value) / 100);
    const { cx, cy } = clamp(img, offsetX, offsetY, newSc);
    scaleRef.current = newSc;
    setScale(newSc);
    setOffsetX(cx);
    setOffsetY(cy);
  }

  const sliderVal = minSc > 0 ? Math.round(((scale - minSc) / (minSc * 3)) * 100) : 0;

  // ── Confirm ────────────────────────────────────────────────────────────────
  function handleConfirm() {
    const src = canvasRef.current;
    if (!src) return;
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
        {t.cropperTitle}
      </p>

      {/* Canvas crop area */}
      <div style={{
        position: "relative", borderRadius: 999, overflow: "clip",
        flexShrink: 0, cursor: "grab",
      }}>
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          style={{ display: "block", touchAction: "none", userSelect: "none" }}
        />
        {/* Ring overlay */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: 999,
          boxShadow: "inset 0 0 0 2.5px rgba(255,255,255,0.7), 0 0 0 9999px rgba(0,0,0,0.5)",
          pointerEvents: "none",
        }} />
      </div>

      {/* Hint */}
      <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, margin: 0, textAlign: "center" }}>
        {t.cropperHint}
      </p>

      {/* Zoom slider */}
      <div style={{ width: "100%", maxWidth: 280 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 0.8,
            color: "rgba(255,255,255,0.55)",
            fontFamily: "var(--font-jakarta), sans-serif",
          }}>
            {t.cropperZoom}
          </span>
          <span style={{
            fontSize: 11, color: "rgba(255,255,255,0.45)",
            fontFamily: "var(--font-jakarta), sans-serif",
          }}>
            {sliderVal}%
          </span>
        </div>
        <style>{`
          .cropper-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; border-radius: 9999px; background: rgba(255,255,255,0.18); outline: none; cursor: pointer; }
          .cropper-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 22px; height: 22px; border-radius: 9999px; background: #2e8a5a; border: 2.5px solid #fff; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.35); }
          .cropper-slider::-moz-range-thumb { width: 22px; height: 22px; border-radius: 9999px; background: #2e8a5a; border: 2.5px solid #fff; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.35); }
          .cropper-slider::-webkit-slider-runnable-track { border-radius: 9999px; }
        `}</style>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={sliderVal}
          onChange={handleSlider}
          className="cropper-slider"
        />
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 280 }}>
        <button
          onClick={onCancel}
          onTouchEnd={(e) => { e.preventDefault(); onCancel(); }}
          style={{
            flex: 1, padding: "13px 0", borderRadius: 14,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "#fff", fontSize: 14, fontWeight: 600,
            cursor: "pointer", touchAction: "manipulation",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <X size={16} /> {t.cropperCancel}
        </button>
        <button
          onClick={handleConfirm}
          onTouchEnd={(e) => { e.preventDefault(); handleConfirm(); }}
          style={{
            flex: 1, padding: "13px 0", borderRadius: 14,
            background: "linear-gradient(135deg, #1f6b43, #2e8a5a)",
            border: "none",
            color: "#fff", fontSize: 14, fontWeight: 700,
            cursor: "pointer", touchAction: "manipulation",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <Check size={16} /> {t.cropperConfirm}
        </button>
      </div>
    </div>
  );
}
