import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, ExternalLink, Building2 } from "lucide-react";
import { Gauge } from "@/components/ui/gauge-1";
import type { JobItem } from "@/lib/job-types";

interface Props {
  job: JobItem | null;
  onClose: () => void;
}

export default function JobDetailPanel({ job, onClose }: Props) {
  return (
    <AnimatePresence>
      {job && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] bg-black/20"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            key={job.id}
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 z-[150] w-[400px] h-full bg-white dark:bg-[#1C1A19] border-l border-black/10 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden"
            data-testid="job-detail-panel"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-black/5 dark:border-white/5">
              <div className="flex items-start gap-3 min-w-0 flex-1 mr-3">
                {job.employerLogo && (
                  <img
                    src={job.employerLogo}
                    alt={`${job.company} logo`}
                    className="w-10 h-10 rounded-xl object-contain bg-white dark:bg-white/10 border border-black/5 dark:border-white/10 shrink-0"
                    data-testid="detail-employer-logo"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-[18px] font-bold text-[#1A1A1A] dark:text-[#F0EDE7] leading-tight mb-1">
                    {job.title}
                  </h2>
                  <div className="flex items-center gap-1.5 text-[13px] text-[#7A736C] dark:text-[#9E9893]">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    {job.company}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {job.matchScore > 0 && (
                  <div data-testid="detail-gauge-score" className="text-[#1A1A1A] dark:text-[#F0EDE7]">
                    <Gauge
                      value={job.matchScore}
                      size={42}
                      strokeWidth={4}
                      showValue={true}
                      showPercentage={false}
                      gapPercent={3}
                      primary={{
                        0: "danger",
                        50: "warning",
                        70: "info",
                        85: "success",
                      }}
                      secondary="rgba(120,120,120,0.1)"
                      label="match"
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-[#7A736C] hover:text-[#1A1A1A] dark:text-[#9E9893] dark:hover:text-[#F0EDE7] transition-colors mt-0.5"
                  data-testid="close-detail-panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Meta pills */}
              <div className="flex flex-wrap gap-2">
                {job.location && (
                  <span className="flex items-center gap-1 text-[12px] font-medium text-[#7A736C] dark:text-[#9E9893] bg-black/[0.04] dark:bg-white/[0.04] px-2.5 py-1 rounded-full">
                    <MapPin className="w-3 h-3" /> {job.location}
                  </span>
                )}
                {job.type && (
                  <span className="text-[12px] font-medium text-[#7A736C] dark:text-[#9E9893] bg-black/[0.04] dark:bg-white/[0.04] px-2.5 py-1 rounded-full">
                    {job.type}
                  </span>
                )}
                {job.salary && (
                  <span className="text-[12px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7] bg-black/[0.04] dark:bg-white/[0.04] px-2.5 py-1 rounded-full">
                    {job.salary}
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-[13px] font-bold text-[#1A1A1A] dark:text-[#F0EDE7] mb-2.5">
                  About the role
                </h3>
                <p className="text-[13px] text-[#7A736C] dark:text-[#B5AFA5] leading-[1.75] whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              {/* Tags */}
              {job.tags && job.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {job.tags.map((tag) => (
                    <span key={tag} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[#7A736C] dark:text-[#9E9893]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Posted */}
              {job.postedDate && (
                <p className="text-[12px] text-[#7A736C]/60 dark:text-[#9E9893]/60">
                  Posted {job.postedDate}
                </p>
              )}
            </div>

            {/* Footer */}
            {job.url && (
              <div className="px-6 py-4 border-t border-black/5 dark:border-white/5 shrink-0">
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-[#1A1A1A] dark:bg-[#F0EDE7] text-white dark:text-[#1A1A1A] text-[13px] font-semibold hover:opacity-90 transition-opacity"
                >
                  Apply <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
