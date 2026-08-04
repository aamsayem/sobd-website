import { z } from "zod";
import { apiFetchRaw } from "@/lib/api";

type PagedResponse<T = unknown> = { count: number; results: T[] };

async function safeJson<T = unknown>(
  response: Response | Promise<Response>,
): Promise<PagedResponse<T>> {
  const res = await response;
  if (!res.ok) return { count: 0, results: [] };
  const body = await res.json();
  if (Array.isArray(body)) return { count: body.length, results: body };
  return {
    count: typeof body?.count === "number" ? body.count : 0,
    results: Array.isArray(body?.results) ? body.results : [],
  };
}

async function requestJson<T = unknown>(path: string, init: RequestInit = {}) {
  const res = await apiFetchRaw(path, {
    ...init,
    headers: {
      ...(init.headers || {}),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) {
    return { ok: true } as unknown as T;
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : { ok: true }) as T;
}

export async function getMyRoles() {
  const res = await apiFetchRaw("accounts/me/");
  if (!res.ok) throw new Error("Failed to fetch current user");
  const user = await res.json();
  return {
    roles: user?.role ? [user.role] : [],
    profile: user,
  };
}

export async function getDashboardStats() {
  const [campaignsRes, membersRes, profilesRes, galleryRes, newsRes, reportsRes] =
    await Promise.all([
      apiFetchRaw("content/campaigns/?page_size=1"),
      apiFetchRaw("content/committee-members/?page_size=1"),
      apiFetchRaw("admin/user-roles/?page_size=1"),
      apiFetchRaw("content/galleries/?page_size=1"),
      apiFetchRaw("content/news/?page_size=1"),
      apiFetchRaw("content/reports/?page_size=1"),
    ]);

  const [campaigns, members, profiles, gallery, news, reports] = await Promise.all([
    safeJson(campaignsRes),
    safeJson(membersRes),
    safeJson(profilesRes),
    safeJson(galleryRes),
    safeJson(newsRes),
    safeJson(reportsRes),
  ]);

  return {
    totalCampaigns: campaigns.count ?? 0,
    activeCampaigns: 0,
    totalRaised: 0,
    totalMembers: members.count ?? 0,
    totalUsers: profiles.count ?? 0,
    totalGallery: gallery.count ?? 0,
    totalNews: news.count ?? 0,
    totalReports: reports.count ?? 0,
  };
}

const campaignSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(200),
  title_bn: z.string().max(200).optional().nullable(),
  slug: z.string().optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  target_amount: z.number().min(0),
  raised_amount: z.number().min(0),
  status: z.enum(["active", "completed", "paused"]),
  banner_url: z.string().max(1000).optional().nullable().or(z.literal("")),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  featured: z.boolean(),
  sort_order: z.number().int(),
});

export async function upsertCampaign(data: unknown) {
  const actualData = data && typeof data === "object" && "data" in data ? (data as any).data : data;
  const parsed = campaignSchema.parse(actualData);
  const payload = { ...parsed, banner_url: parsed.banner_url || null };
  if (parsed.id) {
    return requestJson(`content/campaigns/${parsed.id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }
  return requestJson("content/campaigns/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteCampaign(data: unknown) {
  const actualData = data && typeof data === "object" && "data" in data ? (data as any).data : data;
  const parsed = z.object({ id: z.string() }).parse(actualData);
  await requestJson(`content/campaigns/${parsed.id}/`, { method: "DELETE" });
  return { ok: true };
}

const memberSchema = z.object({
  id: z.string().optional(),
  full_name: z.string().min(1).max(200),
  designation: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  photo_url: z.string().max(1000).optional().nullable().or(z.literal("")),
  facebook_url: z.string().max(1000).optional().nullable().or(z.literal("")),
  sort_order: z.number().int(),
});

export async function upsertMember(data: unknown) {
  const actualData = data && typeof data === "object" && "data" in data ? (data as any).data : data;
  const parsed = memberSchema.parse(actualData);
  const payload = {
    ...parsed,
    photo_url: parsed.photo_url || null,
    facebook_url: parsed.facebook_url || null,
  };
  if (parsed.id) {
    return requestJson(`content/committee-members/${parsed.id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }
  return requestJson("content/committee-members/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteMember(data: unknown) {
  const actualData = data && typeof data === "object" && "data" in data ? (data as any).data : data;
  const parsed = z.object({ id: z.string() }).parse(actualData);
  await requestJson(`content/committee-members/${parsed.id}/`, { method: "DELETE" });
  return { ok: true };
}

const gallerySchema = z.object({
  id: z.string().optional(),
  title: z.string().max(200).optional().nullable(),
  caption: z.string().max(2000).optional().nullable(),
  image_url: z.string().min(1).max(1000),
  category: z.string().max(100).optional().nullable(),
  sort_order: z.number().int(),
});

export async function upsertGalleryItem(data: unknown) {
  const actualData = data && typeof data === "object" && "data" in data ? (data as any).data : data;
  const parsed = gallerySchema.parse(actualData);
  if (parsed.id) {
    return requestJson(`content/galleries/${parsed.id}/`, {
      method: "PATCH",
      body: JSON.stringify(parsed),
    });
  }
  return requestJson("content/galleries/", {
    method: "POST",
    body: JSON.stringify(parsed),
  });
}

export async function deleteGalleryItem(data: unknown) {
  const actualData = data && typeof data === "object" && "data" in data ? (data as any).data : data;
  const parsed = z.object({ id: z.string() }).parse(actualData);
  await requestJson(`content/galleries/${parsed.id}/`, { method: "DELETE" });
  return { ok: true };
}

const newsSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(300),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(1000).optional().nullable(),
  content: z.string().max(50000).optional().nullable(),
  cover_url: z.string().max(1000).optional().nullable().or(z.literal("")),
  published: z.boolean(),
  published_at: z.string().optional().nullable(),
});

export async function upsertNews(data: unknown) {
  const actualData = data && typeof data === "object" && "data" in data ? (data as any).data : data;
  const parsed = newsSchema.parse(actualData);
  const payload = {
    ...parsed,
    cover_url: parsed.cover_url || null,
    published_at:
      parsed.published && !parsed.published_at
        ? new Date().toISOString()
        : parsed.published_at || null,
  };
  if (parsed.id) {
    return requestJson(`content/news/${parsed.id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }
  return requestJson("content/news/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteNews(data: unknown) {
  const actualData = data && typeof data === "object" && "data" in data ? (data as any).data : data;
  const parsed = z.object({ id: z.string() }).parse(actualData);
  await requestJson(`content/news/${parsed.id}/`, { method: "DELETE" });
  return { ok: true };
}

const reportSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(300),
  bn_title: z.string().max(300).optional().nullable(),
  year: z.number().int().min(2000).max(2100).optional().nullable(),
  summary: z.string().max(500).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  category: z.string().max(120).optional().nullable(),
  publish_date: z.string().optional().nullable(),
  published: z.boolean().optional(),
  file_url: z.string().max(1000).optional().nullable().or(z.literal("")),
  cover_url: z.string().max(1000).optional().nullable().or(z.literal("")),
  sort_order: z.number().int(),
});

export async function upsertReport(data: unknown) {
  const actualData = data && typeof data === "object" && "data" in data ? (data as any).data : data;
  const parsed = reportSchema.parse(actualData);
  const payload = {
    ...parsed,
    file_url: parsed.file_url || null,
    cover_url: parsed.cover_url || null,
    publish_date: parsed.publish_date || null,
    published: parsed.published ?? true,
  };
  if (parsed.id) {
    return requestJson(`content/reports/${parsed.id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }
  return requestJson("content/reports/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function toggleReportPublished(data: unknown) {
  const actualData = data && typeof data === "object" && "data" in data ? (data as any).data : data;
  const parsed = z.object({ id: z.string(), published: z.boolean() }).parse(actualData);
  await requestJson(`content/reports/${parsed.id}/`, {
    method: "PATCH",
    body: JSON.stringify({ published: parsed.published }),
  });
  return { ok: true };
}

export async function deleteReport(data: unknown) {
  const actualData = data && typeof data === "object" && "data" in data ? (data as any).data : data;
  const parsed = z.object({ id: z.string() }).parse(actualData);
  await requestJson(`content/reports/${parsed.id}/`, { method: "DELETE" });
  return { ok: true };
}

const achievementSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional().nullable(),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  image_url: z.string().max(1000).optional().nullable().or(z.literal("")),
  sort_order: z.number().int(),
  published: z.boolean(),
});

export async function upsertAchievement(data: unknown) {
  const actualData = data && typeof data === "object" && "data" in data ? (data as any).data : data;
  const parsed = achievementSchema.parse(actualData);
  const payload = { ...parsed, image_url: parsed.image_url || null };
  if (parsed.id) {
    return requestJson(`content/achievements/${parsed.id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }
  return requestJson("content/achievements/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function toggleAchievementPublished(data: unknown) {
  const actualData = data && typeof data === "object" && "data" in data ? (data as any).data : data;
  const parsed = z.object({ id: z.string(), published: z.boolean() }).parse(actualData);
  await requestJson(`content/achievements/${parsed.id}/`, {
    method: "PATCH",
    body: JSON.stringify({ published: parsed.published }),
  });
  return { ok: true };
}

export async function deleteAchievement(data: unknown) {
  const actualData = data && typeof data === "object" && "data" in data ? (data as any).data : data;
  const parsed = z.object({ id: z.string() }).parse(actualData);
  await requestJson(`content/achievements/${parsed.id}/`, { method: "DELETE" });
  return { ok: true };
}
