import { z } from "zod";
import { apiFetchRaw } from "@/lib/api";

type TableName =
  | "volunteer_applications"
  | "sokkhom_applications"
  | "donation_requests"
  | "donations"
  | "contact_messages";

function getSubmissionPath(table: TableName) {
  if (table === "donation_requests" || table === "donations") {
    return "donation-requests";
  }
  return table.replace(/_/g, "-");
}

export async function getSubmissionCounts() {
  const paths = [
    "submissions/volunteer-applications/",
    "submissions/sokkhom-applications/",
    "submissions/donation-requests/",
    "submissions/contact-messages/",
  ];
  const results = await Promise.all(paths.map((p) => apiFetchRaw(p)));
  const jsons = await Promise.all(
    results.map(async (r) => (r.ok ? ((await r.json()) as unknown[]) : []) as unknown[]),
  );
  return {
    pendingVolunteers: (jsons[0] ?? []).filter((a: any) => a.status === "pending").length,
    pendingSokkhom: (jsons[1] ?? []).filter((a: any) => a.status === "pending" || a.status === "under_review").length,
    pendingDonations: (jsons[2] ?? []).filter((a: any) => a.status === "pending").length,
    unreadMessages: (jsons[3] ?? []).filter((a: any) => !a.is_read).length,
    totalVolunteerApps: jsons[0]?.length ?? 0,
    totalDonationsAmount: 0,
  };
}

const statusSchema = z.object({
  table: z.enum([
    "volunteer_applications",
    "sokkhom_applications",
    "donation_requests",
    "donations",
  ]),
  id: z.union([z.string().min(1), z.number()]),
  status: z.string().min(1).max(30),
  notes: z.string().max(2000).optional().nullable(),
});

export async function updateSubmissionStatus(data: unknown) {
  const actualData = data && typeof data === "object" && "data" in data ? (data as any).data : data;
  const parsed = statusSchema.parse(actualData);
  const table = parsed.table as TableName;
  const id = String(parsed.id);
  const patch: Record<string, string | null | undefined> = {};
  if (parsed.notes !== undefined) patch.internal_notes = parsed.notes;
  if (table === "donation_requests" || table === "donations") {
    patch.verification_status = parsed.status;
    patch.verified_at = new Date().toISOString();
  } else {
    patch.status = parsed.status;
    patch.reviewed_at = new Date().toISOString();
  }
  const res = await apiFetchRaw(`submissions/${getSubmissionPath(table)}/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(patch),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const payload = await res.text();
    throw new Error(payload || "Update failed");
  }
  return { ok: true };
}

export async function setMessageRead(data: unknown) {
  const actualData = data && typeof data === "object" && "data" in data ? (data as any).data : data;
  const parsed = z.object({ id: z.string(), is_read: z.boolean() }).parse(actualData);
  const res = await apiFetchRaw(`submissions/contact-messages/${parsed.id}/`, {
    method: "PATCH",
    body: JSON.stringify({ is_read: parsed.is_read }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to update message state");
  return { ok: true };
}

export async function deleteSubmission(data: unknown) {
  const actualData = data && typeof data === "object" && "data" in data ? (data as any).data : data;
  const parsed = z
    .object({
      table: z.enum([
        "volunteer_applications",
        "sokkhom_applications",
        "donation_requests",
        "donations",
        "contact_messages",
      ]),
      id: z.union([z.string().min(1), z.number()]),
    })
    .parse(actualData);
  const table = getSubmissionPath(parsed.table as TableName);
  const res = await apiFetchRaw(`submissions/${table}/${String(parsed.id)}/`, { method: "DELETE" });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Delete failed");
  }
  return { ok: true };
}
