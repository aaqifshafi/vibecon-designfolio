import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, SendHorizontal, Sparkles, Briefcase, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getResumeData } from "@/lib/indexeddb";
import { buildScoutSystemPrompt, sendScoutMessage } from "@/lib/scout-chat";
import type { ChatMessage } from "@/lib/scout-chat";
import type { JobItem } from "@/lib/job-types";
import type { ParsedResume } from "@/lib/types";

const SUGGESTIONS = [
  "Am I a good fit for this role?",
  "What skills am I missing?",
  "Help me write a cover letter",
  "What should I research before applying?",
];

interface Props {
  job: JobItem;
  onClose: () => void;
}

export default function ScoutChat({ job, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string | null>(null);
  const [noResume, setNoResume] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevJobIdRef = useRef<string>(job.id);

  // Online/offline detection
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); };
  }, []);

  // Hydrate context when job changes
  useEffect(() => {
    if (prevJobIdRef.current !== job.id) {
      // Job switched — reset everything
      setMessages([]);
      setInput("");
      setError(null);
      setFailedMessage(null);
      setSystemPrompt(null);
      setNoResume(false);
      prevJobIdRef.current = job.id;
    }

    getResumeData().then((resume) => {
      if (!resume) {
        setNoResume(true);
        return;
      }
      setSystemPrompt(buildScoutSystemPrompt(job, resume));
    }).catch(() => setNoResume(true));
  }, [job.id]);

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, [messages, isLoading]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !systemPrompt || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setError(null);
    setFailedMessage(null);
    setIsLoading(true);

    try {
      const response = await sendScoutMessage(systemPrompt, [...messages, userMsg].slice(0, -1), userMsg.content);
      setMessages((prev) => [...prev, { role: "model", content: response }]);
    } catch {
      setError("Scout ran into an issue. Try again.");
      setFailedMessage(text.trim());
    } finally {
      setIsLoading(false);
    }
  }, [systemPrompt, messages, isLoading]);

  const handleRetry = () => {
    if (failedMessage) {
      // Remove the last user message (failed one) and resend
      setMessages((prev) => prev.slice(0, -1));
      setError(null);
      const msg = failedMessage;
      setFailedMessage(null);
      sendMessage(msg);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className="fixed bottom-5 right-5 z-[200] w-[380px] h-[520px] bg-white dark:bg-[#1C1A19] rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden"
      data-testid="scout-chat"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-black/5 dark:border-white/5 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-violet-500" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7] truncate">
              Scout
            </div>
            <div className="text-[11px] text-[#7A736C] dark:text-[#9E9893] truncate">
              {job.title} at {job.company}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] transition-colors"
          data-testid="scout-close-btn"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {/* No resume error */}
        {noResume && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <p className="text-[14px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mb-2">
              Scout needs your portfolio to give useful answers.
            </p>
            <p className="text-[12px] text-[#7A736C] dark:text-[#9E9893] mb-4">
              Upload your resume first.
            </p>
            <button type="button" onClick={onClose} className="text-[12px] font-medium text-violet-500 hover:underline">Close</button>
          </div>
        )}

        {/* Empty state / First view */}
        {!noResume && isEmpty && (
          <div className="flex flex-col items-center text-center pt-6 pb-2">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-violet-500" />
            </div>
            <h3 className="text-[16px] font-bold text-[#1A1A1A] dark:text-[#F0EDE7] mb-1.5">
              Hey, I'm Scout.
            </h3>
            <p className="text-[13px] text-[#7A736C] dark:text-[#9E9893] mb-4 leading-relaxed">
              I've read the JD and your portfolio. Ask me anything about this role.
            </p>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.04] mb-5">
              <Briefcase className="w-3 h-3 text-[#7A736C] dark:text-[#9E9893]" />
              <span className="text-[11px] font-medium text-[#7A736C] dark:text-[#9E9893]">
                {job.title} at {job.company}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  disabled={!systemPrompt}
                  className="text-[12px] font-medium px-3 py-2 rounded-xl border border-black/8 dark:border-white/8 text-[#1A1A1A] dark:text-[#F0EDE7] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] hover:border-black/15 dark:hover:border-white/15 transition-all disabled:opacity-40 text-left"
                  data-testid={`scout-suggestion-${SUGGESTIONS.indexOf(s)}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message thread */}
        {!noResume && !isEmpty && (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                  msg.role === "user"
                    ? "bg-[#1A1A1A] dark:bg-[#F0EDE7] text-white dark:text-[#1A1A1A] rounded-br-md"
                    : "bg-black/[0.04] dark:bg-white/[0.06] text-[#1A1A1A] dark:text-[#F0EDE7] rounded-bl-md"
                )}>
                  {msg.role === "model" ? (
                    <div className="prose-scout" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7A736C] dark:bg-[#9E9893] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7A736C] dark:bg-[#9E9893] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7A736C] dark:bg-[#9E9893] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            {/* Error with retry */}
            {error && (
              <div className="flex justify-start">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[13px]">
                  <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-red-500 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      {!noResume && (
        <div className="px-3 pb-3 pt-1 shrink-0">
          <div className="flex items-end gap-2 bg-black/[0.03] dark:bg-white/[0.03] rounded-xl border border-black/5 dark:border-white/5 px-3 py-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={!isOnline ? "You're offline. Scout needs a connection to respond." : "Ask anything about this role..."}
              disabled={isLoading || !systemPrompt || !isOnline}
              rows={1}
              className="flex-1 bg-transparent text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] placeholder:text-[#7A736C]/50 dark:placeholder:text-[#9E9893]/50 resize-none outline-none max-h-[80px] leading-relaxed disabled:opacity-40"
              style={{ minHeight: "20px" }}
              data-testid="scout-input"
            />
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading || !systemPrompt || !isOnline}
              className="w-7 h-7 rounded-lg bg-[#1A1A1A] dark:bg-[#F0EDE7] text-white dark:text-[#1A1A1A] flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity disabled:opacity-20"
              data-testid="scout-send-btn"
            >
              <SendHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Simple markdown renderer (bold, bullets, paragraphs)
function renderMarkdown(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Bullet points
    .replace(/^[-•] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/((?:<li[^>]*>.*?<\/li>\n?)+)/g, '<ul class="my-1.5 space-y-0.5">$1</ul>')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p class="mt-2">')
    // Single newlines
    .replace(/\n/g, "<br/>")
    // Wrap in paragraph
    .replace(/^(.+)$/, '<p>$1</p>');
}
