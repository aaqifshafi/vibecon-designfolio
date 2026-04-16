import { cn } from "@/lib/utils";

interface OrbProps {
  dimension?: string;
  className?: string;
  tones?: {
    base?: string;
    accent1?: string;
    accent2?: string;
    accent3?: string;
  };
  spinDuration?: number;
}

export function ColorOrb({
  dimension = "24px",
  className,
  tones,
  spinDuration = 12,
}: OrbProps) {
  const palette = {
    base: "oklch(94% 0.01 80)",
    accent1: "oklch(62% 0.28 318)",
    accent2: "oklch(66% 0.27 22)",
    accent3: "oklch(82% 0.22 72)",
    ...tones,
  };

  const dim = parseInt(dimension.replace("px", ""), 10);
  const blur = dim < 50 ? Math.max(dim * 0.008, 1) : Math.max(dim * 0.015, 4);
  const contrast = dim < 30 ? 1.1 : dim < 50 ? Math.max(dim * 0.004 * 1.2, 1.3) : Math.max(dim * 0.008, 1.5);
  const dot = dim < 50 ? Math.max(dim * 0.004, 0.05) : Math.max(dim * 0.008, 0.1);
  const shadow = dim < 50 ? Math.max(dim * 0.004, 0.5) : Math.max(dim * 0.008, 2);
  const mask = dim < 30 ? "0%" : dim < 50 ? "5%" : dim < 100 ? "15%" : "25%";

  return (
    <div
      className={cn("color-orb", className)}
      style={{
        width: dimension,
        height: dimension,
        "--orb-base": palette.base,
        "--orb-accent1": palette.accent1,
        "--orb-accent2": palette.accent2,
        "--orb-accent3": palette.accent3,
        "--orb-spin-duration": `${spinDuration}s`,
        "--orb-blur": `${blur}px`,
        "--orb-contrast": contrast,
        "--orb-dot": `${dot}px`,
        "--orb-shadow": `${shadow}px`,
        "--orb-mask": mask,
      } as React.CSSProperties}
    />
  );
}
