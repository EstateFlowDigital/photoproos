"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { X, Copy, Mic, MicOff, StickyNote, Bug, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Only available for the developer account
const DEV_EMAIL = "cameron@houseandhomephoto.com";

type RecognitionInstance = {
  start: () => void;
  stop: () => void;
  onresult?: (event: any) => void;
  onend?: () => void;
  onerror?: (event: any) => void;
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
};

type EntryType = "click" | "note" | "voice" | "error" | "route";

interface Entry {
  id: string;
  type: EntryType;
  message: string;
  ts: number;
  meta?: Record<string, string>;
}

export function BugProbe() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [note, setNote] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [listening, setListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const recognitionRef = useRef<RecognitionInstance | null>(null);
  const sessionIdRef = useRef<string>("");
  const prevPathRef = useRef<string | null>(null);

  // Generate session ID on client only to avoid hydration mismatch
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = crypto.randomUUID();
    }
  }, []);

  const isDeveloper =
    isLoaded &&
    user?.emailAddresses?.some(
      (e) => e.emailAddress?.toLowerCase() === DEV_EMAIL.toLowerCase()
    );

  const addEntry = (type: EntryType, message: string, meta?: Record<string, string>) => {
    const entry: Entry = {
      id: crypto.randomUUID(),
      type,
      message,
      ts: Date.now(),
      meta,
    };
    setEntries((prev) => [entry, ...prev].slice(0, 200));
  };

  // Capture clicks (use capture phase to avoid stopPropagation)
  useEffect(() => {
    if (!isDeveloper) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a");
      const label =
        anchor?.innerText?.trim() ||
        target.innerText?.trim() ||
        target.getAttribute("aria-label") ||
        target.getAttribute("data-testid") ||
        target.tagName;
      addEntry(
        "click",
        label || "Unknown click",
        anchor?.getAttribute("href")
          ? { href: anchor.getAttribute("href") as string }
          : undefined
      );
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isDeveloper]);

  // Capture JS errors
  useEffect(() => {
    if (!isDeveloper) return;
    const onError = (event: ErrorEvent) => {
      addEntry("error", event.message, { source: event.filename || "" });
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      addEntry("error", String(event.reason));
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [isDeveloper]);

  // Capture route changes
  useEffect(() => {
    if (!isDeveloper) return;
    if (prevPathRef.current && prevPathRef.current !== pathname) {
      addEntry("route", `Navigated to ${pathname}`);
    }
    prevPathRef.current = pathname;
  }, [isDeveloper, pathname]);

  // Speech recognition setup
  useEffect(() => {
    if (!isDeveloper) return;
    const SpeechRecognitionCtor =
      (typeof window !== "undefined" &&
        (((window as any).SpeechRecognition as { new (): RecognitionInstance }) ||
          ((window as any).webkitSpeechRecognition as { new (): RecognitionInstance }))) ||
      null;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          setLiveTranscript(transcript);
        }
      }
      if (finalTranscript) {
        addEntry("voice", finalTranscript.trim());
        setLiveTranscript("");
      }
    };
    recognition.onend = () => {
      setListening(false);
    };
    recognition.onerror = () => {
      setListening(false);
    };
    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, [isDeveloper]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setListening(true);
    setLiveTranscript("");
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
  };

  const addNote = () => {
    if (!note.trim()) return;
    addEntry("note", note.trim());
    setNote("");
  };

  const copyLog = async () => {
    try {
      const text = entries
        .slice()
        .reverse()
        .map((entry) => {
          const time = new Date(entry.ts).toLocaleTimeString();
          const meta = entry.meta?.href ? ` (${entry.meta.href})` : "";
          return `[${time}] ${entry.type.toUpperCase()}: ${entry.message}${meta}`;
        })
        .join("\n");
      await navigator.clipboard.writeText(text || "No entries yet.");
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 1500);
    }
  };

  const header = useMemo(() => {
    const sessionId = typeof sessionIdRef.current === "string" ? sessionIdRef.current : "";
    return `Bug Session ${sessionId.slice(0, 8)} — ${pathname}`;
  }, [pathname]);

  if (!isDeveloper) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-full max-w-[360px] text-sm">
      {isOpen ? (
        <div className="rounded-xl border border-[rgba(255,255,255,0.12)] bg-[#0f0f10] text-white shadow-2xl">
          <div className="flex items-center justify-between gap-2 border-b border-[rgba(255,255,255,0.12)] px-3 py-2">
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-[var(--primary)]" />
              <div className="leading-tight">
                <p className="text-xs font-semibold">Bug Probe</p>
                <p className="text-[11px] text-[#9ca3af]">{header}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyLog}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-[#d1d5db] hover:bg-white/10"
                title="Copy session log"
              >
                {copyState === "copied" ? (
                  <span className="text-[10px] font-bold text-[var(--primary)]">OK</span>
                ) : copyState === "error" ? (
                  <span className="text-[10px] font-bold text-[#f87171]">ERR</span>
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-[#d1d5db] hover:bg-white/10"
                title="Minimize"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[320px] overflow-y-auto divide-y divide-[rgba(255,255,255,0.06)]">
            {entries.length === 0 ? (
              <p className="px-3 py-6 text-xs text-[#9ca3af] text-center">Click around to capture events. Add notes or voice to annotate.</p>
            ) : (
              entries.map((entry) => {
                const time = new Date(entry.ts).toLocaleTimeString();
                return (
                  <div key={entry.id} className="px-3 py-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                          entry.type === "error"
                            ? "bg-[var(--error)]/15 text-[var(--error)]"
                            : entry.type === "note" || entry.type === "voice"
                              ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                              : "bg-white/10 text-white"
                        )}
                      >
                        {entry.type}
                      </span>
                      <span className="text-[11px] text-[#9ca3af]">{time}</span>
                    </div>
                    <p className="text-sm leading-snug break-words text-white">
                      {entry.message}
                      {entry.meta?.href && (
                        <span className="ml-1 text-[11px] text-[#9ca3af]">{entry.meta.href}</span>
                      )}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          <div className="space-y-2 border-t border-[rgba(255,255,255,0.12)] p-3">
            <div className="flex items-center gap-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a quick note..."
                className="h-16 flex-1 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0b0b0c] px-3 py-2 text-sm text-white placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
              <button
                onClick={addNote}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)] text-white hover:opacity-90"
                title="Add note"
              >
                <StickyNote className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              {recognitionRef.current ? (
                <>
                  <button
                    onClick={listening ? stopListening : startListening}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                      listening
                        ? "bg-[var(--error)]/15 text-[var(--error)]"
                        : "bg-white/5 text-white hover:bg-white/10"
                    )}
                  >
                    {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {listening ? "Stop voice" : "Voice note"}
                  </button>
                  {liveTranscript && (
                    <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-[#d1d5db]">
                      <Loader2 className="h-3 w-3 animate-spin text-[var(--primary)]" />
                      <span className="truncate">{liveTranscript}</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[11px] text-[#9ca3af]">Voice notes not supported in this browser.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.12)] bg-[#0f0f10] px-3 py-2 text-xs text-white shadow-2xl hover:bg-[#161617]"
        >
          <Bug className="h-4 w-4 text-[var(--primary)]" />
          <span>Bug Probe</span>
        </button>
      )}
    </div>
  );
}
