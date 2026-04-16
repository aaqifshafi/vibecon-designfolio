import type { ParsedResume } from "./types";
import type { JobItem } from "./job-types";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export async function generateJobMatches(resume: ParsedResume): Promise<JobItem[]> {
  const skills = resume.tools?.map(t => t.name).join(", ") || "";
  const experienceSummary = resume.experience
    ?.slice(0, 3)
    .map(e => `${e.role} at ${e.company}`)
    .join("; ") || "";

  const prompt = `You are a job matching engine. Based on the resume profile below, generate exactly 8 realistic job listings that would be a strong match. Return ONLY a valid JSON array of objects. No explanation, no markdown, no code fences.

Each object must have these fields:
- id (string) — unique like "job-1", "job-2", etc.
- title (string) — job title
- company (string) — realistic company name
- location (string) — city or "Remote"
- type (string) — one of: "Full-time", "Part-time", "Contract", "Remote"
- salary (string) — salary range like "$120k - $160k"
- description (string) — 1-2 sentence job description
- matchScore (number) — 70-98, how well it matches the profile
- tags (array of strings) — 2-4 relevant skill tags
- postedDate (string) — a recent date like "2 days ago", "1 week ago"

Resume profile:
- Name: ${resume.name}
- Title: ${resume.title}
- Skills/Tools: ${skills}
- Experience: ${experienceSummary}
- About: ${resume.about || ""}

Generate diverse jobs: mix of senior/lead roles, different company sizes, some remote. Sort by matchScore descending.`;

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error (${response.status})`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let jobs: JobItem[];
  try {
    jobs = JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse job matches");
  }

  return jobs.map((j: any, i: number) => ({
    id: j.id || `job-${i + 1}`,
    title: j.title || "Untitled Role",
    company: j.company || "Unknown Company",
    location: j.location || "Remote",
    type: j.type || "Full-time",
    salary: j.salary || "",
    description: j.description || "",
    matchScore: Math.min(99, Math.max(50, j.matchScore || 75)),
    tags: j.tags || [],
    postedDate: j.postedDate || "Recently",
    url: j.url || undefined,
  }));
}


// ── Individual Job Scoring ──

function buildCandidateContext(resume: ParsedResume): string {
  const skills = resume.tools?.map((t) => t.name).join(", ") || "Not specified";
  const experience = resume.experience
    ?.slice(0, 5)
    .map((e) => `- ${e.role} at ${e.company} (${e.startDate}${e.endDate ? "–" + e.endDate : "–Present"}): ${e.description}`)
    .join("\n") || "None";
  const projects = resume.projects
    ?.map((p) => `- ${p.title}: ${p.description}`)
    .join("\n") || "None";

  return `Title: ${resume.title}
About: ${resume.about || "N/A"}
Skills: ${skills}
Experience:
${experience}
Projects:
${projects}`;
}

async function scoreOneJob(
  job: JobItem,
  candidateContext: string
): Promise<number> {
  const prompt = `Score how well this job fits this candidate. Return ONLY a single number between 25 and 97. Just the number, nothing else.

CANDIDATE:
${candidateContext}

JOB:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location} | ${job.type}
${job.salary ? "Salary: " + job.salary : ""}
Tags: ${job.tags?.join(", ") || "none"}
Description: ${job.description.slice(0, 500)}

RUBRIC:
- Role Alignment (30%): Title and responsibilities match?
- Skills Match (30%): Skills overlap with candidate?
- Experience Fit (20%): Seniority level match?
- Context Fit (10%): Location, industry fit?
- Growth Fit (10%): Good next career step?

Penalties: Wrong field -15, Low skill overlap -10, Seniority mismatch -5
Guide: 90+ strong fit, 70-89 good, 50-69 average, <50 poor

Score:`;

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 8 },
    }),
  });

  if (!res.ok) throw new Error(`API ${res.status}`);

  const data = await res.json();
  const raw = (data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
  const num = parseInt(raw.replace(/[^0-9]/g, ""), 10);

  if (isNaN(num) || num < 1 || num > 100) throw new Error("bad score");
  return Math.min(97, Math.max(25, num));
}

// Process in parallel with concurrency limit
async function parallelMap<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  fallback: R,
  concurrency: number
): Promise<R[]> {
  const results: R[] = new Array(items.length).fill(fallback);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const i = next++;
      try {
        results[i] = await fn(items[i]);
      } catch {
        // Individual failure — only this job gets fallback
        results[i] = fallback;
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

export async function rankJobsWithGemini(
  jobs: JobItem[],
  resume: ParsedResume
): Promise<JobItem[]> {
  if (jobs.length === 0) return jobs;

  const candidateContext = buildCandidateContext(resume);

  // Score each job individually, 4 concurrent calls
  const scores = await parallelMap(
    jobs,
    (job) => scoreOneJob(job, candidateContext),
    50, // only THIS job gets 50 on failure, not all
    4
  );

  const scored = jobs.map((job, i) => ({
    ...job,
    matchScore: scores[i],
  }));

  return scored.sort((a, b) => b.matchScore - a.matchScore);
}
