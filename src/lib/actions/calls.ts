"use server";

/**
 * Voice/Video Call Integration
 *
 * STATUS: Coming Soon
 *
 * To activate voice/video calls, configure a video call provider:
 *
 * 1. Choose a provider: Daily.co (recommended), Twilio Video, or LiveKit
 *
 * 2. Set environment variables:
 *    - VIDEO_CALL_PROVIDER=daily (or 'twilio' or 'livekit')
 *    - DAILY_API_KEY=your_daily_api_key (for Daily.co)
 *    - Or respective API keys for Twilio/LiveKit
 *
 * 3. Re-enable call buttons in:
 *    - src/app/(dashboard)/messages/[conversationId]/conversation-page-client.tsx
 *    - Remove "Coming Soon" disabled state from Phone/Video buttons
 *
 * See Daily.co setup: https://docs.daily.co/
 * See Twilio Video: https://www.twilio.com/docs/video
 * See LiveKit: https://docs.livekit.io/
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { CallType, CallStatus, CallParticipantStatus } from "@prisma/client";
import { requireOrganizationId, requireUserId } from "./auth-helper";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

// =============================================================================
// Types
// =============================================================================

export interface CallWithDetails {
  id: string;
  conversationId: string;
  initiatorId: string;
  type: CallType;
  status: CallStatus;
  provider: string | null;
  roomId: string | null;
  roomUrl: string | null;
  roomToken: string | null;
  scheduledFor: Date | null;
  startedAt: Date | null;
  endedAt: Date | null;
  duration: number | null;
  isRecorded: boolean;
  recordingUrl: string | null;
  title: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  initiator: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
  participants: {
    id: string;
    userId: string | null;
    clientId: string | null;
    status: CallParticipantStatus;
    joinedAt: Date | null;
    leftAt: Date | null;
    isMuted: boolean;
    isCameraOff: boolean;
    user?: {
      id: string;
      fullName: string | null;
      avatarUrl: string | null;
    } | null;
    client?: {
      id: string;
      fullName: string | null;
    } | null;
  }[];
  conversation: {
    id: string;
    name: string | null;
    type: string;
  };
}

export interface StartCallInput {
  conversationId: string;
  type?: CallType;
  title?: string;
  description?: string;
  participantUserIds?: string[];
  participantClientIds?: string[];
}

// =============================================================================
// Call Provider Interface
// This is where you'd integrate with Daily.co, Twilio, LiveKit, etc.
// =============================================================================

interface CallProviderResult {
  success: boolean;
  roomId?: string;
  roomUrl?: string;
  roomToken?: string;
  error?: string;
}

/**
 * Create a video call room with the configured provider
 * Replace this implementation with your actual video provider (Daily.co, Twilio, etc.)
 */
async function createProviderRoom(callId: string): Promise<CallProviderResult> {
  // Check which provider is configured
  const provider = process.env.VIDEO_CALL_PROVIDER || "none";

  switch (provider) {
    case "daily": {
      // Daily.co integration
      const apiKey = process.env.DAILY_API_KEY;
      if (!apiKey) {
        return { success: false, error: "Daily.co API key not configured" };
      }

      try {
        const response = await fetch("https://api.daily.co/v1/rooms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            name: `photoproos-${callId}`,
            properties: {
              exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
              enable_chat: true,
              enable_screenshare: true,
              start_video_off: false,
              start_audio_off: false,
            },
          }),
        });

        if (!response.ok) {
          return { success: false, error: "Failed to create Daily.co room" };
        }

        const data = await response.json();
        return {
          success: true,
          roomId: data.name,
          roomUrl: data.url,
        };
      } catch (error) {
        console.error("[Calls] Daily.co error:", error);
        return { success: false, error: "Daily.co integration error" };
      }
    }

    case "twilio": {
      // Twilio Video integration placeholder
      // Add your Twilio implementation here
      return { success: false, error: "Twilio integration not implemented" };
    }

    case "livekit": {
      // LiveKit integration placeholder
      // Add your LiveKit implementation here
      return { success: false, error: "LiveKit integration not implemented" };
    }

    default: {
      // No provider configured - return demo mode
      return {
        success: true,
        roomId: `demo-${callId}`,
        roomUrl: `https://demo.videocall.example.com/${callId}`,
        roomToken: "demo-token",
      };
    }
  }
}

// =============================================================================
// Call Actions
// =============================================================================

/**
 * Start a new call in a conversation
 */
export async function startCall(
  input: StartCallInput
): Promise<ActionResult<CallWithDetails>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Verify user has access to conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: input.conversationId,
        userId,
        leftAt: null,
        conversation: {
          organizationId,
          isArchived: false,
        },
      },
      include: {
        conversation: {
          include: {
            participants: {
              where: { leftAt: null },
              include: {
                user: { select: { id: true, fullName: true } },
                client: { select: { id: true, fullName: true } },
              },
            },
          },
        },
      },
    });

    if (!participant) {
      return fail("You don't have access to this conversation");
    }

    // Check for existing active call in this conversation
    const existingCall = await prisma.call.findFirst({
      where: {
        conversationId: input.conversationId,
        status: { in: ["pending", "ringing", "active"] },
      },
    });

    if (existingCall) {
      return fail("There's already an active call in this conversation");
    }

    // Create the call
    const call = await prisma.call.create({
      data: {
        conversationId: input.conversationId,
        initiatorId: userId,
        type: input.type || "video",
        status: "pending",
        title: input.title,
        description: input.description,
      },
    });

    // Create provider room
    const providerResult = await createProviderRoom(call.id);

    if (!providerResult.success) {
      await prisma.call.update({
        where: { id: call.id },
        data: { status: "failed" },
      });
      return fail(providerResult.error || "Failed to create call room");
    }

    // Update call with provider details
    await prisma.call.update({
      where: { id: call.id },
      data: {
        provider: process.env.VIDEO_CALL_PROVIDER || "demo",
        roomId: providerResult.roomId,
        roomUrl: providerResult.roomUrl,
        roomToken: providerResult.roomToken,
        status: "ringing",
      },
    });

    // Add participants
    const participantUserIds = input.participantUserIds ||
      participant.conversation.participants
        .filter((p) => p.userId && p.userId !== userId)
        .map((p) => p.userId!);

    const participantClientIds = input.participantClientIds ||
      participant.conversation.participants
        .filter((p) => p.clientId)
        .map((p) => p.clientId!);

    // Add initiator as first participant (joined)
    await prisma.callParticipant.create({
      data: {
        callId: call.id,
        userId,
        status: "joined",
        joinedAt: new Date(),
      },
    });

    // Add other users (invited)
    for (const participantUserId of participantUserIds) {
      await prisma.callParticipant.create({
        data: {
          callId: call.id,
          userId: participantUserId,
          status: "invited",
        },
      });
    }

    // Add clients (invited)
    for (const clientId of participantClientIds) {
      await prisma.callParticipant.create({
        data: {
          callId: call.id,
          clientId,
          status: "invited",
        },
      });
    }

    // Fetch the updated call with all details
    const updatedCall = await prisma.call.findUnique({
      where: { id: call.id },
      include: {
        initiator: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, fullName: true, avatarUrl: true },
            },
            client: {
              select: { id: true, fullName: true },
            },
          },
        },
        conversation: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    revalidatePath(`/messages/${input.conversationId}`);
    return success(updatedCall as unknown as CallWithDetails);
  } catch (error) {
    console.error("[Calls] Error starting call:", error);
    return fail("Failed to start call");
  }
}

/**
 * Join an existing call
 */
export async function joinCall(
  callId: string
): Promise<ActionResult<CallWithDetails>> {
  try {
    const userId = await requireUserId();

    // Find the call and verify access
    const call = await prisma.call.findFirst({
      where: {
        id: callId,
        status: { in: ["pending", "ringing", "active"] },
      },
      include: {
        participants: {
          where: {
            OR: [{ userId }, { leftAt: null }],
          },
        },
      },
    });

    if (!call) {
      return fail("Call not found or already ended");
    }

    // Check if user is a participant
    const participant = call.participants.find((p) => p.userId === userId);
    if (!participant) {
      return fail("You're not invited to this call");
    }

    // Update participant status
    await prisma.callParticipant.update({
      where: { id: participant.id },
      data: {
        status: "joined",
        joinedAt: new Date(),
      },
    });

    // If this is the first non-initiator to join, mark call as active
    if (call.status === "ringing") {
      await prisma.call.update({
        where: { id: callId },
        data: {
          status: "active",
          startedAt: new Date(),
        },
      });
    }

    // Fetch updated call
    const updatedCall = await prisma.call.findUnique({
      where: { id: callId },
      include: {
        initiator: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, fullName: true, avatarUrl: true },
            },
            client: {
              select: { id: true, fullName: true },
            },
          },
        },
        conversation: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    return success(updatedCall as unknown as CallWithDetails);
  } catch (error) {
    console.error("[Calls] Error joining call:", error);
    return fail("Failed to join call");
  }
}

/**
 * Leave a call
 */
export async function leaveCall(
  callId: string
): Promise<ActionResult<void>> {
  try {
    const userId = await requireUserId();

    const participant = await prisma.callParticipant.findFirst({
      where: {
        callId,
        userId,
        status: "joined",
      },
    });

    if (!participant) {
      return fail("You're not in this call");
    }

    const now = new Date();
    const duration = participant.joinedAt
      ? Math.floor((now.getTime() - participant.joinedAt.getTime()) / 1000)
      : 0;

    await prisma.callParticipant.update({
      where: { id: participant.id },
      data: {
        status: "left",
        leftAt: now,
        duration,
      },
    });

    // Check if all participants have left
    const remainingParticipants = await prisma.callParticipant.count({
      where: {
        callId,
        status: "joined",
      },
    });

    if (remainingParticipants === 0) {
      // End the call
      const call = await prisma.call.findUnique({
        where: { id: callId },
        select: { startedAt: true },
      });

      const callDuration = call?.startedAt
        ? Math.floor((now.getTime() - call.startedAt.getTime()) / 1000)
        : 0;

      await prisma.call.update({
        where: { id: callId },
        data: {
          status: "ended",
          endedAt: now,
          duration: callDuration,
        },
      });
    }

    return ok();
  } catch (error) {
    console.error("[Calls] Error leaving call:", error);
    return fail("Failed to leave call");
  }
}

/**
 * Decline a call invitation
 */
export async function declineCall(
  callId: string
): Promise<ActionResult<void>> {
  try {
    const userId = await requireUserId();

    const participant = await prisma.callParticipant.findFirst({
      where: {
        callId,
        userId,
        status: "invited",
      },
    });

    if (!participant) {
      return fail("No invitation found");
    }

    await prisma.callParticipant.update({
      where: { id: participant.id },
      data: { status: "declined" },
    });

    // Check if all invited participants have declined
    const pendingInvites = await prisma.callParticipant.count({
      where: {
        callId,
        status: "invited",
      },
    });

    const joinedParticipants = await prisma.callParticipant.count({
      where: {
        callId,
        status: "joined",
      },
    });

    if (pendingInvites === 0 && joinedParticipants <= 1) {
      // Mark call as missed if only initiator is left
      await prisma.call.update({
        where: { id: callId },
        data: { status: "missed" },
      });
    }

    return ok();
  } catch (error) {
    console.error("[Calls] Error declining call:", error);
    return fail("Failed to decline call");
  }
}

/**
 * End a call (initiator only)
 */
export async function endCall(
  callId: string
): Promise<ActionResult<void>> {
  try {
    const userId = await requireUserId();

    const call = await prisma.call.findFirst({
      where: {
        id: callId,
        initiatorId: userId,
        status: { in: ["pending", "ringing", "active"] },
      },
    });

    if (!call) {
      return fail("Call not found or you don't have permission to end it");
    }

    const now = new Date();
    const duration = call.startedAt
      ? Math.floor((now.getTime() - call.startedAt.getTime()) / 1000)
      : 0;

    // Update all joined participants
    await prisma.callParticipant.updateMany({
      where: {
        callId,
        status: "joined",
      },
      data: {
        status: "left",
        leftAt: now,
      },
    });

    // End the call
    await prisma.call.update({
      where: { id: callId },
      data: {
        status: "ended",
        endedAt: now,
        duration,
      },
    });

    return ok();
  } catch (error) {
    console.error("[Calls] Error ending call:", error);
    return fail("Failed to end call");
  }
}

/**
 * Get active call for a conversation (if any)
 */
export async function getActiveCall(
  conversationId: string
): Promise<ActionResult<CallWithDetails | null>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Verify access
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
        conversation: { organizationId },
      },
    });

    if (!participant) {
      return fail("You don't have access to this conversation");
    }

    const call = await prisma.call.findFirst({
      where: {
        conversationId,
        status: { in: ["pending", "ringing", "active"] },
      },
      include: {
        initiator: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, fullName: true, avatarUrl: true },
            },
            client: {
              select: { id: true, fullName: true },
            },
          },
        },
        conversation: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    return success(call as unknown as CallWithDetails | null);
  } catch (error) {
    console.error("[Calls] Error getting active call:", error);
    return fail("Failed to get active call");
  }
}

/**
 * Get call history for a conversation
 */
export async function getCallHistory(
  conversationId: string,
  limit: number = 20
): Promise<ActionResult<CallWithDetails[]>> {
  try {
    const organizationId = await requireOrganizationId();
    const userId = await requireUserId();

    // Verify access
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
        conversation: { organizationId },
      },
    });

    if (!participant) {
      return fail("You don't have access to this conversation");
    }

    const calls = await prisma.call.findMany({
      where: {
        conversationId,
        status: { in: ["ended", "missed", "declined", "failed"] },
      },
      include: {
        initiator: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, fullName: true, avatarUrl: true },
            },
            client: {
              select: { id: true, fullName: true },
            },
          },
        },
        conversation: {
          select: { id: true, name: true, type: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return success(calls as unknown as CallWithDetails[]);
  } catch (error) {
    console.error("[Calls] Error getting call history:", error);
    return fail("Failed to get call history");
  }
}

/**
 * Update participant media state
 */
export async function updateCallMediaState(
  callId: string,
  state: { isMuted?: boolean; isCameraOff?: boolean }
): Promise<ActionResult<void>> {
  try {
    const userId = await requireUserId();

    await prisma.callParticipant.updateMany({
      where: {
        callId,
        userId,
        status: "joined",
      },
      data: state,
    });

    return ok();
  } catch (error) {
    console.error("[Calls] Error updating media state:", error);
    return fail("Failed to update media state");
  }
}
