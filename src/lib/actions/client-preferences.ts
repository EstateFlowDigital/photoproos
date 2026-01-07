"use server";

import { prisma } from "@/lib/db";
import { getClientSession } from "@/lib/actions/client-auth";
import { success, fail, type ActionResult } from "@/lib/types/action-result";
import type { ClientBookingPreferences, ClientPreferences } from "@/lib/types/client-preferences";
import { Prisma } from "@prisma/client";

export type UpdateClientBookingPreferencesInput = Partial<ClientBookingPreferences> & {
  profile?: ClientBookingPreferences["profile"];
  preferences?: ClientBookingPreferences["preferences"];
  agreements?: ClientBookingPreferences["agreements"];
  preferredIndustry?: ClientBookingPreferences["preferredIndustry"];
};

function mergeRecord(
  base: Record<string, unknown>,
  update: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...base };
  Object.entries(update).forEach(([key, value]) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const existing = result[key];
      result[key] = mergeRecord(
        (existing as Record<string, unknown>) || {},
        value as Record<string, unknown>
      );
      return;
    }
    if (value !== undefined) {
      result[key] = value;
    }
  });
  return result;
}

export async function updateClientBookingPreferences(
  input: UpdateClientBookingPreferencesInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getClientSession();
    if (!session) {
      return fail("Unauthorized");
    }

    const client = await prisma.client.findUnique({
      where: { id: session.clientId },
      select: { id: true, preferences: true },
    });

    if (!client) {
      return fail("Client not found");
    }

    const currentPreferences = (client.preferences as ClientPreferences | null) || {};
    const currentBooking = currentPreferences.booking || {};

    const nextBooking: ClientBookingPreferences = {
      ...currentBooking,
      ...input,
      profile: {
        ...currentBooking.profile,
        ...input.profile,
      },
      preferences: {
        ...currentBooking.preferences,
        ...input.preferences,
      },
      agreements: {
        ...currentBooking.agreements,
        ...input.agreements,
      },
    };

    const nextPreferences = mergeRecord(currentPreferences as Record<string, unknown>, {
      booking: nextBooking as unknown as Record<string, unknown>,
    });

    const updated = await prisma.client.update({
      where: { id: session.clientId },
      data: {
        preferences: nextPreferences as Prisma.InputJsonValue,
      },
      select: { id: true },
    });

    return success({ id: updated.id });
  } catch (error) {
    console.error("Error updating client booking preferences:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to update preferences");
  }
}
