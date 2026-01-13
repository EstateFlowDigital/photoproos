"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Send,
  Plus,
  FileText,
  Camera,
  Calendar,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Star,
  ArrowRight,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface Session {
  id: string;
  clientName: string;
  clientEmail: string;
  date: string;
  type: string;
  photoCount: number;
  hasRecap: boolean;
}

interface SessionRecapsClientProps {
  sessions: Session[];
}

interface RecapData {
  highlights: string;
  nextSteps: string[];
  deliveryDate: string;
  sneakPeekCount: number;
  requestReview: boolean;
  requestReferral: boolean;
}

export function SessionRecapsClient({ sessions }: SessionRecapsClientProps) {
  const { showToast } = useToast();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "sent">("all");
  const [recapData, setRecapData] = useState<RecapData>({
    highlights: "",
    nextSteps: ["Final images delivered", "Gallery access sent"],
    deliveryDate: "",
    sneakPeekCount: 3,
    requestReview: true,
    requestReferral: true,
  });
  const [newStep, setNewStep] = useState("");

  const filteredSessions = sessions.filter((s) => {
    if (filter === "all") return true;
    if (filter === "pending") return !s.hasRecap;
    if (filter === "sent") return s.hasRecap;
    return true;
  });

  const pendingCount = sessions.filter((s) => !s.hasRecap).length;
  const sentCount = sessions.filter((s) => s.hasRecap).length;

  const handleSendRecap = async () => {
    if (!selectedSession) return;

    if (!recapData.highlights.trim()) {
      showToast("Please add session highlights", "error");
      return;
    }

    setIsSending(true);

    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 1500));

    showToast(`Recap sent to ${selectedSession.clientEmail}`, "success");
    setSelectedSession(null);
    setIsSending(false);
    setRecapData({
      highlights: "",
      nextSteps: ["Final images delivered", "Gallery access sent"],
      deliveryDate: "",
      sneakPeekCount: 3,
      requestReview: true,
      requestReferral: true,
    });
  };

  const addNextStep = () => {
    if (!newStep.trim()) return;
    setRecapData((prev) => ({
      ...prev,
      nextSteps: [...prev.nextSteps, newStep.trim()],
    }));
    setNewStep("");
  };

  const removeNextStep = (index: number) => {
    setRecapData((prev) => ({
      ...prev,
      nextSteps: prev.nextSteps.filter((_, i) => i !== index),
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <FileText className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Total Sessions</p>
              <p className="text-xl font-bold text-foreground">{sessions.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--warning)]/10">
              <Clock className="h-5 w-5 text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Pending Recaps</p>
              <p className="text-xl font-bold text-[var(--warning)]">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Recaps Sent</p>
              <p className="text-xl font-bold text-[var(--success)]">{sentCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-[var(--foreground)] text-[var(--background)]"
              : "bg-[var(--card)] text-foreground-muted hover:bg-[var(--background-hover)] border border-[var(--card-border)]"
          }`}
        >
          All
          <span className="opacity-70">{sessions.length}</span>
        </button>
        {pendingCount > 0 && (
          <button
            onClick={() => setFilter("pending")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === "pending"
                ? "bg-[var(--warning)] text-white"
                : "bg-[var(--warning)]/10 text-[var(--warning)] hover:bg-[var(--warning)]/20"
            }`}
          >
            Pending
            <span className="opacity-70">{pendingCount}</span>
          </button>
        )}
        {sentCount > 0 && (
          <button
            onClick={() => setFilter("sent")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === "sent"
                ? "bg-[var(--success)] text-white"
                : "bg-[var(--success)]/10 text-[var(--success)] hover:bg-[var(--success)]/20"
            }`}
          >
            Sent
            <span className="opacity-70">{sentCount}</span>
          </button>
        )}
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="card p-12 text-center">
          <Camera className="h-12 w-12 text-foreground-muted mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No sessions found</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {filter === "pending"
              ? "All sessions have recap emails sent."
              : filter === "sent"
              ? "No recap emails sent yet."
              : "Complete some photo sessions to create recaps."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="card p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--background-tertiary)]">
                  <Camera className="h-5 w-5 text-foreground-muted" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">{session.clientName}</h3>
                  <p className="text-xs text-foreground-muted">
                    {session.type} • {formatDate(session.date)} • {session.photoCount} photos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {session.hasRecap ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-[var(--success)]/10 px-3 py-1.5 text-xs font-medium text-[var(--success)]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Sent
                  </span>
                ) : (
                  <Button size="sm" onClick={() => setSelectedSession(session)}>
                    <Send className="h-4 w-4 mr-1" />
                    Create Recap
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Recap Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-[var(--card)] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Create Session Recap</h2>
                <p className="text-sm text-foreground-muted">
                  {selectedSession.clientName} • {formatDate(selectedSession.date)}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedSession(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Highlights */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Session Highlights
                </label>
                <textarea
                  value={recapData.highlights}
                  onChange={(e) => setRecapData({ ...recapData, highlights: e.target.value })}
                  placeholder="Write a brief summary of the session highlights, favorite moments, and what made this shoot special..."
                  rows={4}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none resize-none"
                />
              </div>

              {/* Sneak Peeks */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Sneak Peek Images
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={recapData.sneakPeekCount}
                    onChange={(e) => setRecapData({ ...recapData, sneakPeekCount: parseInt(e.target.value) || 0 })}
                    className="w-24 rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-3 py-2 text-sm text-foreground"
                  />
                  <span className="text-sm text-foreground-muted">images will be attached</span>
                </div>
              </div>

              {/* Delivery Date */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Estimated Delivery Date
                </label>
                <input
                  type="date"
                  value={recapData.deliveryDate}
                  onChange={(e) => setRecapData({ ...recapData, deliveryDate: e.target.value })}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-3 py-2 text-sm text-foreground"
                />
              </div>

              {/* Next Steps */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Next Steps
                </label>
                <div className="space-y-2 mb-3">
                  {recapData.nextSteps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-lg bg-[var(--background-tertiary)] px-3 py-2"
                    >
                      <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                      <span className="flex-1 text-sm text-foreground">{step}</span>
                      <button
                        onClick={() => removeNextStep(index)}
                        className="text-foreground-muted hover:text-[var(--error)]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newStep}
                    onChange={(e) => setNewStep(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addNextStep()}
                    placeholder="Add a next step..."
                    className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
                  />
                  <Button size="sm" onClick={addNextStep} disabled={!newStep.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <button
                  onClick={() => setRecapData({ ...recapData, requestReview: !recapData.requestReview })}
                  className={`w-full flex items-center gap-3 rounded-lg p-3 transition-colors ${
                    recapData.requestReview
                      ? "bg-[var(--success)]/10 border border-[var(--success)]/30"
                      : "bg-[var(--background-tertiary)]"
                  }`}
                >
                  <div className={`flex h-5 w-5 items-center justify-center rounded ${
                    recapData.requestReview ? "bg-[var(--success)]" : "border-2 border-[var(--card-border)]"
                  }`}>
                    {recapData.requestReview && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Request a Review</p>
                    <p className="text-xs text-foreground-muted">Include a link to leave a Google/Facebook review</p>
                  </div>
                </button>

                <button
                  onClick={() => setRecapData({ ...recapData, requestReferral: !recapData.requestReferral })}
                  className={`w-full flex items-center gap-3 rounded-lg p-3 transition-colors ${
                    recapData.requestReferral
                      ? "bg-[var(--primary)]/10 border border-[var(--primary)]/30"
                      : "bg-[var(--background-tertiary)]"
                  }`}
                >
                  <div className={`flex h-5 w-5 items-center justify-center rounded ${
                    recapData.requestReferral ? "bg-[var(--primary)]" : "border-2 border-[var(--card-border)]"
                  }`}>
                    {recapData.requestReferral && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Request Referrals</p>
                    <p className="text-xs text-foreground-muted">Include referral program information</p>
                  </div>
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-[var(--card-border)]">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedSession(null)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSendRecap} disabled={isSending}>
                  {isSending ? (
                    <>
                      <LoadingSpinner className="h-4 w-4 mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Recap
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
