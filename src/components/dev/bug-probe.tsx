"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  X,
  Copy,
  Mic,
  MicOff,
  StickyNote,
  Bug,
  Loader2,
  Camera,
  Video,
  StopCircle,
  AlertTriangle,
} from "lucide-react";
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

type EntryType =
  | "click"
  | "note"
  | "voice"
  | "error"
  | "route"
  | "network"
  | "nav"
  | "overlay"
  | "screenshot"
  | "recording";

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
  const navChecksRef = useRef<Array<{ timer: number; href: string }>>([]);
  const [screenshotting, setScreenshotting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimeoutRef = useRef<number | null>(null);
  const routeEventRef = useRef<{ startedAt: number | null; completedAt: number | null }>({
    startedAt: null,
    completedAt: null,
  });

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
      const href = anchor?.getAttribute("href") || undefined;
      const pointerX = e.clientX;
      const pointerY = e.clientY;

      // Overlay intercept detector: if something else is on top of the click target
      const topElement = document.elementFromPoint(pointerX, pointerY);
      if (
        topElement &&
        target &&
        topElement !== target &&
        !topElement.contains(target) &&
        !target.contains(topElement)
      ) {
        addEntry("overlay", "Click intercepted by overlay", {
          target: describeElement(target),
          overlay: describeElement(topElement),
          coords: `${pointerX},${pointerY}`,
        });
      }

      const meta: Record<string, string> = {
        defaultPrevented: String(e.defaultPrevented),
        coords: `${pointerX},${pointerY}`,
      };
      if (href) meta.href = href;
      addEntry("click", label || "Unknown click", meta);

      if (e.defaultPrevented && href) {
        addEntry("nav", "Link click default prevented", { href });
      }

      // Check if navigation actually occurs within 2s
      if (href && typeof window !== "undefined") {
        routeEventRef.current.startedAt = Date.now();
        routeEventRef.current.completedAt = null;
        const before = window.location.href;
        const timer = window.setTimeout(() => {
          if (window.location.href === before) {
            const meta: Record<string, string> = {
              defaultPrevented: String(e.defaultPrevented),
              routeEventStart: routeEventRef.current.startedAt ? "yes" : "no",
              routeEventComplete: routeEventRef.current.completedAt ? "yes" : "no",
            };
            if (href) meta.href = href;
            addEntry("nav", "Navigation did not occur after click", meta);
            // Auto-screenshot on failed nav
            setTimeout(() => captureScreenshot(), 0);
          }
        }, 2000);
        navChecksRef.current.push({ timer, href });
      }
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
    routeEventRef.current.completedAt = Date.now();
    // Clear pending nav timers on route change
    navChecksRef.current.forEach(({ timer }) => window.clearTimeout(timer));
    navChecksRef.current = [];
    prevPathRef.current = pathname;
  }, [isDeveloper, pathname]);

  // Network monitoring (fetch + XHR)
  useEffect(() => {
    if (!isDeveloper) return;
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const started = Date.now();
      try {
        const res = await originalFetch(...args);
        if (!res.ok) {
          addEntry("network", `Fetch ${res.status} ${res.url}`, {
            status: String(res.status),
            duration: `${Date.now() - started}ms`,
          });
        }
        return res;
      } catch (err) {
        addEntry("network", `Fetch failed: ${String(err)}`);
        throw err;
      }
    };

    const OriginalXHR = window.XMLHttpRequest;
    function PatchedXHR(this: XMLHttpRequest) {
      const xhr = new OriginalXHR();
      let url = "";
      const origOpen = xhr.open;
      xhr.open = function (...openArgs: any) {
        url = openArgs[1];
        return origOpen.apply(xhr, openArgs as any);
      };
      xhr.addEventListener("loadend", function () {
        if (xhr.status >= 400) {
          addEntry("network", `XHR ${xhr.status} ${url}`, { status: String(xhr.status) });
        }
      });
      xhr.addEventListener("error", function () {
        addEntry("network", `XHR error ${url}`);
      });
      return xhr;
    }
    (window as any).XMLHttpRequest = PatchedXHR as any;

    return () => {
      window.fetch = originalFetch;
      (window as any).XMLHttpRequest = OriginalXHR;
    };
  }, [isDeveloper]);

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

  async function captureScreenshot() {
    if (screenshotting) return;
    if (!navigator.mediaDevices?.getDisplayMedia) {
      addEntry("error", "Screen capture not supported by this browser");
      return;
    }
    setScreenshotting(true);
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      const capture = (window as any).ImageCapture ? new (window as any).ImageCapture(track) : null;
      let dataUrl = "";
      if (capture?.grabFrame) {
        const frame = await capture.grabFrame();
        const canvas = document.createElement("canvas");
        canvas.width = frame.width;
        canvas.height = frame.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(frame, 0, 0);
          dataUrl = canvas.toDataURL("image/png");
        }
      } else {
        const video = document.createElement("video");
        video.srcObject = stream;
        await video.play();
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          dataUrl = canvas.toDataURL("image/png");
        }
        video.pause();
      }
      addEntry("screenshot", "Screenshot captured", dataUrl ? { screenshot: dataUrl } : undefined);
    } catch (err) {
      addEntry("error", `Screenshot failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      stream?.getTracks().forEach((t) => t.stop());
      setScreenshotting(false);
    }
  }

  const startRecording = async () => {
    if (recording) return;
    if (!navigator.mediaDevices?.getDisplayMedia) {
      addEntry("error", "Screen recording not supported by this browser");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        addEntry("recording", "Screen recording captured (webm)", { url });
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        if (recordTimeoutRef.current) {
          window.clearTimeout(recordTimeoutRef.current);
          recordTimeoutRef.current = null;
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      addEntry("recording", "Screen recording started");
      recordTimeoutRef.current = window.setTimeout(() => {
        stopRecording(true);
      }, 30000);
    } catch (err) {
      addEntry("error", `Recording failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const stopRecording = (auto = false) => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      addEntry("recording", auto ? "Recording stopped (auto 30s)" : "Recording stopped");
    }
  };

  const copyLog = async () => {
    try {
      const headerInfo = `Session: ${sessionIdRef.current.slice(0, 8)} | Path: ${pathname} | Viewport: ${window.innerWidth}x${window.innerHeight}`;
      const text = [
        headerInfo,
        ...entries
          .slice()
          .reverse()
          .map((entry) => {
            const time = new Date(entry.ts).toLocaleTimeString();
            const metaHref = entry.meta?.href ? ` (${entry.meta.href})` : "";
            const metaStatus = entry.meta?.status ? ` [${entry.meta.status}]` : "";
            const marker =
              entry.meta?.screenshot ? " [screenshot]" : entry.meta?.url ? " [recording]" : "";
            return `[${time}] ${entry.type.toUpperCase()}: ${entry.message}${metaHref}${metaStatus}${marker}`;
          }),
      ].join("\n");
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
              {recordedUrl && (
                <a
                  href={recordedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[var(--primary)] hover:underline"
                >
                  Last recording
                </a>
              )}
              <button
                onClick={captureScreenshot}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-[#d1d5db] hover:bg-white/10"
                title="Capture screenshot"
                disabled={screenshotting}
              >
                {screenshotting ? <Loader2 className="h-4 w-4 animate-spin text-[var(--primary)]" /> : <Camera className="h-4 w-4" />}
              </button>
              <button
                onClick={recording ? () => stopRecording(false) : startRecording}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md text-[#d1d5db] hover:bg-white/10",
                  recording ? "bg-[var(--error)]/20 text-[var(--error)]" : "bg-white/5"
                )}
                title={recording ? "Stop recording" : "Start 30s screen record"}
              >
                {recording ? <StopCircle className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </button>
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
                            : entry.type === "note" ||
                                entry.type === "voice" ||
                                entry.type === "screenshot" ||
                                entry.type === "recording"
                              ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                              : entry.type === "network" || entry.type === "nav" || entry.type === "overlay"
                                ? "bg-[#f59e0b]/15 text-[#f59e0b]"
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
                      {entry.meta?.status && (
                        <span className="ml-1 text-[11px] text-[#9ca3af]">({entry.meta.status})</span>
                      )}
                    </p>
                    {entry.meta?.screenshot && (
                      <div className="overflow-hidden rounded-lg border border-[rgba(255,255,255,0.08)]">
                        <img src={entry.meta.screenshot} alt="Screenshot" className="max-h-40 w-full object-contain" />
                      </div>
                    )}
                    {entry.meta?.url && (
                      <a
                        href={entry.meta.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[var(--primary)] hover:underline"
                      >
                        <Video className="h-3 w-3" /> Open recording
                      </a>
                    )}
                    {entry.type === "overlay" && (
                      <div className="flex items-start gap-2 rounded-md bg-white/5 p-2 text-[11px] text-[#d1d5db]">
                        <AlertTriangle className="h-3 w-3 text-[var(--warning)] shrink-0" />
                        <div className="space-y-1">
                          {entry.meta?.target && <p>Target: {entry.meta.target}</p>}
                          {entry.meta?.overlay && <p>Overlay: {entry.meta.overlay}</p>}
                        </div>
                      </div>
                    )}
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

function describeElement(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const cls =
    el.className && typeof el.className === "string"
      ? `.${el.className
          .split(" ")
          .filter(Boolean)
          .join(".")}`
      : "";
  return `${tag}${id}${cls}`;
}
