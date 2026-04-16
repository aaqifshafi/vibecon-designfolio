import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";
import { FileText, Search, Brain, BarChart3, CheckCircle2 } from "lucide-react";

const STEPS = [
  { icon: FileText, label: "Reading your resume", desc: "Extracting skills, experience & preferences" },
  { icon: Search, label: "Fetching jobs from JSearch", desc: "Scanning 3 pages of live listings" },
  { icon: Brain, label: "Matching skills to roles", desc: "Cross-referencing your profile with each job" },
  { icon: BarChart3, label: "Scoring & ranking results", desc: "Calculating match quality per position" },
  { icon: CheckCircle2, label: "Preparing your board", desc: "Sorting top picks into AI Picks column" },
];

const STEP_INTERVAL = 2400;

interface AIThinkingBlockProps {
  status?: string;
  className?: string;
}

export default function AIThinkingBlock({ status = "Scout is thinking", className }: AIThinkingBlockProps) {
  const [timer, setTimer] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTimer((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveStep((p) => (p < STEPS.length - 1 ? p + 1 : p));
    }, STEP_INTERVAL);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={cn("flex flex-col max-w-md w-full", className)} data-testid="ai-thinking-block">
      {/* Header */}
      <div className="flex items-center justify-start gap-2.5 mb-6">
        <Loader size="sm" className="text-[#1A1A1A] dark:text-[#F0EDE7]" />
        <p className="text-[14px] font-semibold scout-shimmer">
          {status}
        </p>
        <span className="text-[12px] text-[#7A736C] dark:text-[#9E9893] tabular-nums">
          {timer}s
        </span>
      </div>

      {/* Timeline */}
      <div className="flex flex-col">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === activeStep;
          const isDone = i < activeStep;
          const isVisible = i <= activeStep;

          return (
            <AnimatePresence key={i}>
              {isVisible && (
                <motion.div
                  initial={{ opacity: 0, filter: "blur(6px)", y: 6 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="flex items-start gap-3 relative"
                >
                  {/* Vertical line */}
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "absolute left-[13px] top-[28px] w-px h-[calc(100%-12px)]",
                        isDone ? "bg-[#1A1A1A]/20 dark:bg-[#F0EDE7]/20" : "bg-black/8 dark:bg-white/8"
                      )}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className={cn(
                      "w-[26px] h-[26px] rounded-lg flex items-center justify-center shrink-0 z-[1] transition-colors duration-500",
                      isActive
                        ? "bg-[#1A1A1A] dark:bg-[#F0EDE7] text-white dark:text-[#1A1A1A]"
                        : isDone
                          ? "bg-[#1A1A1A]/10 dark:bg-[#F0EDE7]/10 text-[#1A1A1A] dark:text-[#F0EDE7]"
                          : "bg-black/5 dark:bg-white/5 text-[#7A736C] dark:text-[#9E9893]"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Icon className={cn("w-3.5 h-3.5", isActive && "animate-pulse")} />
                    )}
                  </div>

                  {/* Text */}
                  <div className="pb-5 min-w-0">
                    <div
                      className={cn(
                        "text-[13px] font-semibold leading-tight transition-colors duration-300",
                        isActive
                          ? "text-[#1A1A1A] dark:text-[#F0EDE7]"
                          : isDone
                            ? "text-[#1A1A1A]/50 dark:text-[#F0EDE7]/50"
                            : "text-[#7A736C] dark:text-[#9E9893]"
                      )}
                    >
                      {step.label}
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15, duration: 0.3 }}
                        className="text-[11px] text-[#7A736C] dark:text-[#9E9893] mt-0.5"
                      >
                        {step.desc}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}
      </div>
    </div>
  );
}
