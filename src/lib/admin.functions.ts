import { createServerFn } from "@tanstack/react-start";
import { requireDjangoAuth } from "@/integrations/django/auth-middleware";
import { getDjangoFetch } from "@/lib/django-auth";
import { z } from "zod";

type PagedResponse<T = unknown> = { count: number; results: T[] };

async function safeJson<T = unknown>(response: Response | Promise<Response>): Promise<PagedResponse<T>> {
  const res = await response;
  if (!res.ok) return { count: 0, results: [] };
  const body = await res.json();
  if (Array.isArray(body)) return { count: body.length, results: body };
  return {
    count: typeof body?.count === "number" ? body.count : 0,
    results: Array.isArray(body?.results) ? body.results : [],
  };
}

// === Role / profile ===
export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireDjangoAuth])
  .handler(async ({ context }) => {
    const djangoFetch = getDjangoFetch(context);
    const res = await djangoFetch("/api/v1/accounts/me/");
    if (!res.ok) throw new Error("Failed to fetch current user");
    const user = await res.json();
    return {
      roles: user?.role ? [user.role] : [],
      profile: user,
    };
  });

// === Dashboard stats ===
export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireDjangoAuth])
  .handler(async ({ context }) => {
    const djangoFetch = getDjangoFetch(context);
    const [campaignsRes, membersRes, profilesRes, galleryRes, newsRes, reportsRes] = await Promise.all([
      djangoFetch("/api/v1/content/campaigns/?page_size=1"),
      djangoFetch("/api/v1/content/committee-members/?page_size=1"),
      djangoFetch("/api/v1/admin/user-roles/?page_size=1"),
      djangoFetch("/api/v1/content/galleries/?page_size=1"),
      djangoFetch("/api/v1/content/news/?page_size=1"),
      djangoFetch("/api/v1/content/reports/?page_size=1"),
    ]);

    const [campaigns, members, profiles, gallery, news, reports] = await Promise.all([
      safeJson(campaignsRes),
      safeJson(membersRes),
      safeJson(profilesRes),
      safeJson(galleryRes),
      safeJson(newsRes),
      safeJson(reportsRes),
    ]);

    const totalRaised = 0;
    const active = 0;
    return {
      totalCampaigns: campaigns.count ?? 0,
      activeCampaigns: active,
      totalRaised,
      totalMembers: members.count ?? 0,
      totalUsers: profiles.count ?? 0,
      totalGallery: gallery.count ?? 0,
      totalNews: news.count ?? 0,
      totalReports: reports.count ?? 0,
    };
  });

// === Campaigns ===
const campaignSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  title_bn: z.string().max(200).optional().nullable(),
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

export const upsertCampaign = createServerFn({ method: "POST" })
  .middleware([requireDjangoAuth])
  .validator((d) => campaignSchema.parse(d))
  .handler(async ({ data, context }) => {
    const djangoFetch = getDjangoFetch(context);
    const payload = { ...data, banner_url: data.banner_url || null };
    if (data.id) {
      const res = await djangoFetch(`/api/v1/content/campaigns/${data.id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update campaign");
      return await res.json();
    }
    const res = await djangoFetch(`/api/v1/content/campaigns/`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to create campaign");
    return await res.json();
  });

export const deleteCampaign = createServerFn({ method: "POST" })
  .middleware([requireDjangoAuth])
  .validator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const djangoFetch = getDjangoFetch(context);
    const res = await djangoFetch(`/api/v1/content/campaigns/${data.id}/`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete campaign");
    return { ok: true };
  });

// === Committee ===
const memberSchema = z.object({
  id: z.string().uuid().optional(),
  full_name: z.string().min(1).max(200),
  designation: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  photo_url: z.string().max(1000).optional().nullable().or(z.literal("")),
  facebook_url: z.string().max(1000).optional().nullable().or(z.literal("")),
  sort_order: z.number().int(),
});

export const upsertMember = createServerFn({ method: "POST" })
  .middleware([requireDjangoAuth])
  .validator((d) => memberSchema.parse(d))
  .handler(async ({ data, context }) => {
    const djangoFetch = getDjangoFetch(context);
    const payload = {
      ...data,
      photo_url: data.photo_url || null,
      facebook_url: data.facebook_url || null,
    };
    if (data.id) {
      const res = await djangoFetch(`/api/v1/content/committee-members/${data.id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update member");
      return await res.json();
    }
    const res = await djangoFetch(`/api/v1/content/committee-members/`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to create member");
    return await res.json();
  });

export const deleteMember = createServerFn({ method: "POST" })
  .middleware([requireDjangoAuth])
  .validator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const djangoFetch = getDjangoFetch(context);
    const res = await djangoFetch(`/api/v1/content/committee-members/${data.id}/`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete member");
    return { ok: true };
  });

// === Gallery ===
const gallerySchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().max(200).optional().nullable(),
  caption: z.string().max(2000).optional().nullable(),
  image_url: z.string().min(1).max(1000),
  category: z.string().max(100).optional().nullable(),
  sort_order: z.number().int(),
});

export const upsertGalleryItem = createServerFn({ method: "POST" })
  .middleware([requireDjangoAuth])
  .validator((d) => gallerySchema.parse(d))
  .handler(async ({ data, context }) => {
    const djangoFetch = getDjangoFetch(context);
    if (data.id) {
      const res = await djangoFetch(`/api/v1/content/galleries/${data.id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update gallery item");
      return await res.json();
    }
    const res = await djangoFetch(`/api/v1/content/galleries/`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to create gallery item");
    return await res.json();
  });

export const deleteGalleryItem = createServerFn({ method: "POST" })
  .middleware([requireDjangoAuth])
  .validator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const djangoFetch = getDjangoFetch(context);
    const res = await djangoFetch(`/api/v1/content/galleries/${data.id}/`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete gallery item");
    return { ok: true };
  });

// === News ===
const newsSchema = z.object({
  id: z.string().uuid().optional(),
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

export const upsertNews = createServerFn({ method: "POST" })
  .middleware([requireDjangoAuth])
  .validator((d) => newsSchema.parse(d))
  .handler(async ({ data, context }) => {
    const djangoFetch = getDjangoFetch(context);
    const payload = {
      ...data,
      cover_url: data.cover_url || null,
      published_at: data.published && !data.published_at ? new Date().toISOString() : data.published_at || null,
    };
    if (data.id) {
      const res = await djangoFetch(`/api/v1/content/news/${data.id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update news");
      return await res.json();
    }
    const res = await djangoFetch(`/api/v1/content/news/`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to create news");
    return await res.json();
  });

export const deleteNews = createServerFn({ method: "POST" })
  .middleware([requireDjangoAuth])
  .validator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const djangoFetch = getDjangoFetch(context);
    const res = await djangoFetch(`/api/v1/content/news/${data.id}/`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete news");
    return { ok: true };
  });

// === Reports ===
const reportSchema = z.object({
  id: z.string().uuid().optional(),
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

export const upsertReport = createServerFn({ method: "POST" })
  .middleware([requireDjangoAuth])
  .validator((d) => reportSchema.parse(d))
  .handler(async ({ data, context }) => {
    const djangoFetch = getDjangoFetch(context);
    const payload = {
      ...data,
      file_url: data.file_url || null,
      cover_url: data.cover_url || null,
      publish_date: data.publish_date || null,
      published: data.published ?? true,
    };
    if (data.id) {
      const res = await djangoFetch(`/api/v1/content/reports/${data.id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update report");
      return await res.json();
    }
    const res = await djangoFetch(`/api/v1/content/reports/`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to create report");
    return await res.json();
  });

export const toggleReportPublished = createServerFn({ method: "POST" })
  .middleware([requireDjangoAuth])
  .validator((d) => z.object({ id: z.string().uuid(), published: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const djangoFetch = getDjangoFetch(context);
    const res = await djangoFetch(`/api/v1/content/reports/${data.id}/`, {
      method: "PATCH",
      body: JSON.stringify({ published: data.published }),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to toggle published");
    return { ok: true };
  });

export const deleteReport = createServerFn({ method: "POST" })
  .middleware([requireDjangoAuth])
  .validator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const djangoFetch = getDjangoFetch(context);
    const res = await djangoFetch(`/api/v1/content/reports/${data.id}/`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete report");
    return { ok: true };
  });

// === Achievements ===
const achievementSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional().nullable(),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  image_url: z.string().max(1000).optional().nullable().or(z.literal("")),
  sort_order: z.number().int(),
  published: z.boolean(),
});

export const upsertAchievement = createServerFn({ method: "POST" })
  .middleware([requireDjangoAuth])
  .validator((d) => achievementSchema.parse(d))
  .handler(async ({ data, context }) => {
    const djangoFetch = getDjangoFetch(context);
    const payload = { ...data, image_url: data.image_url || null };
    if (data.id) {
      const res = await djangoFetch(`/api/v1/content/achievements/${data.id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update achievement");
      return await res.json();
    }
    const res = await djangoFetch(`/api/v1/content/achievements/`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to create achievement");
    return await res.json();
  });

export const toggleAchievementPublished = createServerFn({ method: "POST" })
  .middleware([requireDjangoAuth])
  .validator((d) => z.object({ id: z.string().uuid(), published: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const djangoFetch = getDjangoFetch(context);
    const res = await djangoFetch(`/api/v1/content/achievements/${data.id}/`, {
      method: "PATCH",
      body: JSON.stringify({ published: data.published }),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to toggle achievement");
    return { ok: true };
  });

export const deleteAchievement = createServerFn({ method: "POST" })
  .middleware([requireDjangoAuth])
  .validator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const djangoFetch = getDjangoFetch(context);
    const res = await djangoFetch(`/api/v1/content/achievements/${data.id}/`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete achievement");
    return { ok: true };
  });
