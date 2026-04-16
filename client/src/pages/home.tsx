import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import CinematicThemeSwitcher from "@/components/ui/cinematic-theme-switcher";
import { Switch as SwitchButton } from "@/components/ui/switch-button";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  Download,
  Dribbble,
  Mail,
  ChevronDown,
  Copy,
  Phone,
  Linkedin,
  Twitter,
  Globe,
  FileText,
  ArrowUpRight,
  Github,
  Play,
  Square,
  Sun,
  Moon,
  Move,
  Pencil,
  Plus,
  Trash2,
  Search,
  X,
  Check,
  ChevronsUpDown,
  GripVertical,
  ArrowUp,
} from "lucide-react";
import {
  AtSignIcon,
  AtSignIconHandle,
  DownloadIcon,
  DownloadIconHandle,
  DribbbleIcon,
  DribbbleIconHandle,
  TwitterIcon,
  TwitterIconHandle,
} from "lucide-animated";
import { motion, AnimatePresence, Reorder, Variants } from "framer-motion";
import { useLocation } from "wouter";
import { Cursor, CursorFollow, CursorProvider } from "@/components/ui/cursor";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { TextGradientScroll } from "@/components/ui/text-gradient-scroll";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import profileImg from "/previewproject/avatar.png";
import project1 from "@/assets/images/project1.png";
import project2 from "@/assets/images/project2.png";
import project3 from "@/assets/images/project3.png";
import project4 from "@/assets/images/project4.png";
import recommender1 from "/images/recommender-1.jpg";
import story1 from "@/assets/images/story-1.jpg";
import story2 from "@/assets/images/story-2.jpg";
import story3 from "@/assets/images/story-3.jpg";
import story4 from "@/assets/images/story-4.jpg";
import { useResume } from "@/context/ResumeContext";
import { getResumeData } from "@/lib/indexeddb";
import type { ParsedResume } from "@/lib/types";

export default function Home() {
  const [, navigate] = useLocation();
  const { resume, setResume } = useResume();
  const [dataLoaded, setDataLoaded] = useState(false);
  const atSignRef = useRef<AtSignIconHandle>(null);
  const downloadRef = useRef<DownloadIconHandle>(null);
  const dribbbleRef = useRef<DribbbleIconHandle>(null);
  const twitterRef = useRef<TwitterIconHandle>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [expandedCareer, setExpandedCareer] = useState<Record<number, boolean>>(
    {},
  );
  const [playingTestimonial, setPlayingTestimonial] = useState<number | null>(
    null,
  );
  const careerLadderRef = useRef<HTMLDivElement>(null);
  const ladderContainerRef = useRef<HTMLDivElement>(null);
  const pegboardRef = useRef<HTMLDivElement>(null);
  const [zIndexes, setZIndexes] = useState({ 1: 10, 2: 20, 3: 10 });
  const [characterPosition, setCharacterPosition] = useState(0);
  const [isEditing, setIsEditing] = useState(true);
  const [isContactPanelOpen, setIsContactPanelOpen] = useState(false);
  const [isStackPanelOpen, setIsStackPanelOpen] = useState(false);
  const [isRecommendationsPanelOpen, setIsRecommendationsPanelOpen] =
    useState(false);
  const [isRecommendationsRearrangeOpen, setIsRecommendationsRearrangeOpen] =
    useState(false);
  const [isProjectsRearrangeOpen, setIsProjectsRearrangeOpen] = useState(false);
  const [isProjectsPanelOpen, setIsProjectsPanelOpen] = useState(false);
  const [isProjectsAddDropdownOpen, setIsProjectsAddDropdownOpen] =
    useState(false);
  const [isExperiencePanelOpen, setIsExperiencePanelOpen] = useState(false);
  const [isProjectPasswordEnabled, setIsProjectPasswordEnabled] =
    useState(false);

  // Hydrate from IndexedDB on mount
  useEffect(() => {
    let cancelled = false;
    getResumeData().then((data) => {
      if (cancelled) return;
      if (data) {
        setResume(data);
        setDataLoaded(true);
      } else {
        navigate("/", { replace: true });
      }
    }).catch(() => {
      // Don't redirect on transient DB errors — retry silently
      if (!cancelled) {
        setTimeout(() => {
          getResumeData().then((data) => {
            if (cancelled) return;
            if (data) { setResume(data); setDataLoaded(true); }
            else { navigate("/", { replace: true }); }
          }).catch(() => {});
        }, 500);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Derive display values from resume context with fallbacks
  const r = resume;
  const displayFirstName = r?.firstName || "there";
  const displayTitle = r?.title || "Product Designer";
  const displayAbout = r?.about || "I'm a Design Engineer focused on crafting meaningful digital experiences where design meets code. With a strong front-end development and UX design background, I build scalable UI systems and contribute to user-centered products from concept to deployment.";
  const displayEmail = r?.email || null;
  const displayPhone = r?.phone || null;
  const displayLinkedin = r?.linkedin || null;
  const displayDribbble = r?.dribbble || null;
  const displayTwitter = r?.twitter || null;
  const displayGithub = r?.github || null;
  const displayWebsite = r?.website || null;

  const [projects, setProjects] = useState([
    {
      id: "proj-1",
      slug: "slate",
      title: "Slate",
      description:
        "A sleek and responsive landing page designed for modern startups to showcase their product.",
      image: project1,
    },
    {
      id: "proj-2",
      slug: "antimetal",
      title: "Antimetal",
      description:
        "A dynamic, animation-focused landing page highlighting creative transitions.",
      image: project2,
    },
  ]);

  // Sync projects from resume
  useEffect(() => {
    if (r?.projects) {
      setProjects(
        r.projects.map((p, i) => ({
          id: p.id || `proj-${i + 1}`,
          slug: p.id || `project-${i + 1}`,
          title: p.title,
          description: p.description || p.subtitle,
          image: i === 0 ? project1 : project2,
        }))
      );
    }
  }, [r?.projects]);
  const [isMyStoryPanelOpen, setIsMyStoryPanelOpen] = useState(false);
  const [storyImages, setStoryImages] = useState([
    story1,
    story2,
    story3,
    story4,
  ]);
  const [selectedStoryImage, setSelectedStoryImage] = useState<string | null>(
    null,
  );
  const [isDraggingResume, setIsDraggingResume] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [toolSearchQuery, setToolSearchQuery] = useState("");
  const [recommendations, setRecommendations] = useState([
    {
      id: "rec-1",
      name: "Jonathan Carter",
      role: "TechStarter CTO",
      content:
        "Alex's ability to combine creativity with strategic thinking has transformed the way our team approaches challenges. He is good in his domain.",
      image: recommender1,
    },
    {
      id: "rec-2",
      name: "Michael Johnson",
      role: "TechStarter CTO",
      content:
        "Alex's ability to combine creativity with strategic thinking has transformed the way our team approaches challenges. He is good in his domain.",
      image: recommender1,
    },
  ]);

  // Sync recommendations from resume
  useEffect(() => {
    if (r?.recommendations && r.recommendations.length > 0) {
      setRecommendations(
        r.recommendations.map((rec) => ({
          ...rec,
          image: rec.image || recommender1,
        }))
      );
    } else if (r && r.recommendations?.length === 0) {
      setRecommendations([]);
    }
  }, [r?.recommendations]);

  const [activeTools, setActiveTools] = useState([
    { name: "Figma", icon: "/tools/image 4.png" },
    { name: "Notion", icon: "/tools/image 5.png" },
    { name: "Raycast", icon: "/tools/image 6.png" },
    { name: "Framer", icon: "/tools/image 7.png" },
    { name: "Linear", icon: "/tools/image 8.png" },
    { name: "Slack", icon: "/tools/image 9.png" },
    { name: "Arc", icon: "/tools/image 10.png" },
  ]);

  // Sync tools from resume
  useEffect(() => {
    if (r?.tools && r.tools.length > 0) {
      setActiveTools(r.tools);
    }
  }, [r?.tools]);

  const allTools = [
    { name: "Figma", icon: "/tools/image 4.png" },
    { name: "Notion", icon: "/tools/image 5.png" },
    { name: "Raycast", icon: "/tools/image 6.png" },
    { name: "Framer", icon: "/tools/image 7.png" },
    { name: "Linear", icon: "/tools/image 8.png" },
    { name: "Slack", icon: "/tools/image 9.png" },
    { name: "Arc", icon: "/tools/image 10.png" },
    {
      name: "GitHub",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
    },
    {
      name: "VS Code",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg",
    },
    {
      name: "React",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    },
    {
      name: "TypeScript",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
    },
    {
      name: "Tailwind",
      icon: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg",
    },
    {
      name: "Python",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    },
    {
      name: "Node.js",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
    },
    {
      name: "Vercel",
      icon: "https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png",
    },
    {
      name: "GitLab",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg",
    },
    {
      name: "Firebase",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg",
    },
  ];

  const handleAddTool = (tool: { name: string; icon: string }) => {
    if (!activeTools.find((t) => t.name === tool.name)) {
      setActiveTools([...activeTools, tool]);
    }
  };

  const handleRemoveTool = (toolToRemove: { name: string; icon: string }) => {
    setActiveTools(activeTools.filter((t) => t.name !== toolToRemove.name));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingResume(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingResume(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingResume(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setResumeFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    const root = document.getElementById("root");
    if (root) {
      if (
        isContactPanelOpen ||
        isStackPanelOpen ||
        isRecommendationsPanelOpen ||
        isRecommendationsRearrangeOpen ||
        isProjectsRearrangeOpen ||
        isProjectsPanelOpen ||
        isMyStoryPanelOpen ||
        isExperiencePanelOpen
      ) {
        root.classList.add("theme-panel-open");
      } else {
        root.classList.remove("theme-panel-open");
      }
    }
    return () => {
      if (root) root.classList.remove("theme-panel-open");
    };
  }, [
    isContactPanelOpen,
    isStackPanelOpen,
    isRecommendationsPanelOpen,
    isRecommendationsRearrangeOpen,
    isProjectsRearrangeOpen,
    isProjectsPanelOpen,
    isMyStoryPanelOpen,
    isExperiencePanelOpen,
  ]);

  useEffect(() => {
    if (isContactPanelOpen) {
      window.dispatchEvent(
        new CustomEvent("panelOpened", { detail: "contact" }),
      );
    }
    if (isStackPanelOpen) {
      window.dispatchEvent(new CustomEvent("panelOpened", { detail: "stack" }));
    }
    if (isRecommendationsPanelOpen) {
      window.dispatchEvent(
        new CustomEvent("panelOpened", { detail: "recommendations" }),
      );
    }
    if (isRecommendationsRearrangeOpen) {
      window.dispatchEvent(
        new CustomEvent("panelOpened", { detail: "rearrange" }),
      );
    }
    if (isProjectsRearrangeOpen) {
      window.dispatchEvent(
        new CustomEvent("panelOpened", { detail: "projectsrearrange" }),
      );
    }
    if (isProjectsPanelOpen) {
      window.dispatchEvent(
        new CustomEvent("panelOpened", { detail: "projects" }),
      );
    }
    if (isExperiencePanelOpen) {
      window.dispatchEvent(
        new CustomEvent("panelOpened", { detail: "experience" }),
      );
    }
    if (isMyStoryPanelOpen) {
      window.dispatchEvent(
        new CustomEvent("panelOpened", { detail: "mystory" }),
      );
    }
  }, [
    isContactPanelOpen,
    isStackPanelOpen,
    isRecommendationsPanelOpen,
    isRecommendationsRearrangeOpen,
    isProjectsRearrangeOpen,
    isProjectsPanelOpen,
    isMyStoryPanelOpen,
    isExperiencePanelOpen,
  ]);

  useEffect(() => {
    const handlePanelOpened = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail !== "contact") {
        setIsContactPanelOpen(false);
      }
      if (customEvent.detail !== "stack") {
        setIsStackPanelOpen(false);
      }
      if (customEvent.detail !== "recommendations") {
        setIsRecommendationsPanelOpen(false);
      }
      if (customEvent.detail !== "rearrange") {
        setIsRecommendationsRearrangeOpen(false);
      }
      if (customEvent.detail !== "projectsrearrange") {
        setIsProjectsRearrangeOpen(false);
      }
      if (customEvent.detail !== "projects") {
        setIsProjectsPanelOpen(false);
      }
      if (customEvent.detail !== "experience") {
        setIsExperiencePanelOpen(false);
      }
      if (customEvent.detail !== "mystory") {
        setIsMyStoryPanelOpen(false);
      }
    };
    window.addEventListener("panelOpened", handlePanelOpened);
    return () => window.removeEventListener("panelOpened", handlePanelOpened);
  }, []);

  const bringToFront = (id: number) => {
    setZIndexes((prev) => {
      const maxZ = Math.max(...Object.values(prev));
      return { ...prev, [id]: maxZ + 1 };
    });
  };

  const playPegboardClick = (type: "grab" | "drop") => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const now = audioContext.currentTime;

      if (type === "grab") {
        // Quick peek sound when grabbing
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(1000, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

        osc.start(now);
        osc.stop(now + 0.03);
      } else {
        // Quick pop sound when dropping
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

        osc.start(now);
        osc.stop(now + 0.04);
      }
    } catch (e) {
      // Audio context not available or blocked
    }
  };

  useEffect(() => {
    const handleEnd = () => setPlayingTestimonial(null);
    window.speechSynthesis.addEventListener("voiceschanged", () => {}); // Just to initialize
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    let rafId: number;

    const updatePosition = () => {
      if (!careerLadderRef.current || !ladderContainerRef.current) return;

      const sectionRect = careerLadderRef.current.getBoundingClientRect();
      const containerHeight = ladderContainerRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      // When does the section start entering the viewport?
      // When sectionRect.bottom reaches viewportHeight (bottom of viewport)
      // Progress: 0 = section entering from bottom, 1 = section exiting from top

      const sectionTop = sectionRect.top;
      const sectionHeight = sectionRect.height;

      let progress = 0;

      // Calculate when the section is in viewport
      // We want progress to be 0 when the section top reaches the middle of the screen
      // and 1 when the section bottom reaches the middle of the screen

      const middleOfScreen = viewportHeight / 2;

      // Calculate how far the top of the section is from the middle of the screen
      // Positive when below middle, negative when above middle
      const distanceFromMiddle = sectionTop - middleOfScreen;

      // We start when top reaches middle (distance = 0)
      // We end when bottom reaches middle (distance = -sectionHeight)

      // Map the distance to a 0-1 progress value
      // 0 = sectionTop is at middleOfScreen
      // 1 = sectionTop is at middleOfScreen - sectionHeight (so section bottom is at middle)
      if (distanceFromMiddle > 0) {
        progress = 0; // Section is below the middle
      } else if (distanceFromMiddle < -sectionHeight) {
        progress = 1; // Section is above the middle
      } else {
        // Section is passing through the middle
        progress = Math.abs(distanceFromMiddle) / sectionHeight;
      }
      progress = Math.max(0, Math.min(1, progress));

      // Get the max available height for character movement
      const maxPosition = containerHeight - 54; // 54px is character height

      // Apply progress to move character across full ladder height
      const newPosition = progress * maxPosition;

      setCharacterPosition(newPosition);
    };

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePosition);
    };

    updatePosition();
    const timeoutId = setTimeout(updatePosition, 50);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, []);

  const handlePlayTestimonial = (text: string, id: number) => {
    if (playingTestimonial === id) {
      window.speechSynthesis.cancel();
      setPlayingTestimonial(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setPlayingTestimonial(null);
      window.speechSynthesis.speak(utterance);
      setPlayingTestimonial(id);
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  // Dino Game State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [dinoY, setDinoY] = useState(0);
  const [obstacles, setObstacles] = useState<{ id: number; x: number }[]>([]);

  const dinoYRef = useRef(0);
  const velocityRef = useRef(0);
  const obstaclesRef = useRef<{ id: number; x: number }[]>([]);
  const scoreRef = useRef(0);

  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number | undefined>(undefined);
  const gameRef = useRef<HTMLDivElement>(null);

  const jump = useCallback(() => {
    if (isGameOver) {
      setIsPlaying(true);
      setIsGameOver(false);
      scoreRef.current = 0;
      obstaclesRef.current = [];
      dinoYRef.current = 0;
      velocityRef.current = 0;
      setScore(0);
      setObstacles([]);
      setDinoY(0);
      return;
    }
    if (!isPlaying) {
      setIsPlaying(true);
      scoreRef.current = 0;
      obstaclesRef.current = [];
      dinoYRef.current = 0;
      velocityRef.current = 0;
      setScore(0);
      setObstacles([]);
      setDinoY(0);
      return;
    }
    if (dinoYRef.current === 0) {
      velocityRef.current = 11; // Jump strength
      dinoYRef.current = 0.1; // trigger jump
    }
  }, [isPlaying, isGameOver]);

  useEffect(() => {
    if (!isPlaying || isGameOver) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const update = (time: number) => {
      if (lastTimeRef.current !== undefined) {
        const deltaTime = Math.min(time - lastTimeRef.current, 32);

        scoreRef.current += 1;

        // Physics update
        if (dinoYRef.current > 0 || velocityRef.current !== 0) {
          dinoYRef.current += velocityRef.current * (deltaTime / 16);
          velocityRef.current -= 0.6 * (deltaTime / 16); // Gravity

          if (dinoYRef.current <= 0) {
            dinoYRef.current = 0;
            velocityRef.current = 0;
          }
        }

        // Obstacles update
        let newObstacles = obstaclesRef.current
          .map((obs) => ({ ...obs, x: obs.x - 5.5 * (deltaTime / 16) })) // speed
          .filter((obs) => obs.x > -50);

        const lastObsX =
          newObstacles.length > 0 ? newObstacles[newObstacles.length - 1].x : 0;
        if (
          newObstacles.length === 0 ||
          (lastObsX < 400 && Math.random() < 0.02)
        ) {
          newObstacles.push({ id: Date.now(), x: 700 });
        }

        obstaclesRef.current = newObstacles;

        // Collision check
        const dinoLeft = 52; // roughly left-12 (48) + some padding
        const dinoRight = 80;
        const dinoBottom = dinoYRef.current;

        let hit = false;
        for (const obs of newObstacles) {
          const obsLeft = obs.x + 4;
          const obsRight = obs.x + 20;
          const obsTop = 28; // height of cactus

          if (
            dinoRight > obsLeft &&
            dinoLeft < obsRight &&
            dinoBottom < obsTop
          ) {
            hit = true;
            break;
          }
        }

        if (hit) {
          setIsGameOver(true);
          setIsPlaying(false);
          setHighScore((current) =>
            Math.max(current, Math.floor(scoreRef.current / 10)),
          );
        } else {
          // Sync state for rendering
          setScore(scoreRef.current);
          setDinoY(dinoYRef.current);
          setObstacles(newObstacles);
        }
      }

      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      lastTimeRef.current = undefined;
    };
  }, [isPlaying, isGameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jump]);

  const experiences = r?.experience && r.experience.length > 0
    ? r.experience.map((exp) => ({
        year: exp.startDate || "",
        company: exp.company,
        role: exp.role,
        description: exp.description,
      }))
    : [
        {
          year: "2025",
          company: "Apple",
          role: "Staff Product Designer",
          description:
            "Leading design initiatives for core ecosystem products, focusing on seamless cross-device experiences and next-generation interface patterns.",
        },
        {
          year: "2024",
          company: "Apple",
          role: "Lead Product Designer",
          description:
            "Spearheaded the redesign of iCloud services, improving user engagement by 40% through simplified sharing workflows and enhanced visual hierarchy.",
        },
        {
          year: "2023",
          company: "Apple",
          role: "Product Designer II",
          description:
            "Contributed to the development of new accessibility features within iOS, ensuring inclusive design across all system-level components.",
        },
      ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      filter: "blur(10px)",
      y: 10,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98] as any,
      },
    },
  };

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-[#F0EDE7] dark:bg-[#1A1A1A] flex justify-center font-['Inter'] text-[#1A1A1A] dark:text-[#F0EDE7] selection:bg-[#1A1A1A] dark:selection:bg-[#F0EDE7] selection:text-[#F0EDE7] dark:selection:text-[#1A1A1A] transition-colors duration-700"
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
        .custom-dashed-x {
          position: relative;
        }
        .custom-dashed-x::before, .custom-dashed-x::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          background-image: linear-gradient(to bottom, #E5D7C4 50%, transparent 50%);
          background-size: 1px 10px;
          z-index: 0;
          pointer-events: none;
        }
        .dark .custom-dashed-x::before, .dark .custom-dashed-x::after {
          background-image: linear-gradient(to bottom, #3A352E 50%, transparent 50%);
        }
        .custom-dashed-x::before {
          left: 0;
        }
        .custom-dashed-x::after {
          right: 0;
        }
        .custom-dashed-t {
          height: 1px;
          width: 100%;
          background-image: linear-gradient(to right, #E5D7C4 50%, transparent 50%);
          background-size: 10px 1px;
        }
        .dark .custom-dashed-t {
          background-image: linear-gradient(to right, #3A352E 50%, transparent 50%);
        }
        .dino-color {
          fill: #535353;
        }
        .dark .dino-color {
          fill: #B5AFA5;
        }
        .custom-solid-x {
          position: relative;
        }
        .custom-solid-x::before, .custom-solid-x::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          background-color: #D5D0C6;
          pointer-events: none;
          z-index: 50;
        }
        .dark .custom-solid-x::before, .dark .custom-solid-x::after {
          background-color: #3A352E;
        }
        .custom-solid-x::before {
          left: 0;
        }
        .custom-solid-x::after {
          right: 0;
        }
      `,
          }}
        />
        <div className="w-full max-w-[640px] relative min-h-screen flex flex-col font-['Inter'] transition-colors duration-700 bg-[#F0EDE7] dark:bg-[#1A1A1A] custom-dashed-x">
          <>
            <SmoothCursor type="minimal" />
            {/* Header Section */}
            <motion.div
              variants={itemVariants}
              className="px-5 md:px-8 pt-12 md:pt-16 pb-6 relative group/section"
            >
              {isEditing && (
                <div className="absolute top-4 right-4 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                  </Button>
                </div>
              )}
              <div className="flex items-start justify-between gap-4 mb-6">
                <Avatar className="w-[80px] h-[80px] rounded-2xl">
                  <AvatarImage src={profileImg} className="object-cover" />
                  <AvatarFallback>M</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 mt-1">
                  <AnimatedThemeToggler />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 sm:gap-0">
                <div>
                  <h1 className="text-[24px] font-semibold mb-0.5 tracking-tight text-[#1A1A1A] dark:text-[#F0EDE7]">
                    Hey I'm {displayFirstName}.
                  </h1>
                  <p
                    className="text-[#7A736C] dark:text-[#B5AFA5] text-base"
                    style={{ fontWeight: 450 }}
                  >
                    {displayTitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  className="text-[13px] font-medium flex items-center gap-1.5 border-b border-[#1A1A1A] dark:border-[#F0EDE7] pb-0.5 hover:opacity-70 transition-opacity w-fit group/download text-[#1A1A1A] dark:text-[#F0EDE7]"
                  onMouseEnter={() => downloadRef.current?.startAnimation()}
                  onMouseLeave={() => downloadRef.current?.stopAnimation()}
                >
                  Download resume <DownloadIcon ref={downloadRef} size={14} />
                </button>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="custom-dashed-t"
            ></motion.div>

            {/* Contact Section */}
            <motion.div
              variants={itemVariants}
              className="px-5 md:px-8 py-4 flex justify-between items-center relative group/section"
            >
              {isEditing && (
                <div className="absolute top-1/2 -translate-y-1/2 right-4 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                  </Button>
                </div>
              )}
              {displayEmail && (
                <a
                  href={`mailto:${displayEmail}`}
                  className="flex items-center gap-2 text-base text-[#666666] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] transition-colors group"
                  onMouseEnter={() => atSignRef.current?.startAnimation()}
                  onMouseLeave={() => atSignRef.current?.stopAnimation()}
                >
                  <AtSignIcon
                    ref={atSignRef}
                    size={18}
                    className="transition-colors"
                  />
                  {displayEmail}
                </a>
              )}
              {!displayEmail && <div />}
              <div className="flex items-center gap-5 text-[#1A1A1A] dark:text-[#F0EDE7]">
                {displayDribbble && (
                  <a
                    href={displayDribbble}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-70 transition-opacity"
                    onMouseEnter={() => dribbbleRef.current?.startAnimation()}
                    onMouseLeave={() => dribbbleRef.current?.stopAnimation()}
                  >
                    <DribbbleIcon
                      ref={dribbbleRef}
                      size={16}
                      className="transition-colors"
                    />
                  </a>
                )}
                {displayTwitter && (
                  <a
                    href={displayTwitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-70 transition-opacity"
                    onMouseEnter={() => twitterRef.current?.startAnimation()}
                    onMouseLeave={() => twitterRef.current?.stopAnimation()}
                  >
                    <TwitterIcon
                      ref={twitterRef}
                      size={16}
                      className="transition-colors"
                    />
                  </a>
                )}
                {displayLinkedin && (
                  <a href={displayLinkedin} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                    <Linkedin size={16} />
                  </a>
                )}
                {displayGithub && (
                  <a href={displayGithub} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                    <Github size={16} />
                  </a>
                )}
                {displayWebsite && (
                  <a href={displayWebsite} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                    <Globe size={16} />
                  </a>
                )}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="custom-dashed-t"
            ></motion.div>

            {/* Intro Section */}
            <motion.div
              variants={itemVariants}
              className="px-5 md:px-8 py-8 relative group/section"
            >
              {isEditing && (
                <div className="absolute top-4 right-4 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                  </Button>
                </div>
              )}
              <h2 className="text-[14px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-['DM_Mono'] uppercase tracking-widest mb-4">
                Intro
              </h2>
              <p
                className="text-[#7A736C] dark:text-[#B5AFA5] leading-[1.7] text-base"
                style={{ fontWeight: 450 }}
              >
                {displayAbout}
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="custom-dashed-t"
            ></motion.div>

            {/* Experience Section */}
            <motion.div
              variants={itemVariants}
              className="px-5 md:px-8 py-8 relative group/section"
            >
              {isEditing && (
                <div className="absolute top-4 right-4 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100 flex gap-2">
                  <Sheet
                    modal={false}
                    open={isExperiencePanelOpen}
                    onOpenChange={setIsExperiencePanelOpen}
                  >
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      className="border-l border-black/10 dark:border-white/10 bg-white dark:bg-[#2A2520] p-0 flex flex-col"
                      hasOverlay={false}
                      onInteractOutside={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <SheetHeader className="px-5 py-4 border-b border-black/10 dark:border-white/10 flex-shrink-0 flex flex-row items-center m-0 space-y-0 h-[65px]">
                        <SheetTitle className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] font-medium m-0">
                          Add Experience
                        </SheetTitle>
                      </SheetHeader>

                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="exp-company"
                              className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1"
                            >
                              Company
                            </Label>
                            <Input
                              id="exp-company"
                              placeholder="e.g. Apple"
                              className="h-10 bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all px-3.5 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="exp-role"
                              className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1"
                            >
                              Role
                            </Label>
                            <Input
                              id="exp-role"
                              placeholder="e.g. Product Designer"
                              className="h-10 bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all px-3.5 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="exp-year"
                              className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1"
                            >
                              Year
                            </Label>
                            <Input
                              id="exp-year"
                              placeholder="e.g. 2020 - Present"
                              className="h-10 bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all px-3.5 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="exp-desc"
                              className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1"
                            >
                              Description
                            </Label>
                            <textarea
                              id="exp-desc"
                              rows={4}
                              placeholder="What did you do?"
                              className="w-full bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all p-3.5 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30 resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-5 border-t border-black/10 dark:border-white/10 flex justify-end gap-3 flex-shrink-0 bg-white dark:bg-[#2A2520]">
                        <SheetClose asChild>
                          <Button
                            variant="outline"
                            className="h-9 px-4 rounded-full text-[13px] font-medium border-black/10 dark:border-white/10 text-[#1A1A1A] dark:text-[#F0EDE7] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          >
                            Cancel
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button className="h-9 px-5 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm">
                            Add Experience
                          </Button>
                        </SheetClose>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              )}
              <h2 className="text-[14px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-['DM_Mono'] uppercase tracking-widest mb-4">
                Experience
              </h2>
              <div className="space-y-1">
                {experiences.map((exp, index) => (
                  <div
                    key={index}
                    className="rounded-lg transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.05] -mx-3 px-3 relative group/item"
                  >
                    {isEditing && (
                      <div className="absolute top-2.5 right-3 z-20 transition-opacity flex gap-2 opacity-100 md:opacity-0 md:group-hover/item:opacity-100">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                        </Button>
                      </div>
                    )}
                    <button
                      onClick={() =>
                        setExpandedIndex(expandedIndex === index ? null : index)
                      }
                      className="w-full flex justify-between items-center py-2.5 text-base group"
                    >
                      <div className="flex items-center gap-3">
                        <motion.span
                          animate={{ rotate: expandedIndex === index ? 45 : 0 }}
                          className="text-[#888888] dark:text-[#7A736C] font-light text-lg leading-none mt-[1px] transition-colors group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                        >
                          +
                        </motion.span>
                        <span className="text-[#1A1A1A] dark:text-[#F0EDE7]">
                          <span className="text-[#7A736C] dark:text-[#9E9893]">
                            {exp.year} /{" "}
                          </span>
                          {exp.company}
                        </span>
                      </div>
                      <span className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7] transition-colors">
                        {exp.role}
                      </span>
                    </button>
                    <AnimatePresence>
                      {expandedIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: 0.3,
                            ease: [0.23, 1, 0.32, 1],
                          }}
                          className="overflow-hidden"
                        >
                          <div className="pb-4 pl-7 pr-4">
                            <motion.p
                              variants={{
                                hidden: { opacity: 0 },
                                show: {
                                  opacity: 1,
                                  transition: {
                                    staggerChildren: 0.015,
                                  },
                                },
                              }}
                              initial="hidden"
                              animate="show"
                              className="text-[#7A736C] dark:text-[#B5AFA5] text-[15px] leading-relaxed break-words whitespace-normal"
                            >
                              {exp.description
                                .split(" ")
                                .map((word, wordIndex) => (
                                  <span
                                    key={wordIndex}
                                    className="inline-block whitespace-nowrap"
                                  >
                                    {word.split("").map((char, charIndex) => (
                                      <motion.span
                                        key={charIndex}
                                        variants={{
                                          hidden: {
                                            opacity: 0,
                                            filter: "blur(10px)",
                                          },
                                          show: {
                                            opacity: 1,
                                            filter: "blur(0px)",
                                          },
                                        }}
                                        transition={{ duration: 0.3 }}
                                        className="inline-block"
                                      >
                                        {char}
                                      </motion.span>
                                    ))}
                                    {/* Add space after each word except the last one */}
                                    {wordIndex <
                                      exp.description.split(" ").length - 1 && (
                                      <span className="inline-block">
                                        &nbsp;
                                      </span>
                                    )}
                                  </span>
                                ))}
                            </motion.p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="custom-dashed-t"
            ></motion.div>

            {/* Projects Section */}
            <motion.div
              variants={itemVariants}
              className="px-5 md:px-8 py-8 pb-16 relative group/section"
            >
              {isEditing && (
                <div
                  className={`absolute top-4 right-4 z-10 transition-opacity flex gap-2 ${
                    isProjectsAddDropdownOpen
                      ? "opacity-100"
                      : "opacity-100 md:opacity-0 md:group-hover/section:opacity-100"
                  }`}
                >
                  <Sheet
                    modal={false}
                    open={isProjectsRearrangeOpen}
                    onOpenChange={setIsProjectsRearrangeOpen}
                  >
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
                      >
                        <ChevronsUpDown className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      className="border-l border-black/10 dark:border-white/10 bg-white dark:bg-[#2A2520] p-0 flex flex-col"
                      hasOverlay={false}
                      onInteractOutside={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <SheetHeader className="px-5 py-4 border-b border-black/10 dark:border-white/10 flex-shrink-0 flex flex-row items-center m-0 space-y-0 h-[65px]">
                        <SheetTitle className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] font-medium m-0">
                          Rearrange Projects
                        </SheetTitle>
                      </SheetHeader>

                      <div className="flex-1 overflow-y-auto p-6 space-y-3">
                        <Reorder.Group
                          axis="y"
                          values={projects}
                          onReorder={setProjects}
                          className="space-y-3"
                        >
                          {projects.map((proj) => (
                            <Reorder.Item
                              key={proj.id}
                              value={proj}
                              className="flex items-center gap-3 p-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-xl cursor-grab active:cursor-grabbing hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors relative bg-white dark:bg-[#2A2520]"
                              whileDrag={{
                                scale: 1.02,
                                zIndex: 10,
                                boxShadow:
                                  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                              }}
                            >
                              <GripVertical className="w-4 h-4 text-[#7A736C] dark:text-[#9E9893]" />
                              <div className="w-12 h-10 rounded-md overflow-hidden bg-black/5 shrink-0">
                                <img
                                  src={proj.image}
                                  alt={proj.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] truncate">
                                  {proj.title}
                                </span>
                                <span className="text-[11px] text-[#7A736C] dark:text-[#9E9893] truncate">
                                  {proj.description}
                                </span>
                              </div>
                            </Reorder.Item>
                          ))}
                        </Reorder.Group>
                      </div>

                      <div className="p-5 border-t border-black/10 dark:border-white/10 flex justify-end gap-3 flex-shrink-0 bg-white dark:bg-[#2A2520]">
                        <SheetClose asChild>
                          <Button className="h-9 px-5 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm">
                            Done
                          </Button>
                        </SheetClose>
                      </div>
                    </SheetContent>
                  </Sheet>

                  <DropdownMenu
                    open={isProjectsAddDropdownOpen}
                    onOpenChange={setIsProjectsAddDropdownOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 bg-white dark:bg-[#2A2520] border border-black/10 dark:border-white/10 shadow-lg rounded-xl overflow-hidden p-1"
                    >
                      <DropdownMenuItem
                        onClick={() => setIsProjectsPanelOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer rounded-lg focus:bg-black/5 dark:focus:bg-white/5"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Write from Scratch</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setIsProjectsPanelOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer rounded-lg focus:bg-black/5 dark:focus:bg-white/5"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                        <span>Write using AI</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Sheet
                    modal={false}
                    open={isProjectsPanelOpen}
                    onOpenChange={setIsProjectsPanelOpen}
                  >
                    <SheetContent
                      className="border-l border-black/10 dark:border-white/10 bg-white dark:bg-[#2A2520] p-0 flex flex-col"
                      hasOverlay={false}
                      onInteractOutside={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <SheetHeader className="px-5 py-4 border-b border-black/10 dark:border-white/10 flex-shrink-0 flex flex-row items-center m-0 space-y-0 h-[65px]">
                        <SheetTitle className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] font-medium m-0">
                          Add Project
                        </SheetTitle>
                      </SheetHeader>

                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="proj-title"
                              className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1"
                            >
                              Project Title
                            </Label>
                            <Input
                              id="proj-title"
                              placeholder="e.g. Slate"
                              className="h-10 bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all px-3.5 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="proj-desc"
                              className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1"
                            >
                              Description
                            </Label>
                            <textarea
                              id="proj-desc"
                              rows={3}
                              placeholder="Short description of the project"
                              className="w-full bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all p-3.5 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30 resize-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1">
                              Cover Image
                            </Label>
                            <div className="flex items-center gap-4">
                              <div className="w-24 h-16 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 flex items-center justify-center overflow-hidden">
                                <Plus className="w-5 h-5 text-[#7A736C] dark:text-[#9E9893]" />
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-full text-[12px] border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                              >
                                Upload Image
                              </Button>
                            </div>
                          </div>

                          <div className="pt-2">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1">
                                  Protect Project
                                </Label>
                                <p className="text-[12px] text-[#7A736C] dark:text-[#9E9893] ml-1">
                                  Require a password to view this project (e.g.,
                                  for NDAs).
                                </p>
                              </div>
                              <Switch
                                checked={isProjectPasswordEnabled}
                                onCheckedChange={setIsProjectPasswordEnabled}
                              />
                            </div>
                            <AnimatePresence>
                              {isProjectPasswordEnabled && (
                                <motion.div
                                  initial={{
                                    opacity: 0,
                                    height: 0,
                                    marginTop: 0,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    height: "auto",
                                    marginTop: 12,
                                  }}
                                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="space-y-1.5 px-1">
                                    <Input
                                      id="proj-password"
                                      type="password"
                                      placeholder="Enter password"
                                      className="h-10 bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all px-3.5 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30"
                                    />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 border-t border-black/10 dark:border-white/10 flex justify-end gap-3 flex-shrink-0 bg-white dark:bg-[#2A2520]">
                        <SheetClose asChild>
                          <Button
                            variant="outline"
                            className="h-9 px-4 rounded-full text-[13px] font-medium border-black/10 dark:border-white/10 text-[#1A1A1A] dark:text-[#F0EDE7] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          >
                            Cancel
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button className="h-9 px-5 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm">
                            Add Project
                          </Button>
                        </SheetClose>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              )}
              <h2 className="text-[14px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-['DM_Mono'] uppercase tracking-widest mb-4">
                Projects
              </h2>

              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-white/50 dark:bg-[#2A2520]/50 backdrop-blur-sm">
                  <div className="w-12 h-12 rounded-full bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-[#7A736C] dark:text-[#9E9893]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <h3 className="text-[15px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mb-1">
                    No projects yet
                  </h3>
                  <p className="text-[13px] text-[#7A736C] dark:text-[#9E9893] max-w-[250px] mb-5">
                    Add some projects to showcase your work and experience.
                  </p>
                  {isEditing && (
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <Button
                        onClick={() => setIsProjectsPanelOpen(true)}
                        className="h-9 px-5 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Write from Scratch
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsProjectsPanelOpen(true)}
                        className="h-9 px-5 rounded-full text-[13px] font-medium bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors flex items-center gap-2 text-[#1A1A1A] dark:text-[#F0EDE7]"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                        Write using AI
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <CursorProvider>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-8">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => handleProjectClick(project.slug)}
                        className="group cursor-pointer flex flex-col p-4 -m-4 rounded-2xl hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-all duration-300 relative"
                      >
                        {isEditing && (
                          <div
                            className="absolute top-8 right-8 z-10 transition-opacity flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-black/10 dark:border-white/10 shadow-sm hover:bg-white dark:hover:bg-[#35302A]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                            </Button>
                            <div onClick={(e) => e.stopPropagation()}>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-black/10 dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7] group-hover/btn:text-red-600" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent
                                  onClick={(e) => e.stopPropagation()}
                                  className="bg-[#F0EDE7] dark:bg-[#1A1A1A] border-black/10 dark:border-white/10 rounded-2xl p-6 gap-6 max-w-md w-[90vw]"
                                >
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-xl font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
                                      Delete Project
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-[15px] text-[#7A736C] dark:text-[#B5AFA5]">
                                      Are you sure you want to delete "
                                      {project.title}"? This action cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="gap-3 sm:gap-2">
                                    <AlertDialogCancel className="rounded-xl border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[#1A1A1A] dark:text-[#F0EDE7] m-0 h-11 px-6">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setProjects(
                                          projects.filter(
                                            (p) => p.id !== project.id,
                                          ),
                                        );
                                      }}
                                      className="rounded-xl bg-red-600 text-white hover:bg-red-700 m-0 h-11 px-6 border-none shadow-none"
                                    >
                                      Delete Project
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        )}
                        <div className="rounded-xl overflow-hidden mb-4 aspect-[4/3] bg-white dark:bg-[#2A2520] drop-shadow-sm border border-black/5 dark:border-white/10 group-hover:border-black/10 dark:group-hover:border-white/20 transition-colors">
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <h3 className="font-medium text-base mb-1.5 text-[#1A1A1A] dark:text-[#F0EDE7]">
                          {project.title}
                        </h3>
                        <p
                          className="text-base text-[#7A736C] dark:text-[#B5AFA5] leading-relaxed"
                          style={{ fontWeight: 450 }}
                        >
                          {project.description}
                        </p>
                      </div>
                    ))}
                  </div>
                  <CursorFollow>
                    <div className="bg-[#1A1A1A] dark:bg-[#F0EDE7] text-[#F0EDE7] dark:text-[#1A1A1A] px-3 py-1.5 rounded-full text-[13px] font-medium shadow-2xl flex items-center gap-1.5">
                      View Project <ArrowUpRight size={14} />
                    </div>
                  </CursorFollow>
                </CursorProvider>
              )}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="custom-dashed-t"
            ></motion.div>

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="px-5 md:px-8 py-8 relative group/section"
            >
              {isEditing && (
                <div className="absolute top-4 right-4 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100 flex gap-2">
                  <Sheet
                    modal={false}
                    open={isRecommendationsRearrangeOpen}
                    onOpenChange={setIsRecommendationsRearrangeOpen}
                  >
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
                      >
                        <ChevronsUpDown className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      className="border-l border-black/10 dark:border-white/10 bg-white dark:bg-[#2A2520] p-0 flex flex-col"
                      hasOverlay={false}
                      onInteractOutside={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <SheetHeader className="px-5 py-4 border-b border-black/10 dark:border-white/10 flex-shrink-0 flex flex-row items-center m-0 space-y-0 h-[65px]">
                        <SheetTitle className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] font-medium m-0">
                          Rearrange Recommendations
                        </SheetTitle>
                      </SheetHeader>

                      <div className="flex-1 overflow-y-auto p-6 space-y-3">
                        <Reorder.Group
                          axis="y"
                          values={recommendations}
                          onReorder={setRecommendations}
                          className="space-y-3"
                        >
                          {recommendations.map((rec) => (
                            <Reorder.Item
                              key={rec.id}
                              value={rec}
                              className="flex items-center gap-3 p-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-xl cursor-grab active:cursor-grabbing hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors relative bg-white dark:bg-[#2A2520]"
                              whileDrag={{
                                scale: 1.02,
                                zIndex: 10,
                                boxShadow:
                                  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                              }}
                            >
                              <GripVertical className="w-4 h-4 text-[#7A736C] dark:text-[#9E9893]" />
                              <Avatar className="w-8 h-8 rounded-full">
                                <AvatarImage
                                  src={rec.image}
                                  className="object-cover"
                                />
                                <AvatarFallback>{rec.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] truncate">
                                  {rec.name}
                                </span>
                                <span className="text-[11px] text-[#7A736C] dark:text-[#9E9893] truncate">
                                  {rec.role}
                                </span>
                              </div>
                            </Reorder.Item>
                          ))}
                        </Reorder.Group>
                      </div>

                      <div className="p-5 border-t border-black/10 dark:border-white/10 flex justify-end gap-3 flex-shrink-0 bg-white dark:bg-[#2A2520]">
                        <SheetClose asChild>
                          <Button className="h-9 px-5 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm">
                            Done
                          </Button>
                        </SheetClose>
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Sheet
                    modal={false}
                    open={isRecommendationsPanelOpen}
                    onOpenChange={setIsRecommendationsPanelOpen}
                  >
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      className="border-l border-black/10 dark:border-white/10 bg-white dark:bg-[#2A2520] p-0 flex flex-col"
                      hasOverlay={false}
                      onInteractOutside={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <SheetHeader className="px-5 py-4 border-b border-black/10 dark:border-white/10 flex-shrink-0 flex flex-row items-center m-0 space-y-0 h-[65px]">
                        <SheetTitle className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] font-medium m-0">
                          Add Recommendation
                        </SheetTitle>
                      </SheetHeader>

                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="rec-name"
                              className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1"
                            >
                              Name
                            </Label>
                            <Input
                              id="rec-name"
                              placeholder="e.g. Jane Doe"
                              className="h-10 bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all px-3.5 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="rec-role"
                              className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1"
                            >
                              Role & Company
                            </Label>
                            <Input
                              id="rec-role"
                              placeholder="e.g. Design Lead at Apple"
                              className="h-10 bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all px-3.5 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="rec-content"
                              className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1"
                            >
                              Recommendation Text
                            </Label>
                            <textarea
                              id="rec-content"
                              rows={4}
                              placeholder="What did they say about you?"
                              className="w-full bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all p-3.5 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30 resize-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1">
                              Profile Photo
                            </Label>
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 flex items-center justify-center overflow-hidden">
                                <Plus className="w-5 h-5 text-[#7A736C] dark:text-[#9E9893]" />
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-full text-[12px] border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                              >
                                Upload Photo
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 border-t border-black/10 dark:border-white/10 flex justify-end gap-3 flex-shrink-0 bg-white dark:bg-[#2A2520]">
                        <SheetClose asChild>
                          <Button
                            variant="outline"
                            className="h-9 px-4 rounded-full text-[13px] font-medium border-black/10 dark:border-white/10 text-[#1A1A1A] dark:text-[#F0EDE7] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          >
                            Cancel
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button className="h-9 px-5 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm">
                            Add Recommendation
                          </Button>
                        </SheetClose>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              )}
              <h2 className="text-[14px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-['DM_Mono'] uppercase tracking-widest mb-6">
                Recommendations
              </h2>

              {recommendations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-white/50 dark:bg-[#2A2520]/50 backdrop-blur-sm">
                  <div className="w-12 h-12 rounded-full bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-[#7A736C] dark:text-[#9E9893]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-[15px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mb-1">
                    No recommendations yet
                  </h3>
                  <p className="text-[13px] text-[#7A736C] dark:text-[#9E9893] max-w-[250px] mb-5">
                    Add recommendations to build trust and credibility.
                  </p>
                  {isEditing && (
                    <Button
                      onClick={() => setIsRecommendationsPanelOpen(true)}
                      className="h-9 px-4 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm"
                    >
                      Add Testimonial
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-white dark:bg-[#2A2520] rounded-[16px] border border-black/5 dark:border-white/10 drop-shadow-sm overflow-hidden group/card relative"
                    >
                      {isEditing && (
                        <div className="absolute top-3 right-3 z-20 transition-opacity flex gap-2 opacity-100 md:opacity-0 md:group-hover/card:opacity-100">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-black/10 dark:border-white/10 shadow-sm hover:bg-white dark:hover:bg-[#35302A]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                          </Button>
                          <div onClick={(e) => e.stopPropagation()}>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-black/10 dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7] group-hover/btn:text-red-600" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent
                                onClick={(e) => e.stopPropagation()}
                                className="bg-[#F0EDE7] dark:bg-[#1A1A1A] border-black/10 dark:border-white/10 rounded-2xl p-6 gap-6 max-w-md w-[90vw]"
                              >
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-xl font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
                                    Delete Recommendation
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-[15px] text-[#7A736C] dark:text-[#B5AFA5]">
                                    Are you sure you want to delete this
                                    recommendation from {rec.name}? This action
                                    cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="gap-3 sm:gap-2">
                                  <AlertDialogCancel className="rounded-xl border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[#1A1A1A] dark:text-[#F0EDE7] m-0 h-11 px-6">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRecommendations(
                                        recommendations.filter(
                                          (r) => r.id !== rec.id,
                                        ),
                                      );
                                    }}
                                    className="rounded-xl bg-red-600 text-white hover:bg-red-700 m-0 h-11 px-6 border-none shadow-none"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between items-center px-6 py-4">
                        <div className="flex flex-col">
                          <h3 className="font-medium text-base text-[#1A1A1A] dark:text-[#F0EDE7] mb-1">
                            {rec.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <svg
                              viewBox="0 0 24 24"
                              className="w-4 h-4 text-black dark:text-[#F0EDE7] transition-colors duration-200 hover:text-[#0077B5] dark:hover:text-[#87CEEB] cursor-pointer"
                              fill="currentColor"
                            >
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                            <span className="text-[13px] text-[#7A736C] dark:text-[#9E9893]">
                              {rec.role}
                            </span>
                          </div>
                        </div>
                        <Avatar className="w-[80px] h-[80px] rounded-none -mr-6 -my-4 transition-all duration-700">
                          <AvatarImage
                            src={rec.image}
                            className="object-cover"
                          />
                          <AvatarFallback>{rec.name[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="p-0">
                        <div className="border border-dashed border-[#E5D7C4] dark:border-[#3A352E] rounded-[12px] p-4">
                          <p
                            className="text-[#7A736C] dark:text-[#B5AFA5] text-sm md:text-[15px] leading-relaxed"
                            style={{ fontWeight: 450 }}
                          >
                            {rec.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
            )}

            {recommendations.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="custom-dashed-t"
            ></motion.div>
            )}

            {/* My Story Section */}
            <motion.div
              variants={itemVariants}
              className="px-5 md:px-8 py-8 pb-16 relative group/section"
            >
              {isEditing && (
                <div className="absolute top-4 right-4 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100">
                  <Sheet
                    modal={false}
                    open={isMyStoryPanelOpen}
                    onOpenChange={setIsMyStoryPanelOpen}
                  >
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      className="border-l border-black/10 dark:border-white/10 bg-white dark:bg-[#2A2520] p-0 flex flex-col"
                      hasOverlay={false}
                      onInteractOutside={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <SheetHeader className="px-5 py-4 border-b border-black/10 dark:border-white/10 flex-shrink-0 flex flex-row items-center m-0 space-y-0 h-[65px]">
                        <SheetTitle className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] font-medium m-0">
                          Edit My Story
                        </SheetTitle>
                      </SheetHeader>

                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="story-text"
                              className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1"
                            >
                              Your Story
                            </Label>
                            <textarea
                              id="story-text"
                              rows={8}
                              defaultValue={
                                "I'm David Simmons, a passionate digital designer and no-code developer who bridges creativity with technology. Currently exploring new ways to craft meaningful digital experiences, I'm driven by curiosity and a love for clean, purposeful design.\n\nI thrive on transforming ideas into reality — whether it's shaping intuitive interfaces, crafting distinctive brand identities, designing immersive visuals, or building websites that feel effortless to use."
                              }
                              className="w-full bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all p-3.5 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30 resize-y min-h-[120px]"
                            />
                          </div>

                          <div className="space-y-3 pt-2">
                            <Label className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1">
                              Story Images
                            </Label>
                            <div className="grid grid-cols-2 gap-3">
                              {storyImages.map((imgSrc, i) => (
                                <div
                                  key={i}
                                  className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer border border-black/5 dark:border-white/5 shadow-sm"
                                >
                                  <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    accept="image/*"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                          if (event.target?.result) {
                                            const newImages = [...storyImages];
                                            newImages[i] = event.target
                                              .result as string;
                                            setStoryImages(newImages);
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                  <img
                                    src={imgSrc}
                                    alt={`Story image ${i + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 dark:group-hover:bg-black/40 transition-colors duration-300 pointer-events-none" />
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100 pointer-events-none z-0">
                                    <div className="bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-md px-3.5 py-2 rounded-full flex items-center gap-1.5 shadow-lg border border-black/5 dark:border-white/10">
                                      <Plus className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                                      <span className="text-[11px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
                                        Replace
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 border-t border-black/10 dark:border-white/10 flex justify-end gap-3 flex-shrink-0 bg-white dark:bg-[#2A2520]">
                        <SheetClose asChild>
                          <Button
                            variant="outline"
                            className="h-9 px-4 rounded-full text-[13px] font-medium border-black/10 dark:border-white/10 text-[#1A1A1A] dark:text-[#F0EDE7] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          >
                            Cancel
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button className="h-9 px-5 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm">
                            Save Changes
                          </Button>
                        </SheetClose>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              )}
              <h2 className="text-[14px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-['DM_Mono'] uppercase tracking-widest mb-6">
                My Story
              </h2>

              <div className="relative mb-8 h-56 flex items-center justify-center">
                <motion.div
                  initial={{ rotate: -8, x: -120, y: 0 }}
                  whileHover={{ rotate: -2, scale: 1.1, zIndex: 50 }}
                  className="absolute w-32 h-40 rounded-xl overflow-hidden border-4 border-white dark:border-[#2A2520] shadow-lg z-0"
                >
                  <img
                    src={storyImages[0]}
                    alt="My workspace"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.div
                  initial={{ rotate: 12, x: -40, y: 15 }}
                  whileHover={{ rotate: 5, scale: 1.1, zIndex: 50 }}
                  className="absolute w-36 h-36 rounded-xl overflow-hidden border-4 border-white dark:border-[#2A2520] shadow-lg z-10"
                >
                  <img
                    src={storyImages[1]}
                    alt="Designing"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.div
                  initial={{ rotate: -5, x: 40, y: -10 }}
                  whileHover={{ rotate: 0, scale: 1.1, zIndex: 50 }}
                  className="absolute w-32 h-40 rounded-xl overflow-hidden border-4 border-white dark:border-[#2A2520] shadow-lg z-20"
                >
                  <img
                    src={storyImages[2]}
                    alt="Coffee and notes"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.div
                  initial={{ rotate: 8, x: 120, y: 20 }}
                  whileHover={{ rotate: 3, scale: 1.1, zIndex: 50 }}
                  className="absolute w-36 h-36 rounded-xl overflow-hidden border-4 border-white dark:border-[#2A2520] shadow-lg z-30"
                >
                  <img
                    src={storyImages[3]}
                    alt="Creative studio"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>

              <div className="space-y-6 text-[#7A736C] dark:text-[#B5AFA5] text-base leading-[1.7]">
                {displayAbout.split('\n').filter(Boolean).map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="custom-dashed-t"
            ></motion.div>

            {/* Stack Section */}
            <motion.div
              variants={itemVariants}
              className="px-5 md:px-8 py-8 relative group/section"
            >
              {isEditing && (
                <div className="absolute top-4 right-4 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100">
                  <Sheet
                    modal={false}
                    open={isStackPanelOpen}
                    onOpenChange={setIsStackPanelOpen}
                  >
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      className="border-l border-black/10 dark:border-white/10 bg-white dark:bg-[#2A2520] p-0 flex flex-col"
                      hasOverlay={false}
                      onInteractOutside={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <SheetHeader className="px-5 py-4 border-b border-black/10 dark:border-white/10 flex-shrink-0 flex flex-row items-center m-0 space-y-0 h-[65px]">
                        <SheetTitle className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] font-medium m-0">
                          Edit Stack
                        </SheetTitle>
                      </SheetHeader>

                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="space-y-3">
                          <Label className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1">
                            Search Tools
                          </Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A736C] dark:text-[#9E9893]" />
                            <Input
                              placeholder="Search for a tool..."
                              value={toolSearchQuery}
                              onChange={(e) =>
                                setToolSearchQuery(e.target.value)
                              }
                              className="h-10 pl-9 bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all shadow-none placeholder:text-black/30 dark:placeholder:text-white/30"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {allTools
                              .filter((t) =>
                                t.name
                                  .toLowerCase()
                                  .includes(toolSearchQuery.toLowerCase()),
                              )
                              .sort((a, b) => {
                                const isASelected = activeTools.some(
                                  (t) => t.name === a.name,
                                );
                                const isBSelected = activeTools.some(
                                  (t) => t.name === b.name,
                                );
                                if (isASelected === isBSelected)
                                  return a.name.localeCompare(b.name);
                                return isASelected ? -1 : 1;
                              })
                              .map((tool) => {
                                const isSelected = activeTools.some(
                                  (t) => t.name === tool.name,
                                );
                                return (
                                  <motion.button
                                    layout
                                    transition={{
                                      type: "spring",
                                      stiffness: 400,
                                      damping: 25,
                                    }}
                                    key={`tool-${tool.name}`}
                                    onClick={() =>
                                      isSelected
                                        ? handleRemoveTool(tool)
                                        : handleAddTool(tool)
                                    }
                                    className={`group h-[34px] px-3.5 rounded-xl flex items-center gap-2.5 text-[13px] font-medium transition-colors border ${
                                      isSelected
                                        ? "bg-[#EFECE6] dark:bg-[#1A1A1A] border-black/5 dark:border-white/5 text-[#1A1A1A] dark:text-[#F0EDE7] shadow-sm"
                                        : "bg-transparent border-transparent text-[#7A736C] dark:text-[#9E9893] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7]"
                                    }`}
                                  >
                                    <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                                      <img
                                        src={tool.icon}
                                        alt={tool.name}
                                        className={`absolute inset-0 w-4 h-4 object-contain transition-all duration-200 ${
                                          isSelected
                                            ? "grayscale-0 opacity-100"
                                            : "grayscale opacity-50 group-hover:opacity-0 group-hover:scale-50 group-hover:-rotate-45"
                                        }`}
                                      />
                                      {!isSelected && (
                                        <Plus className="absolute inset-0 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-200 scale-50 group-hover:scale-100 rotate-45 group-hover:rotate-0" />
                                      )}
                                    </div>
                                    {tool.name}
                                  </motion.button>
                                );
                              })}
                          </div>
                        </div>
                      </div>

                      <div className="p-5 border-t border-black/10 dark:border-white/10 flex justify-end gap-3 flex-shrink-0 bg-white dark:bg-[#2A2520]">
                        <SheetClose asChild>
                          <Button
                            variant="outline"
                            className="h-9 px-4 rounded-full text-[13px] font-medium border-black/10 dark:border-white/10 text-[#1A1A1A] dark:text-[#F0EDE7] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          >
                            Close
                          </Button>
                        </SheetClose>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              )}
              <h2 className="text-[14px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-['DM_Mono'] uppercase tracking-widest mb-6">
                Stack
              </h2>
              <div className="flex flex-wrap gap-6 items-center">
                {activeTools.map((tool, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -4 }}
                    className="w-8 h-8 flex items-center justify-center cursor-pointer relative group/tool"
                  >
                    {isEditing && (
                      <div className="absolute -top-3 -right-3 z-20 transition-opacity flex gap-1 opacity-100 md:opacity-0 md:group-hover/tool:opacity-100">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-black/10 dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="w-2.5 h-2.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                        </Button>
                      </div>
                    )}
                    <img
                      src={tool.icon}
                      alt={tool.name}
                      className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="custom-dashed-t"
            ></motion.div>

            {/* Contact Section (Grid) */}
            <motion.div
              variants={itemVariants}
              className="px-5 md:px-8 py-8 relative group/section"
            >
              {isEditing && (
                <div className="absolute top-4 right-4 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100">
                  <Sheet
                    modal={false}
                    open={isContactPanelOpen}
                    onOpenChange={setIsContactPanelOpen}
                  >
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      className="border-l border-black/10 dark:border-white/10 bg-white dark:bg-[#2A2520] p-0 flex flex-col"
                      hasOverlay={false}
                      onInteractOutside={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <SheetHeader className="px-5 py-4 border-b border-black/10 dark:border-white/10 flex-shrink-0 flex flex-row items-center m-0 space-y-0 h-[65px]">
                        <SheetTitle className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] font-medium m-0">
                          Edit Contact Information
                        </SheetTitle>
                      </SheetHeader>

                      <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        <div className="space-y-4">
                          <div className="text-[12px] font-semibold text-[#7A736C] dark:text-[#9E9893] uppercase tracking-wider px-1">
                            Primary Contact
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <Label
                                htmlFor="email"
                                className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1"
                              >
                                Email Address
                              </Label>
                              <Input
                                id="email"
                                defaultValue="hello@example.com"
                                className="h-10 bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all px-3.5 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label
                                htmlFor="phone"
                                className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1"
                              >
                                Phone Number
                              </Label>
                              <Input
                                id="phone"
                                defaultValue="+1 (555) 123-4567"
                                className="h-10 bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all px-3.5 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1">
                                Resume
                              </Label>
                              <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden group ${
                                  isDraggingResume
                                    ? "bg-black/[0.05] dark:bg-white/[0.05] border-[#1A1A1A] dark:border-[#F0EDE7]"
                                    : "bg-black/[0.03] dark:bg-white/[0.03] border-black/10 dark:border-white/10 hover:bg-black/[0.05] dark:hover:bg-white/[0.05]"
                                }`}
                              >
                                <input
                                  type="file"
                                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                  accept=".pdf,.doc,.docx"
                                  onChange={handleFileSelect}
                                />
                                {resumeFile ? (
                                  <>
                                    <div className="w-10 h-10 rounded-full bg-[#1A1A1A] dark:bg-[#F0EDE7] shadow-sm flex items-center justify-center text-white dark:text-[#1A1A1A]">
                                      <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] flex flex-col items-center max-w-[80%]">
                                      <span className="truncate w-full text-center">
                                        {resumeFile.name}
                                      </span>
                                      <span className="text-[10px] text-[#7A736C] dark:text-[#9E9893] mt-0.5">
                                        Click or drag to replace
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div
                                      className={`w-10 h-10 rounded-full bg-white dark:bg-[#2A2520] shadow-sm flex items-center justify-center transition-all ${
                                        isDraggingResume
                                          ? "text-[#1A1A1A] dark:text-[#F0EDE7] scale-110"
                                          : "text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7] group-hover:scale-110"
                                      }`}
                                    >
                                      <Download className="w-5 h-5" />
                                    </div>
                                    <div className="text-[12px] font-medium text-[#7A736C] dark:text-[#9E9893]">
                                      <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-semibold underline decoration-black/20 dark:decoration-white/20 underline-offset-2">
                                        Click to upload
                                      </span>{" "}
                                      or drag and drop
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="text-[12px] font-semibold text-[#7A736C] dark:text-[#9E9893] uppercase tracking-wider px-1">
                            Social Links
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <Label
                                htmlFor="linkedin"
                                className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1"
                              >
                                LinkedIn URL
                              </Label>
                              <Input
                                id="linkedin"
                                defaultValue="https://linkedin.com/in/username"
                                className="h-10 bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all px-3.5 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label
                                htmlFor="dribbble"
                                className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1"
                              >
                                Dribbble URL
                              </Label>
                              <Input
                                id="dribbble"
                                defaultValue="https://dribbble.com/username"
                                className="h-10 bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all px-3.5 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label
                                htmlFor="twitter"
                                className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1"
                              >
                                X (Twitter) URL
                              </Label>
                              <Input
                                id="twitter"
                                defaultValue="https://x.com/username"
                                className="h-10 bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all px-3.5 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label
                                htmlFor="medium"
                                className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1"
                              >
                                Medium URL
                              </Label>
                              <Input
                                id="medium"
                                defaultValue="https://medium.com/@username"
                                className="h-10 bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all px-3.5 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 border-t border-black/10 dark:border-white/10 flex justify-end gap-3 flex-shrink-0 bg-white dark:bg-[#2A2520]">
                        <SheetClose asChild>
                          <Button
                            variant="outline"
                            className="h-9 px-4 rounded-full text-[13px] font-medium border-black/10 dark:border-white/10 text-[#1A1A1A] dark:text-[#F0EDE7] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          >
                            Cancel
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button className="h-9 px-5 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm">
                            Save Changes
                          </Button>
                        </SheetClose>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              )}
              <h2 className="text-[14px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-['DM_Mono'] uppercase tracking-widest mb-6">
                Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {displayEmail && (
                <motion.div
                  whileHover="hover"
                  initial="rest"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { navigator.clipboard.writeText(displayEmail); }}
                    className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-[#2A2520] rounded-xl border border-black/5 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors group h-auto"
                  >
                    <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
                      Copy mail
                    </span>
                    <motion.div
                      variants={{
                        rest: { scale: 1, rotate: 0 },
                        hover: { scale: 1.3, rotate: 15 },
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <AtSignIcon
                        size={14}
                        className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                      />
                    </motion.div>
                  </Button>
                </motion.div>
                )}
                {displayPhone && (
                <motion.div
                  whileHover="hover"
                  initial="rest"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { navigator.clipboard.writeText(displayPhone); }}
                    className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-[#2A2520] rounded-xl border border-black/5 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors group h-auto"
                  >
                    <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
                      Copy phone
                    </span>
                    <motion.div
                      variants={{
                        rest: { scale: 1, rotate: 0 },
                        hover: { scale: 1.3, rotate: -15 },
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <Phone
                        size={14}
                        className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                      />
                    </motion.div>
                  </Button>
                </motion.div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {displayLinkedin && (
                <motion.div
                  whileHover="hover"
                  initial="rest"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(displayLinkedin, '_blank')}
                    className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-[#2A2520] rounded-xl border border-black/5 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors group h-auto"
                  >
                    <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
                      Linkedin
                    </span>
                    <motion.div
                      variants={{
                        rest: { scale: 1, rotate: 0 },
                        hover: { scale: 1.3, rotate: -10 },
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <Linkedin
                        size={14}
                        className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                      />
                    </motion.div>
                  </Button>
                </motion.div>
                )}
                {displayDribbble && (
                <motion.div
                  whileHover="hover"
                  initial="rest"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(displayDribbble, '_blank')}
                    className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-[#2A2520] rounded-xl border border-black/5 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors group h-auto"
                  >
                    <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
                      Dribbble
                    </span>
                    <motion.div
                      variants={{
                        rest: { scale: 1, rotate: 0 },
                        hover: { scale: 1.3, rotate: 20 },
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <DribbbleIcon
                        size={14}
                        className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                      />
                    </motion.div>
                  </Button>
                </motion.div>
                )}
                {displayTwitter && (
                <motion.div
                  whileHover="hover"
                  initial="rest"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(displayTwitter, '_blank')}
                    className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-[#2A2520] rounded-xl border border-black/5 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors group h-auto"
                  >
                    <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
                      X
                    </span>
                    <motion.div
                      variants={{
                        rest: { scale: 1, rotate: 0 },
                        hover: { scale: 1.3, rotate: -20 },
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <TwitterIcon
                        size={14}
                        className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                      />
                    </motion.div>
                  </Button>
                </motion.div>
                )}
                {(displayGithub || displayWebsite) && (
                <motion.div
                  whileHover="hover"
                  initial="rest"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(displayGithub || displayWebsite || '#', '_blank')}
                    className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-[#2A2520] rounded-xl border border-black/5 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors group h-auto"
                  >
                    <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
                      {displayGithub ? "GitHub" : "Website"}
                    </span>
                    <motion.div
                      variants={{
                        rest: { scale: 1, rotate: 0 },
                        hover: { scale: 1.3, rotate: 15 },
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      {displayGithub ? (
                        <Github
                          size={14}
                          className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                        />
                      ) : (
                        <Globe
                          size={14}
                          className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                        />
                      )}
                    </motion.div>
                  </Button>
                </motion.div>
                )}
              </div>
              <motion.div whileHover="hover" initial="rest" className="w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-[#2A2520] rounded-xl border border-black/5 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors group h-auto"
                >
                  <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
                    View resume
                  </span>
                  <motion.div
                    variants={{
                      rest: { scale: 1, rotate: 0 },
                      hover: { scale: 1.3, rotate: -15 },
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <FileText
                      size={14}
                      className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                    />
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="custom-dashed-t"
            ></motion.div>

            {/* Dino Game Section */}
            <motion.div
              variants={itemVariants}
              className="relative flex flex-col items-center justify-center overflow-hidden border-b border-[#E5D7C4]/50"
            >
              <div className="absolute top-6 left-8 right-8 flex justify-between z-10 font-['DM_Mono'] text-[10px] uppercase tracking-widest text-[#463B34] dark:text-[#C4B5A0] pointer-events-none">
                <span>
                  {isGameOver
                    ? "Game Over"
                    : isPlaying
                    ? "Playing"
                    : "Tap to play"}
                </span>
                <div className="flex gap-4">
                  <span>HI {String(highScore).padStart(5, "0")}</span>
                  <span>{String(Math.floor(score / 10)).padStart(5, "0")}</span>
                </div>
              </div>

              <div
                ref={gameRef}
                onClick={jump}
                className="w-full h-48 relative flex items-end overflow-hidden cursor-pointer select-none bg-black/[0.015] dark:bg-white/[0.03] transition-colors hover:bg-black/[0.025] dark:hover:bg-white/[0.05]"
              >
                {/* Ground Line */}
                <div className="absolute bottom-12 left-0 w-full h-[1px] bg-[#E5D7C4] dark:bg-[#3A352E]"></div>

                {/* Dino */}
                <motion.div
                  animate={{ y: -dinoY - 48 }}
                  transition={{ type: "just" as any }}
                  className="absolute left-12 bottom-0 mb-[-2px] z-20 dino-game"
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 54 54"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-sm"
                  >
                    <path
                      d="M45.4502 6.75024V8.55005H47.25V18.7317H35.1006V20.2502H40.5V21.5999H35.1006V25.6497H39.1504V29.7004H37.3506V27.8997H35.1006V34.6497H33.2998V37.8H31.0498V40.05H29.25V48.1497H31.0498V49.9504H27.4502L27 43.6497H25.6504V41.8499H23.4004V43.6497H21.1504V45.8997H18.9004V48.1497H21.1504V49.9504H17.1006V41.8499H14.8506V40.05H13.0498V37.8H10.7998V35.55H9V33.3H7.2002V22.05H9V25.6497H10.7998V27.8997H13.0498V29.7004H17.1006V27.8997H19.3506V25.6497H22.0498V23.8499H25.2002V21.5999H27.1689L27.4502 8.55005H29.25V6.30005L45.4502 6.75024ZM31.0498 10.3499V14.8499H35.5498V10.3499H31.0498ZM34.6504 11.2502V13.9504H31.9502V11.2502H34.6504Z"
                      className="dino-color"
                    />
                    {isPlaying && dinoY === 0 && (
                      <motion.path
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.2, repeat: Infinity }}
                        d="M18.9004 48.1497H21.1504V49.9504H17.1006V41.8499M29.25 48.1497H31.0498V49.9504H27.4502L27 43.6497"
                        fill="#F0EDE7"
                      />
                    )}
                  </svg>
                </motion.div>

                {/* Obstacles */}
                {obstacles.map((obs) => (
                  <div
                    key={obs.id}
                    className="absolute bottom-12 mb-[-2px] z-10 dino-game"
                    style={{ left: `${obs.x}px` }}
                  >
                    <svg
                      width="24"
                      height="36"
                      viewBox="0 0 20 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M8 30H12V0H8V30Z" className="dino-color" />
                      <path d="M4 10H8V14H4V10Z" className="dino-color" />
                      <path d="M12 5H16V9H12V5Z" className="dino-color" />
                    </svg>
                  </div>
                ))}

                {/* Decorative Background Elements */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E5D7C4]/30 dark:via-[#3A352E]/40 to-transparent -translate-y-12"></div>

                {isGameOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#F0EDE7]/40 dark:bg-[#1A1A1A]/60 backdrop-blur-[2px] z-30">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white/80 dark:bg-[#2A2520]/90 backdrop-blur-md px-8 py-4 rounded-2xl border border-black/5 dark:border-white/10 shadow-xl flex flex-col items-center gap-2"
                    >
                      <span className="text-[11px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-['DM_Mono'] uppercase tracking-[0.2em]">
                        Game Over
                      </span>
                      <div className="flex flex-col items-center group">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-[#535353] dark:text-[#9E9893] mb-1 transition-transform group-hover:rotate-180 duration-500"
                        >
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                        </svg>
                        <span className="text-[9px] font-medium text-[#7A736C] dark:text-[#9E9893] uppercase tracking-widest">
                          Tap to Restart
                        </span>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        </div>
      </motion.div>
    </>
  );
}
