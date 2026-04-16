import type { JobItem, JobColumns } from "./job-types";

export type GravityMode = "match" | "salary" | "recent" | "remote";

export interface PlanetData {
  job: JobItem;
  distance: number; // 0-1, lower = closer to You
  size: number;     // px radius
  angle: number;    // degrees
  x: number;
  y: number;
  color: string;
}

const COLORS = [
  "#818cf8", // indigo
  "#a78bfa", // violet
  "#f472b6", // pink
  "#fb923c", // orange
  "#34d399", // emerald
  "#38bdf8", // sky
  "#fbbf24", // amber
  "#f87171", // red
];

function parseSalaryMid(salary: string): number {
  const nums = salary.match(/\d[\d,]*/g);
  if (!nums || nums.length === 0) return 0;
  const parsed = nums.map((n) => parseInt(n.replace(/,/g, ""), 10));
  return parsed.reduce((a, b) => a + b, 0) / parsed.length;
}

function daysAgo(posted: string): number {
  const m = posted.match(/(\d+)/);
  if (!m) return 30;
  const n = parseInt(m[1], 10);
  if (posted.includes("w")) return n * 7;
  if (posted.includes("mo")) return n * 30;
  return n;
}

export function computeGravity(job: JobItem, mode: GravityMode): number {
  switch (mode) {
    case "match":
      return job.matchScore / 100;
    case "salary": {
      const mid = parseSalaryMid(job.salary || "");
      if (mid === 0) return 0.3;
      return Math.min(1, mid / 250000);
    }
    case "recent": {
      const d = daysAgo(job.postedDate || "30d");
      return Math.max(0.1, 1 - d / 60);
    }
    case "remote":
      return job.type === "Remote" || job.location?.toLowerCase().includes("remote") ? 0.95 : 0.3;
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

  return jobs.map((job, i) => {
    const gravity = computeGravity(job, mode);
    // Higher gravity = closer to center
    const distance = 1 - gravity;
    const r = 0.15 * maxRadius + distance * 0.85 * maxRadius;

    // Distribute angles evenly with slight randomness
    const baseAngle = (360 / jobs.length) * i;
    const jitter = ((i * 37 + 13) % 30) - 15;
    const angle = baseAngle + jitter;
    const rad = (angle * Math.PI) / 180;

    // Size based on matchScore
    const size = 12 + (job.matchScore / 100) * 18;

    return {
      job,
      distance,
      size,
      angle,
      x: cx + Math.cos(rad) * r,
      y: cy + Math.sin(rad) * r,
      color: COLORS[i % COLORS.length],
    };
  });
}

export function getAllJobs(columns: JobColumns): JobItem[] {
  return Object.values(columns).flat();
}
