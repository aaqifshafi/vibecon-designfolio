import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { computeCosmosData, computeCosmosDataFallback, layoutStars, TYPE_COLORS } from "@/lib/cosmos";
import type { StarData } from "@/lib/cosmos";
import type { JobItem, JobColumns } from "@/lib/job-types";
import type { ParsedResume } from "@/lib/types";
import JobDetailPanel from "@/components/job-detail-panel";

interface Props {
  columns: JobColumns;
  resume: ParsedResume | null;
}

export default function CosmosView({ columns, resume }: Props) {
  const [stars, setStars] = useState<StarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredStar, setHoveredStar] = useState<StarData | null>(null);
  const [selectedStar, setSelectedStar] = useState<StarData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const allJobs: JobItem[] = Object.values(columns).flat();

  const loadCosmos = useCallback(async () => {
    if (allJobs.length === 0) { setStars([]); setLoading(false); return; }
    setLoading(true);
    try {
      let rawStars: StarData[];
      if (resume) {
        rawStars = await computeCosmosData(allJobs, resume);
      } else {
        rawStars = computeCosmosDataFallback(allJobs);
      }
      const rect = containerRef.current?.getBoundingClientRect();
      const w = rect?.width || 1200;
      const h = rect?.height || 700;
      setStars(layoutStars(rawStars, w, h));
    } catch {
      // Fallback on error
      const rawStars = computeCosmosDataFallback(allJobs);
      const rect = containerRef.current?.getBoundingClientRect();
      setStars(layoutStars(rawStars, rect?.width || 1200, rect?.height || 700));
    }
    setLoading(false);
  }, [allJobs.length, resume?.name]);

  useEffect(() => { loadCosmos(); }, [loadCosmos]);

  // Relayout on resize
  useEffect(() => {
    const handleResize = () => {
      if (stars.length > 0 && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setStars((prev) => layoutStars(prev, rect.width, rect.height));
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [stars.length]);

  const handleStarHover = (star: StarData, e: React.MouseEvent) => {
    setHoveredStar(star);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="flex-1 flex relative" style={{ height: "calc(100vh - 64px)" }} data-testid="cosmos-view">
      {/* Constellation Canvas */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse at center, #0f0f1a 0%, #060609 100%)",
        }}
      >
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-3">
              <Sparkles className="w-8 h-8 text-violet-400 animate-pulse" />
              <span className="text-[14px] font-medium text-white/50">
                Mapping your constellation...
              </span>
            </div>
          </div>
        )}

        {/* User at center */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="absolute z-10"
            style={{
              left: "calc(50% - 20px)",
              top: "calc(50% - 20px)",
            }}
          >
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-white/90" />
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-white/30 whitespace-nowrap">
              You
            </span>
          </motion.div>
        )}

        {/* Stars */}
        {!loading && stars.map((star, i) => {
          const size = 8 + star.weight * 20;
          const glowSize = size + star.resonance * 30;
          const color = TYPE_COLORS[star.companyType] || "#a78bfa";
          const isHovered = hoveredStar?.job.id === star.job.id;

          return (
            <motion.div
              key={star.job.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.06, type: "spring", stiffness: 300, damping: 20 }}
              className="absolute cursor-pointer group/star"
              style={{
                left: star.x - size / 2,
                top: star.y - size / 2,
              }}
              onMouseEnter={(e) => handleStarHover(star, e)}
              onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setHoveredStar(null)}
              onClick={() => setSelectedStar(star)}
              data-testid={`cosmos-star-${star.job.id}`}
            >
              {/* Glow */}
              <div
                className="absolute rounded-full transition-all duration-500"
                style={{
                  width: glowSize,
                  height: glowSize,
                  left: (size - glowSize) / 2,
                  top: (size - glowSize) / 2,
                  background: `radial-gradient(circle, ${color}${isHovered ? "50" : "20"} 0%, transparent 70%)`,
                  transform: isHovered ? "scale(1.5)" : "scale(1)",
                }}
              />
              {/* Star core */}
              <div
                className="relative rounded-full transition-transform duration-300"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: color,
                  boxShadow: `0 0 ${star.resonance * 12}px ${color}`,
                  transform: isHovered ? "scale(1.4)" : "scale(1)",
                }}
              />
              {/* Company label (visible on hover) */}
              <span className={cn(
                "absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-medium whitespace-nowrap transition-opacity duration-200",
                isHovered ? "opacity-100 text-white/70" : "opacity-0"
              )}>
                {star.job.company}
              </span>
            </motion.div>
          );
        })}

        {/* Hover Tooltip */}
        <AnimatePresence>
          {hoveredStar && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="fixed z-[100] pointer-events-none"
              style={{
                left: tooltipPos.x + 16,
                top: tooltipPos.y - 10,
              }}
            >
              <div className="bg-[#1a1a2e]/95 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 max-w-[260px] shadow-xl">
                <div className="text-[13px] font-semibold text-white mb-0.5">
                  {hoveredStar.job.title}
                </div>
                <div className="text-[11px] text-white/50 mb-2">
                  {hoveredStar.job.company} · {hoveredStar.job.location}
                </div>
                <p className="text-[12px] text-white/60 leading-relaxed italic">
                  "{hoveredStar.insight}"
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        {!loading && stars.length > 0 && (
          <div className="absolute bottom-5 left-5 flex items-center gap-4">
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px] text-white/30 capitalize">{type}</span>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && stars.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[14px] text-white/30">No jobs to visualize yet.</p>
          </div>
        )}
      </div>

      {/* OFERTA Side Panel */}
      <JobDetailPanel star={selectedStar} onClose={() => setSelectedStar(null)} />
    </div>
  );
}
