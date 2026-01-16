/**
 * Diagnostic script to check super-admin data and database state
 * Run with: npx tsx prisma/check-super-admin-data.ts
 */

import "dotenv/config";
import { prisma } from "../src/lib/db";

async function checkSuperAdminData() {
  console.log("\n🔍 SUPER ADMIN DATA DIAGNOSTIC\n");
  console.log("=".repeat(60));

  // 1. Check Users
  console.log("\n📊 USERS");
  const userCount = await prisma.user.count();
  console.log(`  Total users: ${userCount}`);

  if (userCount > 0) {
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
      },
    });
    console.log("  Recent users:");
    recentUsers.forEach(u => {
      console.log(`    - ${u.email} (${u.fullName || 'No name'})`);
    });
  }

  // 2. Check Organizations
  console.log("\n🏢 ORGANIZATIONS");
  const orgCount = await prisma.organization.count();
  console.log(`  Total organizations: ${orgCount}`);

  if (orgCount > 0) {
    const orgs = await prisma.organization.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        plan: true,
      },
    });
    console.log("  Recent organizations:");
    orgs.forEach(o => {
      console.log(`    - ${o.name} (Plan: ${o.plan || 'Free'})`);
    });
  }

  // 3. Check Projects/Galleries
  console.log("\n📸 PROJECTS/GALLERIES");
  const projectCount = await prisma.project.count();
  console.log(`  Total projects: ${projectCount}`);

  // 4. Check Clients
  console.log("\n👥 CLIENTS");
  const clientCount = await prisma.client.count();
  console.log(`  Total clients: ${clientCount}`);

  // 5. Check Payments
  console.log("\n💰 PAYMENTS");
  const paymentCount = await prisma.payment.count();
  const paidPayments = await prisma.payment.count({ where: { status: "paid" } });
  const totalRevenue = await prisma.payment.aggregate({
    _sum: { amountCents: true },
    where: { status: "paid" },
  });
  console.log(`  Total payments: ${paymentCount}`);
  console.log(`  Paid payments: ${paidPayments}`);
  console.log(`  Total revenue: $${((totalRevenue._sum.amountCents || 0) / 100).toFixed(2)}`);

  // 6. Check Support Tickets
  console.log("\n🎫 SUPPORT TICKETS");
  const ticketCount = await prisma.supportTicket.count();
  const openTickets = await prisma.supportTicket.count({
    where: { status: { in: ["open", "in_progress"] } },
  });
  console.log(`  Total tickets: ${ticketCount}`);
  console.log(`  Open tickets: ${openTickets}`);

  // 7. Check Feature Flags
  console.log("\n🚩 FEATURE FLAGS");
  const flagCount = await prisma.featureFlag.count();
  const enabledFlags = await prisma.featureFlag.count({ where: { isEnabled: true } });
  console.log(`  Total flags: ${flagCount}`);
  console.log(`  Enabled flags: ${enabledFlags}`);

  // 8. Check System Settings
  console.log("\n⚙️ SYSTEM SETTINGS");
  const settingsCount = await prisma.systemSetting.count();
  console.log(`  Total settings: ${settingsCount}`);

  // 9. Check Platform Feedback
  console.log("\n📝 PLATFORM FEEDBACK");
  const feedbackCount = await prisma.platformFeedback.count();
  console.log(`  Total feedback: ${feedbackCount}`);

  // 10. Check Announcements
  console.log("\n📢 ANNOUNCEMENTS");
  const announcementCount = await prisma.announcement.count();
  console.log(`  Total announcements: ${announcementCount}`);

  // 11. Check Discounts
  console.log("\n🎁 DISCOUNTS");
  const discountCount = await prisma.platformDiscount.count();
  console.log(`  Total discounts: ${discountCount}`);

  // 12. Check Gamification
  console.log("\n🎮 GAMIFICATION");
  const gamificationCount = await prisma.userGamification.count();
  console.log(`  Users with gamification: ${gamificationCount}`);

  // 13. Check Audit Logs
  console.log("\n📋 AUDIT LOGS");
  const auditLogCount = await prisma.adminAuditLog.count();
  console.log(`  Total audit logs: ${auditLogCount}`);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("\n📋 SUMMARY\n");

  const isEmpty = userCount === 0 && orgCount === 0 && projectCount === 0;

  if (isEmpty) {
    console.log("  ⚠️  DATABASE APPEARS EMPTY");
    console.log("  The super-admin portal needs data to display.");
    console.log("\n  To fix this, you can:");
    console.log("  1. Run the seed script: npx prisma db seed");
    console.log("  2. Or create data through the regular app");
  } else {
    console.log("  ✅ Database has data");
    console.log("\n  If data still doesn't appear in super-admin portal:");
    console.log("  1. Check if your Clerk user has isSuperAdmin metadata set");
    console.log("  2. Go to Clerk Dashboard → Users → Your user → Metadata");
    console.log("  3. Add to Public Metadata: { \"isSuperAdmin\": true }");
  }

  // Check for super admin metadata hint
  console.log("\n" + "=".repeat(60));
  console.log("\n🔐 SUPER ADMIN ACCESS CHECK\n");
  console.log("  The super-admin portal requires your Clerk user to have:");
  console.log("  publicMetadata.isSuperAdmin = true");
  console.log("\n  To set this:");
  console.log("  1. Go to https://dashboard.clerk.com");
  console.log("  2. Select your application");
  console.log("  3. Go to Users → find your user");
  console.log("  4. Click on Metadata tab");
  console.log("  5. Add to Public Metadata: { \"isSuperAdmin\": true }");
  console.log("  6. Save and refresh your app");

  console.log("\n");
}

checkSuperAdminData()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
