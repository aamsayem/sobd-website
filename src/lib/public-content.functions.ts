import { createServerFn } from "@tanstack/react-start";

const API_BASE = import.meta.env.VITE_DJANGO_API_URL ?? "http://localhost:8000";

async function fetchList(path: string) {
  const url = new URL(path.replace(/^\/+/, ""), API_BASE).toString();
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  const data = await res.json();
  return data ?? [];
}

export const getPublicCommittee = createServerFn({ method: "GET" }).handler(async () => {
  return fetchList("/api/v1/content/committee-members/");
});

export const getPublicCampaigns = createServerFn({ method: "GET" }).handler(async () => {
  return fetchList("/api/v1/content/campaigns/");
});

export const getPublicGallery = createServerFn({ method: "GET" }).handler(async () => {
  return fetchList("/api/v1/content/galleries/");
});

export const getPublicNews = createServerFn({ method: "GET" }).handler(async () => {
  return fetchList("/api/v1/content/news/");
});

export const getPublicReports = createServerFn({ method: "GET" }).handler(async () => {
  return fetchList("/api/v1/content/reports/");
});

export const getPublicAchievements = createServerFn({ method: "GET" }).handler(async () => {
  return fetchList("/api/v1/content/achievements/");
});
