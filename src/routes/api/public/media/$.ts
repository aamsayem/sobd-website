import { createFileRoute } from "@tanstack/react-router";

const BUCKET = "site-media";

/**
 * Public, cacheable delivery route for files stored in the private `site-media`
 * bucket. The bucket stays private (workspace policy blocks public buckets), so
 * reads are proxied here with a long cache lifetime.
 */
export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as { _splat?: string })._splat ?? "";

        // Only allow simple folder/file paths — no traversal, no absolute paths.
        if (
          !path ||
          path.includes("..") ||
          path.startsWith("/") ||
          !/^[a-z0-9-]+\/[A-Za-z0-9._-]+$/.test(path)
        ) {
          return new Response("Not found", { status: 404 });
        }

        const API_BASE = import.meta.env.VITE_DJANGO_API_URL ?? "http://localhost:8000";
        const mediaUrl = new URL(`/media/${path.replace(/^\/+/, "")}`, API_BASE).toString();
        const proxied = await fetch(mediaUrl);
        if (!proxied.ok) return new Response("Not found", { status: 404 });
        const contentType = proxied.headers.get("content-type") || "application/octet-stream";
        const buf = await proxied.arrayBuffer();
        return new Response(buf, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
