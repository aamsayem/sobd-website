import { api } from "@/lib/api";

async function fetchList(path: string) {
  const resource = path.replace(/^\/api\/v1\//, "").replace(/^\/+/, "");
  return api.get<any>(resource);
}

export async function getPublicCommittee() {
  return fetchList("/api/v1/content/committee-members/");
}

export async function getPublicCampaigns() {
  return fetchList("/api/v1/content/campaigns/");
}

export async function getPublicGallery() {
  return fetchList("/api/v1/content/galleries/");
}

export async function getPublicNews() {
  return fetchList("/api/v1/content/news/");
}

export async function getPublicReports() {
  return fetchList("/api/v1/content/reports/");
}

export async function getPublicAchievements() {
  return fetchList("/api/v1/content/achievements/");
}

export async function getPublicActivities() {
  return fetchList("/api/v1/content/activities/");
}

export async function getPublicSettings() {
  return fetchList("/api/v1/content/site-settings/");
}
