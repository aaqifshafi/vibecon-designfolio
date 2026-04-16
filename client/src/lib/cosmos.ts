import type { JobItem, JobColumns } from "./job-types";

export type GravityMode = "overall" | "skills" | "culture" | "growth" | "stage";

export interface PlanetData {
  job: JobItem;
  distance: number;
  size: number;
  angle: number;
  x: number;
  y: number;
  color: string;
}

const COLORS = [
  "#818cf8", "#a78bfa", "#f472b6", "#fb923c",
  "#34d399", "#38bdf8", "#fbbf24", "#f87171",
];

// Skills-related keywords — more matches = higher gravity
const SKILL_KEYWORDS = [
  "figma", "design system", "prototyp", "user research", "ux", "ui",
  "component", "accessibility", "responsive", "mobile", "web app",
  "wireframe", "interaction", "visual design", "usability",
];

// Culture signals — remote-friendly, collaborative, creative
const CULTURE_SIGNALS = [
  "remote", "flexible", "async", "collaborative", "inclusive",
  "diverse", "culture", "team", "autonomy", "trust", "creative",
  "work-life", "balance", "transparent", "open",
];

// Growth signals — leadership, senior, impact, scale
const GROWTH_SIGNALS = [
  "lead", "senior", "staff", "principal", "director", "head",
  "mentor", "impact", "scale", "strategy", "vision", "own",
  "shape", "define", "grow", "opportunity",
];

function keywordScore(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  let hits = 0;
  for (const kw of keywords) {
    if (lower.includes(kw)) hits++;
  }
  return Math.min(1, hits / (keywords.length * 0.35));
}

function stageScore(job: JobItem): number {
  const desc = (job.description + " " + job.title + " " + (job.tags?.join(" ") || "")).toLowerCase();
  // Startup signals
  const startupHits = ["startup", "seed", "series a", "early stage", "founding", "small team", "fast-paced", "0 to 1", "zero to one"].filter((s) => desc.includes(s)).length;
  // Enterprise signals
  const entHits = ["enterprise", "fortune", "large scale", "millions of users", "global", "platform", "infrastructure"].filter((s) => desc.includes(s)).length;

  if (startupHits > entHits) return 0.85 + startupHits * 0.03;
  if (entHits > startupHits) return 0.6 + entHits * 0.05;
  return 0.5;
}

export function computeGravity(job: JobItem, mode: GravityMode): number {
  const desc = job.description + " " + job.title + " " + (job.tags?.join(" ") || "");

  switch (mode) {
    case "overall":
      return job.matchScore / 100;
    case "skills":
      return Math.max(0.2, keywordScore(desc, SKILL_KEYWORDS) * 0.6 + (job.matchScore / 100) * 0.4);
    case "culture":
      return Math.max(0.15, keywordScore(desc, CULTURE_SIGNALS) * 0.7 + (job.matchScore / 100) * 0.3);
    case "growth":
      return Math.max(0.15, keywordScore(desc, GROWTH_SIGNALS) * 0.7 + (job.matchScore / 100) * 0.3);
    case "stage":
      return Math.max(0.15, stageScore(job));
    default:
      return job.matchScore / 100;
  }
}

export function layoutPlanets(
  jobs: JobItem[],
  width: number,
  height: number,
  mode: GravityMode
): PlanetData[] {
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(cx, cy) * 0.78;

  const planets = jobs.map((job, i) => {
    const gravity = computeGravity(job, mode);
    const distance = 1 - gravity;
    const r = 0.15 * maxRadius + distance * 0.85 * maxRadius;

    const baseAngle = (360 / jobs.length) * i;
    const jitter = ((i * 37 + 13) % 30) - 15;
    const angle = baseAngle + jitter;
    const rad = (angle * Math.PI) / 180;

    const size = 28 + (job.matchScore / 100) * 20;

    return {
      job, distance, size, angle,
      x: cx + Math.cos(rad) * r,
      y: cy + Math.sin(rad) * r,
      color: COLORS[i % COLORS.length],
    };
  });

  // Collision resolution — push overlapping planets apart (including center YOU node)
  const centerSize = 44;
  const padding = 24;
  for (let iter = 0; iter < 60; iter++) {
    let moved = false;

    // Planet vs planet
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const a = planets[i];
        const b = planets[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = (a.size + b.size) / 2 + padding;
        if (dist < minDist && dist > 0) {
          const overlap = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;
          moved = true;
        }
      }
    }

    // Planet vs center YOU
    for (let i = 0; i < planets.length; i++) {
      const p = planets[i];
      const dx = p.x - cx;
      const dy = p.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = (p.size + centerSize) / 2 + padding;
      if (dist < minDist && dist > 0) {
        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;
        p.x += nx * overlap;
        p.y += ny * overlap;
        moved = true;
      }
    }

    if (!moved) break;
  }

  return planets;
}

export function getAllJobs(columns: JobColumns): JobItem[] {
  return Object.values(columns).flat();
}
