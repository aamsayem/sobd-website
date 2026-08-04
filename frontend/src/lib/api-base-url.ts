export function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.")) {
      return "http://localhost:5000";
    }
    return "https://sobd-backend-api.vercel.app";
  }

  // Server-side (SSR) runtime
  return process.env.VITE_API_BASE_URL || "https://sobd-backend-api.vercel.app";
}
