import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  X,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InterviewReport } from "@/lib/interview-report";

const SIGNAL_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  "Strong Hire": { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  "Hire": { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  "Lean Hire": { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  "Lean No Hire": { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  "No Hire": { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
};

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444";

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          strokeDasharray={circumference}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-[36px] font-bold text-white tabular-nums"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-[11px] text-white/40 font-medium -mt-1">out of 100</span>
      </div>
    </div>
  );
}

function QuestionScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color =
    score >= 8 ? "bg-emerald-500" : score >= 6 ? "bg-amber-500" : score >= 4 ? "bg-orange-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2.5 w-full">
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
      </div>
      <span className="text-[13px] font-bold text-white/70 tabular-nums w-6 text-right">
        {score}
      </span>
    </div>
  );
}

interface Props {
  report: InterviewReport;
  onClose: () => void;
  onRetry: () => void;
}

export default function InterviewReportView({ report, onClose, onRetry }: Props) {
  const signalConfig = SIGNAL_CONFIG[report.hiringSignal] || SIGNAL_CONFIG["Lean No Hire"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[300] bg-[#0C0C0C] overflow-y-auto"
      data-testid="interview-report"
    >
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-[24px] font-bold text-white tracking-tight mb-1">
              Interview Report
            </h1>
            <p className="text-[14px] text-white/40">
              {report.jobTitle} at {report.company}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/15 transition-all"
            data-testid="close-report-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Score + Signal + Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row items-center gap-8 mb-10 p-6 rounded-2xl bg-white/[0.03] border border-white/5"
        >
          <ScoreRing score={report.overallScore} />
          <div className="flex-1 text-center md:text-left">
            <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-bold mb-3 border", signalConfig.bg, signalConfig.border, signalConfig.color)}>
              <Target className="w-3.5 h-3.5" />
              {report.hiringSignal}
            </div>
            <p className="text-[15px] text-white/70 leading-relaxed">
              {report.summary}
            </p>
          </div>
        </motion.div>

        {/* Strengths + Weaknesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-white/[0.03] border border-white/5 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-[14px] font-semibold text-white">Strengths</h3>
            </div>
            <div className="space-y-2.5">
              {report.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500/60 shrink-0 mt-0.5" />
                  <span className="text-[13px] text-white/60 leading-relaxed">{s}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl bg-white/[0.03] border border-white/5 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-orange-400" />
              </div>
              <h3 className="text-[14px] font-semibold text-white">Areas to Improve</h3>
            </div>
            <div className="space-y-2.5">
              {report.weaknesses.map((w, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-orange-500/60 shrink-0 mt-0.5" />
                  <span className="text-[13px] text-white/60 leading-relaxed">{w}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Question Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 mb-8"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-violet-400" />
            </div>
            <h3 className="text-[14px] font-semibold text-white">Question Breakdown</h3>
          </div>
          <div className="space-y-5">
            {report.questionBreakdown.map((q, i) => (
              <div key={i} className="pb-5 border-b border-white/5 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="text-[13px] font-medium text-white/80">{q.question}</p>
                  <span className={cn(
                    "text-[12px] font-bold px-2 py-0.5 rounded-full shrink-0 tabular-nums",
                    q.score >= 8 ? "bg-emerald-500/10 text-emerald-400" :
                    q.score >= 6 ? "bg-amber-500/10 text-amber-400" :
                    "bg-red-500/10 text-red-400"
                  )}>
                    {q.score}/10
                  </span>
                </div>
                <QuestionScoreBar score={q.score} />
                <p className="text-[13px] text-white/50 leading-relaxed mt-2">{q.feedback}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actionable Improvements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 mb-10"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-[14px] font-semibold text-white">What to Do Next</h3>
          </div>
          <div className="space-y-3">
            {report.actionableImprovements.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <ArrowRight className="w-3 h-3 text-blue-400" />
                </div>
                <span className="text-[13px] text-white/60 leading-relaxed">{a}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-4 pb-10"
        >
          <Button
            type="button"
            onClick={onRetry}
            variant="outline"
            className="rounded-full px-6 h-11 text-[13px] font-medium border-white/10 text-white/70 hover:text-white hover:bg-white/5 bg-transparent gap-2"
            data-testid="retry-interview-btn"
          >
            <RotateCcw className="w-4 h-4" />
            Retry Interview
          </Button>
          <Button
            type="button"
            onClick={onClose}
            className="rounded-full px-6 h-11 text-[13px] font-semibold bg-white text-black hover:bg-white/90"
            data-testid="back-to-jobs-btn"
          >
            Back to Jobs
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
