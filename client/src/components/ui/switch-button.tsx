import { motion } from "motion/react";
import { ReactNode, useCallback, useRef } from "react";
import { flushSync } from "react-dom";

type SwitchProps = {
  value: boolean;
  onToggle: () => void;
  iconOn: ReactNode;
  iconOff: ReactNode;
  className?: string;
};

export function Switch({
  value,
  onToggle,
  iconOn,
  iconOff,
  className = "",
}: SwitchProps) {
  const toggleRef = useRef<HTMLButtonElement>(null);

  const playHeartbeat = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const now = audioContext.currentTime

      // First beat
      const osc1 = audioContext.createOscillator()
      const gain1 = audioContext.createGain()
      osc1.connect(gain1)
      gain1.connect(audioContext.destination)

      osc1.frequency.setValueAtTime(150, now)
      gain1.gain.setValueAtTime(0.3, now)
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1)

      osc1.start(now)
      osc1.stop(now + 0.1)

      // Second beat (shortly after)
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
      // Silently fail if audio context is not available
    }
  }, []);

  const handleToggle = async () => {
    if (!toggleRef.current) return;
    
    // Play sound
    playHeartbeat();
    
    const isDark = !value;
    
    // Trigger view transition
    if (document.startViewTransition) {
      await document.startViewTransition(() => {
        flushSync(() => {
          onToggle();
        });
      }).ready;

      // Animate ripple from button location
      const { left, top, width, height } = toggleRef.current.getBoundingClientRect();
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
    } else {
      // Fallback for browsers without View Transition API
      onToggle();
    }
  };

  return (
    <button
      ref={toggleRef}
      className={`flex w-12 cursor-pointer rounded-full p-0.5 bg-[#E5D7C4] dark:bg-card-foreground/15 ${
        value ? "justify-end" : "justify-start"
      } ${className}`}
      onClick={handleToggle}
    >
      <motion.div
        className="flex justify-center items-center size-6 rounded-full bg-white dark:bg-background text-[#1A1A1A] dark:text-foreground"
        layout
        transition={{
          type: "spring",
          duration: 0.6,
          bounce: 0.2,
        }}
      >
        {value ? (
          <motion.div
            key="on"
            initial={{ opacity: 0, rotate: -60 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 60 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center items-center size-5 text-foreground"
          >
            {iconOn}
          </motion.div>
        ) : (
          <motion.div
            key="off"
            initial={{ opacity: 0, rotate: 60 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: -60 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center items-center size-5 text-foreground"
          >
            {iconOff}
          </motion.div>
        )}
      </motion.div>
    </button>
  );
}
