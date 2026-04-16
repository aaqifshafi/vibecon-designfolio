import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from "@/components/ui/kanban";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Star,
  Send,
  MessageSquare,
  Trophy,
  GripVertical,
  MapPin,
  Building2,
  Clock,
  RefreshCw,
  Briefcase,
  ArrowLeft,
} from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useResume } from "@/context/ResumeContext";
import { getResumeData } from "@/lib/indexeddb";
import { getJobsData, setJobsData } from "@/lib/jobs-db";
import { generateJobMatches } from "@/lib/gemini-jobs";
import type { JobItem, JobColumns, JobColumn } from "@/lib/job-types";
import { COLUMN_LABELS, COLUMN_ORDER, EMPTY_COLUMNS } from "@/lib/job-types";

const COLUMN_ICONS: Record<JobColumn, typeof Sparkles> = {
  "ai-picks": Sparkles,
  shortlisted: Star,
  applied: Send,
  interview: MessageSquare,
  offer: Trophy,
};

const COLUMN_COLORS: Record<JobColumn, string> = {
  "ai-picks": "text-violet-500",
  shortlisted: "text-amber-500",
  applied: "text-blue-500",
  interview: "text-emerald-500",
  offer: "text-rose-500",
};

const COLUMN_DOT_COLORS: Record<JobColumn, string> = {
  "ai-picks": "bg-violet-500",
  shortlisted: "bg-amber-500",
  applied: "bg-blue-500",
  interview: "bg-emerald-500",
  offer: "bg-rose-500",
};

function JobCard({ job, columnId }: { job: JobItem; columnId: string }) {
  return (
    <div
      data-testid={`job-card-${job.id}`}
      className="bg-white dark:bg-[#2A2520] rounded-xl border border-black/5 dark:border-white/8 p-4 shadow-sm hover:shadow-md transition-shadow group/card"
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="min-w-0 flex-1">
          <h4 className="text-[14px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7] leading-tight truncate">
            {job.title}
          </h4>
          <div className="flex items-center gap-1.5 mt-1">
            <Building2 className="w-3 h-3 text-[#7A736C] dark:text-[#9E9893] shrink-0" />
            <span className="text-[12px] text-[#7A736C] dark:text-[#9E9893] truncate font-medium">
              {job.company}
            </span>
          </div>
        </div>
        <KanbanItemHandle>
          <GripVertical className="w-4 h-4 text-[#7A736C]/40 dark:text-[#9E9893]/40 opacity-0 group-hover/card:opacity-100 transition-opacity shrink-0 mt-0.5" />
        </KanbanItemHandle>
      </div>

      <div className="flex items-center gap-3 mb-3 text-[11px] text-[#7A736C] dark:text-[#9E9893]">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {job.location}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {job.postedDate}
        </span>
      </div>

      <p className="text-[12px] text-[#7A736C] dark:text-[#B5AFA5] leading-relaxed mb-3 line-clamp-2">
        {job.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {job.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[#1A1A1A]/70 dark:text-[#F0EDE7]/70"
            >
              {tag}
            </span>
          ))}
        </div>
        <div
          className={cn(
            "text-[11px] font-bold px-2 py-0.5 rounded-full",
            job.matchScore >= 90
              ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
              : job.matchScore >= 80
                ? "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400"
                : "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
          )}
        >
          {job.matchScore}%
        </div>
      </div>

      {job.salary && (
        <div className="mt-2.5 pt-2.5 border-t border-black/5 dark:border-white/5">
          <span className="text-[12px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
            {job.salary}
          </span>
          <span className="text-[11px] text-[#7A736C] dark:text-[#9E9893] ml-1">
            / year
          </span>
        </div>
      )}
    </div>
  );
}

export default function Jobs() {
  const [, navigate] = useLocation();
  const { resume, setResume } = useResume();
  const [columns, setColumns] = useState<JobColumns>(EMPTY_COLUMNS);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate resume and jobs from IndexedDB
  useEffect(() => {
    (async () => {
      try {
        const resumeData = await getResumeData();
        if (!resumeData) {
          navigate("/", { replace: true });
          return;
        }
        if (!resume) setResume(resumeData);

        const savedJobs = await getJobsData();
        if (savedJobs) {
          setColumns(savedJobs);
        }
        setIsInitialized(true);
      } catch {
        navigate("/", { replace: true });
      }
    })();
  }, []);

  // Persist columns to IndexedDB on change
  useEffect(() => {
    if (isInitialized) {
      setJobsData(columns);
    }
  }, [columns, isInitialized]);

  const fetchAIJobs = useCallback(async () => {
    if (!resume) return;
    setIsLoading(true);
    setError(null);
    try {
      const jobs = await generateJobMatches(resume);
      setColumns((prev) => ({ ...prev, "ai-picks": jobs }));
    } catch (err: any) {
      setError("Couldn't fetch job matches. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [resume]);

  // Auto-fetch AI picks on first load if empty
  useEffect(() => {
    if (isInitialized && resume && columns["ai-picks"].length === 0) {
      fetchAIJobs();
    }
  }, [isInitialized, resume]);

  const totalJobs = Object.values(columns).reduce((sum, col) => sum + col.length, 0);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#F0EDE7] dark:bg-[#1A1A1A] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#7A736C] dark:text-[#9E9893]">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-[14px] font-medium">Loading jobs...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#F0EDE7] dark:bg-[#1A1A1A] font-['Inter'] text-[#1A1A1A] dark:text-[#F0EDE7] transition-colors duration-700"
      data-testid="jobs-page"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#F0EDE7]/95 dark:bg-[#1A1A1A]/95 backdrop-blur-sm border-b border-black/5 dark:border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-20 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/builder")}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] transition-colors group"
              data-testid="back-to-builder"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-0.5"
              />
              Builder
            </button>
            <div className="w-px h-5 bg-black/10 dark:bg-white/10" />
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#7A736C] dark:text-[#9E9893]" />
              <h1 className="text-[15px] font-semibold">Job Tracker</h1>
              <span className="text-[12px] font-medium text-[#7A736C] dark:text-[#9E9893] bg-black/[0.04] dark:bg-white/[0.06] px-2 py-0.5 rounded-full">
                {totalJobs} jobs
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={fetchAIJobs}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-full text-[12px] font-medium border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 gap-1.5"
              data-testid="refresh-ai-picks"
            >
              <Sparkles
                className={cn("w-3.5 h-3.5 text-violet-500", isLoading && "animate-spin")}
              />
              {isLoading ? "Finding jobs..." : "Refresh AI Picks"}
            </Button>
            <AnimatedThemeToggler />
          </div>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-[1400px] mx-auto px-6 lg:px-20 pt-3"
          >
            <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[13px] font-medium px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/30" data-testid="jobs-error">
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban Board */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-20 py-6">
        <Kanban
          value={columns}
          onValueChange={(val) => setColumns(val as JobColumns)}
          getItemValue={(item: JobItem) => item.id}
          className="w-full"
        >
          <KanbanBoard className="grid grid-cols-5 gap-4">
            {COLUMN_ORDER.map((colId) => {
              const Icon = COLUMN_ICONS[colId];
              const items = columns[colId] || [];
              return (
                <KanbanColumn
                  key={colId}
                  value={colId}
                  className="min-h-[calc(100vh-180px)]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", COLUMN_DOT_COLORS[colId])} />
                      <span className="text-[13px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
                        {COLUMN_LABELS[colId]}
                      </span>
                      <span className="text-[11px] font-medium text-[#7A736C] dark:text-[#9E9893] bg-black/[0.04] dark:bg-white/[0.06] w-5 h-5 flex items-center justify-center rounded-full">
                        {items.length}
                      </span>
                    </div>
                    <Icon className={cn("w-3.5 h-3.5", COLUMN_COLORS[colId])} />
                  </div>

                  {/* Column Content */}
                  <KanbanColumnContent
                    value={colId}
                    className={cn(
                      "flex-1 rounded-xl p-2 min-h-[200px]",
                      "bg-black/[0.02] dark:bg-white/[0.02]",
                      "border border-dashed border-transparent",
                      "transition-colors",
                      items.length === 0 && "border-black/8 dark:border-white/8"
                    )}
                  >
                    {/* Loading state for AI Picks */}
                    {colId === "ai-picks" && isLoading && (
                      <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Sparkles className="w-6 h-6 text-violet-500 animate-pulse" />
                        <span className="text-[13px] font-medium text-[#7A736C] dark:text-[#9E9893]">
                          Finding matches...
                        </span>
                      </div>
                    )}

                    {items.map((job) => (
                      <KanbanItem key={job.id} value={job.id}>
                        <JobCard job={job} columnId={colId} />
                      </KanbanItem>
                    ))}

                    {/* Empty state */}
                    {!isLoading && items.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Icon className={cn("w-5 h-5 mb-2 opacity-30", COLUMN_COLORS[colId])} />
                        <p className="text-[12px] text-[#7A736C] dark:text-[#9E9893] font-medium">
                          {colId === "ai-picks"
                            ? "Click 'Refresh AI Picks' to find matches"
                            : "Drag jobs here"}
                        </p>
                      </div>
                    )}
                  </KanbanColumnContent>
                </KanbanColumn>
              );
            })}
          </KanbanBoard>

          {/* Drag Overlay */}
          <KanbanOverlay>
            {({ value }) => {
              const job = Object.values(columns)
                .flat()
                .find((j) => j.id === value);
              if (!job) return null;
              return (
                <div className="rotate-[2deg] scale-105">
                  <JobCard job={job} columnId="" />
                </div>
              );
            }}
          </KanbanOverlay>
        </Kanban>
      </div>
    </div>
  );
}
