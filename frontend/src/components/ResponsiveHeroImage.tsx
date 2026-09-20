import React from "react";
import { resolveImageUrl } from "@/lib/image-url";

interface ResponsiveHeroImageProps {
  desktopSrc: string;
  mobileSrc?: string | null;
  alt: string;
  className?: string;
  pictureClassName?: string;
}

export function ResponsiveHeroImage({
  desktopSrc,
  mobileSrc,
  alt,
  className = "absolute inset-0 h-full w-full object-cover",
  pictureClassName = "absolute inset-0 w-full h-full block overflow-hidden",
}: ResponsiveHeroImageProps) {
  // Resolve desktop and mobile sources; fallback mobile to desktop if missing
  const resolvedDesktop = resolveImageUrl(desktopSrc);
  const resolvedMobile = resolveImageUrl(mobileSrc || desktopSrc, resolvedDesktop);

  return (
    <picture className={pictureClassName}>
      {/* Target mobile viewports (< 768px) with the mobile-specific source */}
      {resolvedMobile && <source media="(max-width: 767px)" srcSet={resolvedMobile} />}
      {/* Target larger viewports with the desktop source */}
      {resolvedDesktop && <source media="(min-width: 768px)" srcSet={resolvedDesktop} />}
      <img
        src={resolvedDesktop || resolvedMobile}
        alt={alt}
        className={className}
        loading="eager"
      />
    </picture>
  );
}
