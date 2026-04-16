import type { JobItem } from "./job-types";
import type { ParsedResume } from "./types";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

function formatExperience(resume: ParsedResume): string {
  if (!resume.experience?.length) return "No experience listed.";
  return resume.experience
    .map((e) => {
      const period = e.endDate ? `${e.startDate}–${e.endDate}` : `${e.startDate}–Present`;
      return `${e.role} at ${e.company}, ${period}: ${e.description}`;
    })
    .join("\n");
}

function formatProjects(resume: ParsedResume): string {
  if (!resume.projects?.length) return "No projects listed.";
  return resume.projects
    .map((p) => `${p.title} — ${p.subtitle || p.description}`)
    .join("\n");
}

function formatSkills(resume: ParsedResume): string {
  if (!resume.tools?.length) return "No skills listed.";
  return resume.tools.map((t) => t.name).join(", ");
}

export function buildScoutSystemPrompt(job: JobItem, resume: ParsedResume): string {
  const isRemote = job.type === "Remote" || job.location?.toLowerCase().includes("remote");

  return `You are Scout, an AI career assistant embedded in a portfolio and job tracking tool. You are sharp, honest, and genuinely helpful — not a cheerleader. You give real, specific answers based on the candidate's actual background and the job they are looking at.

You have two pieces of context:

1. The job the candidate is considering:
Company: ${job.company}
Role: ${job.title}
Location: ${job.location}${isRemote ? " (Remote)" : ""}
Employment type: ${job.type}
Job description:
${job.description}

2. The candidate's portfolio and resume:
Name: ${resume.name}
Title: ${resume.title}
Summary: ${resume.about || "No summary provided."}

Experience:
${formatExperience(resume)}

Projects:
${formatProjects(resume)}

Skills: ${formatSkills(resume)}

Use both of these to give answers that are specific, not generic. When the user asks if they are a good fit, do a real comparison — not a pep talk. When they ask about missing skills, name the actual gaps. When they ask for a cover letter, write one using their real experience mapped to this specific JD. Keep responses concise and scannable. Use bullet points where helpful. Never make up experience the candidate does not have.`;
}

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export async function sendScoutMessage(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  // Cap at last 20 messages
  const trimmedHistory = history.slice(-20);

  const contents = [
    { role: "user", parts: [{ text: systemPrompt + "\n\n---\n\nUser: " + (trimmedHistory.length === 0 ? userMessage : trimmedHistory[0].content) }] },
  ];

  // Build multi-turn conversation
  if (trimmedHistory.length > 0) {
    // First user message already sent above, add the rest
    for (let i = 0; i < trimmedHistory.length; i++) {
      const msg = trimmedHistory[i];
      if (i === 0) continue; // Already included in the first content
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    }
    // Add the new user message
    contents.push({ role: "user", parts: [{ text: userMessage }] });
  }

  // If no history, the first content already has the user message
  // If there IS history, we restructure for proper multi-turn
  const apiContents =
    trimmedHistory.length === 0
      ? [{ role: "user", parts: [{ text: systemPrompt + "\n\n---\n\nUser: " + userMessage }] }]
      : [
          // System prompt + first message
          { role: "user", parts: [{ text: systemPrompt + "\n\n---\n\nUser: " + trimmedHistory[0].content }] },
          // Interleave history
          ...trimmedHistory.slice(1).map((m) => ({
            role: m.role === "user" ? "user" as const : "model" as const,
            parts: [{ text: m.content }],
          })),
          // New message
          { role: "user" as const, parts: [{ text: userMessage }] },
        ];

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: apiContents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    }),
  });

  if (!response.ok) {
    throw new Error(`Scout error (${response.status})`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "I couldn't generate a response. Please try again.";
}
