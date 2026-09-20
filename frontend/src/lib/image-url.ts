import { getApiBaseUrl } from "./api-base-url";

/**
 * Centralized image URL resolver.
 * Handles:
 * - Falsy/empty values -> returns optional fallback or empty string
 * - Absolute URLs (http://, https://, data:, blob:) -> returned unchanged
 * - Relative backend paths (/media/..., /uploads/..., media/...) -> prepended with API base URL
 * - Static frontend assets (e.g. /favicon.ico or Vite asset paths) -> returned unchanged
 */
export function resolveImageUrl(url?: string | null, fallback: string = ""): string {
  if (!url || typeof url !== "string") {
    return fallback;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return fallback;
  }

  // Absolute URLs, data URIs, blob URIs
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  // Relative backend media paths
  if (trimmed.startsWith("/media/") || trimmed.startsWith("/uploads/")) {
    const baseUrl = getApiBaseUrl().replace(/\/$/, "");
    return `${baseUrl}${trimmed}`;
  }

  if (trimmed.startsWith("media/") || trimmed.startsWith("uploads/")) {
    const baseUrl = getApiBaseUrl().replace(/\/$/, "");
    return `${baseUrl}/${trimmed}`;
  }

  // If it's a root-relative path that isn't /media/ or /uploads/ (e.g. /favicon.ico), return as-is
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // Fallback for relative file names (assume /media/<filename>)
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  return `${baseUrl}/media/${trimmed}`;
}
