import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/media/$")({
  component: function MediaRoute() {
    return null;
  },
});
