import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, RefreshCw, Mic, Camera, PhoneOff, MicOff, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getResumeData } from "@/lib/indexeddb";
import {
  buildPortfolioContext,
  createAnamSession,
} from "@/lib/anam-interview";
import type { JobItem } from "@/lib/job-types";

type Phase = "loading" | "streaming" | "error" | "no-resume" | "permission-denied";

interface TranscriptEntry {
  id: string;
  role: "persona" | "user";
  text: string;
  final: boolean;
}

interface Props {
  job: JobItem;
  onClose: () => void;
}

export default function InterviewModal({ job, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [loadingMsg, setLoadingMsg] = useState("Getting Kevin ready...");
  const [errorMsg, setErrorMsg] = useState("");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const anamClientRef = useRef<any>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const userStreamRef = useRef<MediaStream | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Timer
  useEffect(() => {
    if (phase === "streaming") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const startSession = useCallback(async () => {
    setPhase("loading");
    setLoadingMsg("Getting Kevin ready...");
    setErrorMsg("");
    setTranscript([]);
    setElapsed(0);

    try {
      const resume = await getResumeData();
      if (!resume) { setPhase("no-resume"); return; }

      const portfolioContext = buildPortfolioContext(resume);

      setLoadingMsg("Starting your interview...");
      const { sessionToken } = await createAnamSession(portfolioContext, job);

      let userStream: MediaStream;
      try {
        userStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      } catch {
        setPhase("permission-denied");
        return;
      }
      userStreamRef.current = userStream;
      if (userVideoRef.current) userVideoRef.current.srcObject = userStream;

      const { createClient } = await import("@anam-ai/js-sdk");
      const client = createClient(sessionToken);
      anamClientRef.current = client;

      // Listen for transcript events
      try {
        const { AnamEvent } = await import("@anam-ai/js-sdk");

        // Streaming partial messages
        if (AnamEvent?.MESSAGE_STREAM_EVENT_RECEIVED) {
          client.addListener(AnamEvent.MESSAGE_STREAM_EVENT_RECEIVED, (event: any) => {
            const role = event.role === "persona" || event.role === "PERSONA" ? "persona" : "user";
            const id = event.id || `msg-${Date.now()}`;
            setTranscript((prev) => {
              const existing = prev.findIndex((e) => e.id === id);
              if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = { ...updated[existing], text: event.content || "", final: !!event.endOfSpeech };
                return updated;
              }
              return [...prev, { id, role, text: event.content || "", final: !!event.endOfSpeech }];
            });
          });
        }

        // Full history updates
        if (AnamEvent?.MESSAGE_HISTORY_UPDATED) {
          client.addListener(AnamEvent.MESSAGE_HISTORY_UPDATED, (messages: any[]) => {
            const entries: TranscriptEntry[] = messages.map((m: any, i: number) => ({
              id: m.id || `hist-${i}`,
              role: m.role === "persona" || m.role === "PERSONA" || m.role === "assistant" ? "persona" : "user",
              text: m.content || "",
              final: true,
            }));
            setTranscript(entries);
          });
        }
      } catch {
        // SDK events not available — transcript will be empty but interview still works
      }

      if (videoRef.current) {
        await client.streamToVideoElement(videoRef.current.id, userStream);
      }

      setPhase("streaming");
    } catch (err: any) {
      console.error("Interview start error:", err);
      setErrorMsg("We couldn't start the interview. Please try again.");
      setPhase("error");
    }
  }, [job]);

  useEffect(() => {
    startSession();
    return () => {
      try { anamClientRef.current?.stopStreaming?.(); } catch {}
      userStreamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startSession]);

  const handleEnd = useCallback(() => {
    try { anamClientRef.current?.stopStreaming?.(); } catch {}
    userStreamRef.current?.getTracks().forEach((t) => t.stop());
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  }, [onClose]);

  const toggleMute = () => {
    const audioTracks = userStreamRef.current?.getAudioTracks();
    if (audioTracks) {
      audioTracks.forEach((t) => { t.enabled = !t.enabled; });
      setIsMuted((m) => !m);
    }
  };

  const toggleCam = () => {
    const videoTracks = userStreamRef.current?.getVideoTracks();
    if (videoTracks) {
      videoTracks.forEach((t) => { t.enabled = !t.enabled; });
      setIsCamOff((c) => !c);
    }
  };

  // ── Loading / Error / Permission States ──
  if (phase !== "streaming") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[300] bg-[#0C0C0C] flex items-center justify-center"
        data-testid="interview-modal"
      >
        <button
          type="button"
          onClick={handleEnd}
          className="absolute top-6 right-6 z-50 w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/15 transition-all"
          data-testid="end-interview-btn"
        >
          <X className="w-4 h-4" />
        </button>

        <AnimatePresence mode="wait">
          {phase === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                <Sparkles className="w-8 h-8 text-violet-400 animate-pulse" />
              </div>
              <AnimatePresence mode="wait">
                <motion.span key={loadingMsg} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-[18px] font-semibold text-white">
                  {loadingMsg}
                </motion.span>
              </AnimatePresence>
              <span className="text-[13px] text-white/40">This takes a few seconds...</span>
            </motion.div>
          )}

          {phase === "error" && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center gap-5 max-w-sm text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <X className="w-7 h-7 text-red-400" />
              </div>
              <p className="text-[16px] font-semibold text-white">{errorMsg}</p>
              <div className="flex gap-3">
                <Button type="button" onClick={handleEnd} variant="outline" className="rounded-full px-5 h-10 text-[13px] font-medium border-white/10 text-white/70 hover:text-white hover:bg-white/5 bg-transparent">Close</Button>
                <Button type="button" onClick={startSession} className="rounded-full px-5 h-10 text-[13px] font-semibold bg-white text-black hover:bg-white/90"><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Try Again</Button>
              </div>
            </motion.div>
          )}

          {phase === "no-resume" && (
            <motion.div key="no-resume" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center gap-5 max-w-sm text-center">
              <p className="text-[16px] font-semibold text-white">We couldn't find your portfolio data. Please re-upload your resume first.</p>
              <Button type="button" onClick={handleEnd} className="rounded-full px-6 h-10 text-[13px] font-semibold bg-white text-black hover:bg-white/90">Close</Button>
            </motion.div>
          )}

          {phase === "permission-denied" && (
            <motion.div key="perm-denied" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center gap-5 max-w-sm text-center">
              <div className="flex gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10"><Mic className="w-5 h-5 text-white/60" /></div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10"><Camera className="w-5 h-5 text-white/60" /></div>
              </div>
              <p className="text-[16px] font-semibold text-white">Kevin needs access to your mic and camera to run the interview.</p>
              <p className="text-[13px] text-white/40">Please allow permissions in your browser and try again.</p>
              <div className="flex gap-3">
                <Button type="button" onClick={handleEnd} variant="outline" className="rounded-full px-5 h-10 text-[13px] font-medium border-white/10 text-white/70 hover:text-white hover:bg-white/5 bg-transparent">Close</Button>
                <Button type="button" onClick={startSession} className="rounded-full px-5 h-10 text-[13px] font-semibold bg-white text-black hover:bg-white/90">Try Again</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden videos for pre-loading */}
        <video ref={videoRef} id="anam-avatar-video" autoPlay playsInline className="hidden" />
        <video ref={userVideoRef} autoPlay playsInline muted className="hidden" />
      </motion.div>
    );
  }

  // ── Streaming: Two-Grid Video Call Layout ──
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[300] bg-[#0C0C0C] flex flex-col"
      data-testid="interview-modal"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 h-14 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[13px] font-medium text-white/60">
            Interview with Kevin
          </span>
          <span className="text-[13px] font-mono text-white/40">
            {formatTime(elapsed)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-white/30 mr-2">
            {job.title} at {job.company}
          </span>
        </div>
      </div>

      {/* Main Content: Two-Grid */}
      <div className="flex-1 flex gap-3 px-3 pb-3 min-h-0">
        {/* Left: Kevin Avatar */}
        <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#1A1A1A]">
          <video
            ref={videoRef}
            id="anam-avatar-video"
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            data-testid="avatar-video"
          />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[12px] font-medium text-white/80">Kevin</span>
          </div>
        </div>

        {/* Right: User Camera + Transcript */}
        <div className="w-[380px] flex flex-col gap-3 shrink-0">
          {/* User Camera */}
          <div className="relative rounded-2xl overflow-hidden bg-[#1A1A1A] h-[240px] shrink-0">
            <video
              ref={userVideoRef}
              autoPlay
              playsInline
              muted
              className={cn("w-full h-full object-cover", isCamOff && "opacity-0")}
              data-testid="user-pip-video"
            />
            {isCamOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A]">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                  <VideoOff className="w-6 h-6 text-white/40" />
                </div>
              </div>
            )}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
              <span className="text-[12px] font-medium text-white/80">You</span>
              {isMuted && <MicOff className="w-3 h-3 text-red-400" />}
            </div>
          </div>

          {/* Transcript */}
          <div className="flex-1 rounded-2xl bg-[#141414] border border-white/5 flex flex-col min-h-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 shrink-0">
              <span className="text-[12px] font-semibold text-white/50 uppercase tracking-wider">
                Transcript
              </span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
              {transcript.length === 0 && (
                <p className="text-[13px] text-white/20 text-center pt-8">
                  Transcript will appear here as the interview progresses...
                </p>
              )}
              {transcript.map((entry) => (
                <div key={entry.id} className={cn("flex gap-3", entry.role === "user" && "flex-row-reverse")}>
                  <div className={cn(
                    "max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                    entry.role === "persona"
                      ? "bg-white/[0.06] text-white/80"
                      : "bg-violet-500/15 text-violet-200"
                  )}>
                    <span className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ opacity: 0.5 }}>
                      {entry.role === "persona" ? "Kevin" : "You"}
                    </span>
                    {entry.text}
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-center gap-4 py-4 shrink-0">
        <button
          type="button"
          onClick={toggleMute}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all",
            isMuted
              ? "bg-white/15 text-red-400 ring-1 ring-red-400/30"
              : "bg-white/8 text-white/70 hover:bg-white/15 hover:text-white"
          )}
          data-testid="toggle-mute-btn"
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <button
          type="button"
          onClick={toggleCam}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all",
            isCamOff
              ? "bg-white/15 text-red-400 ring-1 ring-red-400/30"
              : "bg-white/8 text-white/70 hover:bg-white/15 hover:text-white"
          )}
          data-testid="toggle-cam-btn"
        >
          {isCamOff ? <VideoOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
        </button>

        <button
          type="button"
          onClick={handleEnd}
          className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105 active:scale-95"
          data-testid="end-interview-btn"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </motion.div>
  );
}
