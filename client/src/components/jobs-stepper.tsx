import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Briefcase,
  MapPin,
  Search,
  Check,
  Loader2,
} from "lucide-react";
import type { JobPreferences } from "@/lib/job-preferences-db";
import OrbitAnimation from "@/components/orbit-animation";

const LEVEL_OPTIONS = [
  { label: "Mid-level", sub: "Growing into ownership \u00b7 2\u20134 years", api: "under_3_years_experience" },
  { label: "Senior", sub: "Leading work independently \u00b7 5\u20138 years", api: "more_than_3_years_experience" },
  { label: "Lead / Staff", sub: "Setting direction for a team \u00b7 8+ years", api: "more_than_3_years_experience" },
  { label: "Manager / Director", sub: "People management and strategy", api: "more_than_3_years_experience" },
];

const LOCATION_OPTIONS = [
  { value: "my-city" as const, label: "My city only" },
  { value: "relocating" as const, label: "Open to relocating" },
  { value: "remote" as const, label: "Remote only" },
];

const ROLE_CHIPS = [
  "Product Designer",
  "UX Designer",
  "UI Designer",
  "UX Researcher",
  "Design Lead",
  "Interaction Designer",
];

const ORBIT_ITEMS = [
  { id: 1, name: "Company 1", src: "/companylogo-new/companyradial01.svg" },
  { id: 2, name: "Company 2", src: "/companylogo-new/companyradial02.svg" },
  { id: 3, name: "Company 3", src: "/companylogo-new/companyradial03.svg" },
  { id: 4, name: "Company 4", src: "/companylogo-new/companyradial04.svg" },
  { id: 5, name: "Company 5", src: "/companylogo-new/companyradial05.svg" },
  { id: 6, name: "Company 6", src: "/companylogo-new/companyradial06.svg" },
  { id: 7, name: "Company 7", src: "/companylogo-new/companyradial07.svg" },
  { id: 8, name: "Company 8", src: "/companylogo-new/companyradial08.svg" },
];

interface Props {
  defaultLocation: string;
  onComplete: (prefs: JobPreferences) => void;
}

function AnimatedIntroHeading() {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 80, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    mv.set(1200);
  }, []);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  return (
    <h1 className="text-[28px] font-bold tracking-tight mb-3 leading-tight max-w-[380px]">
      We've found{" "}
      <span className="tabular-nums">{display.toLocaleString()}+</span>{" "}
      jobs that match your profile
    </h1>
  );
}


export default function JobsStepper({ defaultLocation, onComplete }: Props) {
  const [screen, setScreen] = useState(0);

  // Screen 1
  const [level, setLevel] = useState<string | null>(null);
  const [levelApi, setLevelApi] = useState("");

  // Screen 2
  const [locationType, setLocationType] = useState<"my-city" | "relocating" | "remote" | null>(null);
  const [locationInput, setLocationInput] = useState("");
  const [locationCountry, setLocationCountry] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const locationInputRef = useRef<HTMLInputElement>(null);

  // Screen 3
  const [role, setRole] = useState("");

  // Pre-fill location from resume
  useEffect(() => {
    if (locationType === "my-city" && !locationInput && defaultLocation) {
      setLocationInput(defaultLocation);
    }
  }, [locationType, defaultLocation]);

  // Nominatim autocomplete
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) { setSuggestions([]); return; }
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=6&featuretype=city&accept-language=en`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    } catch {
      // Degrade gracefully
    }
  }, []);

  const handleLocationChange = (val: string) => {
    setLocationInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const selectSuggestion = (s: any) => {
    const city = s.address?.city || s.address?.town || s.address?.village || s.address?.state || "";
    const country = s.address?.country || "";
    const display = city && country ? `${city}, ${country}` : s.display_name?.split(",").slice(0, 2).join(",").trim() || s.display_name;
    setLocationInput(display);
    setLocationCountry(country);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const canAdvance = () => {
    if (screen === 1) return !!level;
    if (screen === 2) return !!locationType && (locationType === "remote" || locationInput.trim().length > 0);
    if (screen === 3) return role.trim().length > 0;
    return true;
  };

  const handleSubmit = () => {
    if (!level || !locationType || !role.trim()) return;
    onComplete({
      level,
      levelApiValue: levelApi,
      locationType,
      location: locationType === "remote" ? "" : locationInput.trim(),
      country: locationCountry,
      role: role.trim(),
    });
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);
  const goNext = () => { setDirection(1); setScreen((s) => s + 1); };
  const goBack = () => { setDirection(-1); setScreen((s) => s - 1); };

  return (
    <div className="min-h-screen bg-[#F0EDE7] dark:bg-[#1A1A1A] flex items-center justify-center font-['Inter'] text-[#1A1A1A] dark:text-[#F0EDE7] transition-colors duration-500 px-4">
      <div className="w-full max-w-[520px]">
        <AnimatePresence mode="wait" custom={direction}>
          {/* Screen 0 — Intro */}
          {screen === 0 && (
            <motion.div
              key="s0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col items-center text-center relative"
              data-testid="stepper-screen-0"
            >
              {/* Orbit animation behind */}
              <div className="absolute inset-0 flex items-center justify-center -z-0 pointer-events-none" aria-hidden>
                <OrbitAnimation orbitItems={ORBIT_ITEMS} stageSize={580} imageSize={52} />
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <AnimatedIntroHeading />
                <p className="text-[15px] text-[#7A736C] dark:text-[#B5AFA5] leading-relaxed mb-8 max-w-[420px]" style={{ fontWeight: 450 }}>
                  Now let's find the ones that are worth your time. Answer 3 questions and we'll narrow it down to your best matches.
                </p>
                <Button
                  onClick={goNext}
                  className="rounded-full px-8 h-12 text-[15px] font-semibold bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-black/80 dark:hover:bg-white/90 shadow-sm"
                  data-testid="stepper-start-btn"
                >
                  Let's do it
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Screen 1 — Experience Level */}
          {screen === 1 && (
            <motion.div
              key="s1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              data-testid="stepper-screen-1"
            >
              <motion.h2
                initial={{ opacity: 0, filter: "blur(8px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="text-[22px] font-bold tracking-tight mb-6"
              >
                What level are you targeting?
              </motion.h2>
              <div className="flex flex-col gap-3 mb-8">
                {LEVEL_OPTIONS.map((opt, idx) => (
                  <motion.button
                    key={opt.label}
                    initial={{ opacity: 0, filter: "blur(8px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.35, delay: 0.12 + idx * 0.07 }}
                    onClick={() => { setLevel(opt.label); setLevelApi(opt.api); }}
                    data-testid={`level-${opt.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className={cn(
                      "w-full text-left px-5 py-4 rounded-xl border transition-all duration-200",
                      level === opt.label
                        ? "border-[#1A1A1A] dark:border-[#F0EDE7] bg-[#1A1A1A]/[0.04] dark:bg-white/[0.06] shadow-sm"
                        : "border-black/8 dark:border-white/8 hover:border-black/20 dark:hover:border-white/20 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[15px] font-semibold">{opt.label}</div>
                        <div className="text-[13px] text-[#7A736C] dark:text-[#9E9893] mt-0.5" style={{ fontWeight: 450 }}>{opt.sub}</div>
                      </div>
                      {level === opt.label && (
                        <div className="w-6 h-6 rounded-full bg-[#1A1A1A] dark:bg-[#F0EDE7] flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 text-white dark:text-[#1A1A1A]" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, filter: "blur(6px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.35, delay: 0.45 }}
                className="flex justify-between"
              >
                <Button variant="outline" onClick={goBack} className="rounded-full h-10 px-5 text-[13px] font-medium border-black/10 dark:border-white/10">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                </Button>
                <Button
                  onClick={goNext}
                  disabled={!canAdvance()}
                  className="rounded-full h-10 px-6 text-[13px] font-semibold bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-black/80 dark:hover:bg-white/90 disabled:opacity-40"
                >
                  Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Screen 2 — Location */}
          {screen === 2 && (
            <motion.div
              key="s2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              data-testid="stepper-screen-2"
            >
              <motion.h2
                initial={{ opacity: 0, filter: "blur(8px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="text-[22px] font-bold tracking-tight mb-6"
              >
                Where are you open to working?
              </motion.h2>
              <div className="flex flex-col gap-3 mb-5">
                {LOCATION_OPTIONS.map((opt, idx) => (
                  <motion.button
                    key={opt.value}
                    initial={{ opacity: 0, filter: "blur(8px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.35, delay: 0.12 + idx * 0.07 }}
                    onClick={() => {
                      setLocationType(opt.value);
                      if (opt.value === "my-city" && defaultLocation && !locationInput) setLocationInput(defaultLocation);
                    }}
                    data-testid={`location-${opt.value}`}
                    className={cn(
                      "w-full text-left px-5 py-3.5 rounded-xl border transition-all duration-200 text-[15px] font-medium",
                      locationType === opt.value
                        ? "border-[#1A1A1A] dark:border-[#F0EDE7] bg-[#1A1A1A]/[0.04] dark:bg-white/[0.06] shadow-sm"
                        : "border-black/8 dark:border-white/8 hover:border-black/20 dark:hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      {opt.label}
                      {locationType === opt.value && (
                        <div className="w-5 h-5 rounded-full bg-[#1A1A1A] dark:bg-[#F0EDE7] flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-white dark:text-[#1A1A1A]" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Location input — shown for my-city and relocating */}
              <AnimatePresence>
                {locationType && locationType !== "remote" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mb-5 relative"
                  >
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A736C] dark:text-[#9E9893]" />
                      <Input
                        ref={locationInputRef}
                        value={locationInput}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="e.g. Bangalore, India"
                        data-testid="location-input"
                        className="h-11 pl-10 bg-black/[0.03] dark:bg-white/[0.03] border-black/10 dark:border-white/10 rounded-xl text-[14px] focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 shadow-none"
                      />
                    </div>
                    {/* Nominatim suggestions */}
                    <AnimatePresence>
                      {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-[#2A2520] rounded-xl border border-black/10 dark:border-white/10 shadow-lg overflow-hidden"
                        >
                          {suggestions.map((s: any, i: number) => (
                            <button
                              key={s.place_id || i}
                              onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }}
                              className="w-full text-left px-4 py-2.5 text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors border-b border-black/5 dark:border-white/5 last:border-0 truncate"
                            >
                              {s.display_name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, filter: "blur(6px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.35, delay: 0.4 }}
                className="flex justify-between mt-3"
              >
                <Button variant="outline" onClick={goBack} className="rounded-full h-10 px-5 text-[13px] font-medium border-black/10 dark:border-white/10">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                </Button>
                <Button
                  onClick={goNext}
                  disabled={!canAdvance()}
                  className="rounded-full h-10 px-6 text-[13px] font-semibold bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-black/80 dark:hover:bg-white/90 disabled:opacity-40"
                >
                  Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Screen 3 — Target Role */}
          {screen === 3 && (
            <motion.div
              key="s3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              data-testid="stepper-screen-3"
            >
              <motion.h2
                initial={{ opacity: 0, filter: "blur(8px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="text-[22px] font-bold tracking-tight mb-6"
              >
                What role are you looking for next?
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, filter: "blur(8px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.35, delay: 0.12 }}
                className="relative mb-4"
              >
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A736C] dark:text-[#9E9893]" />
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Product Designer"
                  data-testid="role-input"
                  className="h-12 pl-10 bg-black/[0.03] dark:bg-white/[0.03] border-black/10 dark:border-white/10 rounded-xl text-[15px] font-medium focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 shadow-none"
                />
              </motion.div>
              <div className="flex flex-wrap gap-2 mb-8">
                {ROLE_CHIPS.map((chip, idx) => (
                  <motion.button
                    key={chip}
                    initial={{ opacity: 0, filter: "blur(8px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.3, delay: 0.2 + idx * 0.05 }}
                    onClick={() => setRole(chip)}
                    data-testid={`chip-${chip.toLowerCase().replace(/\s+/g, "-")}`}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all duration-150",
                      role === chip
                        ? "border-[#1A1A1A] dark:border-[#F0EDE7] bg-[#1A1A1A] dark:bg-[#F0EDE7] text-white dark:text-[#1A1A1A]"
                        : "border-black/10 dark:border-white/10 text-[#7A736C] dark:text-[#9E9893] hover:border-black/25 dark:hover:border-white/25 hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7]"
                    )}
                  >
                    {chip}
                  </motion.button>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, filter: "blur(6px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.35, delay: 0.5 }}
                className="flex justify-between"
              >
                <Button variant="outline" onClick={goBack} className="rounded-full h-10 px-5 text-[13px] font-medium border-black/10 dark:border-white/10">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canAdvance()}
                  className="rounded-full h-10 px-6 text-[13px] font-semibold bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-black/80 dark:hover:bg-white/90 disabled:opacity-40"
                  data-testid="stepper-submit-btn"
                >
                  Find my matches <Sparkles className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress dots — bottom */}
        {screen > 0 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i <= screen ? "w-8 bg-[#1A1A1A] dark:bg-[#F0EDE7]" : "w-1.5 bg-black/10 dark:bg-white/10"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
