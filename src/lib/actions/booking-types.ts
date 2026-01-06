"use server";

import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { revalidatePath } from "next/cache";
import { ok, fail, type ActionResult } from "@/lib/types/action-result";

export interface BookingTypeInput {
  name: string;
  description?: string;
  durationMinutes: number;
  priceCents: number;
  color: string;
  isActive: boolean;
}

export async function getBookingTypes() {
  const auth = await getAuthContext();
  if (!auth) {
    return [];
  }

  return prisma.bookingType.findMany({
    where: { organizationId: auth.organizationId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { bookings: true },
      },
    },
  });
}

export async function getBookingType(id: string) {
  const auth = await getAuthContext();
  if (!auth) {
    return null;
  }

  return prisma.bookingType.findFirst({
    where: {
      id,
      organizationId: auth.organizationId,
    },
    include: {
      _count: {
        select: { bookings: true },
      },
    },
  });
}

export async function createBookingType(
  input: BookingTypeInput
): Promise<ActionResult<{ id: string }>> {
  const auth = await getAuthContext();
  if (!auth) {
    return fail("Not authenticated");
  }

  try {
    const bookingType = await prisma.bookingType.create({
      data: {
        organizationId: auth.organizationId,
        name: input.name,
        description: input.description,
        durationMinutes: input.durationMinutes,
        priceCents: input.priceCents,
        color: input.color,
        isActive: input.isActive,
      },
    });

    revalidatePath("/scheduling");
    revalidatePath("/scheduling/types");

    return { success: true, data: { id: bookingType.id } };
  } catch (error) {
    console.error("Error creating booking type:", error);
    return fail("Failed to create booking type");
  }
}

export async function updateBookingType(
  id: string,
  input: Partial<BookingTypeInput>
): Promise<ActionResult> {
  const auth = await getAuthContext();
  if (!auth) {
    return fail("Not authenticated");
  }

  try {
    await prisma.bookingType.update({
      where: {
        id,
        organizationId: auth.organizationId,
      },
      data: {
        name: input.name,
        description: input.description,
        durationMinutes: input.durationMinutes,
        priceCents: input.priceCents,
        color: input.color,
        isActive: input.isActive,
      },
    });

    revalidatePath("/scheduling");
    revalidatePath("/scheduling/types");

    return ok();
  } catch (error) {
    console.error("Error updating booking type:", error);
    return fail("Failed to update booking type");
  }
}

export async function deleteBookingType(id: string): Promise<ActionResult> {
  const auth = await getAuthContext();
  if (!auth) {
    return fail("Not authenticated");
  }

  try {
    // Check if any bookings use this type
    const bookingsCount = await prisma.booking.count({
      where: { bookingTypeId: id },
    });

    if (bookingsCount > 0) {
      return fail(`Cannot delete booking type with ${bookingsCount} associated booking${bookingsCount > 1 ? "s" : ""}. Please remove or reassign bookings first.`);
    }

    await prisma.bookingType.delete({
      where: {
        id,
        organizationId: auth.organizationId,
      },
    });

    revalidatePath("/scheduling");
    revalidatePath("/scheduling/types");

    return ok();
  } catch (error) {
    console.error("Error deleting booking type:", error);
    return fail("Failed to delete booking type");
  }
}

export async function seedDefaultBookingTypes(): Promise<ActionResult> {
  const auth = await getAuthContext();
  if (!auth) {
    return fail("Not authenticated");
  }

  try {
    const existingCount = await prisma.bookingType.count({
      where: { organizationId: auth.organizationId },
    });

    if (existingCount > 0) {
      return ok();
    }

    const defaultTypes = [
      {
        name: "Real Estate Shoot",
        description: "Standard real estate photography session",
        durationMinutes: 90,
        priceCents: 25000,
        color: "#3b82f6",
        isActive: true,
      },
      {
        name: "Portrait Session",
        description: "Individual or family portrait photography",
        durationMinutes: 60,
        priceCents: 20000,
        color: "#8b5cf6",
        isActive: true,
      },
      {
        name: "Headshots",
        description: "Professional headshot session",
        durationMinutes: 30,
        priceCents: 15000,
        color: "#06b6d4",
        isActive: true,
      },
      {
        name: "Event Coverage",
        description: "Event photography coverage",
        durationMinutes: 180,
        priceCents: 50000,
        color: "#22c55e",
        isActive: true,
      },
    ];

    await prisma.bookingType.createMany({
      data: defaultTypes.map((type) => ({
        ...type,
        organizationId: auth.organizationId,
      })),
    });

    revalidatePath("/scheduling");
    revalidatePath("/scheduling/types");

    return ok();
  } catch (error) {
    console.error("Error seeding booking types:", error);
    return fail("Failed to seed booking types");
  }
}
