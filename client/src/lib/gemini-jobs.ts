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


export async function rankJobsWithGemini(
  jobs: JobItem[],
  resume: ParsedResume
): Promise<JobItem[]> {
  if (jobs.length === 0) return jobs;

  const skills = resume.tools?.map((t) => t.name).join(", ") || "Not specified";
  const experienceYears = resume.experience?.length
    ? `${resume.experience.length} roles`
    : "Unknown";
  const experienceDetail = resume.experience
    ?.slice(0, 5)
    .map((e) => `${e.role} at ${e.company} (${e.startDate}${e.endDate ? "–" + e.endDate : "–Present"}): ${e.description}`)
    .join("\n") || "None listed";
  const projectDetail = resume.projects
    ?.map((p) => `${p.title}: ${p.description}`)
    .join("\n") || "None listed";

  const jobBlock = jobs.slice(0, 30).map((j, i) =>
    `[${i}] Title: ${j.title} | Company: ${j.company} | Location: ${j.location} | Type: ${j.type}${j.salary ? " | Salary: " + j.salary : ""}\nDescription: ${j.description.slice(0, 300)}\nTags: ${j.tags?.join(", ") || "none"}`
  ).join("\n\n");

  const prompt = `You are a strict job evaluator. Score each job against this candidate using the rubric below. Be harsh and differentiated — do NOT cluster scores. If a job is irrelevant, give it a low score.

CANDIDATE PROFILE:
Title: ${resume.title}
Summary: ${resume.about || "Not provided"}
Skills: ${skills}
Experience (${experienceYears}):
${experienceDetail}
Projects:
${projectDetail}

SCORING RUBRIC (total 100):
1. Role Alignment (30 pts): Does the job title and responsibilities match the candidate's current role and trajectory?
2. Skills Match (30 pts): Do the required skills/tools overlap with the candidate's listed skills and project experience?
3. Experience Fit (20 pts): Does the seniority level and years of experience align?
4. Context Fit (10 pts): Location, work mode, industry familiarity.
5. Growth Fit (10 pts): Does this role offer a logical next step in their career?

PENALTIES (subtract from total):
- Role mismatch (completely different field): -15
- Skills mismatch (less than 30% overlap): -10
- Seniority mismatch (junior role for senior candidate or vice versa): -5

JOBS TO EVALUATE:
${jobBlock}

RULES:
- Scores MUST range from 25 to 97. Use the full range.
- No two jobs should have the same score unless truly identical in fit.
- A perfect candidate-job match is 90+. Average fit is 60-75. Poor fit is below 50.
- Return ONLY a JSON array: [{"index": 0, "score": 82}, ...] for each job.
- No markdown, no explanation, no code fences.`;

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 2048 },
      }),
    });

    if (!response.ok) throw new Error("Gemini ranking failed");

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    const scores: { index: number; score: number }[] = JSON.parse(cleaned);

    const scored = jobs.map((job, i) => {
      const match = scores.find((s) => s.index === i);
      return { ...job, matchScore: match ? Math.min(97, Math.max(25, match.score)) : 50 };
    });

    return scored.sort((a, b) => b.matchScore - a.matchScore);
  } catch {
    return jobs.map((j) => ({ ...j, matchScore: 50 }));
  }
}
