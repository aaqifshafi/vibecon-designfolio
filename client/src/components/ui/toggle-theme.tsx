"use client";

import { useId, useState, useEffect, useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { MoonIcon, SunIcon } from "lucide-react";

const SwitchToggleThemeDemo = () => {
  const id = useId();
  const [isDark, setIsDark] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial check
    setIsDark(document.documentElement.classList.contains("dark"));

    const syncTheme = () =>
      setIsDark(document.documentElement.classList.contains("dark"))

    const observer = new MutationObserver(syncTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  const playHeartbeat = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const now = audioContext.currentTime

      const osc1 = audioContext.createOscillator()
      const gain1 = audioContext.createGain()
      osc1.connect(gain1)
      gain1.connect(audioContext.destination)
      osc1.frequency.setValueAtTime(150, now)
      gain1.gain.setValueAtTime(0.3, now)
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
      osc1.start(now)
      osc1.stop(now + 0.1)

      const osc2 = audioContext.createOscillator()
      const gain2 = audioContext.createGain()
      osc2.connect(gain2)
      gain2.connect(audioContext.destination)
      osc2.frequency.setValueAtTime(180, now + 0.12)
      gain2.gain.setValueAtTime(0.2, now + 0.12)
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.22)
      osc2.start(now + 0.12)
      osc2.stop(now + 0.22)
    } catch (e) {
    }
  }, [])

  const handleCheckedChange = async (checked: boolean) => {
    playHeartbeat();

    if (!document.startViewTransition) {
      setIsDark(checked);
      document.documentElement.classList.toggle("dark", checked);
      localStorage.setItem("theme", checked ? "dark" : "light");
      return;
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        setIsDark(checked);
        document.documentElement.classList.toggle("dark", checked);
        localStorage.setItem("theme", checked ? "dark" : "light");
      });
    }).ready;

    if (containerRef.current) {
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const maxDistance = Math.hypot(
        Math.max(centerX, window.innerWidth - centerX),
        Math.max(centerY, window.innerHeight - centerY)
      );

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${centerX}px ${centerY}px)`,
            `circle(${maxDistance}px at ${centerX}px ${centerY}px)`,
          ],
        },
        {
          duration: 700,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border border-black/10 dark:border-white/10 rounded-[16px] bg-black/[0.02] dark:bg-white/[0.02]">
      <div className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">Appearance</div>
      <div ref={containerRef} className="group inline-flex items-center gap-2">
        <span
          id={`${id}-light`}
          className={cn(
            "cursor-pointer text-left text-sm font-medium transition-colors",
            isDark ? "text-[#7A736C] dark:text-[#9E9893]" : "text-[#1A1A1A] dark:text-[#F0EDE7]",
          )}
          aria-controls={id}
          onClick={() => handleCheckedChange(false)}
        >
          <SunIcon className="size-4" aria-hidden="true" />
        </span>

        <Switch
          id={id}
          checked={isDark}
          onCheckedChange={handleCheckedChange}
          aria-labelledby={`${id}-light ${id}-dark`}
          aria-label="Toggle between dark and light mode"
        />

        <span
          id={`${id}-dark`}
          className={cn(
            "cursor-pointer text-right text-sm font-medium transition-colors",
            !isDark ? "text-[#7A736C] dark:text-[#9E9893]" : "text-[#1A1A1A] dark:text-[#F0EDE7]",
          )}
          aria-controls={id}
          onClick={() => handleCheckedChange(true)}
        >
          <MoonIcon className="size-4" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
};

export default SwitchToggleThemeDemo;