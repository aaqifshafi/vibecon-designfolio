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
