"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  Users,
  X,
  MoreVertical,
  Maximize2,
  Minimize2,
  Settings,
} from "lucide-react";
import type { CallWithDetails } from "@/lib/actions/calls";
import { leaveCall, endCall, updateCallMediaState } from "@/lib/actions/calls";

interface CallInterfaceProps {
  call: CallWithDetails;
  currentUserId: string;
  onClose: () => void;
}

export function CallInterface({ call, currentUserId, onClose }: CallInterfaceProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const isInitiator = call.initiatorId === currentUserId;
  const joinedParticipants = call.participants.filter(p => p.status === "joined");

  // Duration timer
  useEffect(() => {
    const startTime = call.startedAt ? new Date(call.startedAt).getTime() : Date.now();

    const interval = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [call.startedAt]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Toggle mute
  const handleToggleMute = async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    await updateCallMediaState(call.id, { isMuted: newMuted });
  };

  // Toggle camera
  const handleToggleCamera = async () => {
    const newCameraOff = !isCameraOff;
    setIsCameraOff(newCameraOff);
    await updateCallMediaState(call.id, { isCameraOff: newCameraOff });
  };

  // Toggle screen share
  const handleToggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    // In production, integrate with video provider's screen share API
  };

  // Toggle fullscreen
  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Leave call
  const handleLeaveCall = async () => {
    if (isEnding) return;
    setIsEnding(true);

    await leaveCall(call.id);
    onClose();
  };

  // End call (initiator only)
  const handleEndCall = async () => {
    if (isEnding) return;
    setIsEnding(true);

    await endCall(call.id);
    onClose();
  };

  // Get participant name
  const getParticipantName = (participant: CallWithDetails["participants"][0]) => {
    return participant.user?.fullName || participant.client?.fullName || "Unknown";
  };

  return (
    <div className="call-interface fixed inset-0 z-50 flex flex-col bg-[#0a0a0a]">
      {/* Call Header */}
      <header className="call-header flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {call.title || call.conversation.name || "Call"}
            </h2>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>{formatDuration(callDuration)}</span>
              <span>•</span>
              <span>{joinedParticipants.length} participant{joinedParticipants.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              showParticipants ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10"
            }`}
            aria-label="Show participants"
            aria-pressed={showParticipants}
          >
            <Users className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            onClick={handleToggleFullscreen}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:bg-white/10 transition-colors"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:bg-white/10 transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Main Call Area */}
      <div className="call-content flex flex-1 overflow-hidden">
        {/* Video Grid */}
        <div className={`flex-1 p-4 ${showParticipants ? "pr-0" : ""}`}>
          <div className={`grid h-full gap-4 ${
            joinedParticipants.length === 1 ? "grid-cols-1" :
            joinedParticipants.length === 2 ? "grid-cols-2" :
            joinedParticipants.length <= 4 ? "grid-cols-2 grid-rows-2" :
            "grid-cols-3 grid-rows-2"
          }`}>
            {joinedParticipants.map((participant) => (
              <div
                key={participant.id}
                className="relative rounded-2xl bg-[#1a1a1a] overflow-hidden"
              >
                {/* Video placeholder - In production, embed actual video stream */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {participant.isCameraOff ? (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-600 to-gray-700">
                      <span className="text-3xl font-medium text-white">
                        {getParticipantName(participant).split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    // Placeholder for video stream
                    <div className="h-full w-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-blue-600">
                        <span className="text-3xl font-medium text-white">
                          {getParticipantName(participant).split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Participant info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {getParticipantName(participant)}
                      {participant.userId === currentUserId && " (You)"}
                    </span>
                    {participant.isMuted && (
                      <MicOff className="h-4 w-4 text-red-400" aria-label="Muted" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Participants Panel */}
        {showParticipants && (
          <aside className="participants-panel w-80 border-l border-white/10 bg-[#141414] overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-4">
                Participants ({call.participants.length})
              </h3>
              <ul className="space-y-2" role="list">
                {call.participants.map((participant) => (
                  <li
                    key={participant.id}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-600 to-gray-700">
                      <span className="text-sm font-medium text-white">
                        {getParticipantName(participant).split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {getParticipantName(participant)}
                        {participant.userId === currentUserId && " (You)"}
                      </p>
                      <p className="text-xs text-white/50 capitalize">
                        {participant.status}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {participant.isMuted && (
                        <MicOff className="h-4 w-4 text-red-400" aria-hidden="true" />
                      )}
                      {participant.isCameraOff && (
                        <VideoOff className="h-4 w-4 text-red-400" aria-hidden="true" />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>

      {/* Call Controls */}
      <footer className="call-controls flex items-center justify-center gap-4 bg-gradient-to-t from-black/50 to-transparent px-6 py-6">
        {/* Mute Button */}
        <button
          onClick={handleToggleMute}
          className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
            isMuted
              ? "bg-red-500 text-white"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
          aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
          aria-pressed={isMuted}
        >
          {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </button>

        {/* Camera Button */}
        <button
          onClick={handleToggleCamera}
          className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
            isCameraOff
              ? "bg-red-500 text-white"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
          aria-label={isCameraOff ? "Turn on camera" : "Turn off camera"}
          aria-pressed={isCameraOff}
        >
          {isCameraOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
        </button>

        {/* Screen Share Button */}
        <button
          onClick={handleToggleScreenShare}
          className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
            isScreenSharing
              ? "bg-[var(--primary)] text-white"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
          aria-label={isScreenSharing ? "Stop sharing screen" : "Share screen"}
          aria-pressed={isScreenSharing}
        >
          <Monitor className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* End Call Button */}
        <button
          onClick={isInitiator ? handleEndCall : handleLeaveCall}
          disabled={isEnding}
          className="flex h-14 w-24 items-center justify-center gap-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
          aria-label={isInitiator ? "End call for everyone" : "Leave call"}
        >
          <PhoneOff className="h-6 w-6" aria-hidden="true" />
        </button>
      </footer>

      {/* Provider Integration Notice */}
      {call.provider === "demo" && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-lg bg-yellow-500/20 border border-yellow-500/30 px-4 py-2 text-sm text-yellow-200">
          Demo mode - Configure VIDEO_CALL_PROVIDER for real video calls
        </div>
      )}
    </div>
  );
}
