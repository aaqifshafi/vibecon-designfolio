import { Link, useLocation } from "wouter";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LayoutTemplate, Briefcase } from "lucide-react";

const navItems = [
  {
    icon: LayoutTemplate,
    label: "Portfolio Builder",
    href: "/builder",
  },
  {
    icon: Briefcase,
    label: "Jobs",
    href: "/jobs",
  },
];

function DesignfolioLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      <rect width="37" height="37" rx="18.5" fill="#FF553E"/>
      <path d="M20.0417 4.625H16.9583V14.7781L9.77902 7.59877L7.59877 9.77902L14.7781 16.9583H4.625V20.0417H14.7781L7.59877 27.221L9.77902 29.4012L16.9583 22.2219V32.375H20.0417V22.2219L27.221 29.4012L29.4012 27.221L22.2219 20.0417H32.375V16.9583H22.2219L29.4012 9.77902L27.221 7.59877L20.0417 14.7781V4.625Z" fill="white"/>
    </svg>
  );
}

export function FloatingNav() {
  const [location] = useLocation();

  return (
    <div className="fixed top-6 left-6 z-[200] flex flex-col items-center gap-2 bg-white dark:bg-[#2A2520] border border-black/8 dark:border-white/10 px-2 py-3 rounded-full shadow-sm">
      {/* Logo at top */}
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className="cursor-default mb-1" data-testid="nav-logo">
            <DesignfolioLogo />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          Designfolio
        </TooltipContent>
      </Tooltip>

      {/* Divider */}
      <div className="w-5 h-px bg-border" />

      {/* Nav items */}
      {navItems.map(({ icon: Icon, label, href }) => {
        const isActive =
          href === "/builder" ? location === "/builder" : location.startsWith(href);
        return (
          <Tooltip key={href} delayDuration={200}>
            <TooltipTrigger asChild>
              <Link href={href}>
                <button
                  data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-black/[0.07] dark:hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
