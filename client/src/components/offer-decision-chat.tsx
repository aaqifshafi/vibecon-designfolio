import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Trophy, ArrowRight, CheckCircle2, AlertTriangle, Target, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateOfferDecision } from "@/lib/offer-decision";
import type { UserPreferences, OfferDecisionResult } from "@/lib/offer-decision";
import type { JobItem } from "@/lib/job-types";

interface Props {
  offers: JobItem[];
  onClose: () => void;
}

interface StepOption {
  label: string;
  value: string;
}

const STEPS: { question: string; key: keyof UserPreferences; options?: StepOption[]; placeholder?: string; freeText?: boolean }[] = [
  {
    question: "What matters most to you right now?",
    key: "priority",
    options: [
      { label: "Salary", value: "Salary" },
      { label: "Growth", value: "Growth" },
      { label: "Work-life balance", value: "Work-life balance" },
      { label: "Brand / reputation", value: "Brand" },
    ],
  },
  {
    question: "What salary range are you targeting?",
    key: "salaryRange",
    freeText: true,
    placeholder: "e.g. $150k - $200k",
  },
  {
    question: "Preferred work mode?",
    key: "workMode",
    options: [
      { label: "Remote", value: "Remote" },
      { label: "Hybrid", value: "Hybrid" },
      { label: "On-site", value: "On-site" },
    ],
  },
  {
    question: "Are you optimizing for?",
    key: "optimizingFor",
    options: [
      { label: "Learning", value: "Learning" },
      { label: "Stability", value: "Stability" },
      { label: "Fast growth", value: "Fast growth" },
    ],
  },
  {
    question: "What's your risk preference?",
    key: "riskPreference",
    options: [
      { label: "Startup", value: "Startup" },
      { label: "Mid-size", value: "Mid-size" },
      { label: "Enterprise", value: "Enterprise" },
    ],
  },
  {
    question: "Any strong preference between these companies?",
    key: "companyPreference",
    freeText: true,
    placeholder: "e.g. I'm leaning towards Company A because...",
  },
];

export default function OfferDecisionChat({ offers, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<UserPreferences>>({});
  const [freeTextInput, setFreeTextInput] = useState("");
  const [phase, setPhase] = useState<"stepper" | "generating" | "result">("stepper");
  const [result, setResult] = useState<OfferDecisionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, [step, phase]);

  const selectOption = (key: keyof UserPreferences, value: string) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    if (step < STEPS.length - 1) {
      setTimeout(() => setStep((s) => s + 1), 300);
    } else {
      submitAll(updated);
    }
  };

  const submitFreeText = (key: keyof UserPreferences) => {
    const value = freeTextInput.trim() || "No preference";
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    setFreeTextInput("");
    if (step < STEPS.length - 1) {
      setTimeout(() => setStep((s) => s + 1), 300);
    } else {
      submitAll(updated);
    }
  };

  const submitAll = async (prefs: Partial<UserPreferences>) => {
    setPhase("generating");
    setError(null);
    try {
      const fullPrefs: UserPreferences = {
        priority: prefs.priority || "Not specified",
        salaryRange: prefs.salaryRange || "Not specified",
        workMode: prefs.workMode || "No preference",
        optimizingFor: prefs.optimizingFor || "Not specified",
        riskPreference: prefs.riskPreference || "No preference",
        companyPreference: prefs.companyPreference || "None",
      };
      const decision = await generateOfferDecision(offers, fullPrefs);
      setResult(decision);
      setPhase("result");
    } catch {
      setError("Couldn't generate recommendation. Please try again.");
      setPhase("stepper");
    }
  };

  const confidenceLabel = (c: number) =>
    c >= 0.8 ? "High confidence" : c >= 0.6 ? "Moderate confidence" : "Low confidence";

  const confidenceColor = (c: number) =>
    c >= 0.8 ? "text-emerald-500" : c >= 0.6 ? "text-amber-500" : "text-orange-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className="fixed bottom-5 right-5 z-[200] w-[400px] h-[560px] bg-white dark:bg-[#1C1A19] rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden"
      data-testid="offer-decision-chat"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-black/5 dark:border-white/5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">Scout</div>
            <div className="text-[11px] text-[#7A736C] dark:text-[#9E9893]">Offer Decision Assistant</div>
          </div>
        </div>
        <button type="button" onClick={onClose} className="w-7 h-7 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] transition-colors" data-testid="offer-decision-close">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {/* Intro */}
        <div className="flex justify-start mb-4">
          <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-black/[0.04] dark:bg-white/[0.06] px-3.5 py-2.5 text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] leading-relaxed">
            <strong>Nice — you have {offers.length} offers!</strong> Let me help you compare them. I'll ask a few quick questions about what you value, then give you a side-by-side breakdown.
          </div>
        </div>

        {/* Offer pills */}
        <div className="flex flex-wrap gap-2 mb-5 px-1">
          {offers.map((o) => (
            <div key={o.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30">
              <Trophy className="w-3 h-3 text-rose-500" />
              <span className="text-[11px] font-medium text-rose-700 dark:text-rose-300">{o.title} at {o.company}</span>
            </div>
          ))}
        </div>

        {/* Stepper Questions */}
        {phase === "stepper" && STEPS.slice(0, step + 1).map((s, i) => {
          const answered = answers[s.key];
          return (
            <motion.div key={s.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-5">
              {/* Scout question */}
              <div className="flex justify-start mb-2.5">
                <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-black/[0.04] dark:bg-white/[0.06] px-3.5 py-2.5 text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7]">
                  {s.question}
                </div>
              </div>

              {/* Options or free text */}
              {answered ? (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#1A1A1A] dark:bg-[#F0EDE7] text-white dark:text-[#1A1A1A] px-3.5 py-2.5 text-[13px]">
                    {answered}
                  </div>
                </div>
              ) : i === step ? (
                <div className="pl-1">
                  {s.options ? (
                    <div className="flex flex-wrap gap-2">
                      {s.options.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => selectOption(s.key, opt.value)}
                          className="text-[12px] font-medium px-3.5 py-2 rounded-xl border border-black/8 dark:border-white/8 text-[#1A1A1A] dark:text-[#F0EDE7] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:border-black/15 dark:hover:border-white/15 transition-all"
                          data-testid={`offer-opt-${s.key}-${opt.value.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={freeTextInput}
                        onChange={(e) => setFreeTextInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitFreeText(s.key); } }}
                        placeholder={s.placeholder}
                        className="flex-1 h-9 px-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/8 dark:border-white/8 text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] placeholder:text-[#7A736C]/50 outline-none focus:border-black/20 dark:focus:border-white/20"
                        data-testid={`offer-input-${s.key}`}
                      />
                      <button type="button" onClick={() => submitFreeText(s.key)} className="w-9 h-9 rounded-xl bg-[#1A1A1A] dark:bg-[#F0EDE7] text-white dark:text-[#1A1A1A] flex items-center justify-center hover:opacity-80 transition-opacity">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </motion.div>
          );
        })}

        {/* Generating */}
        {phase === "generating" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mt-2">
            <div className="bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" />
              <span className="text-[13px] text-[#7A736C] dark:text-[#9E9893]">Comparing your offers...</span>
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div className="flex justify-start mt-2">
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[13px] text-red-600 dark:text-red-400">
              {error}
            </div>
          </div>
        )}

        {/* Result */}
        {phase === "result" && result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 space-y-4">
            {/* Recommendation */}
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-300">Recommendation</span>
                <span className={cn("text-[11px] font-medium ml-auto", confidenceColor(result.confidence))}>
                  {confidenceLabel(result.confidence)} ({Math.round(result.confidence * 100)}%)
                </span>
              </div>
              <p className="text-[13px] text-emerald-800 dark:text-emerald-200 leading-relaxed">{result.summary}</p>
            </div>

            {/* Comparison Cards */}
            {result.comparison.map((comp) => {
              const isRecommended = comp.jobId === result.recommendedJobId;
              return (
                <div
                  key={comp.jobId}
                  className={cn(
                    "rounded-xl border p-4",
                    isRecommended
                      ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/10"
                      : "border-black/8 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02]"
                  )}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[13px] font-bold text-[#1A1A1A] dark:text-[#F0EDE7]">{comp.company}</span>
                    {isRecommended && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                        Best Fit
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center gap-1 mb-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Pros</span>
                      </div>
                      {comp.pros.map((p, i) => (
                        <p key={i} className="text-[12px] text-[#7A736C] dark:text-[#9E9893] leading-relaxed mb-0.5">- {p}</p>
                      ))}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1.5">
                        <AlertTriangle className="w-3 h-3 text-orange-500" />
                        <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">Cons</span>
                      </div>
                      {comp.cons.map((c, i) => (
                        <p key={i} className="text-[12px] text-[#7A736C] dark:text-[#9E9893] leading-relaxed mb-0.5">- {c}</p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Reasoning */}
            <div className="flex justify-start">
              <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-black/[0.04] dark:bg-white/[0.06] px-3.5 py-2.5 text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] leading-relaxed">
                <strong>My reasoning:</strong> {result.reasoning}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Progress */}
      {phase === "stepper" && (
        <div className="px-4 py-3 border-t border-black/5 dark:border-white/5 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-[#7A736C] dark:text-[#9E9893]">
              Question {Math.min(step + 1, STEPS.length)} of {STEPS.length}
            </span>
          </div>
          <div className="h-1 rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-rose-500"
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
