"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { CallWithDetails } from "@/lib/actions/calls";
import { getActiveCall, startCall, joinCall } from "@/lib/actions/calls";
import type { CallType } from "@prisma/client";

interface UseCallOptions {
  conversationId: string;
  currentUserId: string;
  pollInterval?: number;
  enabled?: boolean;
}

interface UseCallReturn {
  activeCall: CallWithDetails | null;
  incomingCall: CallWithDetails | null;
  isStartingCall: boolean;
  isJoiningCall: boolean;
  startVoiceCall: () => Promise<void>;
  startVideoCall: () => Promise<void>;
  acceptCall: (call: CallWithDetails) => void;
  dismissIncomingCall: () => void;
  clearActiveCall: () => void;
}

export function useCall({
  conversationId,
  currentUserId,
  pollInterval = 3000,
  enabled = true,
}: UseCallOptions): UseCallReturn {
  const [activeCall, setActiveCall] = useState<CallWithDetails | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallWithDetails | null>(null);
  const [isStartingCall, setIsStartingCall] = useState(false);
  const [isJoiningCall, setIsJoiningCall] = useState(false);
  const dismissedCallsRef = useRef<Set<string>>(new Set());

  // Poll for active calls
  useEffect(() => {
    if (!enabled) return;

    const checkForCalls = async () => {
      const result = await getActiveCall(conversationId);

      if (result.success && result.data) {
        const call = result.data;

        // Skip if we dismissed this call
        if (dismissedCallsRef.current.has(call.id)) {
          return;
        }

        // Check if this is an incoming call for the current user
        const userParticipant = call.participants.find(
          (p) => p.userId === currentUserId
        );

        if (!userParticipant) {
          // User is not a participant
          return;
        }

        // If user is already joined, set as active call
        if (userParticipant.status === "joined") {
          setActiveCall(call);
          setIncomingCall(null);
        }
        // If user is invited and call is ringing, show incoming call
        else if (
          userParticipant.status === "invited" &&
          (call.status === "ringing" || call.status === "pending")
        ) {
          setIncomingCall(call);
        }
        // If user initiated the call, set as active
        else if (call.initiatorId === currentUserId && call.status !== "ended") {
          setActiveCall(call);
        }
      } else {
        // No active call
        if (activeCall && activeCall.status !== "ended") {
          // Clear active call if it ended
          setActiveCall(null);
        }
      }
    };

    // Initial check
    checkForCalls();

    // Poll for updates
    const interval = setInterval(checkForCalls, pollInterval);

    return () => clearInterval(interval);
  }, [conversationId, currentUserId, pollInterval, enabled, activeCall]);

  // Start a voice call
  const startVoiceCall = useCallback(async () => {
    if (isStartingCall) return;
    setIsStartingCall(true);

    try {
      const result = await startCall({
        conversationId,
        type: "voice" as CallType,
      });

      if (result.success) {
        setActiveCall(result.data);
      }
    } finally {
      setIsStartingCall(false);
    }
  }, [conversationId, isStartingCall]);

  // Start a video call
  const startVideoCall = useCallback(async () => {
    if (isStartingCall) return;
    setIsStartingCall(true);

    try {
      const result = await startCall({
        conversationId,
        type: "video" as CallType,
      });

      if (result.success) {
        setActiveCall(result.data);
      }
    } finally {
      setIsStartingCall(false);
    }
  }, [conversationId, isStartingCall]);

  // Accept incoming call
  const acceptCall = useCallback((call: CallWithDetails) => {
    setActiveCall(call);
    setIncomingCall(null);
    dismissedCallsRef.current.delete(call.id);
  }, []);

  // Dismiss incoming call notification (without declining)
  const dismissIncomingCall = useCallback(() => {
    if (incomingCall) {
      dismissedCallsRef.current.add(incomingCall.id);
    }
    setIncomingCall(null);
  }, [incomingCall]);

  // Clear active call (after leaving/ending)
  const clearActiveCall = useCallback(() => {
    if (activeCall) {
      dismissedCallsRef.current.add(activeCall.id);
    }
    setActiveCall(null);
  }, [activeCall]);

  return {
    activeCall,
    incomingCall,
    isStartingCall,
    isJoiningCall,
    startVoiceCall,
    startVideoCall,
    acceptCall,
    dismissIncomingCall,
    clearActiveCall,
  };
}
