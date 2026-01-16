/**
 * Debug endpoint to diagnose super-admin data issues
 * Visit: /api/debug/super-admin
 *
 * DELETE THIS FILE AFTER DEBUGGING
 */

import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth/super-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics: Record<string, unknown> = {};

  try {
    // 1. Check Clerk auth
    const { userId } = await auth();
    diagnostics.clerkUserId = userId;
    diagnostics.isAuthenticated = !!userId;

    // 2. Check Clerk user metadata
    const user = await currentUser();
    diagnostics.clerkEmail = user?.emailAddresses?.[0]?.emailAddress;
    diagnostics.clerkPublicMetadata = user?.publicMetadata;
    diagnostics.isSuperAdminInMetadata = user?.publicMetadata?.isSuperAdmin === true;

    // 3. Check isSuperAdmin function
    const superAdminCheck = await isSuperAdmin();
    diagnostics.isSuperAdminFunctionResult = superAdminCheck;

    // 4. Check database connection and data
    const dbCounts = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.project.count(),
      prisma.client.count(),
      prisma.payment.count({ where: { status: "paid" } }),
    ]);

    diagnostics.database = {
      connected: true,
      userCount: dbCounts[0],
      orgCount: dbCounts[1],
      projectCount: dbCounts[2],
      clientCount: dbCounts[3],
      paidPaymentCount: dbCounts[4],
    };

    // 5. Test fetching dashboard stats
    if (superAdminCheck) {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [activeUsers, newUsersThisWeek, totalRevenue] = await Promise.all([
        prisma.user.count({ where: { updatedAt: { gte: dayAgo } } }),
        prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
        prisma.payment.aggregate({
          _sum: { amountCents: true },
          where: { status: "paid" },
        }),
      ]);

      diagnostics.dashboardData = {
        activeUsersToday: activeUsers,
        newUsersThisWeek: newUsersThisWeek,
        totalRevenueCents: totalRevenue._sum.amountCents || 0,
        totalRevenueDollars: ((totalRevenue._sum.amountCents || 0) / 100).toFixed(2),
      };
    } else {
      diagnostics.dashboardData = "SKIPPED - isSuperAdmin() returned false";
    }

    // 6. Diagnosis summary
    diagnostics.diagnosis = [];

    if (!userId) {
      (diagnostics.diagnosis as string[]).push("❌ Not authenticated with Clerk");
    } else if (!user?.publicMetadata?.isSuperAdmin) {
      (diagnostics.diagnosis as string[]).push("❌ User lacks isSuperAdmin in publicMetadata");
      (diagnostics.diagnosis as string[]).push("FIX: Go to Clerk Dashboard → Users → Your user → Metadata → Add: { \"isSuperAdmin\": true }");
    } else if (dbCounts[0] === 0) {
      (diagnostics.diagnosis as string[]).push("❌ Database has no users - run seed");
    } else {
      (diagnostics.diagnosis as string[]).push("✅ Everything looks correct");
      (diagnostics.diagnosis as string[]).push("If data still not showing, check browser console for errors");
    }

  } catch (error) {
    diagnostics.error = error instanceof Error ? error.message : String(error);
    diagnostics.database = { connected: false, error: diagnostics.error };
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
