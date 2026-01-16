import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const counts = await Promise.all([
    prisma.user.count().then(c => ({ table: 'Users', count: c })),
    prisma.organization.count().then(c => ({ table: 'Organizations', count: c })),
    prisma.project.count().then(c => ({ table: 'Projects', count: c })),
    prisma.fAQ.count().then(c => ({ table: 'FAQs', count: c })),
    prisma.testimonial.count().then(c => ({ table: 'Testimonials', count: c })),
    prisma.teamMember.count().then(c => ({ table: 'TeamMembers', count: c })),
    prisma.supportTicket.count().then(c => ({ table: 'SupportTickets', count: c })),
    prisma.platformFeedback.count().then(c => ({ table: 'PlatformFeedback', count: c })),
    prisma.announcement.count().then(c => ({ table: 'Announcements', count: c })),
    prisma.discountCode.count().then(c => ({ table: 'DiscountCodes', count: c })),
    prisma.adminAuditLog.count().then(c => ({ table: 'AdminAuditLogs', count: c })),
    prisma.featureFlag.count().then(c => ({ table: 'FeatureFlags', count: c })),
    prisma.systemSetting.count().then(c => ({ table: 'SystemSettings', count: c })),
  ]);
  console.table(counts);
}

main().catch(console.error).finally(() => prisma.$disconnect());
