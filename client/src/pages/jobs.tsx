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
  RotateCcw,
  ExternalLink,
  Video,
  MessageCircle,
  Monitor,
  Bookmark,
} from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Gauge } from "@/components/ui/gauge-1";
import { ColorOrb } from "@/components/ui/color-orb";
import { useResume } from "@/context/ResumeContext";
import { getResumeData } from "@/lib/indexeddb";
import { getJobsData, setJobsData } from "@/lib/jobs-db";
import { rankJobsWithGemini } from "@/lib/gemini-jobs";
import { fetchJSearchJobs } from "@/lib/jsearch";
import { getJobPreferences, setJobPreferences, clearJobPreferences } from "@/lib/job-preferences-db";
import type { JobPreferences } from "@/lib/job-preferences-db";
import type { JobItem, JobColumns, JobColumn } from "@/lib/job-types";
import { COLUMN_LABELS, COLUMN_ORDER, EMPTY_COLUMNS } from "@/lib/job-types";
import JobsStepper from "@/components/jobs-stepper";
import InterviewModal from "@/components/interview-modal";
import ScoutChat from "@/components/scout-chat";
import OfferDecisionChat from "@/components/offer-decision-chat";
import CosmosView from "@/components/cosmos-view";
import AIThinkingBlock from "@/components/ai-thinking-block";
import JobDetailPanel from "@/components/job-detail-panel";

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

const AVATAR_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6"];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function JobCard({ job, columnId, onStartInterview, onAskScout, onClickTitle }: { job: JobItem; columnId?: string; onStartInterview?: (job: JobItem) => void; onAskScout?: (job: JobItem) => void; onClickTitle?: (job: JobItem) => void }) {
  const avatarColor = getAvatarColor(job.company);
  const initials = job.company.charAt(0).toUpperCase();

  return (
    <div
      data-testid={`job-card-${job.id}`}
      className="bg-white dark:bg-[#2A2520] rounded-xl border border-black/5 dark:border-white/8 p-4 shadow-sm hover:shadow-md transition-shadow group/card"
    >
      {/* Row 1: Logo/Avatar + Company + Location | Gauge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {job.employerLogo ? (
            <img
              src={job.employerLogo}
              alt={`${job.company} logo`}
              className="w-10 h-10 rounded-xl object-contain bg-white border border-black/5 dark:border-white/10 shrink-0 p-1"
              data-testid={`employer-logo-${job.id}`}
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = "none";
                el.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <div
            className={cn(
              "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white text-[15px] font-bold",
              job.employerLogo && "hidden"
            )}
            style={{ backgroundColor: avatarColor }}
            data-testid={`employer-avatar-${job.id}`}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[13px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7] block truncate">
              {job.company}
            </span>
            <span className="text-[11px] text-[#7A736C] dark:text-[#9E9893] block truncate">
              {job.location}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <KanbanItemHandle>
            <GripVertical className="w-4 h-4 text-[#7A736C]/30 dark:text-[#9E9893]/30 opacity-0 group-hover/card:opacity-100 transition-opacity" />
          </KanbanItemHandle>
          {job.matchScore > 0 && (
            <div data-testid={`gauge-score-${job.id}`} className="text-[#1A1A1A] dark:text-[#F0EDE7]">
              <Gauge
                value={job.matchScore}
                size={48}
                strokeWidth={4}
                showValue={true}
                gapPercent={5}
                primary={{
                  0: "danger",
                  50: "warning",
                  70: "info",
                  85: "success",
                }}
                secondary="rgba(120,120,120,0.12)"
              />
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Job Title */}
      <h4
        className={cn(
          "text-[15px] font-bold text-[#1A1A1A] dark:text-[#F0EDE7] leading-snug mb-3",
          onClickTitle && "cursor-pointer hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        )}
        onClick={onClickTitle ? (e) => { e.stopPropagation(); onClickTitle(job); } : undefined}
      >
        {job.title}
      </h4>

      {/* Row 3: Meta pills */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {job.type && (
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#7A736C] dark:text-[#9E9893] bg-black/[0.04] dark:bg-white/[0.06] px-2.5 py-1 rounded-lg">
            <Briefcase className="w-3 h-3" />
            {job.type}
          </span>
        )}
        {job.location && !(job.type?.toLowerCase() === "remote" && job.location.toLowerCase().includes("remote")) && (
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#7A736C] dark:text-[#9E9893] bg-black/[0.04] dark:bg-white/[0.06] px-2.5 py-1 rounded-lg">
            <Monitor className="w-3 h-3" />
            {job.location.toLowerCase().includes("remote") ? "Remote" : "On-site"}
          </span>
        )}
        {job.salary && (
          <span className="text-[11px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7] bg-black/[0.04] dark:bg-white/[0.06] px-2.5 py-1 rounded-lg">
            {job.salary}
          </span>
        )}
      </div>

      {/* Row 4: Action bar */}
      <div className="flex items-center gap-2 pt-3 border-t border-black/5 dark:border-white/5">
        {columnId === "interview" && onStartInterview && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onStartInterview(job); }}
            data-testid={`mock-interview-${job.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-[#1A1A1A] dark:bg-[#F0EDE7] text-white dark:text-[#1A1A1A] text-[11px] font-semibold hover:opacity-90 transition-opacity"
          >
            <Video className="w-3.5 h-3.5" />
            Mock Interview
          </button>
        )}

        {onAskScout && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAskScout(job); }}
            data-testid={`ask-scout-${job.id}`}
            className="orb-activates-on-hover flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-black/8 dark:border-white/8 text-[#7A736C] dark:text-[#9E9893] text-[11px] font-medium hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] hover:border-black/15 dark:hover:border-white/15 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all"
          >
            <ColorOrb dimension="14px" spinDuration={8} />
            Ask Scout
          </button>
        )}
      </div>
    </div>
  );
}

type Phase = "loading" | "stepper" | "fetching" | "kanban";

export default function Jobs() {
  const [, navigate] = useLocation();
  const { resume, setResume } = useResume();
  const [columns, setColumns] = useState<JobColumns>(EMPTY_COLUMNS);
  const [phase, setPhase] = useState<Phase>("loading");
  const [fetchStatus, setFetchStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [defaultLocation, setDefaultLocation] = useState("");
  const [interviewJob, setInterviewJob] = useState<JobItem | null>(null);
  const [scoutJob, setScoutJob] = useState<JobItem | null>(null);
  const [showOfferDecision, setShowOfferDecision] = useState(false);
  const [viewMode, setViewMode] = useState<"board" | "cosmos">("board");
  const [detailPanelJob, setDetailPanelJob] = useState<JobItem | null>(null);

  // Hydrate resume + check preferences
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resumeData = await getResumeData();
        if (cancelled) return;
        if (!resumeData) { navigate("/", { replace: true }); return; }
        if (!resume) setResume(resumeData);
        setDefaultLocation(resumeData.location || "");

        const prefs = await getJobPreferences();
        if (cancelled) return;
        if (prefs) {
          const savedJobs = await getJobsData();
          if (cancelled) return;
          if (savedJobs) setColumns(savedJobs);
          setPhase("kanban");
        } else {
          setPhase("stepper");
        }
      } catch {
        // Don't redirect on transient DB errors — retry once
        if (!cancelled) {
          setTimeout(async () => {
            try {
              const r = await getResumeData();
              if (cancelled) return;
              if (!r) { navigate("/", { replace: true }); return; }
              if (!resume) setResume(r);
              setDefaultLocation(r.location || "");
              setPhase("stepper");
            } catch {
              if (!cancelled) navigate("/", { replace: true });
            }
          }, 500);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist columns to IndexedDB
  useEffect(() => {
    if (phase === "kanban") setJobsData(columns);
  }, [columns, phase]);

  // Run job fetch + Gemini ranking after stepper completes
  const runJobPipeline = useCallback(async (prefs: JobPreferences) => {
    setPhase("fetching");
    setError(null);

    try {
      // Step 1: Save preferences
      await setJobPreferences(prefs);

      // Step 2: Fetch from JSearch
      setFetchStatus("Searching for jobs...");
      const rawJobs = await fetchJSearchJobs(prefs);

      if (rawJobs.length === 0) {
        setColumns({ ...EMPTY_COLUMNS });
        setPhase("kanban");
        return;
      }

      // Step 3: Rank with Gemini
      setFetchStatus("Ranking with AI...");
      const resumeData = resume || (await getResumeData());
      let rankedJobs = rawJobs;
      if (resumeData) {
        rankedJobs = await rankJobsWithGemini(rawJobs, resumeData);
      }

      setColumns({ ...EMPTY_COLUMNS, "ai-picks": rankedJobs });
      setPhase("kanban");
    } catch (err: any) {
      setError("Something went wrong fetching jobs. Please try again.");
      setPhase("kanban");
    }
  }, [resume]);

  const handleSearchAgain = async () => {
    await clearJobPreferences();
    setColumns(EMPTY_COLUMNS);
    setError(null);
    setPhase("stepper");
  };

  const totalJobs = Object.values(columns).reduce((sum, col) => sum + col.length, 0);

  // Loading
  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-[#F0EDE7] dark:bg-[#1A1A1A] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#7A736C] dark:text-[#9E9893]">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-[14px] font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  // Stepper
  if (phase === "stepper") {
    return <JobsStepper defaultLocation={defaultLocation} onComplete={runJobPipeline} />;
  }

  // Fetching
  if (phase === "fetching") {
    return (
      <div className="min-h-screen bg-[#F0EDE7] dark:bg-[#1A1A1A] flex items-center justify-center font-['Inter'] px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-5"
          data-testid="fetching-state"
        >
          <AIThinkingBlock status={fetchStatus} />
          <span className="text-[13px] text-[#7A736C] dark:text-[#9E9893]">This takes a few seconds...</span>
        </motion.div>
      </div>
    );
  }

  // Kanban
  return (
    <div
      className="min-h-screen bg-[#F0EDE7] dark:bg-[#1A1A1A] font-['Inter'] text-[#1A1A1A] dark:text-[#F0EDE7] transition-colors duration-700"
      data-testid="jobs-page"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#F0EDE7]/95 dark:bg-[#1A1A1A]/95 backdrop-blur-sm border-b border-black/5 dark:border-white/5">
        <div className="pl-[108px] pr-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/builder")}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] transition-colors group"
              data-testid="back-to-builder"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
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
            {/* Board / COSMOS Toggle */}
            <div className="flex items-center h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.04] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("board")}
                className={cn(
                  "h-7 px-3 rounded-full text-[12px] font-medium transition-all",
                  viewMode === "board"
                    ? "bg-white dark:bg-[#2A2520] text-[#1A1A1A] dark:text-[#F0EDE7] shadow-sm"
                    : "text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7]"
                )}
                data-testid="toggle-board"
              >
                Board
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cosmos")}
                className={cn(
                  "h-7 px-3 rounded-full text-[12px] font-medium transition-all flex items-center gap-1.5",
                  viewMode === "cosmos"
                    ? "bg-white dark:bg-[#2A2520] text-[#1A1A1A] dark:text-[#F0EDE7] shadow-sm"
                    : "text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7]"
                )}
                data-testid="toggle-cosmos"
              >
                <Sparkles className="w-3 h-3" />
                Cosmos
              </button>
            </div>
            <Button
              onClick={handleSearchAgain}
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-full text-[12px] font-medium border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 gap-1.5"
              data-testid="search-again-btn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Search again
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
            className="pl-[108px] pr-4 pt-3"
          >
            <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[13px] font-medium px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/30" data-testid="jobs-error">
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Board / COSMOS Views */}
      {viewMode === "board" ? (
      <div className="pl-[108px] pr-4 py-6 overflow-x-auto">
        <Kanban
          value={columns}
          onValueChange={(val) => setColumns(val as JobColumns)}
          getItemValue={(item: JobItem) => item.id}
          className="w-full"
        >
          <KanbanBoard className="grid grid-cols-5 gap-4" style={{ minWidth: "1100px" }}>
            {COLUMN_ORDER.map((colId, colIndex) => {
              const Icon = COLUMN_ICONS[colId];
              const items = columns[colId] || [];
              return (
                <motion.div
                  key={colId}
                  initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.6, delay: 0.1 + colIndex * 0.15, ease: [0.23, 1, 0.32, 1] }}
                  className="flex flex-col h-[calc(100vh-120px)]"
                >
                <KanbanColumn value={colId} className="flex flex-col min-h-0 h-full">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", COLUMN_DOT_COLORS[colId])} />
                      <span className="text-[13px] font-semibold">{COLUMN_LABELS[colId]}</span>
                      <span className="text-[11px] font-medium text-[#7A736C] dark:text-[#9E9893] bg-black/[0.04] dark:bg-white/[0.06] w-5 h-5 flex items-center justify-center rounded-full">
                        {items.length}
                      </span>
                    </div>
                    <Icon className={cn("w-3.5 h-3.5", COLUMN_COLORS[colId])} />
                  </div>

                  <KanbanColumnContent
                    value={colId}
                    className={cn(
                      "flex-1 rounded-xl p-2 min-h-0 overflow-y-auto",
                      "bg-black/[0.02] dark:bg-white/[0.02]",
                      "border border-dashed border-transparent transition-colors",
                      items.length === 0 && "border-black/8 dark:border-white/8"
                    )}
                  >
                    {/* Help me choose card — Offer column with ≥2 jobs */}
                    {colId === "offer" && items.length >= 2 && (
                      <div
                        className="mb-2 p-3.5 rounded-xl bg-gradient-to-br from-rose-50 to-amber-50 dark:from-rose-950/30 dark:to-amber-950/20 border border-rose-200/60 dark:border-rose-800/30 cursor-pointer hover:shadow-md transition-all group/choose"
                        onClick={() => { setScoutJob(null); setShowOfferDecision(true); }}
                        data-testid="help-me-choose-card"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="shrink-0 orb-spinning">
                            <ColorOrb dimension="32px" spinDuration={8} />
                          </div>
                          <div>
                            <div className="text-[13px] font-bold text-[#1A1A1A] dark:text-[#F0EDE7]">Help me choose</div>
                            <div className="text-[11px] text-[#7A736C] dark:text-[#9E9893]">Compare {items.length} offers with Scout</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {items.map((job) => (
                      <KanbanItem key={job.id} value={job.id}>
                        <JobCard job={job} columnId={colId} onStartInterview={setInterviewJob} onAskScout={setScoutJob} onClickTitle={setDetailPanelJob} />
                      </KanbanItem>
                    ))}

                    {items.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Icon className={cn("w-5 h-5 mb-2 opacity-30", COLUMN_COLORS[colId])} />
                        <p className="text-[12px] text-[#7A736C] dark:text-[#9E9893] font-medium">
                          {colId === "ai-picks" ? "No matches yet" : "Drag jobs here"}
                        </p>
                      </div>
                    )}
                  </KanbanColumnContent>
                </KanbanColumn>
                </motion.div>
              );
            })}
          </KanbanBoard>

          <KanbanOverlay>
            {({ value }) => {
              const job = Object.values(columns).flat().find((j) => j.id === value);
              if (!job) return null;
              return (
                <div className="rotate-[2deg] scale-105">
                  <JobCard job={job} />
                </div>
              );
            }}
          </KanbanOverlay>
        </Kanban>
      </div>
      ) : (
        <CosmosView columns={columns} onSelectJob={setDetailPanelJob} />
      )}

      {/* Job Detail Panel */}
      <JobDetailPanel job={detailPanelJob} onClose={() => setDetailPanelJob(null)} />

      {/* Interview Modal */}
      <AnimatePresence>
        {interviewJob && (
          <InterviewModal
            job={interviewJob}
            onClose={() => setInterviewJob(null)}
          />
        )}
      </AnimatePresence>

      {/* Scout Chat */}
      <AnimatePresence>
        {scoutJob && !showOfferDecision && (
          <ScoutChat
            job={scoutJob}
            onClose={() => setScoutJob(null)}
          />
        )}
      </AnimatePresence>

      {/* Offer Decision Chat */}
      <AnimatePresence>
        {showOfferDecision && (columns.offer?.length ?? 0) >= 2 && (
          <OfferDecisionChat
            offers={columns.offer}
            onClose={() => setShowOfferDecision(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
