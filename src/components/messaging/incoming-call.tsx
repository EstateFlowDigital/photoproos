"use client";

import { useState, useEffect } from "react";
import { Phone, PhoneOff, Video, X } from "lucide-react";
import type { CallWithDetails } from "@/lib/actions/calls";
import { joinCall, declineCall } from "@/lib/actions/calls";

interface IncomingCallProps {
  call: CallWithDetails;
  onAccept: (call: CallWithDetails) => void;
  onDecline: () => void;
}

export function IncomingCall({ call, onAccept, onDecline }: IncomingCallProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [ringDuration, setRingDuration] = useState(0);

  const callerName = call.initiator.fullName || "Unknown";
  const callerInitials = callerName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const isVideoCall = call.type === "video";

  // Ring timer
  useEffect(() => {
    const interval = setInterval(() => {
      setRingDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-decline after 30 seconds
  useEffect(() => {
    if (ringDuration >= 30 && !isJoining && !isDeclining) {
      handleDecline();
    }
  }, [ringDuration, isJoining, isDeclining]);

  // Play ring sound (optional)
  useEffect(() => {
    // In production, you could play a ringtone here
    // const audio = new Audio('/sounds/ringtone.mp3');
    // audio.loop = true;
    // audio.play();
    // return () => audio.pause();
  }, []);

  const handleAccept = async () => {
    if (isJoining) return;
    setIsJoining(true);

    const result = await joinCall(call.id);
    if (result.success) {
      onAccept(result.data);
    } else {
      setIsJoining(false);
    }
  };

  const handleDecline = async () => {
    if (isDeclining) return;
    setIsDeclining(true);

    await declineCall(call.id);
    onDecline();
  };

  return (
    <div className="incoming-call-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        className="incoming-call-card relative w-full max-w-sm rounded-3xl bg-[var(--card)] p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300"
        role="alertdialog"
        aria-labelledby="incoming-call-title"
        aria-describedby="incoming-call-description"
      >
        {/* Animated ring effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute h-32 w-32 animate-ping rounded-full border-4 border-green-500/30" />
          <div className="absolute h-40 w-40 animate-ping rounded-full border-4 border-green-500/20 animation-delay-200" />
        </div>

        {/* Caller Avatar */}
        <div className="relative mx-auto mb-6 flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
          {call.initiator.avatarUrl ? (
            <img
              src={call.initiator.avatarUrl}
              alt={callerName}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span className="text-4xl font-bold text-white">{callerInitials}</span>
          )}
        </div>

        {/* Call Type Icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--background-tertiary)]">
          {isVideoCall ? (
            <Video className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          ) : (
            <Phone className="h-6 w-6 text-green-500" aria-hidden="true" />
          )}
        </div>

        {/* Caller Info */}
        <h2 id="incoming-call-title" className="text-xl font-semibold text-[var(--foreground)] mb-1">
          {callerName}
        </h2>
        <p id="incoming-call-description" className="text-sm text-[var(--foreground-muted)] mb-1">
          {isVideoCall ? "Video call" : "Voice call"}
        </p>
        <p className="text-xs text-[var(--foreground-muted)] mb-8">
          {call.conversation.name || "Direct call"}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-6">
          {/* Decline Button */}
          <button
            onClick={handleDecline}
            disabled={isDeclining}
            className="group flex flex-col items-center gap-2 disabled:opacity-50"
            aria-label="Decline call"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 transition-transform group-hover:scale-110 group-active:scale-95">
              <PhoneOff className="h-7 w-7" aria-hidden="true" />
            </div>
            <span className="text-xs text-[var(--foreground-muted)]">Decline</span>
          </button>

          {/* Accept Button */}
          <button
            onClick={handleAccept}
            disabled={isJoining}
            className="group flex flex-col items-center gap-2 disabled:opacity-50"
            aria-label={isVideoCall ? "Accept video call" : "Accept voice call"}
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 transition-transform group-hover:scale-110 group-active:scale-95">
              {isVideoCall ? (
                <Video className="h-7 w-7" aria-hidden="true" />
              ) : (
                <Phone className="h-7 w-7" aria-hidden="true" />
              )}
            </div>
            <span className="text-xs text-[var(--foreground-muted)]">
              {isJoining ? "Joining..." : "Accept"}
            </span>
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={handleDecline}
          className="absolute right-4 top-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Ringing indicator */}
        <p className="mt-6 text-xs text-[var(--foreground-muted)]">
          Ringing... {30 - ringDuration}s
        </p>
      </div>
    </div>
  );
}
