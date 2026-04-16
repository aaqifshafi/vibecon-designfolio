import type { ParsedResume, ProjectItem } from "./types";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const PROMPT = `You are a resume parser. Extract the following fields from the resume text below and return ONLY a valid JSON object matching the ParsedResume schema exactly. No explanation, no markdown, no code fences.

Fields to extract:
- name (string) — full name
- firstName (string) — first name only
- title (string) — job title or professional headline
- about (string) — 2–3 sentence bio or summary
- location (string) — city, country if present
- email (string) — extracted via regex [\\w.+-]+@[\\w-]+\\.[a-z]{2,}
- phone (string) — extracted via regex [\\+]?[\\d\\s\\-\\(\\)]{7,15}
- linkedin (string) — full URL or handle matching linkedin.com/in/...
- dribbble (string) — full URL or handle matching dribbble.com/...
- twitter (string) — full URL or handle matching twitter.com/... or x.com/...
- github (string) — full URL or handle matching github.com/...
- website (string) — any personal URL not matching the above patterns
- experience (array) — each item: { company, role, startDate, endDate, description }
- projects (array) — ALWAYS exactly 2 items. Cap at 2 if more exist. Pad with placeholder if fewer than 2. Each item: { id, title, subtitle, description, details: { client, role, industry, platform }, introduction }
- tools (array) — each item: { name, icon } where icon must be one of the /tools/image *.png paths
- recommendations (array) — each item: { id, name, role, content, image } — use "/images/recommender-1.jpg" as image fallback. Return empty array if none found.

Resume text:
`;

const DEFAULT_TOOLS = [
  { name: "Figma", icon: "/tools/image 4.png" },
  { name: "Notion", icon: "/tools/image 5.png" },
  { name: "Raycast", icon: "/tools/image 6.png" },
  { name: "Framer", icon: "/tools/image 7.png" },
  { name: "Linear", icon: "/tools/image 8.png" },
  { name: "Slack", icon: "/tools/image 9.png" },
  { name: "Arc", icon: "/tools/image 10.png" },
];

function makePlaceholderProject(title: string): ProjectItem {
  return {
    id: "project-2",
    title: "More work available on request",
    subtitle: "Additional projects and case studies available upon request.",
    description: "Additional projects and case studies available upon request.",
    details: { client: "—", role: title, industry: "—", platform: "—" },
    introduction:
      "Additional projects and detailed case studies are available upon request. Please reach out to learn more.",
  };
}

function enforceProjects(
  raw: any[],
  fallbackTitle: string
): [ProjectItem, ProjectItem] {
  const projects = (raw || []).slice(0, 2).map((p: any, i: number) => ({
    id: p.id || `project-${i + 1}`,
    title: p.title || "Untitled Project",
    subtitle: p.subtitle || "",
    description: p.description || "",
    details: {
      client: p.details?.client || "—",
      role: p.details?.role || fallbackTitle,
      industry: p.details?.industry || "—",
      platform: p.details?.platform || "—",
    },
    introduction: p.introduction || "",
  }));

  if (projects.length < 2) {
    projects.push(makePlaceholderProject(fallbackTitle));
  }
  if (projects.length < 2) {
    projects.push(makePlaceholderProject(fallbackTitle));
  }

  return [projects[0], projects[1]];
}

export async function parseResumeWithGemini(
  resumeText: string
): Promise<ParsedResume> {
  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: PROMPT + resumeText }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const rawText =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Strip markdown fences if present
  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Gemini returned malformed JSON");
  }

  const title = parsed.title || "Product Designer";

  const resume: ParsedResume = {
    name: parsed.name || "",
    firstName: parsed.firstName || parsed.name?.split(" ")[0] || "there",
    title,
    about: parsed.about || undefined,
    location: parsed.location || undefined,
    email: parsed.email || undefined,
    phone: parsed.phone || undefined,
    linkedin: parsed.linkedin || undefined,
    dribbble: parsed.dribbble || undefined,
    twitter: parsed.twitter || undefined,
    github: parsed.github || undefined,
    website: parsed.website || undefined,
    experience: (parsed.experience || []).map((e: any) => ({
      company: e.company || "",
      role: e.role || "",
      startDate: e.startDate || "",
      endDate: e.endDate || undefined,
      description: e.description || "",
    })),
    projects: enforceProjects(parsed.projects, title),
    tools:
      parsed.tools && parsed.tools.length > 0
        ? parsed.tools.map((t: any) => ({
            name: t.name || "",
            icon: t.icon || "/tools/image 4.png",
          }))
        : DEFAULT_TOOLS,
    recommendations: (parsed.recommendations || []).map(
      (r: any, i: number) => ({
        id: r.id || `rec-${i + 1}`,
        name: r.name || "",
        role: r.role || "",
        content: r.content || "",
        image: r.image || "/images/recommender-1.jpg",
      })
    ),
  };

  return resume;
}
