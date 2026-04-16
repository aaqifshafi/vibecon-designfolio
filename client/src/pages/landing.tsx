import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Sun, Moon, ChevronLeft, ChevronRight, FileText, TrendingUp, BookOpen, Mic, Mail, BarChart2, CheckCircle2, X } from "lucide-react";
import { ColorOrb } from "@/components/ui/color-orb";
import { Folder } from "@/components/ui/folder";
import mockupImg from "@assets/image_1773592620611.png";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";

function BlurHoverText({ defaultText, hoverText, scrollActive }: { defaultText: string, hoverText: string, scrollActive?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  // Show hoverText when: (hovered and not scrolled) OR (scrolled and not hovered)
  const showHoverText = isHovered !== !!scrollActive;

  return (
    <div
      className="relative cursor-default inline-flex h-full items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-[0.3em] items-center whitespace-nowrap">
        {defaultText.split(" ").map((word, i) => (
          <motion.span
            key={i}
            animate={{
              opacity: showHoverText ? 0 : 1,
              filter: showHoverText ? "blur(4px)" : "blur(0px)",
            }}
            transition={{ duration: 0.3, delay: showHoverText ? 0 : i * 0.08 }}
          >
            {word}
          </motion.span>
        ))}
      </div>

      <div className="absolute left-0 flex gap-[0.3em] whitespace-nowrap pointer-events-none">
        {hoverText.split(" ").map((word, i) => (
          <motion.span
            key={i}
            animate={{
              opacity: showHoverText ? 1 : 0,
              filter: showHoverText ? "blur(0px)" : "blur(4px)",
            }}
            transition={{ duration: 0.3, delay: showHoverText ? i * 0.08 : 0 }}
          >
            {word}
          </motion.span>
        ))}
      </div>
    </div>
  );
}


const scrollerExtraTestimonials = [
  {
    content: "As someone who talks to designers every day, the biggest portfolio killer is friction—and Designfolio removes it. It's quick to start, easy to use, and the AI case study analysis actually helps. If you've been delaying your portfolio or want to ship faster, go check out Designfolio—you'll thank yourself later.",
    name: "Vidhunnan Murugan",
    role: "Lead Product Designer @ Keka HR",
    image: "/testimonial/vidhunan.png",
    logoSrc: "/testimonial/company/keka.png",
    logoRaw: true,
  },
  {
    content: "Designfolio is the ultimate shortcut for designers who prioritize landing a job over pixel-perfecting a custom site.",
    name: "Arpit Chandak",
    role: "Sr. Product Experience Design @ Mastercard",
    image: "/testimonial/arpit.png",
    logoSrc: "/testimonial/company/mastercard.png",
    logoRaw: true,
  },
  {
    content: "Has to be the easiest way anyone can get their portfolio up and running in no time. And of course, man behind the platform, Shai, never stops innovating.",
    name: "Alok Bhusanur",
    role: "Product Designer @ Cleartax",
    image: "/testimonial/alok.png",
    logoSrc: "/testimonial/company/clear.png",
    logoRaw: true,
  },
  {
    content: "Honestly designfolio just makes putting your work out there feel effortless. Everything feels clean and intuitive, and it actually lets the work speak for itself. I'm really excited to keep using it and see how it grows.",
    name: "Sivachidambaram",
    role: "Staff Product Designer @ Freshworks",
    image: "/testimonial/siva.png",
    logoSrc: "/testimonial/company/freshworks.png",
    logoRaw: true,
  },
  {
    content: "Designfolio made setting up my portfolio ridiculously fast—I was up and running in under 5 minutes. It's easy to use and showcases my work in a clean, polished way. The new editor is a game changer, making case studies feel effortless instead of overwhelming. It removes the friction so you can focus on what actually matters: your work.",
    name: "Chirag Chhajer",
    role: "Product Designer @ SenseHQ",
    image: "/testimonial/chirag.png",
    logoSrc: "/testimonial/company/sense.png",
    logoRaw: true,
  },
];

function VerticalTestimonialsScroller({ duration }: { duration: number }) {
  const all = [...testimonials, ...scrollerExtraTestimonials];
  const doubled = [...all, ...all];
  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: 420,
        maskImage: 'linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)',
      }}
    >
      <motion.ul
        key={duration}
        animate={{ translateY: "-50%" }}
        transition={{ duration, repeat: Infinity, ease: "linear", repeatType: "loop" }}
        className="flex flex-col gap-3 list-none m-0 p-0"
      >
        {doubled.map((t, i) => (
          <li key={i} className="px-5 py-5 rounded-xl border border-[#E2E1DA] dark:border-border bg-[#FFFEF2] dark:bg-background">
            <p className="text-[14px] leading-[1.6] text-[#1D1B1A]/80 dark:text-foreground/80 font-medium mb-4">
              "{t.content}"
            </p>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={t.image}
                  alt={t.name}
                  className="h-8 w-8 rounded-[28%] object-cover flex-shrink-0"
                />
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[13px] font-semibold text-[#1D1B1A] dark:text-foreground leading-none">{t.name}</span>
                  <span className="text-[12px] text-[#1D1B1A]/50 dark:text-foreground/50">{t.role}</span>
                </div>
              </div>
              {t.logoSrc && (
                <img
                  src={t.logoSrc}
                  alt=""
                  aria-hidden="true"
                  className={cn("shrink-0", !t.logoRaw && "opacity-20 dark:invert")}
                  style={{ width: 32, height: 32, objectFit: "contain" }}
                />
              )}
            </div>
          </li>
        ))}
      </motion.ul>
    </div>
  );
}

function ShimmerInView({ text }: { text: string }) {
  if (!text.includes('"')) return <>{text}</>;
  const parts = text.split('"');
  
  return (
    <>
      {parts[0]}
      <motion.span
        initial={{ backgroundPosition: '100% center' }}
        whileInView={{ backgroundPosition: '0% center' }}
        viewport={{ once: true, margin: "0px 0px -20% 0px" }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="text-transparent bg-clip-text inline-block"
        style={{ 
          backgroundImage: 'linear-gradient(to right, hsl(var(--foreground)) 0%, hsl(var(--foreground)) 30%, #5D3560 40%, #E54D2E 50%, #F5A623 60%, hsl(var(--foreground)) 70%, hsl(var(--foreground)) 100%)', 
          backgroundSize: '300% auto'
        }}
      >
        {parts[1]}
      </motion.span>
      {parts[2]}
    </>
  );
}

const testimonials = [
  {
    name: "Ishita Chaudhary",
    role: "Product & Business @ Cisco",
    content: "I was procrastinating on building my portfolio for a year, but Designfolio completely changed that — it helped me go from Word/Figma case studies to a live website in just 20 minutes.",
    image: "/testimonial images/ishita.png",
    logoSrc: "/testimonial/company/cisco.png",
    logoRaw: true,
  },
  {
    name: "Ashutosh Vashishtha",
    role: "Design Evangelist @ Apple",
    content: "The customisations are awesome and incredibly helpful in bringing out the true flavour of my design projects! Totally worth spending time on — such a GOATed portfolio builder!",
    image: "/testimonial/ashuthosh.png",
    logoSrc: "/testimonial/company/apple.png",
    logoRaw: true,
  },
  {
    name: "Suvigya Nijhawan",
    role: "Product Manager @ Google",
    content: "Designfolio is the ideal launchpad for designers and product managers to showcase their skills with an extremely efficient portfolio builder that covers every section recruiters care about.",
    image: "/testimonial/suvigya.png",
    logoSrc: "/testimonial/company/google.png",
    logoRaw: true,
  },
  {
    name: "Aditya Krishna",
    role: "Associate Design Director @ JP Morgan",
    content: "Designfolio has been a fantastic way to showcase my work in a clean, customizable format that reflects my personal style while keeping everything polished and professional.",
    image: "/testimonial/aditya.png",
    logoSrc: "/testimonial/company/jpmorgan.png",
    logoRaw: true,
  }
];

function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const navigate = (dir: 1 | -1) => {
    setCurrentIndex((prev) => (prev + dir + testimonials.length) % testimonials.length);
    setProgress(0);
  };

  useEffect(() => {
    const duration = 5000;
    const interval = 50;
    const step = (interval / duration) * 100;
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((current) => (current + 1) % testimonials.length);
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-[500px] mx-auto flex flex-col items-center">
      <div className="w-full relative h-[130px] sm:h-[120px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-col w-full absolute top-0 left-0"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-[28%] overflow-hidden shrink-0 border border-[#E2E1DA] dark:border-border shadow-sm">
                  <img 
                    src={testimonials[currentIndex].image} 
                    alt={testimonials[currentIndex].name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="text-[#1D1B1A] dark:text-foreground text-[14px] font-bold leading-tight">{testimonials[currentIndex].name}</div>
                  <div className="text-[12px] font-medium text-[#1D1B1A]/50 dark:text-foreground/50 leading-tight">{testimonials[currentIndex].role}</div>
                </div>
              </div>
              {testimonials[currentIndex].logoSrc && (
                <img
                  src={testimonials[currentIndex].logoSrc}
                  alt=""
                  aria-hidden="true"
                  className={cn("shrink-0", !testimonials[currentIndex].logoRaw && "opacity-20 dark:invert")}
                  style={{ width: 36, height: 36, objectFit: "contain" }}
                />
              )}
            </div>
            
            <p className="text-[#1D1B1A]/80 dark:text-foreground/80 font-medium text-[15px] leading-[1.5]">
              {testimonials[currentIndex].content}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3 mt-6 w-full">
        <button
          onClick={() => navigate(-1)}
          aria-label="Previous testimonial"
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[#1D1B1A]/30 dark:text-foreground/30 border border-[#1D1B1A]/10 dark:border-white/10 transition-colors hover:text-[#1D1B1A]/60 dark:hover:text-foreground/60 hover:border-[#1D1B1A]/20 dark:hover:border-white/20"
        >
          <ChevronLeft className="size-3.5" />
        </button>

        <div className="flex-1 h-[3px] bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-black/20 dark:bg-white/20 rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.05 }}
          />
        </div>

        <button
          onClick={() => navigate(1)}
          aria-label="Next testimonial"
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[#1D1B1A]/30 dark:text-foreground/30 border border-[#1D1B1A]/10 dark:border-white/10 transition-colors hover:text-[#1D1B1A]/60 dark:hover:text-foreground/60 hover:border-[#1D1B1A]/20 dark:hover:border-white/20"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function Landing() {
  const [, navigate] = useLocation();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLDivElement>(null);
  const videoSectionRef = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [showNavCTA, setShowNavCTA] = useState(false);
  const [fabVisible, setFabVisible] = useState(true);
  const [speedLevel, setSpeedLevel] = useState(4);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiStatusIndex, setAiStatusIndex] = useState(0);
  const [cutoutPos, setCutoutPos] = useState({ x: 0, y: 300 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadZoneRef = useRef<HTMLDivElement>(null);

  const aiStatuses = [
    "Reading your resume...",
    "Extracting skills & experience...",
    "Building your portfolio...",
    "Scanning matched jobs...",
  ];

  useEffect(() => {
    if (!isProcessing) return;
    setAiStatusIndex(0);
    const interval = setInterval(() => {
      setAiStatusIndex((i) => (i + 1) % aiStatuses.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isProcessing]);

  useEffect(() => {
    if (!isProcessing) return;
    const timer = setTimeout(() => navigate("/builder"), 6200);
    return () => clearTimeout(timer);
  }, [isProcessing, navigate]);

  const speedLabels = ["Taking it easy", "Comfortable", "Normal", "Skimming", "Quick scan"];
  const speedDurations = [52, 38, 28, 18, 11];
  const scrollDuration = speedDurations[speedLevel - 1];

  const playSliderTick = useCallback((level: number) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(300 + level * 60, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
      osc.onended = () => ctx.close();
    } catch {}
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the currently intersecting entry
        const intersectingEntry = entries.find(entry => entry.isIntersecting);
        if (intersectingEntry) {
          setActiveSection(intersectingEntry.target.id);
        } else {
          // If none are intersecting (e.g. scrolling up past 'stories' before 'overview' triggers),
          // check if we are at the top of the page
          if (window.scrollY < 100) {
            setActiveSection('overview');
          }
        }
      },
      { 
        // Adjust the root margin to trigger earlier when scrolling up
        rootMargin: '-10% 0px -70% 0px' 
      }
    );

    const sections = ['overview', 'stories', 'how', 'why'];
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    // Also listen to scroll events specifically for the top of the page
    const handleScroll = () => {
      if (window.scrollY < 100) {
        setActiveSection('overview');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleNavCTAScroll = () => {
      if (!videoSectionRef.current) return;
      const videoRect = videoSectionRef.current.getBoundingClientRect();
      const videoTop = videoRect.top + window.scrollY;
      const halfwayPoint = videoTop + videoRect.height * 0.5;

      const whySection = document.getElementById('why');
      const whyTop = whySection ? whySection.getBoundingClientRect().top + window.scrollY : Infinity;

      setShowNavCTA(window.scrollY > halfwayPoint && window.scrollY < whyTop);
    };
    window.addEventListener('scroll', handleNavCTAScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleNavCTAScroll);
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    const handleFabScroll = () => {
      const currentY = window.scrollY;
      if (currentY < lastY || currentY < 80) {
        setFabVisible(true);
      } else if (currentY > lastY + 4) {
        setFabVisible(false);
      }
      lastY = currentY;
    };
    window.addEventListener('scroll', handleFabScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleFabScroll);
  }, []);

  useEffect(() => {
    if (isProcessing) {
      // Measure the always-mounted upload zone BEFORE locking scroll
      if (uploadZoneRef.current) {
        const rect = uploadZoneRef.current.getBoundingClientRect();
        setCutoutPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }
      // Lock scroll — preserve current position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll
      const lockedTop = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (lockedTop) window.scrollTo(0, parseInt(lockedTop) * -1);
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isProcessing]);

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
      setTheme(checked ? "dark" : "light");
      return;
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        setTheme(checked ? "dark" : "light");
      });
    }).ready;

    const originEl = window.innerWidth < 1024 ? fabRef.current : containerRef.current;
    if (originEl) {
      const { left, top, width, height } = originEl.getBoundingClientRect();
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

  useEffect(() => {
    // Force background color on html, body, and root for Mac/iOS overscroll
    const bgColor = theme === 'dark' ? '#1A1A1A' : '#FFFEF2';
    
    document.documentElement.style.setProperty('background-color', bgColor, 'important');
    document.body.style.setProperty('background-color', bgColor, 'important');
    const root = document.getElementById('root');
    if (root) root.style.setProperty('background-color', bgColor, 'important');
    
    // Also update theme-color meta tag for mobile/Safari
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    let originalThemeColor = '';
    if (metaThemeColor) {
      originalThemeColor = metaThemeColor.getAttribute('content') || '';
      metaThemeColor.setAttribute('content', bgColor);
    } else {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      metaThemeColor.setAttribute('content', bgColor);
      document.head.appendChild(metaThemeColor);
    }
    
    return () => {
      // Reset when unmounting
      document.documentElement.style.removeProperty('background-color');
      document.body.style.removeProperty('background-color');
      if (root) root.style.removeProperty('background-color');
      
      if (metaThemeColor) {
        if (originalThemeColor) {
          metaThemeColor.setAttribute('content', originalThemeColor);
        } else {
          metaThemeColor.remove();
        }
      }
    };
  }, [theme]);


  const scrollToSection = (id: string, block: ScrollLogicalPosition = 'start') => {
    if (id === 'overview') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block });
    }
  };

  return (
    <div id="overview" className="min-h-screen bg-[#FFFEF2] dark:bg-background text-[#1D1B1A] dark:text-foreground antialiased overflow-x-clip flex justify-center" style={{ fontFamily: '"Manrope", sans-serif' }}>
      <div className="w-full max-w-[640px] bg-[#FFFEF2] dark:bg-background min-h-screen border-x border-[#EAE9E4] dark:border-border relative z-10 shadow-[0_0_40px_rgba(0,0,0,0.02)]">
        
        {/* Left Floating Nav */}
        <div className="hidden lg:block absolute right-full top-0 bottom-0 z-40">
          <div className="sticky top-[120px] flex flex-col items-start pr-12 w-max">
            
            {/* Logo that gets revealed */}
            <div className="absolute top-0 left-0 w-9 h-9 z-0">
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full flex items-center justify-center shadow-sm rounded-full overflow-hidden"
              >
                <svg width="125" height="125" viewBox="0 0 125 125" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <g filter="url(#filter0_i_445_296)">
                    <rect width="124.5" height="124.5" rx="62.25" fill="url(#paint0_linear_445_296)"/>
                    <path d="M67.437 15.5625H57.062V49.7263L32.9046 25.5688L25.5683 32.9051L49.7258 57.0625H15.562V67.4375H49.7258L25.5684 91.5949L32.9046 98.9311L57.062 74.7737V108.937H67.437V74.7737L91.5944 98.9312L98.9307 91.5949L74.7732 67.4375H108.937V57.0625H74.7732L98.9307 32.9051L91.5944 25.5688L67.437 49.7263V15.5625Z" fill="white"/>
                  </g>
                  <defs>
                    <filter id="filter0_i_445_296" x="0" y="0" width="124.5" height="124.5" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                      <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                      <feOffset/>
                      <feGaussianBlur stdDeviation="6.72973"/>
                      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.333333 0 0 0 0 0.243137 0 0 0 1 0"/>
                      <feBlend mode="normal" in2="shape" result="effect1_innerShadow_445_296"/>
                    </filter>
                    <linearGradient id="paint0_linear_445_296" x1="62.25" y1="0" x2="62.25" y2="124.5" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FFDCD7"/>
                      <stop offset="0.788462" stopColor="#FF553E"/>
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </div>
            
            {/* Sliding Container */}
            <motion.div 
              initial={{ y: 0 }}
              animate={{ y: 52 }}
              transition={{ duration: 0.6, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col relative z-10 bg-[#FFFEF2] dark:bg-background w-full"
            >
              <div className="font-bold text-[15px] tracking-tight text-[#1D1B1A] dark:text-foreground flex items-center h-9 pr-4 bg-[#FFFEF2] dark:bg-background">
                <span className="mr-1.5">/</span>
                <motion.span
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.4 } }
                  }}
                  className="flex"
                >
                  {"Designfolio".split("").map((char, i) => (
                    <motion.span
                      key={i}
                      variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1 }
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.span>
              </div>
              
              <div ref={containerRef} className="group inline-flex items-center gap-2 mt-4 mb-4">
                <span
                  className={cn(
                    "cursor-pointer text-left text-sm font-medium transition-colors",
                    isDark ? "text-[#7A736C] dark:text-[#9E9893]" : "text-[#1A1A1A] dark:text-[#F0EDE7]",
                  )}
                  onClick={() => handleCheckedChange(false)}
                >
                  <Sun className="size-4" aria-hidden="true" />
                </span>
                <Switch
                  checked={isDark}
                  onCheckedChange={handleCheckedChange}
                  aria-label="Toggle between dark and light mode"
                  className="dark:data-[state=checked]:bg-[#DDD1C4]"
                />
                <span
                  className={cn(
                    "cursor-pointer text-right text-sm font-medium transition-colors",
                    !isDark ? "text-[#7A736C] dark:text-[#9E9893]" : "text-[#1A1A1A] dark:text-[#F0EDE7]",
                  )}
                  onClick={() => handleCheckedChange(true)}
                >
                  <Moon className="size-4" aria-hidden="true" />
                </span>
              </div>

              <nav className="flex flex-col gap-2.5 text-[15px] font-medium text-[#1D1B1A]/50 dark:text-foreground/50 pb-4 bg-[#FFFEF2] dark:bg-background">
                <a href="#overview" onClick={(e) => { e.preventDefault(); scrollToSection('overview'); }} className={cn("transition-colors", activeSection === 'overview' ? "text-[#E54D2E] font-semibold" : "hover:text-[#1D1B1A] dark:hover:text-foreground")}>Overview</a>
                <a href="#stories" onClick={(e) => { e.preventDefault(); scrollToSection('stories', 'center'); }} className={cn("transition-colors", activeSection === 'stories' ? "text-[#E54D2E] font-semibold" : "hover:text-[#1D1B1A] dark:hover:text-foreground")}>Stories</a>
                <a href="#how" onClick={(e) => { e.preventDefault(); scrollToSection('how', 'start'); }} className={cn("transition-colors", activeSection === 'how' ? "text-[#E54D2E] font-semibold" : "hover:text-[#1D1B1A] dark:hover:text-foreground")}>How?</a>
                <a href="#why" onClick={(e) => { e.preventDefault(); scrollToSection('why', 'start'); }} className={cn("transition-colors", activeSection === 'why' ? "text-[#E54D2E] font-semibold" : "hover:text-[#1D1B1A] dark:hover:text-foreground")}>Why?</a>
              </nav>
            </motion.div>
          </div>
        </div>

        {/* Header */}
        <header className="sticky top-0 z-50 w-full bg-[#FFFEF2]/95 dark:bg-background/95 backdrop-blur before:absolute before:content-[''] before:inset-x-[-100vw] before:bottom-0 before:h-px before:bg-[#EAE9E4] dark:before:bg-border">
          <div className="px-6 h-16 flex items-center justify-between">
            {/* Mobile: logo + /designfolio */}
            <div className="flex md:hidden items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
                <svg width="125" height="125" viewBox="0 0 125 125" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <g filter="url(#nav-logo-filter)">
                    <rect width="124.5" height="124.5" rx="62.25" fill="url(#nav-logo-gradient)"/>
                    <path d="M67.437 15.5625H57.062V49.7263L32.9046 25.5688L25.5683 32.9051L49.7258 57.0625H15.562V67.4375H49.7258L25.5684 91.5949L32.9046 98.9311L57.062 74.7737V108.937H67.437V74.7737L91.5944 98.9312L98.9307 91.5949L74.7732 67.4375H108.937V57.0625H74.7732L98.9307 32.9051L91.5944 25.5688L67.437 49.7263V15.5625Z" fill="white"/>
                  </g>
                  <defs>
                    <filter id="nav-logo-filter" x="0" y="0" width="124.5" height="124.5" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                      <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                      <feOffset/><feGaussianBlur stdDeviation="6.72973"/>
                      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.333333 0 0 0 0 0.243137 0 0 0 1 0"/>
                      <feBlend mode="normal" in2="shape" result="effect1_innerShadow_nav"/>
                    </filter>
                    <linearGradient id="nav-logo-gradient" x1="62.25" y1="0" x2="62.25" y2="124.5" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FFDCD7"/>
                      <stop offset="0.788462" stopColor="#FF553E"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="text-[14px] font-bold tracking-tight text-[#1D1B1A] dark:text-foreground">/designfolio</span>
            </div>
            {/* Desktop: stats */}
            <div className="hidden md:flex text-[13px] font-semibold tracking-wide text-[#1D1B1A]/70 dark:text-foreground/70 uppercase h-[20px] items-center min-w-[200px]" style={{ fontFamily: '"Geist Mono", monospace' }}>
              <BlurHoverText defaultText="25000+ USERS" hoverText="5000+ PORTFOLIOS LAUNCHED" scrollActive={showNavCTA} />
            </div>
            <div className="flex items-center">
              <Button
                variant="outline"
                className="rounded-full px-5 h-8 text-[13px] font-medium border-black/10 dark:border-border hover:bg-black/5 dark:hover:bg-white/5 bg-transparent text-[#1D1B1A] dark:text-foreground"
                onClick={() => navigate("/builder")}
              >
                Go to builder
              </Button>
              <AnimatePresence>
                {showNavCTA && (
                  <motion.div
                    key="nav-cta"
                    initial={{ opacity: 0, maxWidth: 0, marginLeft: 0 }}
                    animate={{ opacity: 1, maxWidth: 180, marginLeft: 8 }}
                    exit={{ opacity: 0, maxWidth: 0, marginLeft: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden flex-shrink-0 flex"
                  >
                    <div className="group inline-flex cursor-pointer items-center gap-0 rounded-full" onClick={() => setShowUploadModal(true)}>
                      <span className="rounded-full bg-[#1D1B1A] dark:bg-white px-4 py-[6px] text-[13px] font-medium text-[#FDFCF8] dark:text-[#1D1B1A] transition-colors duration-500 ease-in-out group-hover:bg-[#FF553E] dark:group-hover:bg-[#FF553E] group-hover:text-white dark:group-hover:text-white whitespace-nowrap">
                        Get Started
                      </span>
                      <div className="relative h-[32px] w-[32px] flex-shrink-0 overflow-hidden rounded-full bg-[#1D1B1A] dark:bg-white text-[#FDFCF8] dark:text-[#1D1B1A] transition-colors duration-500 ease-in-out group-hover:bg-[#FF553E] dark:group-hover:bg-[#FF553E] group-hover:text-white dark:group-hover:text-white">
                        <ArrowUpRight className="absolute top-1/2 left-1/2 h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-6 group-hover:-translate-y-6" strokeWidth={2.5} />
                        <ArrowUpRight className="absolute top-1/2 left-1/2 h-[14px] w-[14px] -translate-x-7 translate-y-7 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2 group-hover:-translate-y-1/2" strokeWidth={2.5} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex flex-col items-center">
          {/* Hero Section */}
          <section className="w-full px-6 pt-12 pb-12 flex flex-col items-center text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-[32px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] max-w-[480px] mb-5 text-[#463B34] dark:text-foreground"
              style={{ fontWeight: 650 }}
            >
              The career tool that works while you sleep.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="text-[16px] mb-8 max-w-[400px] leading-relaxed font-semibold text-[#1d1b1ab3] dark:text-foreground/70"
            >
              Upload your resume. AI builds your portfolio, scans, scores, and shortlists matched jobs.
            </motion.p>
            
            <motion.div
              ref={uploadZoneRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="w-full max-w-[400px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                data-testid="input-resume-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { setResumeFile(file); setIsProcessing(true); }
                }}
              />
              <AnimatePresence mode="wait">
                {isProcessing && resumeFile ? (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25 }}
                    className="orb-always-active inline-flex items-center gap-3.5 rounded-xl border border-dashed border-[#1D1B1A]/25 dark:border-white/25 bg-[#1D1B1A]/[0.03] dark:bg-white/[0.05] px-5 py-3"
                  >
                    <ColorOrb dimension="14px" spinDuration={5} />
                    <div className="flex flex-col items-start gap-0.5">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={aiStatusIndex}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="text-[14px] font-semibold leading-none text-[#1D1B1A] dark:text-foreground whitespace-nowrap"
                        >
                          {aiStatuses[aiStatusIndex]}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-[12px] text-[#1D1B1A]/40 dark:text-foreground/40 leading-none">
                        This takes a few seconds…
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25 }}
                    data-testid="dropzone-resume"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type === "application/pdf") { setResumeFile(file); setIsProcessing(true); }
                    }}
                    className={cn(
                      "group/dropzone cursor-pointer inline-flex items-center gap-3.5 rounded-xl border border-dashed px-5 py-3 transition-all duration-200",
                      isDragging
                        ? "border-[#FF553E] bg-[#FF553E]/5"
                        : "border-[#1D1B1A]/25 dark:border-white/25 bg-[#1D1B1A]/[0.03] dark:bg-white/[0.05] hover:border-[#1D1B1A]/45 dark:hover:border-white/40 hover:bg-[#1D1B1A]/[0.05] dark:hover:bg-white/[0.07]"
                    )}
                  >
                    {/* Animated folder icon */}
                    <Folder />

                    {/* Text */}
                    <div className="flex flex-col items-start gap-0.5">
                      <span className={cn("text-[14px] font-semibold leading-none transition-colors duration-200", isDragging ? "text-[#FF553E]" : "text-[#1D1B1A] dark:text-foreground")}>
                        {isDragging ? "Drop it here" : "Upload your resume"}
                      </span>
                      <span className="text-[12px] text-[#1D1B1A]/40 dark:text-foreground/40 leading-none">
                        PDF · max 5MB
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </section>

          {/* Browser Mockup Section */}
          <section ref={videoSectionRef} className="w-full px-6 mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="relative rounded-[20px] overflow-hidden shadow-xl border border-[#E2E1DA] dark:border-border bg-[#141414]"
            >
              <div className="relative w-full overflow-hidden" style={{ paddingTop: '65%' }}>
                <video 
                  key={isDark ? "dark" : "light"}
                  src={isDark ? "/landing-video/hero-dark.mp4" : "/landing-video/hero-light.mp4"}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover origin-center" 
                />
              </div>
            </motion.div>
          </section>

          {/* Trusted By Section */}
          <section className="w-full px-6 mb-20 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="text-[14px] text-[#1D1B1A]/60 dark:text-foreground/60 leading-tight whitespace-nowrap text-center md:text-left shrink-0 font-semibold">
              Trusted by folks<br className="hidden md:block" /> working at
            </div>
            <div className="flex-1 w-full overflow-hidden relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
              <motion.div 
                className="flex items-center text-[#1D1B1A]/40 dark:text-foreground/40 w-max"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ ease: "linear", duration: 50, repeat: Infinity }}
              >
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-x-8 pr-8">
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <img 
                        key={num}
                        src={`/companylogo/companienames0${num}.svg`} 
                        alt={`Company logo ${num}`}
                        className="h-[32px] w-auto opacity-50 hover:opacity-80 transition-opacity dark:invert dark:opacity-75 dark:hover:opacity-100"
                      />
                    ))}
                  </div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Testimonial Section */}
          <section id="stories" className="w-full border-y border-[#EAE9E4] dark:border-border py-8 px-6 bg-[#F4F3E5] dark:bg-card overflow-hidden scroll-mt-[30vh]">
            <TestimonialCarousel />
          </section>

          {/* Steps Section */}
          <section id="how" className="w-full px-6 mb-16 mt-[48px] scroll-mt-24">
            <div className="w-full flex flex-col gap-12">
              {[
                { step: "1/", title: 'Choose a "template".', video: "/landing-video/template-section.mp4" },
                { step: "2/", title: 'Use AI as a "co-pilot".', video: "/landingvideo/analyzeai.mp4" },
                { step: "3/", title: 'And other "AI tools".', video: "/landing-video/other-ai-tools.mp4", features: [
                  { label: "Fix your resume",       icon: FileText,  color: "#2563EB", lightBg: "#DBEAFE", midBg: "#BFDBFE" },
                  { label: "Salary Negotiation",    icon: TrendingUp, color: "#16A34A", lightBg: "#DCFCE7", midBg: "#BBF7D0" },
                  { label: "Case study generator",  icon: BookOpen,  color: "#7C3AED", lightBg: "#EDE9FE", midBg: "#DDD6FE" },
                  { label: "AI mock interview",     icon: Mic,       color: "#C2410C", lightBg: "#FFEDD5", midBg: "#FED7AA" },
                  { label: "AI email generator",    icon: Mail,      color: "#0D9488", lightBg: "#CCFBF1", midBg: "#99F6E4" },
                  { label: "Analyze Case study",    icon: BarChart2, color: "#DC2626", lightBg: "#FFE4E1", midBg: "#FECACA" },
                ] }
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-5">
                  <h3 className="text-[18px] font-bold text-[#1D1B1A] dark:text-foreground">
                    {item.step} <ShimmerInView text={item.title} />
                  </h3>
                  <div className="w-full rounded-[12px] overflow-hidden border border-[#E2E1DA] dark:border-border shadow-sm bg-[#141414]">
                    <div className="relative w-full overflow-hidden" style={{ paddingTop: '65%' }}>
                      <video 
                        src={item.video} 
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover origin-center" 
                      />
                    </div>
                  </div>
                  {item.features && (() => {
                    const renderRow = (f: any, fi: number, isLast: boolean) => {
                      const Icon = f.icon;
                      const c = f.color as string | undefined;
                      const lightBg = f.lightBg as string | undefined;
                      const midBg = f.midBg as string | undefined;
                      const pillStyle = lightBg && midBg ? {
                        background: `radial-gradient(circle at 38% 32%, ${lightBg}, ${midBg})`,
                        boxShadow: `inset 0 1.5px 2px rgba(255,255,255,0.75), inset 0 -1px 2px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)`,
                      } : undefined;
                      return (
                        <div
                          className={cn("group flex items-center justify-between px-4 py-3.5 cursor-pointer bg-[#FFFEF2] dark:bg-background hover:bg-[#F8F7EE] dark:hover:bg-white/[0.03] transition-colors duration-150", !isLast && "border-b border-[#E2E1DA] dark:border-border")}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#1D1B1A]/[0.08] dark:bg-white/[0.10]">
                              <span className="absolute inset-0 rounded-full scale-100 sm:scale-0 sm:group-hover:scale-100 transition-transform duration-300 ease-out origin-center" style={pillStyle} />
                              <Icon className="absolute h-3.5 w-3.5 text-[#1D1B1A]/30 dark:text-foreground/30 opacity-0 sm:opacity-100 transition-opacity duration-200 sm:group-hover:opacity-0" strokeWidth={1.75} />
                              <Icon className="absolute h-3.5 w-3.5 opacity-100 sm:opacity-0 transition-opacity duration-200 sm:group-hover:opacity-100" style={c ? { color: c } : undefined} strokeWidth={1.75} />
                            </div>
                            <span className="text-[14px] font-medium text-[#1D1B1A] dark:text-foreground">{f.label}</span>
                          </div>
                          <ArrowUpRight className="h-[15px] w-[15px] text-[#1D1B1A]/40 dark:text-foreground/40 opacity-0 -translate-x-1 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-0 flex-shrink-0" strokeWidth={2} />
                        </div>
                      );
                    };
                    const visible = item.features.slice(0, 3);
                    const hidden = item.features.slice(3);
                    return (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col rounded-xl border border-[#E2E1DA] dark:border-border overflow-hidden">
                          {visible.map((f, fi) => {
                            const isLast = !showAllFeatures && fi === visible.length - 1;
                            return <div key={fi}>{renderRow(f, fi, isLast)}</div>;
                          })}
                          <motion.div
                            initial={false}
                            animate={{ height: showAllFeatures ? "auto" : 0 }}
                            transition={{ type: "spring", stiffness: 380, damping: 38, restDelta: 0.5 }}
                            style={{ overflow: "hidden" }}
                          >
                            {hidden.map((f, fi) => (
                              <motion.div
                                key={`hidden-${fi}`}
                                initial={{ opacity: 0, y: -6 }}
                                animate={showAllFeatures ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
                                transition={{ type: "spring", stiffness: 420, damping: 28, delay: showAllFeatures ? fi * 0.06 : 0 }}
                              >
                                {renderRow(f, fi + 3, fi === hidden.length - 1)}
                              </motion.div>
                            ))}
                          </motion.div>
                        </div>
                        <button
                          onClick={() => setShowAllFeatures(v => !v)}
                          className="self-start flex items-center gap-1.5 px-1 py-1 text-[13px] font-medium text-[#1D1B1A]/50 dark:text-foreground/50 hover:text-[#1D1B1A] dark:hover:text-foreground transition-colors duration-150"
                        >
                          <span>{showAllFeatures ? "Show less" : `+${hidden.length} more tools`}</span>
                          <ChevronRight className={cn("h-3.5 w-3.5 transition-transform duration-300", showAllFeatures && "rotate-90")} />
                        </button>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </section>

          {/* Vertical Testimonials Section */}
          <section className="w-full border-y border-[#EAE9E4] dark:border-border px-6 pt-10 pb-4 bg-[#F4F3E5] dark:bg-card">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[12px] font-semibold tracking-widest uppercase text-[#1D1B1A]/40 dark:text-foreground/40 tabular-nums w-[130px]">
                {speedLabels[speedLevel - 1]}
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] text-[#1D1B1A]/30 dark:text-foreground/30 font-medium">Slow</span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={speedLevel}
                  onChange={(e) => { const v = Number(e.target.value); setSpeedLevel(v); playSliderTick(v); }}
                  className="speed-slider w-24 h-1 appearance-none cursor-pointer rounded-full outline-none"
                  style={{
                    background: isDark
                      ? `linear-gradient(to right, #F0EDE7 ${(speedLevel - 1) * 25}%, #F0EDE740 ${(speedLevel - 1) * 25}%)`
                      : `linear-gradient(to right, #1D1B1A ${(speedLevel - 1) * 25}%, #1D1B1A30 ${(speedLevel - 1) * 25}%)`,
                  }}
                />
                <span className="text-[11px] text-[#1D1B1A]/30 dark:text-foreground/30 font-medium">Fast</span>
              </div>
            </div>
            <VerticalTestimonialsScroller duration={scrollDuration} />
          </section>

          {/* About Maker Section */}
          <section id="why" className="w-full border-t border-[#EAE9E4] dark:border-border pt-16 pb-12 px-6 scroll-mt-24">
            <div className="max-w-[500px] mx-auto">
              <h2 className="text-[24px] font-bold text-[#1D1B1A] dark:text-foreground mb-6 tracking-tight">
                I'm Shai. Maker of Designfolio.
              </h2>
              
              <div className="flex flex-col gap-6 text-[15px] leading-[1.6] text-[#1D1B1A]/80 dark:text-foreground/80 font-medium">
                <p>
                  For the last decade, I've been designing products.<br />
                  And honestly, the hardest problem was never design itself — it was the portfolio.
                </p>
                <p>
                  Keeping it updated, packaging your work right, being ready when the right opportunity shows up — it's a lot.
                </p>
                <p>
                  And somewhere in that process, one thought kept coming back:<br />
                  why is this so hard for everyone?
                </p>
                <p>
                  That question turned into Designfolio.
                </p>
                <p>
                  Hey, I'm Shai — a Staff Product Designer at ServiceNow.<br />
                  I built Designfolio to make this whole thing easier.
                </p>
                <p>
                  Give it a shot.
                </p>
              </div>

              <div className="mt-8 mb-6">
                <div className="font-['Caveat'] text-[32px] text-[#1D1B1A] dark:text-foreground mb-2 leading-none">
                  Shai
                </div>
                <div className="text-[14px] font-medium text-[#1D1B1A]/70 dark:text-foreground/70">
                  Say hi - shai@designfolio.me
                </div>
              </div>

              <div className="group inline-flex cursor-pointer items-center gap-0 rounded-full mt-4 mb-6" onClick={() => setShowUploadModal(true)}>
                <span className="rounded-full bg-[#1D1B1A] dark:bg-white px-6 py-[13px] text-[15px] font-medium text-[#FDFCF8] dark:text-[#1D1B1A] transition-colors duration-500 ease-in-out group-hover:bg-[#FF553E] dark:group-hover:bg-[#FF553E] group-hover:text-white dark:group-hover:text-white">
                  Get started for Free
                </span>
                <div className="relative h-[46px] w-[46px] flex-shrink-0 overflow-hidden rounded-full bg-[#1D1B1A] dark:bg-white text-[#FDFCF8] dark:text-[#1D1B1A] transition-colors duration-500 ease-in-out group-hover:bg-[#FF553E] dark:group-hover:bg-[#FF553E] group-hover:text-white dark:group-hover:text-white">
                  <ArrowUpRight className="absolute top-1/2 left-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-8 group-hover:-translate-y-8" strokeWidth={2.5} />
                  <ArrowUpRight className="absolute top-1/2 left-1/2 h-[18px] w-[18px] -translate-x-10 translate-y-10 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2 group-hover:-translate-y-1/2" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="w-full border-t border-[#EAE9E4] dark:border-border">
            <div className="px-6 py-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] font-medium text-[#1D1B1A]/50 dark:text-foreground/50 bg-[#F4F3E5] dark:bg-card">
              <a href="/privacy-policy" className="hover:text-[#1D1B1A] dark:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#1D1B1A] dark:text-foreground transition-colors">Terms & Conditions</a>
              <a href="#" className="hover:text-[#1D1B1A] dark:text-foreground transition-colors">Refund Policy</a>
              <a href="#" className="hover:text-[#1D1B1A] dark:text-foreground transition-colors">Pricing</a>
              <a href="#" className="hover:text-[#1D1B1A] dark:text-foreground transition-colors">Contact / Support</a>
            </div>
            <div className="border-t border-[#EAE9E4] dark:border-border px-6 py-4 text-center text-[12px] font-medium text-[#1D1B1A]/40 dark:text-foreground/40 bg-[#F4F3E5] dark:bg-card">© 2026 Designfolio Labs LLP. All rights reserved.</div>
          </footer>
        </main>
      </div>
      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            key="upload-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-4"
            style={{ backgroundColor: isDark ? 'rgba(10,9,8,0.75)' : 'rgba(29,27,26,0.45)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              key="upload-modal-card"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[640px] rounded-3xl border border-[#E2E1DA] dark:border-white/10 bg-[#FDFCF8] dark:bg-[#1C1A19] shadow-2xl overflow-hidden"
            >
              {/* Close */}
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-[#1D1B1A]/[0.06] dark:bg-white/[0.08] text-[#1D1B1A]/50 dark:text-foreground/50 hover:bg-[#1D1B1A]/[0.12] dark:hover:bg-white/[0.14] hover:text-[#1D1B1A] dark:hover:text-foreground transition-all duration-150"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>

              <div className="p-7 md:p-9">
                {/* Header */}
                <div className="mb-7">
                  <h2 className="text-[22px] font-bold text-[#1D1B1A] dark:text-foreground tracking-tight leading-tight mb-1.5">
                    Everything starts with your Resume
                  </h2>
                  <p className="text-[14px] text-[#1D1B1A]/55 dark:text-foreground/55 leading-relaxed">
                    Upload once. AI builds your portfolio, matches jobs, and sets you up for your next role.
                  </p>
                </div>

                {/* Single-column body: upload first, features below */}
                <div className="flex flex-col gap-5">

                  {/* Upload zone */}
                  <div className="flex flex-col items-center gap-4">
                    <AnimatePresence mode="wait">
                      {isProcessing && resumeFile ? (
                        <motion.div
                          key="modal-processing"
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          transition={{ duration: 0.25 }}
                          className="orb-always-active w-full flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#1D1B1A]/25 dark:border-white/25 bg-[#1D1B1A]/[0.03] dark:bg-white/[0.05] px-6 py-10"
                        >
                          <ColorOrb dimension="32px" spinDuration={5} />
                          <div className="flex flex-col items-center gap-1">
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={aiStatusIndex}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="text-[14px] font-semibold leading-none text-[#1D1B1A] dark:text-foreground text-center"
                              >
                                {aiStatuses[aiStatusIndex]}
                              </motion.span>
                            </AnimatePresence>
                            <span className="text-[12px] text-[#1D1B1A]/40 dark:text-foreground/40 leading-none">
                              This takes a few seconds…
                            </span>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="modal-idle"
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          transition={{ duration: 0.25 }}
                          className="w-full flex flex-col items-center gap-4"
                        >
                          <div
                            className={cn(
                              "group/dropzone w-full cursor-pointer flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-10 transition-all duration-200",
                              isDragging
                                ? "border-[#FF553E] bg-[#FF553E]/5"
                                : "border-[#1D1B1A]/20 dark:border-white/20 bg-[#1D1B1A]/[0.025] dark:bg-white/[0.04] hover:border-[#1D1B1A]/40 dark:hover:border-white/35 hover:bg-[#1D1B1A]/[0.04] dark:hover:bg-white/[0.06]"
                            )}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDragging(false);
                              const file = e.dataTransfer.files?.[0];
                              if (file && file.type === 'application/pdf') { setResumeFile(file); setIsProcessing(true); }
                            }}
                          >
                            <Folder isDragging={false} />
                            <div className="text-center">
                              <p className={cn("text-[14px] font-semibold leading-none mb-1 transition-colors duration-200", isDragging ? "text-[#FF553E]" : "text-[#1D1B1A] dark:text-foreground")}>
                                {isDragging ? "Drop it here" : "Click to upload Resume"}
                              </p>
                              <p className="text-[12px] text-[#1D1B1A]/40 dark:text-foreground/40">PDF format only · Max 5MB</p>
                            </div>
                          </div>

                          {/* CTA */}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full rounded-xl bg-[#1D1B1A] dark:bg-white text-[#FDFCF8] dark:text-[#1D1B1A] py-3.5 text-[15px] font-semibold transition-colors duration-300 hover:bg-[#FF553E] dark:hover:bg-[#FF553E] dark:hover:text-white"
                          >
                            Upload Resume
                          </button>

                          {/* Trust badges */}
                          <div className="flex items-center justify-center gap-3 flex-wrap">
                            {['Data never sold', 'Delete anytime'].map((label) => (
                              <span key={label} className="flex items-center gap-1 text-[11px] text-[#1D1B1A]/35 dark:text-foreground/35 font-medium">
                                <CheckCircle2 className="w-3 h-3 shrink-0" strokeWidth={2} />
                                {label}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Features */}
                  <div className="flex flex-col gap-4">
                    {[
                      {
                        img: '/previewproject/buildresume.png',
                        title: 'Portfolio built in seconds',
                        desc: 'AI reads your resume and generates a beautiful, ready-to-share portfolio automatically.',
                      },
                      {
                        img: '/previewproject/jobs.png',
                        title: 'Jobs matched to your skills',
                        desc: "Scout scans thousands of roles and shortlists the ones where you're a top applicant.",
                      },
                    ].map(({ img, title, desc }) => (
                      <div key={title} className="flex items-start gap-3.5">
                        <img
                          src={img}
                          alt={title}
                          className="shrink-0 w-12 h-12 object-cover"
                          style={{ borderRadius: '22%' }}
                        />
                        <div>
                          <p className="text-[15px] font-semibold text-[#1D1B1A] dark:text-foreground leading-snug mb-1">{title}</p>
                          <p className="text-[13px] text-[#1D1B1A]/50 dark:text-foreground/50 leading-relaxed">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Focus Overlay — spotlight locked to the upload button's exact position */}
      <motion.div
        animate={{ opacity: isProcessing && resumeFile ? 1 : 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="fixed inset-0 z-[80] pointer-events-none"
        style={{
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          background: isDark
            ? `radial-gradient(ellipse 400px 120px at ${cutoutPos.x}px ${cutoutPos.y}px, transparent 0%, rgba(8,7,6,0.65) 62%)`
            : `radial-gradient(ellipse 400px 120px at ${cutoutPos.x}px ${cutoutPos.y}px, transparent 0%, rgba(250,248,238,0.72) 62%)`,
          maskImage: `radial-gradient(ellipse 400px 120px at ${cutoutPos.x}px ${cutoutPos.y}px, transparent 0%, black 62%)`,
          WebkitMaskImage: `radial-gradient(ellipse 400px 120px at ${cutoutPos.x}px ${cutoutPos.y}px, transparent 0%, black 62%)`,
        }}
      />
      {/* Corner bracket — top-left */}
      <motion.div
        animate={{ opacity: isProcessing && resumeFile ? 0.8 : 0, x: isProcessing && resumeFile ? 0 : 5, y: isProcessing && resumeFile ? 0 : 5 }}
        transition={{ duration: 0.35, delay: isProcessing && resumeFile ? 0.15 : 0 }}
        className="fixed z-[82] pointer-events-none"
        style={{
          left: cutoutPos.x - 212, top: cutoutPos.y - 66,
          width: 14, height: 14,
          borderTop: '1.5px solid rgba(255,85,62,0.9)',
          borderLeft: '1.5px solid rgba(255,85,62,0.9)',
        }}
      />
      {/* Corner bracket — top-right */}
      <motion.div
        animate={{ opacity: isProcessing && resumeFile ? 0.8 : 0, x: isProcessing && resumeFile ? 0 : -5, y: isProcessing && resumeFile ? 0 : 5 }}
        transition={{ duration: 0.35, delay: isProcessing && resumeFile ? 0.15 : 0 }}
        className="fixed z-[82] pointer-events-none"
        style={{
          left: cutoutPos.x + 198, top: cutoutPos.y - 66,
          width: 14, height: 14,
          borderTop: '1.5px solid rgba(255,85,62,0.9)',
          borderRight: '1.5px solid rgba(255,85,62,0.9)',
        }}
      />
      {/* Corner bracket — bottom-left */}
      <motion.div
        animate={{ opacity: isProcessing && resumeFile ? 0.8 : 0, x: isProcessing && resumeFile ? 0 : 5, y: isProcessing && resumeFile ? 0 : -5 }}
        transition={{ duration: 0.35, delay: isProcessing && resumeFile ? 0.15 : 0 }}
        className="fixed z-[82] pointer-events-none"
        style={{
          left: cutoutPos.x - 212, top: cutoutPos.y + 52,
          width: 14, height: 14,
          borderBottom: '1.5px solid rgba(255,85,62,0.9)',
          borderLeft: '1.5px solid rgba(255,85,62,0.9)',
        }}
      />
      {/* Corner bracket — bottom-right */}
      <motion.div
        animate={{ opacity: isProcessing && resumeFile ? 0.8 : 0, x: isProcessing && resumeFile ? 0 : -5, y: isProcessing && resumeFile ? 0 : -5 }}
        transition={{ duration: 0.35, delay: isProcessing && resumeFile ? 0.15 : 0 }}
        className="fixed z-[82] pointer-events-none"
        style={{
          left: cutoutPos.x + 198, top: cutoutPos.y + 52,
          width: 14, height: 14,
          borderBottom: '1.5px solid rgba(255,85,62,0.9)',
          borderRight: '1.5px solid rgba(255,85,62,0.9)',
        }}
      />
      {/* Scanning line — sweeps inside the spotlight */}
      <motion.div
        animate={isProcessing && resumeFile
          ? { top: [`${cutoutPos.y - 35}px`, `${cutoutPos.y + 35}px`, `${cutoutPos.y - 35}px`], opacity: [0, 0.5, 0.5, 0] }
          : { opacity: 0 }}
        transition={isProcessing && resumeFile
          ? { duration: 2.2, repeat: Infinity, ease: "easeInOut", times: [0, 0.45, 0.9, 1] }
          : { duration: 0.25 }}
        className="fixed z-[82] pointer-events-none"
        style={{
          left: cutoutPos.x - 190, width: 380, height: 1,
          background: 'linear-gradient(to right, transparent, rgba(255,85,62,0.65) 20%, rgba(255,85,62,0.65) 80%, transparent)',
        }}
      />

      {/* Floating Theme FAB */}
      <AnimatePresence>
        {fabVisible && (
          <motion.div
            ref={fabRef}
            key="theme-fab"
            initial={{ opacity: 0, scale: 0.7, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-[9999] lg:hidden"
          >
            <button
              onClick={() => handleCheckedChange(!isDark)}
              aria-label="Toggle theme"
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-colors duration-300",
                isDark
                  ? "bg-[#2A2825] text-[#F0EDE7] border border-white/10 hover:bg-[#343230]"
                  : "bg-white text-[#1D1B1A] border border-black/8 hover:bg-[#F5F4EE]"
              )}
            >
              <AnimatePresence mode="wait">
                {isDark ? (
                  <motion.span
                    key="moon-icon"
                    initial={{ rotate: -40, opacity: 0, scale: 0.6 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 40, opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="flex items-center justify-center"
                  >
                    <Moon className="size-[18px]" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="sun-icon"
                    initial={{ rotate: 40, opacity: 0, scale: 0.6 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -40, opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="flex items-center justify-center"
                  >
                    <Sun className="size-[18px]" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
