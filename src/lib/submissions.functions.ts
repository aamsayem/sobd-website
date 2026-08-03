import { createServerFn } from "@tanstack/react-start";
import { requireDjangoAuth } from "@/integrations/django/auth-middleware";
import { getErrorMessage } from "@/lib/utils";
import { getDjangoFetch, getUserId } from "@/lib/django-auth";
import { z } from "zod";

type TableName =
  | "volunteer_applications"
  | "sokkhom_applications"
  | "donations"
  | "contact_messages";

// ============ COUNTS (for sidebar badges + dashboard) ============
export const getSubmissionCounts = createServerFn({ method: "GET" })
  .middleware([requireDjangoAuth])
  .handler(async ({ context }) => {
    const djangoFetch = getDjangoFetch(context);
    const paths = [
      "/api/v1/submissions/volunteer-applications/",
      "/api/v1/submissions/sokkhom-applications/",
      "/api/v1/submissions/donation-requests/",
      "/api/v1/submissions/contact-messages/",
    ];
    const results = await Promise.all(paths.map((p) => djangoFetch(p)));
    const jsons = await Promise.all(
      results.map(async (r) => (r.ok ? ((await r.json()) as unknown[]) : []) as unknown[]),
    );
    return {
      pendingVolunteers: (jsons[0]?.length ?? 0) as number,
      pendingSokkhom: (jsons[1]?.length ?? 0) as number,
      pendingDonations: (jsons[2]?.length ?? 0) as number,
      unreadMessages: (jsons[3]?.length ?? 0) as number,
      totalVolunteerApps: jsons[0]?.length ?? 0,
      totalDonationsAmount: 0,
    };
  });

// ============ Generic status update ============
const statusSchema = z.object({
  table: z.enum(["volunteer_applications", "sokkhom_applications", "donations"]),
  id: z.string().uuid(),
  status: z.string().min(1).max(30),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateSubmissionStatus = createServerFn({ method: "POST" })
  .middleware([requireDjangoAuth])
  .validator((d) => statusSchema.parse(d))
  .handler(async ({ data, context }) => {
    const djangoFetch = getDjangoFetch(context);
    const userId = getUserId(context);
    const table = data.table as TableName;
    const patch: Record<string, string | null | undefined> = { status: data.status };
    if (data.notes !== undefined) patch.internal_notes = data.notes;
    if (table === "donations") {
      patch.verified_by = userId;
      patch.verified_at = new Date().toISOString();
    } else {
      patch.reviewed_by = userId;
      patch.reviewed_at = new Date().toISOString();
    }
    const url = `/api/v1/submissions/${table}/${data.id}/`;
    const res = await djangoFetch(url, { method: "PATCH", body: JSON.stringify(patch) });
    if (!res.ok) {
      const payload = await res.text();
      throw new Error(payload || "Update failed");
    }
    return { ok: true };
  });

// ============ Mark message read/unread ============
export const setMessageRead = createServerFn({ method: "POST" })
  .middleware([requireDjangoAuth])
  .validator((d) => z.object({ id: z.string().uuid(), is_read: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const djangoFetch = getDjangoFetch(context);
    const res = await djangoFetch(`/api/v1/submissions/contact-messages/${data.id}/`, {
      method: "PATCH",
      body: JSON.stringify({ is_read: data.is_read }),
    });
    if (!res.ok) throw new Error("Failed to update message state");
    return { ok: true };
  });

// ============ Delete submission ============
export const deleteSubmission = createServerFn({ method: "POST" })
  .middleware([requireDjangoAuth])
  .validator((d) =>
    z
      .object({
        table: z.enum([
          "volunteer_applications",
          "sokkhom_applications",
          "donations",
          "contact_messages",
        ]),
        id: z.string().uuid(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const djangoFetch = getDjangoFetch(context);
    const res = await djangoFetch(`/api/v1/submissions/${data.table}/${data.id}/`, { method: "DELETE" });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "Delete failed");
    }
    return { ok: true };
  });
