import Image from "next/image";
import type { CSSProperties, MouseEventHandler, TouchEventHandler } from "react";

/**
 * Route Supabase Storage images through Next.js Image Optimization (AVIF/WebP,
 * resized to the requested `sizes`) so we stop serving full-resolution originals
 * straight from Supabase Storage — that direct egress is what we're cutting.
 *
 * Any other host (picsum.photos placeholders, legacy `image_url`s, `data:` URLs,
 * Google avatars, etc.) renders as a plain <img>: those don't hit Supabase, and
 * routing an unconfigured remote host through next/image would 400.
 *
 * Two layout modes mirror the patterns used across the app:
 *  - `fill`  → image fills a positioned parent (pass `sizes` + objectFit via `style`)
 *  - sized   → fixed `width`/`height` thumbnails
 *
 * Lazy loading is on by default (next/image default + native loading="lazy");
 * pass `priority` only for above-the-fold hero images.
 */

function isSupabaseStorage(src: string): boolean {
  return src.includes(".supabase.co/storage/");
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

  if (isSupabaseStorage(src)) {
    const common = { src, alt, sizes, priority, className, style, draggable, onClick, onTouchEnd };
    return fill ? (
      <Image {...common} fill />
    ) : (
      <Image {...common} width={width ?? 0} height={height ?? 0} />
    );
  }

  // Non-Supabase host → plain <img> (no optimization, no egress concern, no 400 risk).
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? "eager" : "lazy"}
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
