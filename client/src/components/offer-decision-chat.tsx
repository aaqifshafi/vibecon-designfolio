import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Trophy, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JobItem } from "@/lib/job-types";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const FEEL_OPTIONS = [
  "Genuinely excited — felt like my kind of people",
  "Solid but nothing special",
  "Red flags but good offer",
  "Mixed — liked some rounds, not others",
];

const REGRET_OPTIONS = [
  "Taking less money for something I love",
  "Chasing money over growth",
  "Playing it safe when I should bet on myself",
  "Optimising for title over actual work",
  "Ignoring my gut feeling",
];

interface Props {
  offers: JobItem[];
  onClose: () => void;
}

interface Answer {
  question: string;
  value: string;
}

export default function OfferDecisionChat({ offers, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [freeText, setFreeText] = useState("");
  const [interviewFeels, setInterviewFeels] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"chat" | "thinking" | "result">("chat");
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 60);
  }, [step, phase, answers, interviewFeels]);

  // Build dynamic questions based on offers
  const questions = [
    {
      id: "ctc",
      text: "What's your current CTC?",
      type: "free" as const,
      placeholder: "e.g. $140k base + $20k bonus",
    },
    {
      id: "offer-0",
      text: `Let's figure this out together. What's ${offers[0]?.company} actually offering you — base salary, and anything else on top?`,
      type: "free" as const,
      placeholder: "e.g. $185k base, $30k signing, 4yr vest",
    },
    ...(offers.length > 1
      ? offers.slice(1).map((o, i) => ({
          id: `offer-${i + 1}`,
          text: `Got it. And ${o.company}?`,
          type: "free" as const,
          placeholder: "Base, bonus, equity, anything else",
        }))
      : []),
    {
      id: "feel",
      text: "Okay. Now the part that data can't tell me — how did each interview actually feel?",
      type: "feel" as const,
      placeholder: "",
    },
    {
      id: "regret",
      text: "One more. Right now, what's the thing you'd most regret optimising for the wrong way?",
      type: "chips" as const,
      placeholder: "",
    },
  ];

  const currentQ = questions[step];

  const submitAnswer = (value: string) => {
    if (!value.trim()) return;
    const newAnswers = [...answers, { question: currentQ.text, value }];
    setAnswers(newAnswers);
    setFreeText("");
    if (step < questions.length - 1) {
      setTimeout(() => setStep((s) => s + 1), 250);
    } else {
      runDecision(newAnswers);
    }
  };

  const submitFeels = () => {
    const feelSummary = offers
      .map((o) => `${o.company}: ${interviewFeels[o.id] || "No answer"}`)
      .join(". ");
    submitAnswer(feelSummary);
  };

  const runDecision = async (allAnswers: Answer[]) => {
    setPhase("thinking");
    setError(null);

    const offersBlock = offers
      .map((j) => `- ${j.title} at ${j.company} | ${j.location} | ${j.type} | Salary: ${j.salary || "?"}\n  ${j.description}`)
      .join("\n");

    const answersBlock = allAnswers.map((a) => `Q: ${a.question}\nA: ${a.value}`).join("\n\n");

    const prompt = `You are a sharp, honest career advisor helping someone choose between job offers. No fluff. No "both are great options". Give a real opinion.

OFFERS:
${offersBlock}

CANDIDATE'S ANSWERS:
${answersBlock}

Based on everything above, give your recommendation. Be direct. Write like you're talking to a friend over coffee — not writing a report.

Format your response as:
1. A clear 1-sentence recommendation (which offer and why, in plain english)
2. The honest tradeoff they're making (2-3 sentences max)
3. One thing to negotiate before signing (1 sentence)

Keep the total response under 150 words. No bullet points. No headers. No markdown. Just talk.`;

    try {
      const res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      setResult(text.trim());
      setPhase("result");
    } catch {
      setError("Couldn't get a recommendation right now. Try again.");
      setPhase("chat");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className="fixed bottom-5 right-5 z-[200] w-[380px] h-[520px] bg-white dark:bg-[#1C1A19] rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden"
      data-testid="offer-decision-chat"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-13 py-3 border-b border-black/5 dark:border-white/5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-violet-500" />
          </div>
          <span className="text-[13px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">Scout</span>
        </div>
        <button type="button" onClick={onClose} className="w-7 h-7 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-[#7A736C] hover:text-[#1A1A1A] dark:text-[#9E9893] dark:hover:text-[#F0EDE7] transition-colors" data-testid="offer-decision-close">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Intro */}
        <ScoutBubble>
          You've got {offers.length} offers on the table. Let's work through this.
        </ScoutBubble>

        {/* Rendered Q&A pairs */}
        {answers.map((a, i) => (
          <div key={i} className="space-y-2.5">
            <ScoutBubble>{questions[i].text}</ScoutBubble>
            <UserBubble>{a.value}</UserBubble>
          </div>
        ))}

        {/* Current question */}
        {phase === "chat" && currentQ && step === answers.length && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <ScoutBubble>{currentQ.text}</ScoutBubble>

            {/* Free text input */}
            {currentQ.type === "free" && (
              <div className="flex gap-2 pl-1">
                <input
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitAnswer(freeText); } }}
                  placeholder={currentQ.placeholder}
                  className="flex-1 h-9 px-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/8 dark:border-white/8 text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] placeholder:text-[#7A736C]/40 outline-none focus:border-black/20 dark:focus:border-white/20"
                  autoFocus
                  data-testid={`decision-input-${currentQ.id}`}
                />
                <button type="button" onClick={() => submitAnswer(freeText)} disabled={!freeText.trim()} className="w-9 h-9 rounded-xl bg-[#1A1A1A] dark:bg-[#F0EDE7] text-white dark:text-[#1A1A1A] flex items-center justify-center disabled:opacity-20 hover:opacity-80 transition-opacity">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Interview feel — one per offer */}
            {currentQ.type === "feel" && (
              <div className="space-y-3 pl-1">
                {offers.map((o) => (
                  <div key={o.id}>
                    <span className="text-[12px] font-semibold text-[#7A736C] dark:text-[#9E9893] mb-1.5 block">{o.company}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {FEEL_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setInterviewFeels((p) => ({ ...p, [o.id]: opt }))}
                          className={cn(
                            "text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-all",
                            interviewFeels[o.id] === opt
                              ? "border-[#1A1A1A] dark:border-[#F0EDE7] bg-[#1A1A1A] dark:bg-[#F0EDE7] text-white dark:text-[#1A1A1A]"
                              : "border-black/8 dark:border-white/8 text-[#7A736C] dark:text-[#9E9893] hover:border-black/20 dark:hover:border-white/20"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {Object.keys(interviewFeels).length === offers.length && (
                  <button type="button" onClick={submitFeels} className="mt-1 text-[12px] font-semibold text-violet-500 hover:text-violet-600 transition-colors" data-testid="submit-feels">
                    Continue →
                  </button>
                )}
              </div>
            )}

            {/* Regret chips */}
            {currentQ.type === "chips" && (
              <div className="flex flex-wrap gap-1.5 pl-1">
                {REGRET_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => submitAnswer(opt)}
                    className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-black/8 dark:border-white/8 text-[#7A736C] dark:text-[#9E9893] hover:border-black/20 dark:hover:border-white/20 hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Thinking */}
        {phase === "thinking" && (
          <div className="flex justify-start">
            <div className="bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-violet-500 animate-pulse" />
              <span className="text-[13px] text-[#7A736C] dark:text-[#9E9893]">Thinking...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl px-3.5 py-2.5 text-[13px] text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Result */}
        {phase === "result" && result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3.5 text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] leading-relaxed whitespace-pre-line">
              {result}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function ScoutBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[88%] rounded-2xl rounded-bl-md bg-black/[0.04] dark:bg-white/[0.06] px-3.5 py-2.5 text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#1A1A1A] dark:bg-[#F0EDE7] text-white dark:text-[#1A1A1A] px-3.5 py-2.5 text-[13px] leading-relaxed">
        {children}
      </div>
    </div>
  );
}
