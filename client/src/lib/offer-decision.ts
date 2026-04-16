import type { JobItem } from "./job-types";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export interface UserPreferences {
  priority: string;
  salaryRange: string;
  workMode: string;
  optimizingFor: string;
  riskPreference: string;
  companyPreference: string;
}

export interface OfferComparison {
  jobId: string;
  company: string;
  pros: string[];
  cons: string[];
}

export interface OfferDecisionResult {
  recommendedJobId: string;
  summary: string;
  comparison: OfferComparison[];
  reasoning: string;
  confidence: number;
}

export async function generateOfferDecision(
  offers: JobItem[],
  prefs: UserPreferences
): Promise<OfferDecisionResult> {
  const offersContext = offers
    .map(
      (j, i) =>
        `Job ${i + 1} (ID: ${j.id}):
  Company: ${j.company}
  Role: ${j.title}
  Salary: ${j.salary || "Not specified"}
  Location: ${j.location}
  Work mode: ${j.type}
  Description: ${j.description}`
    )
    .join("\n\n");

  const prompt = `You are a career decision advisor. A candidate has multiple job offers and needs help choosing. Analyze the offers against their stated preferences and provide a structured recommendation.

JOB OFFERS:
${offersContext}

CANDIDATE PREFERENCES:
- Top priority: ${prefs.priority}
- Target salary range: ${prefs.salaryRange}
- Preferred work mode: ${prefs.workMode}
- Optimizing for: ${prefs.optimizingFor}
- Risk preference: ${prefs.riskPreference}
- Company preference note: ${prefs.companyPreference || "None stated"}

Return ONLY a valid JSON object with this exact schema. No markdown, no code fences, no explanation:
{
  "recommendedJobId": "<the id of the best-fit job>",
  "summary": "<1-2 sentence recommendation summary>",
  "comparison": [
    {
      "jobId": "<job id>",
      "company": "<company name>",
      "pros": ["<pro 1>", "<pro 2>", ...],
      "cons": ["<con 1>", "<con 2>", ...]
    }
  ],
  "reasoning": "<2-3 sentences explaining WHY this recommendation based on their preferences>",
  "confidence": <number 0.0-1.0 how confident you are in this recommendation>
}

Be specific. Reference actual salary figures, company names, and job details. Do not give generic advice.`;

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
    }),
  });

  if (!response.ok) throw new Error(`Decision error (${response.status})`);

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  return {
    recommendedJobId: parsed.recommendedJobId || offers[0].id,
    summary: parsed.summary || "",
    comparison: (parsed.comparison || []).map((c: any) => ({
      jobId: c.jobId || "",
      company: c.company || "",
      pros: c.pros || [],
      cons: c.cons || [],
    })),
    reasoning: parsed.reasoning || "",
    confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
  };
}
