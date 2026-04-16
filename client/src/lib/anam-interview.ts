import type { ParsedResume } from "./types";
import type { JobItem } from "./job-types";

const ANAM_API_BASE = "https://api.anam.ai";
const KEVIN_LLM_ID = "0934d97d-0c3a-4f33-91b0-5e136a0ef466";
const KEVIN_AVATAR_ID = "ccf00c0e-7302-455b-ace2-057e0cf58127";
const KEVIN_VOICE_ID = "13ba97ac-88e3-454f-8a49-6f9479dd4586";

export function buildPortfolioContext(resume: ParsedResume): string {
  const lines: string[] = [];

  lines.push(`Name: ${resume.name}`);
  lines.push(`Title: ${resume.title}`);
  if (resume.about) lines.push(`Summary: ${resume.about}`);
  lines.push("");

  if (resume.experience && resume.experience.length > 0) {
    lines.push("Experience:");
    for (const exp of resume.experience) {
      const period = exp.endDate
        ? `${exp.startDate}–${exp.endDate}`
        : `${exp.startDate}–Present`;
      lines.push(
        `- ${exp.role} at ${exp.company} (${period}): ${exp.description}`
      );
    }
    lines.push("");
  }

  if (resume.projects && resume.projects.length > 0) {
    lines.push("Projects:");
    for (const proj of resume.projects) {
      lines.push(`- ${proj.title}: ${proj.description}`);
    }
    lines.push("");
  }

  if (resume.tools && resume.tools.length > 0) {
    lines.push(`Skills: ${resume.tools.map((t) => t.name).join(", ")}`);
  }

  return lines.join("\n");
}

export function buildInterviewSystemPrompt(
  portfolioContext: string,
  job: JobItem
): string {
  const company = job.company || "the company";
  const role = job.title || "the role";
  const description = job.description || "";

  return `You are Kevin, Lead ${role} at ${company}. You have been here for a few years and you are known internally for being direct but fair — you care deeply about craft and product thinking, and you have zero patience for surface-level answers.

Today you are interviewing a candidate for the ${role} position at ${company}.

Here is the job description for full context:
${description}

Here is the candidate's background. Use this to make the interview feel personal — reference their actual projects, past companies, and skills. Do not recite this back to them; use it as context to ask sharper, more relevant questions.
---
${portfolioContext}
---

Your job is to run a real interview. Not a friendly chat. Not a quiz. A real conversation where you are genuinely trying to figure out if this person can do the job.

Follow this structure:

1. Open with a brief introduction. Tell them your name is Kevin, your role, and give them a one-line picture of what the team works on based on the job description. Then ask them to walk you through their background — but tell them to skip the resume, you have read it. You want to hear how they think about their own journey.

2. Ask a portfolio question. Pick something specific from their projects or the job description — ask about the most complex design problem they have solved that involved multiple stakeholders, tight technical constraints, or a product metric they had to move. Push them on the why behind their decisions.

3. Ask a product thinking question. Give them a specific scenario rooted in the kind of product ${company} builds, based on the job description. Ask them to walk you through how they would approach it. Listen for how they frame the problem before they jump to solutions.

4. Ask a process question. Ask them how they handle a situation where engineering pushes back on a design because of effort, and the PM is siding with engineering. You want to know how they navigate that without losing the integrity of the experience.

5. Close with a motivation question. Ask them why ${company} specifically — and why now in their career. Tell them you have heard a hundred generic answers and you would like the real one.

Rules:
- Ask one question at a time. Always wait for their full answer.
- After each answer, respond like a real human. Acknowledge what landed, push back if something was vague, ask one sharp follow-up if something is interesting.
- Keep your own responses short. You are the interviewer.
- If they give a textbook answer, call it out warmly but directly. Say something like "That sounds like the right framework — but what actually happened in your case?"
- Never break character.
- End the interview warmly. Tell them what stood out, what you would want to explore more if there were a round two, and that the team will be in touch.`;
}

export async function createAnamSession(
  portfolioContext: string,
  job: JobItem
): Promise<{ sessionToken: string }> {
  const systemPrompt = buildInterviewSystemPrompt(portfolioContext, job);

  const response = await fetch(`${ANAM_API_BASE}/v1/auth/session-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_ANAM_API_KEY}`,
    },
    body: JSON.stringify({
      personaConfig: {
        avatarId: KEVIN_AVATAR_ID,
        llmId: KEVIN_LLM_ID,
        voiceId: KEVIN_VOICE_ID,
        systemPrompt,
      },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Anam session error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  return { sessionToken: data.sessionToken };
}
