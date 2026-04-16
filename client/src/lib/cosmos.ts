import type { JobItem } from "./job-types";
import type { ParsedResume } from "./types";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export interface StarData {
  job: JobItem;
  distance: number;      // 0-1, lower = closer/better emotional fit
  resonance: number;     // 0-1, higher = more glow
  weight: number;        // 0-1, higher = bigger star
  companyType: "startup" | "mid" | "enterprise" | "agency";
  insight: string;       // Emotional insight for hover
  whyFits: string;       // For OFERTA panel
  angle: number;         // Computed during layout
  x: number;             // Computed during layout
  y: number;             // Computed during layout
}

export async function computeCosmosData(
  jobs: JobItem[],
  resume: ParsedResume
): Promise<StarData[]> {
  if (jobs.length === 0) return [];

  const jobsList = jobs
    .map((j, i) => `[${i}] ${j.title} at ${j.company} | ${j.location} | ${j.type} | ${j.description?.slice(0, 150)}`)
    .join("\n");

  const candidateContext = `${resume.name}, ${resume.title}. ${resume.about || ""}. Skills: ${resume.tools?.map((t) => t.name).join(", ") || "N/A"}. Experience: ${resume.experience?.map((e) => `${e.role} at ${e.company}`).join(", ") || "N/A"}.`;

  const prompt = `You are an emotional career alignment engine. For each job below, compute how emotionally and culturally aligned it is with the candidate — not based on skills matching, but on values, energy, culture, and career meaning.

Candidate: ${candidateContext}

Jobs:
${jobsList}

Return ONLY a JSON array. No markdown, no fences, no explanation. Each item:
{
  "index": <number>,
  "distance": <0.15 to 0.85, lower = stronger emotional pull>,
  "resonance": <0.2 to 1.0, how much this role would energize them>,
  "weight": <0.3 to 1.0, opportunity magnitude — consider seniority, impact, compensation>,
  "companyType": "<startup|mid|enterprise|agency>",
  "insight": "<1 sentence emotional insight for hover, e.g. 'This feels like the kind of team that ships fast and celebrates wins together'>",
  "whyFits": "<2-3 sentences about why this job matters to them emotionally, not just professionally>"
}

Be poetic but honest. If a job doesn't fit emotionally, say so — distance should be far.`;

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 4096 },
    }),
  });

  if (!response.ok) throw new Error(`Cosmos error (${response.status})`);

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed: any[] = JSON.parse(cleaned);

  return parsed.map((p) => {
    const idx = Math.min(p.index ?? 0, jobs.length - 1);
    return {
      job: jobs[idx],
      distance: Math.max(0.15, Math.min(0.85, p.distance ?? 0.5)),
      resonance: Math.max(0.2, Math.min(1, p.resonance ?? 0.5)),
      weight: Math.max(0.3, Math.min(1, p.weight ?? 0.5)),
      companyType: (["startup", "mid", "enterprise", "agency"].includes(p.companyType) ? p.companyType : "mid") as StarData["companyType"],
      insight: p.insight || "An interesting opportunity.",
      whyFits: p.whyFits || "This role could bring new perspective to your career.",
      angle: 0,
      x: 0,
      y: 0,
    };
  });
}

// Fallback: compute locally without Gemini
export function computeCosmosDataFallback(jobs: JobItem[]): StarData[] {
  return jobs.map((job, i) => {
    const isRemote = job.type === "Remote" || job.location?.toLowerCase().includes("remote");
    const hasSalary = !!job.salary;
    return {
      job,
      distance: 0.25 + Math.random() * 0.5,
      resonance: 0.4 + Math.random() * 0.5,
      weight: hasSalary ? 0.6 + Math.random() * 0.3 : 0.3 + Math.random() * 0.4,
      companyType: (isRemote ? "startup" : "enterprise") as StarData["companyType"],
      insight: `${job.company} — ${isRemote ? "a remote-first culture" : "in " + job.location}`,
      whyFits: `${job.title} at ${job.company} offers a chance to grow in ${job.tags?.[0] || "design"}.`,
      angle: 0,
      x: 0,
      y: 0,
    };
  });
}

const TYPE_ANGLES: Record<string, number> = { startup: 0, mid: 90, enterprise: 180, agency: 270 };
const TYPE_COLORS: Record<string, string> = {
  startup: "#818cf8",   // indigo
  mid: "#a78bfa",       // violet
  enterprise: "#fbbf24", // amber
  agency: "#34d399",    // emerald
};

export function layoutStars(stars: StarData[], width: number, height: number): StarData[] {
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(cx, cy) * 0.82;

  return stars.map((star, i) => {
    const baseAngle = TYPE_ANGLES[star.companyType] || 0;
    const spread = 65;
    const angle = baseAngle + (Math.random() * spread - spread / 2) + (i * 17) % 30;
    const rad = (angle * Math.PI) / 180;
    const r = star.distance * maxRadius;

    return {
      ...star,
      angle,
      x: cx + Math.cos(rad) * r,
      y: cy + Math.sin(rad) * r,
    };
  });
}

export { TYPE_COLORS };
