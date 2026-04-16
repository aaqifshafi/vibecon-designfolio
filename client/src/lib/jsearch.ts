import type { JobItem } from "./job-types";
import type { JobPreferences } from "./job-preferences-db";

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const JSEARCH_URL = "https://jsearch.p.rapidapi.com/search";

interface JSearchResult {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city: string;
  job_state: string;
  job_country: string;
  job_description: string;
  job_employment_type: string;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string;
  job_salary_period: string;
  job_posted_at_datetime_utc: string;
  job_apply_link: string;
  job_is_remote: boolean;
  job_required_skills: string[] | null;
  job_highlights?: {
    Qualifications?: string[];
    Responsibilities?: string[];
  };
}

function buildLocation(r: JSearchResult): string {
  if (r.job_is_remote) return "Remote";
  const parts = [r.job_city, r.job_state, r.job_country].filter(Boolean);
  return parts.join(", ") || "Not specified";
}

function buildSalary(r: JSearchResult): string {
  if (!r.job_min_salary && !r.job_max_salary) return "";
  const curr = r.job_salary_currency || "USD";
  const fmt = (n: number) => {
    if (n >= 1000) return `${curr === "USD" ? "$" : ""}${Math.round(n / 1000)}k`;
    return `${curr === "USD" ? "$" : ""}${n}`;
  };
  if (r.job_min_salary && r.job_max_salary) return `${fmt(r.job_min_salary)} - ${fmt(r.job_max_salary)}`;
  if (r.job_min_salary) return `From ${fmt(r.job_min_salary)}`;
  return `Up to ${fmt(r.job_max_salary!)}`;
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "Recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function buildTags(r: JSearchResult): string[] {
  const tags: string[] = [];
  if (r.job_required_skills) tags.push(...r.job_required_skills.slice(0, 3));
  if (tags.length === 0 && r.job_employment_type) tags.push(r.job_employment_type);
  if (r.job_is_remote && !tags.includes("Remote")) tags.push("Remote");
  return tags.slice(0, 4);
}

function toJobItem(r: JSearchResult, index: number): JobItem {
  return {
    id: r.job_id || `jsearch-${index}`,
    title: r.job_title || "Untitled",
    company: r.employer_name || "Unknown",
    location: buildLocation(r),
    type: r.job_is_remote ? "Remote" : (r.job_employment_type || "Full-time"),
    salary: buildSalary(r),
    description: (r.job_description || "").slice(0, 200).trim() + (r.job_description?.length > 200 ? "..." : ""),
    matchScore: 75,
    tags: buildTags(r),
    postedDate: timeAgo(r.job_posted_at_datetime_utc),
    url: r.job_apply_link || undefined,
  };
}

async function fetchPage(params: Record<string, string>, page: number): Promise<JSearchResult[]> {
  const url = new URL(JSEARCH_URL);
  Object.entries(params).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
  url.searchParams.set("page", String(page));
  url.searchParams.set("num_pages", "1");

  const res = await fetch(url.toString(), {
    headers: {
      "X-RapidAPI-Key": RAPIDAPI_KEY,
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    },
  });

  if (!res.ok) throw new Error(`JSearch API error (${res.status})`);
  const data = await res.json();
  return data?.data || [];
}

export async function fetchJSearchJobs(prefs: JobPreferences): Promise<JobItem[]> {
  const params: Record<string, string> = {
    query: `${prefs.role} in ${prefs.location || "United States"}`,
    date_posted: "month",
  };

  if (prefs.levelApiValue) params.job_requirements = prefs.levelApiValue;
  if (prefs.locationType === "remote") {
    params.remote_jobs_only = "true";
    params.query = prefs.role;
  } else if (prefs.location) {
    params.query = `${prefs.role} in ${prefs.location}`;
  }

  // Fetch pages 1, 2, 3 in parallel
  const [p1, p2, p3] = await Promise.all([
    fetchPage(params, 1).catch(() => [] as JSearchResult[]),
    fetchPage(params, 2).catch(() => [] as JSearchResult[]),
    fetchPage(params, 3).catch(() => [] as JSearchResult[]),
  ]);

  const all = [...p1, ...p2, ...p3];
  // Deduplicate by job_id
  const seen = new Set<string>();
  const unique = all.filter((r) => {
    const id = r.job_id || r.job_title;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  return unique.map(toJobItem);
}
