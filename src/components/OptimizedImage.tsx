import type { CSSProperties, MouseEventHandler, TouchEventHandler } from "react";

/**
 * Serve Supabase Storage images through Supabase's own image-transformation
 * endpoint (resized + WebP, CDN-cached) instead of full-resolution originals,
 * so we stop paying egress on multi-MB files. We deliberately do NOT use Next.js
 * Image Optimization here: routing the whole site through Vercel's optimizer
 * exhausts its quota and returns 402 on uncached images.
 *
 * How it works: a public object URL
 *   …/storage/v1/object/public/<bucket>/<key>
 * is rewritten to the render endpoint
 *   …/storage/v1/render/image/public/<bucket>/<key>?width=W&quality=Q
 * Supabase scales the source down to `width` (keeping aspect ratio) and returns
 * WebP when the browser supports it (via the Accept header). The original file
 * is untouched — the resizer reads from it.
 *
 * Any other host (picsum.photos placeholders, legacy `image_url`s, `data:` URLs,
 * Google avatars, etc.) renders as a plain <img>: those don't hit Supabase, so
 * there's nothing to transform.
 *
 * Two layout modes mirror the patterns used across the app:
 *  - `fill`  → image fills a positioned parent (objectFit via `style`; `sizes`
 *              drives the requested transform width)
 *  - sized   → fixed `width`/`height` thumbnails
 *
 * Lazy loading is on by default; pass `priority` only for above-the-fold heroes.
 */

const PUBLIC_SEGMENT = "/storage/v1/object/public/";
const RENDER_SEGMENT = "/storage/v1/render/image/public/";

/** Only public Supabase Storage objects can be transformed via the render endpoint. */
function isTransformableSupabase(src: string): boolean {
  return src.includes(".supabase.co") && src.includes(PUBLIC_SEGMENT);
}

/** Largest pixel width implied by a `sizes` string (falls back to vw≈768px base). */
function widthFromSizes(sizes: string | undefined): number | null {
  if (!sizes) return null;
  // Drop media conditions like "(max-width: 480px)" so their breakpoint px
  // don't get mistaken for the image's display width.
  const values = sizes.replace(/\([^)]*\)/g, " ");
  const px = [...values.matchAll(/(\d+)px/g)].map((m) => Number(m[1]));
  if (px.length) return Math.max(...px);
  const vw = [...values.matchAll(/(\d+)vw/g)].map((m) => Number(m[1]));
  if (vw.length) return Math.round((768 * Math.max(...vw)) / 100);
  return null;
}

/**
 * Build a Supabase render URL sized for a 2× (retina) display, capped at 1280px
 * so we never request anything close to the original resolution.
 */
function supabaseResizedUrl(src: string, displayWidth: number): string {
  const targetW = Math.min(Math.round(displayWidth * 2), 1280);
  const quality = targetW >= 800 ? 75 : 70;
  const [base] = src.split("?"); // drop any pre-existing query (e.g. legacy ?width=)
  const rendered = base.replace(PUBLIC_SEGMENT, RENDER_SEGMENT);
  return `${rendered}?width=${targetW}&quality=${quality}`;
}

type OptimizedImageProps = {
  src: string | null | undefined;
  alt: string;
  /** Fill a positioned parent. Requires the parent to be position: relative/absolute/fixed. */
  fill?: boolean;
  width?: number;
  height?: number;
  /** Responsive sizes hint — keep small on grids/cards so thumbnails aren't full-res. */
  sizes?: string;
  /** Above-the-fold only; disables lazy loading. */
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  draggable?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  onTouchEnd?: TouchEventHandler<HTMLElement>;
};

export function OptimizedImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  priority,
  className,
  style,
  draggable,
  onClick,
  onTouchEnd,
}: OptimizedImageProps) {
  if (!src) return null;

  // Supabase public objects → request a resized variant; everything else → as-is.
  const displaySrc = isTransformableSupabase(src)
    ? supabaseResizedUrl(src, (fill ? widthFromSizes(sizes) : width) ?? 96)
    : src;

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={displaySrc}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      draggable={draggable}
      onClick={onClick}
      onTouchEnd={onTouchEnd}
      className={className}
      style={
        fill
          ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style }
          : style
      }
    />
  );
}
