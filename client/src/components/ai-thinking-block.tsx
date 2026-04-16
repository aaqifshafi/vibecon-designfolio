import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";

const THINKING_CONTENT = `Okay, let me start by analyzing the resume to understand the candidate's core strengths. I can see strong experience with frontend frameworks, particularly React and TypeScript. There's also significant backend experience with Node.js and Python.

Now I need to cross-reference these skills with the job listings from JSearch. Let me look at each position and evaluate how well it matches the candidate's profile. I'll consider the job title, required skills, experience level, and location preferences.

Starting with the first batch of results. I see several positions that mention React and TypeScript as primary requirements. These are strong matches. Let me check the seniority levels — the candidate specified they're targeting senior roles, so I should weight positions that match that level higher.

For the location preferences, I need to filter based on what was specified in the onboarding. Some positions are remote-friendly which could be a good fit. Let me also look at salary ranges where available to ensure they align with the candidate's expected level.

I'm now evaluating the skills overlap for each position. A strong match would have at least 70% overlap between the candidate's skills and the job requirements. I'm also considering adjacent skills — for example, if a job requires Next.js and the candidate knows React, that's still a partial match since Next.js is built on React.

Let me now look at company culture signals. Some job descriptions emphasize innovation and modern tech stacks, which aligns with the candidate's experience with cutting-edge tools. Others focus more on stability and enterprise solutions.

I'm also considering growth potential. Positions at companies that are scaling tend to offer more opportunities for career advancement. I'll factor in company size, funding stage, and industry growth trends where available.

Now scoring each position. I'm using a weighted combination of skills match, seniority alignment, location fit, and growth potential. Each position gets a composite score that reflects how well it matches the overall profile.

Sorting the results by match quality. The top positions show strong alignment across multiple dimensions. Let me also identify a few stretch opportunities — positions that might require the candidate to grow in certain areas but offer significant upside.

Final pass — checking for any red flags like unrealistic requirements or potential mismatches. Removing any duplicate listings and ensuring each position has enough detail for the candidate to make an informed decision.

Preparing the ranked results. The AI picks column will contain the highest-scoring matches, ready for the candidate to review, shortlist, and take action on. Each position will show its match score so the candidate can quickly assess fit at a glance.`;

interface AIThinkingBlockProps {
  status?: string;
  className?: string;
}

export default function AIThinkingBlock({ status = "Scout is thinking", className }: AIThinkingBlockProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      const clientHeight = contentRef.current.clientHeight;
      const maxScroll = scrollHeight - clientHeight;

      scrollIntervalRef.current = setInterval(() => {
        setScrollPosition((prev) => {
          const next = prev + 1;
          return next >= maxScroll ? 0 : next;
        });
      }, 5);

      return () => {
        if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
      };
    }
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  return (
    <div className={cn("flex flex-col max-w-xl w-full", className)} data-testid="ai-thinking-block">
      <div className="flex items-center justify-start gap-2 mb-4">
        <Loader size="sm" className="text-[#1A1A1A] dark:text-[#F0EDE7]" />
        <p className="text-[14px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7] scout-shimmer">
          {status}
        </p>
        <span className="text-[12px] text-[#7A736C] dark:text-[#9E9893] tabular-nums">
          {timer}s
        </span>
      </div>

      <div className="relative h-[150px] overflow-hidden rounded-xl border border-black/5 dark:border-white/8 bg-black/[0.03] dark:bg-white/[0.03]">
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-[60px] bg-gradient-to-b from-[#F0EDE7] dark:from-[#1A1A1A] from-30% to-transparent z-10 pointer-events-none" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-gradient-to-t from-[#F0EDE7] dark:from-[#1A1A1A] from-30% to-transparent z-10 pointer-events-none" />

        <div
          ref={contentRef}
          className="h-full overflow-hidden px-4 py-3"
          style={{ scrollBehavior: "auto" }}
        >
          <p className="text-[12px] leading-relaxed whitespace-pre-wrap text-[#7A736C] dark:text-[#9E9893]">
            {THINKING_CONTENT}
          </p>
        </div>
      </div>
    </div>
  );
}
