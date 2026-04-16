import type { JobItem } from "./job-types";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export interface QuestionBreakdown {
  question: string;
  feedback: string;
  score: number;
}

export interface InterviewReport {
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  questionBreakdown: QuestionBreakdown[];
  actionableImprovements: string[];
  hiringSignal: string;
  generatedAt: string;
  jobId: string;
  jobTitle: string;
  company: string;
}

export interface TranscriptMessage {
  role: "persona" | "user" | string;
  content: string;
}

function formatTranscript(messages: TranscriptMessage[]): string {
  return messages
    .map((m) => {
      const speaker =
        m.role === "persona" || m.role === "PERSONA" || m.role === "assistant"
          ? "Kevin (Interviewer)"
          : "Candidate";
      return `${speaker}: ${m.content}`;
    })
    .join("\n\n");
}

export async function generateInterviewReport(
  transcript: TranscriptMessage[],
  job: JobItem
): Promise<InterviewReport> {
  const formattedTranscript = formatTranscript(transcript);
  const role = job.title || "the role";
  const company = job.company || "the company";
  const description = job.description || "";

  const prompt = `You are a senior hiring manager evaluating a mock interview transcript. Analyze the entire conversation and generate a detailed, structured performance report.

Job Context:
- Role: ${role}
- Company: ${company}
- Description: ${description}

Interview Transcript:
---
${formattedTranscript}
---

Evaluate the candidate like a real interviewer. Be direct but constructive. Focus on:
- Communication clarity and confidence
- Depth of answers (surface-level vs substantive)
- Product thinking and problem-solving ability
- Structured thinking (frameworks, methodology)
- Role fit based on the job description
- Use of real examples, metrics, and specifics

Rules:
- Reference specific answers from the transcript — do not give generic feedback
- Every strength and weakness must tie back to something the candidate actually said
- Actionable improvements must be concrete and immediately usable
- The hiring signal must be one of: "Strong Hire", "Hire", "Lean Hire", "Lean No Hire", "No Hire"
- Score each question 1-10 where 10 is exceptional
- Overall score is 0-100

Return ONLY a valid JSON object matching this exact schema. No markdown, no code fences, no explanation:
{
  "overallScore": <number 0-100>,
  "summary": "<2-3 sentence executive summary>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "questionBreakdown": [
    { "question": "<the question asked>", "feedback": "<specific feedback on the answer>", "score": <1-10> }
  ],
  "actionableImprovements": ["<improvement 1>", "<improvement 2>", ...],
  "hiringSignal": "<one of: Strong Hire, Hire, Lean Hire, Lean No Hire, No Hire>"
}`;

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini report error (${response.status})`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse interview report");
  }

  return {
    overallScore: Math.min(100, Math.max(0, parsed.overallScore || 0)),
    summary: parsed.summary || "",
    strengths: parsed.strengths || [],
    weaknesses: parsed.weaknesses || [],
    questionBreakdown: (parsed.questionBreakdown || []).map((q: any) => ({
      question: q.question || "",
      feedback: q.feedback || "",
      score: Math.min(10, Math.max(1, q.score || 5)),
    })),
    actionableImprovements: parsed.actionableImprovements || [],
    hiringSignal: parsed.hiringSignal || "Lean No Hire",
    generatedAt: new Date().toISOString(),
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
  };
}
