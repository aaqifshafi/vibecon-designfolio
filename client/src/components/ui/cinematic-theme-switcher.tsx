import { Sun, Moon } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { flushSync } from 'react-dom';

interface Particle {
  id: number;
  delay: number;
  duration: number;
}

export default function CinematicThemeSwitcher() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Initialize theme from document class and sync with external changes
  useEffect(() => {
    const syncTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    };
    
    // Initial check
    syncTheme();

    // Listen for changes
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    
    return () => observer.disconnect();
  }, []);

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
  }, [])

  const setAppTheme = async (newTheme: 'light' | 'dark') => {
    if (!toggleRef.current) return;
    
    // Play sound
    playHeartbeat();
    
    // Trigger view transition
    if (document.startViewTransition) {
      await document.startViewTransition(() => {
        flushSync(() => {
          setTheme(newTheme);
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          localStorage.setItem("theme", newTheme);
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
      setTheme(newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem("theme", newTheme);
    }
  };
  
  // State Management
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Ref to track toggle button DOM element
  const toggleRef = useRef<HTMLButtonElement>(null);
  
  // Track whether toggle is in checked (dark) or unchecked (light) position
  const isDark = mounted && theme === 'dark';

  // Handle hydration - prevent mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate particles with different timing
  const generateParticles = () => {
    const newParticles: Particle[] = [];
    const particleCount = 3; // Multiple layers

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        delay: i * 0.1, // Stagger timing
        duration: 0.6 + i * 0.1, // Different durations for depth
      });
    }

    setParticles(newParticles);
    setIsAnimating(true);

    // Clear particles after animation
    setTimeout(() => {
      setIsAnimating(false);
      setParticles([]);
    }, 1000);
  };

  // Toggle handler - switches theme and triggers particles
  const handleToggle = () => {
    generateParticles();
    setAppTheme(isDark ? 'light' : 'dark');
  };

  // Prevent hydration mismatch - show placeholder during SSR
  if (!mounted) {
    return (
      <div className="relative inline-block scale-75 origin-top-right">
        <div className="relative flex h-[64px] w-[104px] items-center rounded-full bg-[#EFECE6] dark:bg-[#1A1A1A] border border-[#D5D0C6] dark:border-[#3A352E] p-1" />
      </div>
    );
  }

  return (
    <div className="relative inline-block scale-75 origin-top-right">
        {/* SVG Filter for Film Grain Texture */}
        <svg className="absolute w-0 h-0">
        <defs>
          {/* Light mode grain - subtle */}
          <filter id="grain-light">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="saturate"
              values="0"
              result="desaturatedNoise"
            />
            <feComponentTransfer in="desaturatedNoise" result="lightGrain">
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feBlend in="SourceGraphic" in2="lightGrain" mode="overlay" />
          </filter>
          
          {/* Dark mode grain - more visible */}
          <filter id="grain-dark">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="saturate"
              values="0"
              result="desaturatedNoise"
            />
            <feComponentTransfer in="desaturatedNoise" result="darkGrain">
              <feFuncA type="linear" slope="0.5" />
            </feComponentTransfer>
            <feBlend in="SourceGraphic" in2="darkGrain" mode="overlay" />
          </filter>
        </defs>
      </svg>

      {/* Pill-shaped track container */}
      <motion.button
        ref={toggleRef}
        onClick={handleToggle}
        className="relative flex h-[64px] w-[104px] items-center rounded-full p-[6px] transition-all duration-300 focus:outline-none"
        style={{
          background: isDark
            ? '#1A1A1A'
            : '#EFECE6',
          boxShadow: isDark
            ? `
              inset 5px 5px 12px rgba(0, 0, 0, 0.5),
              inset -5px -5px 12px rgba(255, 255, 255, 0.05),
              0 2px 10px rgba(0, 0, 0, 0.2)
            `
            : `
              inset 5px 5px 12px rgba(213, 208, 198, 0.5),
              inset -5px -5px 12px rgba(255, 255, 255, 0.8),
              0 2px 10px rgba(0, 0, 0, 0.05)
            `,
          border: isDark 
            ? '2px solid #3A352E' 
            : '2px solid #D5D0C6',
          position: 'relative',
        }}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        role="switch"
        aria-checked={isDark}
        whileTap={{ scale: 0.98 }}
      >
        {/* Deep inner groove/rim effect */}
        <div 
          className="absolute inset-[3px] rounded-full pointer-events-none"
          style={{
            boxShadow: isDark
              ? 'inset 0 2px 6px rgba(0, 0, 0, 0.5)'
              : 'inset 0 2px 6px rgba(0, 0, 0, 0.05)',
          }}
        />
        
        {/* Background Icons */}
        <div className="absolute inset-0 flex items-center justify-between px-4">
          <Sun size={20} className={isDark ? 'text-[#3A352E]' : 'text-[#7A736C]'} />
          <Moon size={20} className={isDark ? 'text-[#7A736C]' : 'text-[#D5D0C6]'} />
        </div>

        {/* Circular Thumb with Bouncy Spring Physics */}
        <motion.div
          className="relative z-10 flex h-[44px] w-[44px] items-center justify-center rounded-full overflow-hidden"
          style={{
            background: isDark
              ? '#2A2520'
              : '#F0EDE7',
            boxShadow: isDark
              ? `
                inset 2px 2px 4px rgba(255, 255, 255, 0.05),
                inset -2px -2px 4px rgba(0, 0, 0, 0.5),
                0 4px 8px rgba(0, 0, 0, 0.5)
              `
              : `
                inset 2px 2px 4px rgba(255, 255, 255, 0.8),
                inset -2px -2px 4px rgba(0, 0, 0, 0.05),
                0 4px 8px rgba(0, 0, 0, 0.1)
              `,
            border: isDark
              ? '1px solid #3A352E'
              : '1px solid #ffffff',
          }}
          animate={{
            x: isDark ? 44 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 300, // Fast, responsive movement
            damping: 20, // Bouncy feel with slight overshoot
          }}
        >
          {/* Particle Layer - expanding circles from center with grainy texture */}
          {isAnimating && particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: '10px',
                  height: '10px',
                  background: isDark
                    ? 'radial-gradient(circle, rgba(240, 237, 231, 0.2) 0%, rgba(240, 237, 231, 0) 70%)'
                    : 'radial-gradient(circle, rgba(26, 26, 26, 0.1) 0%, rgba(26, 26, 26, 0) 70%)',
                  mixBlendMode: 'normal',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: isDark ? 6 : 8, opacity: [0, 1, 0] }}
                transition={{
                  duration: isDark ? 0.5 : particle.duration,
                  delay: particle.delay,
                  ease: 'easeOut',
                }}
              />
            </motion.div>
          ))}

          {/* Icon */}
          <div className="relative z-10">
            {isDark ? (
              <Moon size={18} className="text-[#F0EDE7]" />
            ) : (
              <Sun size={18} className="text-[#1A1A1A]" />
            )}
          </div>
        </motion.div>
      </motion.button>
    </div>
  );
}