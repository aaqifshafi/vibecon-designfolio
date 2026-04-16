import type { ParsedResume } from "./types";
import type { JobItem } from "./job-types";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
const GEMINI_EMBED_MODEL = "gemini-embedding-001";
const GEMINI_EMBED_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBED_MODEL}:batchEmbedContents?key=${GEMINI_API_KEY}`;

export async function generateJobMatches(
  resume: ParsedResume,
): Promise<JobItem[]> {
  const skills = resume.tools?.map((t) => t.name).join(", ") || "";
  const experienceSummary =
    resume.experience
      ?.slice(0, 3)
      .map((e) => `${e.role} at ${e.company}`)
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
  const experience =
    resume.experience
      ?.slice(0, 5)
      .map(
        (e) =>
          `- ${e.role} at ${e.company} (${e.startDate}${
            e.endDate ? "–" + e.endDate : "–Present"
          }): ${e.description}`,
      )
      .join("\n") || "None";
  const projects =
    resume.projects?.map((p) => `- ${p.title}: ${p.description}`).join("\n") ||
    "None";

  return `Title: ${resume.title}
About: ${resume.about || "N/A"}
Skills: ${skills}
Experience:
${experience}
Projects:
${projects}`;
}

function buildCandidateEmbeddingContext(resume: ParsedResume): string {
  const skills = resume.tools?.map((t) => t.name).join(", ") || "Not specified";
  const roles =
    resume.experience
      ?.slice(0, 5)
      .map((e) => `${e.role} at ${e.company}`)
      .join("; ") || "None";

  return `Candidate profile:
Title: ${resume.title || "N/A"}
About: ${resume.about || "N/A"}
Skills: ${skills}
Recent roles: ${roles}`;
}

function buildJobEmbeddingContext(job: JobItem): string {
  return `Job profile:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Type: ${job.type}
Tags: ${(job.tags || []).join(", ") || "none"}
Description: ${(job.description || "").slice(0, 1200)}`;
}

function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function extractScore(raw: string): number {
  // Prefer standalone 1-3 digit numbers so outputs like "58/100" parse as 58, not 58100.
  const normalized = raw.trim();
  const candidates = normalized.match(/\b\d{1,3}\b/g) || [];
  for (const candidate of candidates) {
    const parsed = Number.parseInt(candidate, 10);
    if (parsed >= 1 && parsed <= 100) return parsed;
  }
  throw new Error("bad score");
}

function heuristicJobScore(job: JobItem, resume: ParsedResume): number {
  const resumeSkills = new Set(
    (resume.tools || [])
      .map((tool) => normalizeToken(tool.name))
      .filter(Boolean),
  );
  const roleTerms = new Set(
    normalizeToken(resume.title || "")
      .split(" ")
      .filter((term) => term.length > 2),
  );
  const experienceTerms = new Set(
    (resume.experience || [])
      .flatMap((item) => normalizeToken(item.role || "").split(" "))
      .filter((term) => term.length > 2),
  );

  const jobText = normalizeToken(
    [job.title, job.description, ...(job.tags || [])].join(" "),
  );
  const jobTerms = new Set(
    jobText.split(" ").filter((term) => term.length > 2),
  );

  let skillOverlap = 0;
  resumeSkills.forEach((skill) => {
    if (jobText.includes(skill)) skillOverlap += 1;
  });
  const skillRatio =
    resumeSkills.size > 0 ? skillOverlap / resumeSkills.size : 0;

  let roleOverlap = 0;
  roleTerms.forEach((term) => {
    if (jobTerms.has(term)) roleOverlap += 1;
  });
  const roleRatio = roleTerms.size > 0 ? roleOverlap / roleTerms.size : 0;

  let expOverlap = 0;
  experienceTerms.forEach((term) => {
    if (jobTerms.has(term)) expOverlap += 1;
  });
  const expRatio =
    experienceTerms.size > 0
      ? Math.min(1, expOverlap / Math.min(8, experienceTerms.size))
      : 0;

  const weighted = 0.5 * skillRatio + 0.35 * roleRatio + 0.15 * expRatio;

  const score = Math.round(25 + weighted * (97 - 25));
  return Math.min(97, Math.max(25, score));
}

function cosineSimilarity(a: number[], b: number[]): number {
  const length = Math.min(a.length, b.length);
  if (length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function batchEmbedTexts(texts: string[]): Promise<number[][]> {
  const requests = texts.map((text) => ({
    model: `models/${GEMINI_EMBED_MODEL}`,
    content: { parts: [{ text }] },
  }));

  const res = await fetch(GEMINI_EMBED_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requests }),
  });

  if (!res.ok) throw new Error(`Embedding API ${res.status}`);

  const data = await res.json();
  const embeddings = (data?.embeddings || []).map((e: any) => e?.values);
  if (!Array.isArray(embeddings) || embeddings.length !== texts.length) {
    throw new Error("Invalid embedding response");
  }

  return embeddings;
}

async function scoreOneJob(
  job: JobItem,
  candidateContext: string,
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
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 8,
        responseMimeType: "text/plain",
      },
    }),
  });

  if (!res.ok) throw new Error(`API ${res.status}`);

  const data = await res.json();
  const raw = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((part: { text?: string }) => part?.text || "")
    .join(" ")
    .trim();
  const num = extractScore(raw);

  if (isNaN(num) || num < 1 || num > 100) throw new Error("bad score");
  return Math.min(97, Math.max(25, num));
}

// Process in parallel with concurrency limit
async function parallelMap<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  fallback: R,
  concurrency: number,
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
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

export async function rankJobsWithGemini(
  jobs: JobItem[],
  resume: ParsedResume,
): Promise<JobItem[]> {
  if (jobs.length === 0) return jobs;

  // Primary path: semantic similarity via embeddings.
  try {
    const candidateEmbeddingContext = buildCandidateEmbeddingContext(resume);
    const jobEmbeddingContexts = jobs.map(buildJobEmbeddingContext);
    const embeddings = await batchEmbedTexts([
      candidateEmbeddingContext,
      ...jobEmbeddingContexts,
    ]);
    const candidateEmbedding = embeddings[0];
    const jobEmbeddings = embeddings.slice(1);

    const similarities = jobEmbeddings.map((e) =>
      cosineSimilarity(candidateEmbedding, e),
    );

    const minSim = Math.min(...similarities);
    const maxSim = Math.max(...similarities);
    let embeddingScores: number[];

    if (!isFinite(minSim) || !isFinite(maxSim) || maxSim - minSim < 0.0001) {
      embeddingScores = jobs.map((job) => heuristicJobScore(job, resume));
    } else {
      const range = 97 - 25;
      embeddingScores = similarities.map((sim) => {
        const normalized = (sim - minSim) / (maxSim - minSim);
        return Math.round(25 + normalized * range);
      });
    }

    const scored = jobs.map((job, i) => ({
      ...job,
      matchScore: Math.min(97, Math.max(25, embeddingScores[i])),
    }));

    return scored.sort((a, b) => b.matchScore - a.matchScore);
  } catch {
    // Fallback path below uses direct numeric LLM scoring per job.
  }

  const candidateContext = buildCandidateContext(resume);

  const fallbackScores = jobs.map((job) => heuristicJobScore(job, resume));

  // Score each job individually, 4 concurrent calls
  const scores = await parallelMap(
    jobs,
    (job) => scoreOneJob(job, candidateContext),
    0,
    4,
  );

  const scored = jobs.map((job, i) => ({
    ...job,
    matchScore: scores[i] > 0 ? scores[i] : fallbackScores[i],
  }));

  return scored.sort((a, b) => b.matchScore - a.matchScore);
}
