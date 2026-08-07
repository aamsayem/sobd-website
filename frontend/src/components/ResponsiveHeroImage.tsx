import React from "react";

interface ResponsiveHeroImageProps {
  desktopSrc: string;
  mobileSrc: string;
  alt: string;
  className?: string;
}

export function ResponsiveHeroImage({
  desktopSrc,
  mobileSrc,
  alt,
  className = "absolute inset-0 h-full w-full object-cover",
}: ResponsiveHeroImageProps) {
  // If no mobileSrc is provided, fall back to desktopSrc and vice versa
  const actualDesktop = desktopSrc || mobileSrc;
  const actualMobile = mobileSrc || desktopSrc;

  return (
    <picture className="absolute inset-0 -z-10 w-full h-full block">
      {/* Target mobile viewports (< 768px) with the mobile-specific source */}
      <source media="(max-width: 767px)" srcSet={actualMobile} />
      {/* Target larger viewports with the desktop source */}
      <source media="(min-width: 768px)" srcSet={actualDesktop} />
      <img src={actualDesktop} alt={alt} className={className} loading="eager" />
    </picture>
  );
}
