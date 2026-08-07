import { z } from "zod";
import { apiFetchRaw, apiFetch } from "@/lib/api";

export const MEDIA_BUCKET = "site-media";
export const DONATION_SCREENSHOT_BUCKET = "donation-screenshots";
export const MEDIA_PREFIX = "/media/";

const folderSchema = z
  .string()
  .min(1)
  .max(40)
  .regex(/^[a-z0-9-]+$/, "Invalid folder");

async function assertAdmin() {
  const res = await apiFetchRaw("accounts/me/");
  if (!res.ok) throw new Error("Forbidden: cannot validate user");
  const user = await res.json();
  if (
    !user?.is_staff &&
    !user?.is_superuser &&
    !(user?.role === "admin" || user?.role === "super_admin")
  ) {
    throw new Error("Forbidden: admin access required");
  }
}

const uploadSchema = z.object({
  folder: folderSchema,
  filename: z.string().min(1).max(200),
  contentType: z.string().min(3).max(120),
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
  if (executableSignatures.some((sig) => header.startsWith(sig))) {
    throw new Error("Executable files are not allowed");
  }
}

function base64ToUint8Array(base64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return Uint8Array.from(Buffer.from(base64, "base64"));
  }
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function uploadMedia(data: unknown, onProgress?: (percent: number) => void) {
  const actualData = data && typeof data === "object" && "data" in data ? (data as any).data : data;
  const parsed = uploadSchema.parse(actualData);
  await assertAdmin();

  const bytes = base64ToUint8Array(parsed.base64);
  validateFilePayload(parsed.contentType, parsed.filename, bytes);

  const blob = new Blob([bytes as any], { type: parsed.contentType });
  const form = new FormData();
  form.append("file", blob, parsed.filename);

  const res = await apiFetch<any>("media/files/", {
    method: "POST",
    body: form,
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  return {
    id: res.id,
    path: res.file_path,
    url: res.url,
    size: res.size,
    contentType: res.mime_type || res.file_type,
  };
}

export async function uploadDonationScreenshot(data: unknown) {
  const actualData = data && typeof data === "object" && "data" in data ? (data as any).data : data;
  const parsed = donationUploadSchema.parse(actualData);
  const bytes = base64ToUint8Array(parsed.base64);
  validateFilePayload(parsed.contentType, parsed.filename, bytes);

  const blob = new Blob([bytes as any], { type: parsed.contentType });
  const form = new FormData();
  form.append("file", blob, parsed.filename);

  const res = await apiFetchRaw("media/files/", { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload failed");
  const json = await res.json();
  return {
    id: json.id,
    path: json.file_path,
    url: json.url,
    contentType: json.mime_type || json.file_type,
    size: json.size,
  };
}

export async function listMedia() {
  await assertAdmin();

  const res = await apiFetchRaw("media/files/?page_size=1000");
  if (!res.ok) throw new Error("Failed to list media");
  const json = await res.json();
  const items = Array.isArray(json) ? json : (json.results ?? []);
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
}

export async function deleteMedia(data: unknown) {
  const actualData = data && typeof data === "object" && "data" in data ? (data as any).data : data;
  const parsed = z.object({ path: z.string().min(3).max(400) }).parse(actualData);
  await assertAdmin();

  // Query the file directly by path suffix using the backend's new path filter
  const res = await apiFetchRaw(`media/files/?path=${encodeURIComponent(parsed.path)}`);
  if (!res.ok) throw new Error("Failed to find media file");
  const json = await res.json();
  const items = Array.isArray(json) ? json : (json.results ?? []);

  let foundId: string | null = null;
  for (const it of Array.isArray(items) ? items : []) {
    const item = it as Record<string, unknown>;
    if (
      item.file_path === parsed.path ||
      (typeof item.url === "string" && item.url.endsWith(parsed.path))
    ) {
      foundId = item.id as string;
      break;
    }
  }

  // Fallback: If not found by query filter, search first 1000 items
  if (!foundId) {
    const resFallback = await apiFetchRaw(`media/files/?page_size=1000`);
    if (resFallback.ok) {
      const jsonFallback = await resFallback.json();
      const itemsFallback = Array.isArray(jsonFallback)
        ? jsonFallback
        : (jsonFallback.results ?? []);
      for (const it of Array.isArray(itemsFallback) ? itemsFallback : []) {
        const item = it as Record<string, unknown>;
        if (
          item.file_path === parsed.path ||
          (typeof item.url === "string" && item.url.endsWith(parsed.path))
        ) {
          foundId = item.id as string;
          break;
        }
      }
    }
  }

  if (!foundId) throw new Error("Media file not found");
  const del = await apiFetchRaw(`media/files/${foundId}/`, { method: "DELETE" });
  if (!del.ok) {
    const txt = await del.text();
    throw new Error(txt || "Delete failed");
  }
  return { ok: true };
}

export async function migrateExternalMedia(data: unknown) {
  const actualData = data && typeof data === "object" && "data" in data ? (data as any).data : data;
  const parsed = z
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
    .parse(actualData);
  await assertAdmin();

  const listRes = await apiFetchRaw(`content/${parsed.table}/?page_size=1000`);
  if (!listRes.ok) throw new Error("Failed to list records");
  const listJson = await listRes.json();
  const rows = Array.isArray(listJson) ? listJson : (listJson.results ?? []);

  let migrated = 0;
  const failures: string[] = [];

  for (const row of (rows ?? []) as Array<Record<string, unknown>>) {
    const url = row[parsed.column] as string | null | undefined;
    if (!url || !/^https?:\/\//i.test(url)) continue;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const contentType = res.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
      if (!/^image\//.test(contentType) && contentType !== "application/pdf") {
        throw new Error("Not an image");
      }
      const buf = new Uint8Array(await res.arrayBuffer());
      if (buf.byteLength > 12 * 1024 * 1024) throw new Error("Too large");

      const guessed = url.split("?")[0].split("/").pop() || "image.jpg";
      const fileName = guessed.includes(".") ? guessed : `${guessed}.jpg`;
      const blob = new Blob([buf], { type: contentType });
      const form = new FormData();
      form.append("file", blob, fileName);

      const up = await apiFetchRaw("media/files/", { method: "POST", body: form });
      if (!up.ok) throw new Error("Upload failed");
      const upj = await up.json();

      const upd = await apiFetchRaw(`content/${parsed.table}/${String(row.id)}/`, {
        method: "PATCH",
        body: JSON.stringify({ [parsed.column]: upj.url }),
        headers: { "Content-Type": "application/json" },
      });
      if (!upd.ok) throw new Error("Failed to update record");
      migrated++;
    } catch (error: unknown) {
      failures.push(`${row.id}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return { migrated, failures };
}
