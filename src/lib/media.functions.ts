import { createServerFn } from "@tanstack/react-start";
import { requireDjangoAuth } from "@/integrations/django/auth-middleware";
import { getDjangoFetch, getUserId } from "@/lib/django-auth";
import { z } from "zod";

export const MEDIA_BUCKET = "site-media";
export const DONATION_SCREENSHOT_BUCKET = "donation-screenshots";
export const MEDIA_PREFIX = "/api/public/media/";

const folderSchema = z
  .string()
  .min(1)
  .max(40)
  .regex(/^[a-z0-9-]+$/, "Invalid folder");

async function assertAdmin(djangoFetch: (input: string, init?: RequestInit) => Promise<Response>) {
  const res = await djangoFetch("/api/v1/accounts/me/");
  if (!res.ok) throw new Error("Forbidden: cannot validate user");
  const user = await res.json();
  if (!user?.is_staff && !user?.is_superuser && !(user?.role === "admin" || user?.role === "super_admin")) {
    throw new Error("Forbidden: admin access required");
  }
}

function slugifyName(name: string) {
  const dot = name.lastIndexOf(".");
  const base =
    (dot > 0 ? name.slice(0, dot) : name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "file";
  const ext =
    (dot > 0 ? name.slice(dot + 1) : "bin")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 8) || "bin";
  return { base, ext };
}

const uploadSchema = z.object({
  folder: folderSchema,
  filename: z.string().min(1).max(200),
  contentType: z.string().min(3).max(120),
  /** base64-encoded file contents (no data: prefix) */
  base64: z.string().min(4).max(24_000_000),
});

const donationUploadSchema = z.object({
  folder: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9/_-]+$/i, "Invalid storage path"),
  filename: z.string().min(1).max(200),
  contentType: z.string().min(3).max(120),
  base64: z.string().min(4).max(8_000_000),
});

function sanitizeFileName(name: string) {
  const dot = name.lastIndexOf(".");
  const base =
    (dot > 0 ? name.slice(0, dot) : name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "file";
  const ext =
    (dot > 0 ? name.slice(dot + 1) : "bin")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 8) || "bin";
  return { base, ext };
}

function validateFilePayload(contentType: string, filename: string, bytes: Uint8Array) {
  const normalizedType = contentType.toLowerCase();
  const allowedTypes = new Set([
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif",
    "image/bmp",
    "application/pdf",
  ]);
  if (!allowedTypes.has(normalizedType)) throw new Error("Unsupported file type");

  const extension = (filename.split(".").pop() || "").toLowerCase();
  const blockedExtensions = new Set([
    "exe",
    "dll",
    "bat",
    "cmd",
    "com",
    "scr",
    "js",
    "html",
    "htm",
    "jar",
    "ps1",
    "sh",
    "php",
    "svg",
  ]);
  if (blockedExtensions.has(extension)) throw new Error("Unsupported file type");

  if (bytes.byteLength > 12 * 1024 * 1024) throw new Error("File is larger than 12 MB");

  const header = Array.from(bytes.slice(0, 8))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const executableSignatures = ["4d5a5000", "7f454c46", "feedfacf", "cafebabe", "504b0304"];
  if (executableSignatures.some((sig) => header.startsWith(sig)))
    throw new Error("Executable files are not allowed");
}

export const uploadMedia = createServerFn({ method: "POST" })
  .middleware([requireDjangoAuth])
  .validator((d) => uploadSchema.parse(d))
  .handler(async ({ data, context }) => {
    const djangoFetch = getDjangoFetch(context);
    await assertAdmin(djangoFetch);

    const bytes = Uint8Array.from(Buffer.from(data.base64, "base64"));
    validateFilePayload(data.contentType, data.filename, bytes);

    const blob = new Blob([bytes], { type: data.contentType });
    const form = new FormData();
    form.append("file", blob, data.filename);

    const res = await djangoFetch("/api/v1/media/files/", { method: "POST", body: form });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "Upload failed");
    }
    const json = await res.json();
    return {
      id: json.id,
      path: json.file_path,
      url: json.url,
      size: json.size,
      contentType: json.mime_type || json.file_type,
    };
  });

export const uploadDonationScreenshot = createServerFn({ method: "POST" })
  .middleware([requireDjangoAuth])
  .validator((d) => donationUploadSchema.parse(d))
  .handler(async ({ data, context }) => {
    const djangoFetch = getDjangoFetch(context);
    const userId = getUserId(context);
    const bytes = Uint8Array.from(Buffer.from(data.base64, "base64"));
    validateFilePayload(data.contentType, data.filename, bytes);

    const blob = new Blob([bytes], { type: data.contentType });
    const form = new FormData();
    // Keep original filename; backend will generate stored name
    form.append("file", blob, data.filename);

    const res = await djangoFetch("/api/v1/media/files/", { method: "POST", body: form });
    if (!res.ok) throw new Error("Upload failed");
    const json = await res.json();
    return {
      id: json.id,
      path: json.file_path,
      url: json.url,
      contentType: json.mime_type || json.file_type,
      size: json.size,
    };
  });

export const listMedia = createServerFn({ method: "GET" })
  .middleware([requireDjangoAuth])
  .handler(async ({ context }) => {
    const djangoFetch = getDjangoFetch(context);
    await assertAdmin(djangoFetch);

    const res = await djangoFetch("/api/v1/media/files/?page_size=1000");
    if (!res.ok) throw new Error("Failed to list media");
    const json = await res.json();
    const items = Array.isArray(json) ? json : json.results ?? [];
    const files = (Array.isArray(items) ? items : []).map((f) => {
      const file = f as Record<string, unknown>;
      return {
        path: file.file_path as string,
        url: file.url as string,
        folder: "uploads",
        name: (file.original_file_name as string) || "",
        size: typeof file.size === "number" ? file.size : 0,
        contentType: (file.mime_type as string) || (file.file_type as string) || null,
        createdAt: (file.upload_date as string) || null,
      };
    });
    files.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    return { folders: ["uploads"], files };
  });

export const deleteMedia = createServerFn({ method: "POST" })
  .middleware([requireDjangoAuth])
  .validator((d) => z.object({ path: z.string().min(3).max(400) }).parse(d))
  .handler(async ({ data, context }) => {
    const djangoFetch = getDjangoFetch(context);
    await assertAdmin(djangoFetch);

    // Find media item by file_path by paging through results
    let page = 1;
    const pageSize = 200;
    let foundId: string | null = null;
    while (true) {
      const res = await djangoFetch(`/api/v1/media/files/?page=${page}&page_size=${pageSize}`);
      if (!res.ok) break;
      const json = await res.json();
      const items = Array.isArray(json) ? json : json.results ?? [];
      for (const it of Array.isArray(items) ? items : []) {
        const item = it as Record<string, unknown>;
        if (
          item.file_path === data.path ||
          (typeof item.url === "string" && item.url.endsWith(data.path))
        ) {
          foundId = item.id as string;
          break;
        }
      }
      if (foundId) break;
      if (!Array.isArray(json) && json.next == null) break;
      if (Array.isArray(items) && items.length < pageSize) break;
      page++;
    }

    if (!foundId) throw new Error("Media file not found");
    const del = await djangoFetch(`/api/v1/media/files/${foundId}/`, { method: "DELETE" });
    if (!del.ok) {
      const txt = await del.text();
      throw new Error(txt || "Delete failed");
    }
    return { ok: true };
  });

/** Downloads remote/external images into permanent project storage and rewrites the rows. */
export const migrateExternalMedia = createServerFn({ method: "POST" })
  .middleware([requireDjangoAuth])
  .validator((d) =>
    z
      .object({
        table: z.enum([
          "committee_members",
          "campaigns",
          "gallery_items",
          "news_posts",
          "reports",
          "achievements",
        ]),
        column: z.enum(["photo_url", "banner_url", "image_url", "cover_url"]),
        folder: folderSchema,
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const djangoFetch = getDjangoFetch(context);
    await assertAdmin(djangoFetch);

    const listRes = await djangoFetch(`/api/v1/content/${data.table}/?page_size=1000`);
    if (!listRes.ok) throw new Error("Failed to list records");
    const listJson = await listRes.json();
    const rows = Array.isArray(listJson) ? listJson : listJson.results ?? [];

    let migrated = 0;
    const failures: string[] = [];

    for (const row of (rows ?? []) as Array<Record<string, unknown>>) {
      const url = row[data.column] as string | null | undefined;
      if (!url || !/^https?:\/\//i.test(url)) continue;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = res.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
        if (!/^image\//.test(contentType) && contentType !== "application/pdf")
          throw new Error("Not an image");
        const buf = new Uint8Array(await res.arrayBuffer());
        if (buf.byteLength > 12 * 1024 * 1024) throw new Error("Too large");

        const guessed = url.split("?")[0].split("/").pop() || "image.jpg";
        const fileName = guessed.includes(".") ? guessed : `${guessed}.jpg`;
        const blob = new Blob([buf], { type: contentType });
        const form = new FormData();
        form.append("file", blob, fileName);

        const up = await djangoFetch("/api/v1/media/files/", { method: "POST", body: form });
        if (!up.ok) throw new Error("Upload failed");
        const upj = await up.json();

        const upd = await djangoFetch(`/api/v1/content/${data.table}/${String(row.id)}/`, {
          method: "PATCH",
          body: JSON.stringify({ [data.column]: upj.url }),
          headers: { "Content-Type": "application/json" },
        });
        if (!upd.ok) throw new Error("Failed to update record");
        migrated++;
      } catch (error: unknown) {
        failures.push(`${row.id}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return { migrated, failures };
  });
