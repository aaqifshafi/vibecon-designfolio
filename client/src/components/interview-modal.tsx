import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Sparkles, RefreshCw, Mic, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getResumeData } from "@/lib/indexeddb";
import {
  buildPortfolioContext,
  createAnamSession,
} from "@/lib/anam-interview";
import type { JobItem } from "@/lib/job-types";

type Phase = "loading" | "streaming" | "error" | "no-resume" | "permission-denied";

interface Props {
  job: JobItem;
  onClose: () => void;
}

export default function InterviewModal({ job, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [loadingMsg, setLoadingMsg] = useState("Getting Kevin ready...");
  const [errorMsg, setErrorMsg] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const anamClientRef = useRef<any>(null);
  const pipRef = useRef<HTMLVideoElement>(null);

  const startSession = useCallback(async () => {
    setPhase("loading");
    setLoadingMsg("Getting Kevin ready...");
    setErrorMsg("");

    try {
      // Step 1: Read resume from IndexedDB
      const resume = await getResumeData();
      if (!resume) {
        setPhase("no-resume");
        return;
      }

      // Step 2: Build portfolio context
      const portfolioContext = buildPortfolioContext(resume);

      // Step 3: Create Anam session
      setLoadingMsg("Starting your interview...");
      const { sessionToken } = await createAnamSession(portfolioContext, job);

      // Step 4: Request mic + camera
      let userStream: MediaStream;
      try {
        userStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
      } catch {
        setPhase("permission-denied");
        return;
      }

      // Show PiP of user camera
      if (pipRef.current) {
        pipRef.current.srcObject = userStream;
      }

      // Step 5: Import Anam SDK and stream
      const { createClient } = await import("@anam-ai/js-sdk");
      const client = createClient(sessionToken);
      anamClientRef.current = client;

      if (videoRef.current) {
        await client.streamToVideoElement(videoRef.current.id, userStream);
      }

      setPhase("streaming");
    } catch (err: any) {
      console.error("Interview start error:", err);
      setErrorMsg(
        err.message?.includes("session")
          ? "We couldn't start the interview. Please try again."
          : "We couldn't start the interview. Please try again."
      );
      setPhase("error");
    }
  }, [job]);

  useEffect(() => {
    startSession();
    return () => {
      // Cleanup on unmount
      try {
        anamClientRef.current?.stopStreaming?.();
      } catch {}
      // Stop user media tracks
      if (pipRef.current?.srcObject) {
        (pipRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());
      }
    };
  }, [startSession]);

  const handleEnd = useCallback(() => {
    try {
      anamClientRef.current?.stopStreaming?.();
    } catch {}
    if (pipRef.current?.srcObject) {
      (pipRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((t) => t.stop());
    }
    onClose();
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[300] bg-black flex items-center justify-center"
      data-testid="interview-modal"
    >
      {/* End Interview Button */}
      <button
        type="button"
        onClick={handleEnd}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-[13px] font-medium hover:bg-white/20 hover:text-white transition-all border border-white/10"
        data-testid="end-interview-btn"
      >
        <X className="w-4 h-4" />
        End Interview
      </button>

      {/* Loading State */}
      <AnimatePresence>
        {phase === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-5"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
              <Sparkles className="w-8 h-8 text-violet-400 animate-pulse" />
            </div>
            <AnimatePresence mode="wait">
              <motion.span
                key={loadingMsg}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-[18px] font-semibold text-white"
              >
                {loadingMsg}
              </motion.span>
            </AnimatePresence>
            <span className="text-[13px] text-white/40">
              This takes a few seconds...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {phase === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-5 max-w-sm text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <X className="w-7 h-7 text-red-400" />
            </div>
            <p className="text-[16px] font-semibold text-white">
              {errorMsg}
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleEnd}
                variant="outline"
                className="rounded-full px-5 h-10 text-[13px] font-medium border-white/10 text-white/70 hover:text-white hover:bg-white/5 bg-transparent"
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={startSession}
                className="rounded-full px-5 h-10 text-[13px] font-semibold bg-white text-black hover:bg-white/90"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Try Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Resume State */}
      <AnimatePresence>
        {phase === "no-resume" && (
          <motion.div
            key="no-resume"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-5 max-w-sm text-center"
          >
            <p className="text-[16px] font-semibold text-white">
              We couldn't find your portfolio data. Please re-upload your
              resume first.
            </p>
            <Button
              type="button"
              onClick={handleEnd}
              className="rounded-full px-6 h-10 text-[13px] font-semibold bg-white text-black hover:bg-white/90"
            >
              Close
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permission Denied State */}
      <AnimatePresence>
        {phase === "permission-denied" && (
          <motion.div
            key="perm-denied"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-5 max-w-sm text-center"
          >
            <div className="flex gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <Mic className="w-5 h-5 text-white/60" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <Camera className="w-5 h-5 text-white/60" />
              </div>
            </div>
            <p className="text-[16px] font-semibold text-white">
              Kevin needs access to your mic and camera to run the interview.
            </p>
            <p className="text-[13px] text-white/40">
              Please allow permissions in your browser and try again.
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleEnd}
                variant="outline"
                className="rounded-full px-5 h-10 text-[13px] font-medium border-white/10 text-white/70 hover:text-white hover:bg-white/5 bg-transparent"
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={startSession}
                className="rounded-full px-5 h-10 text-[13px] font-semibold bg-white text-black hover:bg-white/90"
              >
                Try Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Video Stream */}
      <video
        ref={videoRef}
        id="anam-avatar-video"
        autoPlay
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          phase === "streaming" ? "opacity-100" : "opacity-0 absolute"
        }`}
        data-testid="avatar-video"
      />

      {/* User PiP Camera */}
      <video
        ref={pipRef}
        autoPlay
        playsInline
        muted
        className={`absolute bottom-6 right-6 w-36 h-28 rounded-xl object-cover border-2 border-white/15 shadow-2xl transition-opacity duration-500 ${
          phase === "streaming" ? "opacity-100" : "opacity-0"
        }`}
        data-testid="user-pip-video"
      />
    </motion.div>
  );
}
