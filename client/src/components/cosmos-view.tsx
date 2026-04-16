import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { layoutPlanets, getAllJobs } from "@/lib/cosmos";
import type { PlanetData, GravityMode } from "@/lib/cosmos";
import type { JobItem, JobColumns } from "@/lib/job-types";

const AVATAR_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6"];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const GRAVITY_CHIPS: { label: string; value: GravityMode }[] = [
  { label: "Overall", value: "overall" },
  { label: "Skills Match", value: "skills" },
  { label: "Culture", value: "culture" },
  { label: "Growth", value: "growth" },
  { label: "Stage", value: "stage" },
];

interface Props {
  columns: JobColumns;
  onSelectJob: (job: JobItem) => void;
}

export default function CosmosView({ columns, onSelectJob }: Props) {
  const [gravityMode, setGravityMode] = useState<GravityMode>("overall");
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 1200, h: 700 });

  const allJobs = useMemo(() => getAllJobs(columns), [columns]);

  // Measure container
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDims({ w: rect.width, h: rect.height });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Compute planet positions — instant, no API
  const planets = useMemo(
    () => layoutPlanets(allJobs, dims.w, dims.h, gravityMode),
    [allJobs, dims.w, dims.h, gravityMode]
  );

  // Orbit rings
  const cx = dims.w / 2;
  const cy = dims.h / 2;
  const maxR = Math.min(cx, cy) * 0.78;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{
        height: "calc(100vh - 64px)",
        background: "radial-gradient(ellipse at center, #1e1c1a 0%, #121110 100%)",
      }}
      data-testid="cosmos-view"
    >
      {/* Subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
        backgroundSize: "50px 50px",
      }} />

      {/* Orbit rings */}
      {[0.25, 0.5, 0.75].map((pct) => (
        <div
          key={pct}
          className="absolute rounded-full border border-white/[0.04]"
          style={{
            width: maxR * 2 * pct,
            height: maxR * 2 * pct,
            left: cx - maxR * pct,
            top: cy - maxR * pct,
          }}
        />
      ))}

      {/* You — center */}
      <div
        className="absolute z-10"
        style={{ left: cx - 22, top: cy - 22 }}
      >
        <div className="w-11 h-11 rounded-full bg-white/[0.08] backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-white" />
        </div>
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-white/30 tracking-wide">
          YOU
        </span>
      </div>

      {/* Planets */}
      {planets.map((p, i) => {
        const isHovered = hoveredPlanet?.job.id === p.job.id;
        return (
          <motion.div
            key={p.job.id}
            animate={{ left: p.x - p.size / 2, top: p.y - p.size / 2 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="absolute cursor-pointer z-[5]"
            onMouseEnter={(e) => { setHoveredPlanet(p); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
            onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setHoveredPlanet(null)}
            onClick={() => onSelectJob(p.job)}
            data-testid={`cosmos-planet-${p.job.id}`}
          >
            {/* Atmosphere glow */}
            <div
              className="absolute rounded-full transition-all duration-300"
              style={{
                width: p.size * 2.8,
                height: p.size * 2.8,
                left: -(p.size * 2.8 - p.size) / 2,
                top: -(p.size * 2.8 - p.size) / 2,
                background: `radial-gradient(circle, ${p.color}${isHovered ? "30" : "12"} 0%, transparent 70%)`,
              }}
            />
            {/* Planet body with logo/avatar */}
            <div
              className="relative rounded-full transition-transform duration-200 flex items-center justify-center overflow-hidden"
              style={{
                width: p.size,
                height: p.size,
                background: `radial-gradient(circle at 35% 35%, ${p.color}dd, ${p.color}88 60%, ${p.color}44)`,
                boxShadow: isHovered
                  ? `0 0 ${p.size}px ${p.color}60, inset 0 -3px 6px rgba(0,0,0,0.3)`
                  : `0 0 ${p.size * 0.4}px ${p.color}25, inset 0 -3px 6px rgba(0,0,0,0.3)`,
                transform: isHovered ? "scale(1.25)" : "scale(1)",
              }}
            >
              {p.job.employerLogo ? (
                <img
                  src={p.job.employerLogo}
                  alt={p.job.company}
                  className="rounded-full object-contain"
                  style={{ width: p.size * 0.55, height: p.size * 0.55, padding: 1 }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden"); }}
                />
              ) : null}
              <span
                className={cn(
                  "font-bold text-white/90 select-none leading-none",
                  p.job.employerLogo && "hidden"
                )}
                style={{ fontSize: Math.max(p.size * 0.35, 10) }}
              >
                {p.job.company.charAt(0).toUpperCase()}
              </span>
            </div>
            {/* Company label */}
            <span className={cn(
              "absolute left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap transition-opacity duration-200",
              isHovered ? "opacity-100 text-white/80" : "opacity-50 text-white/30"
            )} style={{ top: p.size + 6 }}>
              {p.job.company}
            </span>
          </motion.div>
        );
      })}

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredPlanet && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="fixed z-[100] pointer-events-none"
            style={{ left: tooltipPos.x + 18, top: tooltipPos.y - 12 }}
          >
            <div className="bg-[#12121e]/95 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 max-w-[250px] shadow-2xl">
              <div className="text-[13px] font-semibold text-white">{hoveredPlanet.job.title}</div>
              <div className="text-[11px] text-white/40 mb-1.5">
                {hoveredPlanet.job.company} · {hoveredPlanet.job.location}
              </div>
              {hoveredPlanet.job.salary && (
                <div className="text-[12px] font-semibold text-white/70 mb-1">{hoveredPlanet.job.salary}</div>
              )}
              <div className="text-[11px] text-white/50">
                {hoveredPlanet.job.matchScore}% match
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gravity Chips — top center */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/[0.04] backdrop-blur-sm rounded-full p-1 border border-white/[0.06]">
        {GRAVITY_CHIPS.map((chip) => (
          <button
            key={chip.value}
            type="button"
            onClick={() => setGravityMode(chip.value)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-all",
              gravityMode === chip.value
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/40 hover:text-white/70"
            )}
            data-testid={`gravity-${chip.value}`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Empty */}
      {planets.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-[14px] text-white/25">No jobs to explore yet.</p>
        </div>
      )}
    </div>
  );
}
