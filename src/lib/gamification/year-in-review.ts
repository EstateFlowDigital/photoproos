/**
 * Year in Review
 *
 * Annual summary feature that shows users their accomplishments
 * for the year - galleries delivered, revenue earned, achievements
 * unlocked, and memorable moments.
 */

export interface YearInReviewStats {
  year: number;

  // Gallery stats
  galleriesCreated: number;
  galleriesDelivered: number;
  photosShared: number;

  // Revenue stats
  totalRevenueCents: number;
  paymentsReceived: number;
  averagePaymentCents: number;
  bestMonthRevenueCents: number;
  bestMonthName: string;

  // Client stats
  newClients: number;
  totalClients: number;
  repeatClients: number;

  // Booking stats
  bookingsCompleted: number;
  totalBookingHours: number;

  // Achievement stats
  achievementsUnlocked: number;
  xpEarned: number;
  levelsGained: number;
  startLevel: number;
  endLevel: number;

  // Streak stats
  longestLoginStreak: number;
  longestDeliveryStreak: number;
  totalDaysActive: number;

  // Highlights
  highlights: YearHighlight[];

  // Comparisons
  comparisons: {
    revenueVsLastYear: number | null; // percentage change
    galleriesVsLastYear: number | null;
    clientsVsLastYear: number | null;
  };
}

export interface YearHighlight {
  id: string;
  type: "achievement" | "milestone" | "record" | "streak" | "revenue";
  title: string;
  description: string;
  icon: string;
  date?: Date;
  value?: string;
}

/**
 * Generate highlights from yearly stats
 */
export function generateHighlights(stats: YearInReviewStats): YearHighlight[] {
  const highlights: YearHighlight[] = [];

  // Revenue milestone
  if (stats.totalRevenueCents >= 10000000) {
    highlights.push({
      id: "revenue-100k",
      type: "milestone",
      title: "Six Figure Year!",
      description: `You earned $${Math.round(stats.totalRevenueCents / 100).toLocaleString()} this year!`,
      icon: "🎉",
    });
  } else if (stats.totalRevenueCents >= 5000000) {
    highlights.push({
      id: "revenue-50k",
      type: "milestone",
      title: "$50K+ Year",
      description: `You earned over $50,000 this year!`,
      icon: "💰",
    });
  } else if (stats.totalRevenueCents >= 2500000) {
    highlights.push({
      id: "revenue-25k",
      type: "milestone",
      title: "$25K+ Year",
      description: `A quarter of the way to six figures!`,
      icon: "💵",
    });
  }

  // Best month
  if (stats.bestMonthRevenueCents > 0) {
    highlights.push({
      id: "best-month",
      type: "revenue",
      title: "Best Month",
      description: `${stats.bestMonthName} was your best month with $${Math.round(stats.bestMonthRevenueCents / 100).toLocaleString()}`,
      icon: "📈",
    });
  }

  // Delivery milestone
  if (stats.galleriesDelivered >= 100) {
    highlights.push({
      id: "deliveries-100",
      type: "milestone",
      title: "Delivery Machine",
      description: `You delivered ${stats.galleriesDelivered} galleries!`,
      icon: "📦",
    });
  } else if (stats.galleriesDelivered >= 50) {
    highlights.push({
      id: "deliveries-50",
      type: "milestone",
      title: "Prolific Deliverer",
      description: `50+ galleries delivered this year!`,
      icon: "📬",
    });
  }

  // Client growth
  if (stats.newClients >= 25) {
    highlights.push({
      id: "clients-25",
      type: "milestone",
      title: "Network Builder",
      description: `You added ${stats.newClients} new clients!`,
      icon: "👥",
    });
  }

  // Streak highlights
  if (stats.longestLoginStreak >= 30) {
    highlights.push({
      id: "streak-30",
      type: "streak",
      title: "Dedicated Professional",
      description: `${stats.longestLoginStreak}-day login streak achieved!`,
      icon: "🔥",
    });
  }

  // Level up
  if (stats.levelsGained > 0) {
    highlights.push({
      id: "level-up",
      type: "achievement",
      title: "Level Up!",
      description: `You went from Level ${stats.startLevel} to Level ${stats.endLevel}`,
      icon: "⬆️",
    });
  }

  // Achievement unlocks
  if (stats.achievementsUnlocked >= 10) {
    highlights.push({
      id: "achievements-10",
      type: "achievement",
      title: "Achievement Hunter",
      description: `You unlocked ${stats.achievementsUnlocked} achievements!`,
      icon: "🏆",
    });
  }

  // Year-over-year growth
  if (stats.comparisons.revenueVsLastYear && stats.comparisons.revenueVsLastYear > 50) {
    highlights.push({
      id: "growth-50",
      type: "record",
      title: "Explosive Growth",
      description: `${Math.round(stats.comparisons.revenueVsLastYear)}% revenue growth vs last year!`,
      icon: "🚀",
    });
  }

  return highlights.slice(0, 6); // Max 6 highlights
}

/**
 * Get fun facts about the year's performance
 */
export function getFunFacts(stats: YearInReviewStats): string[] {
  const facts: string[] = [];

  if (stats.photosShared > 0) {
    facts.push(`You shared ${stats.photosShared.toLocaleString()} photos with your clients!`);
  }

  if (stats.totalDaysActive > 0) {
    const percentOfYear = Math.round((stats.totalDaysActive / 365) * 100);
    facts.push(`You were active ${stats.totalDaysActive} days this year (${percentOfYear}% of the year!)`);
  }

  if (stats.totalBookingHours > 0) {
    facts.push(`You worked ${stats.totalBookingHours} hours of bookings - that's ${Math.round(stats.totalBookingHours / 8)} full work days!`);
  }

  if (stats.xpEarned > 0) {
    facts.push(`You earned ${stats.xpEarned.toLocaleString()} XP throughout the year!`);
  }

  if (stats.repeatClients > 0) {
    const repeatRate = Math.round((stats.repeatClients / stats.totalClients) * 100);
    facts.push(`${repeatRate}% of your clients were repeat customers - great retention!`);
  }

  return facts;
}

/**
 * Get encouragement message based on performance
 */
export function getEncouragementMessage(stats: YearInReviewStats): string {
  if (stats.totalRevenueCents >= 10000000) {
    return "Incredible year! You're truly a photography powerhouse. Keep pushing boundaries in the new year!";
  }

  if (stats.totalRevenueCents >= 5000000) {
    return "Fantastic year! Your dedication is paying off. Here's to even bigger achievements ahead!";
  }

  if (stats.totalRevenueCents >= 2500000) {
    return "Great progress this year! You're building something special. Keep up the momentum!";
  }

  if (stats.galleriesDelivered >= 25) {
    return "Solid year of consistent deliveries! Your clients appreciate your reliability.";
  }

  return "Every year is a building block. Here's to growth and new opportunities in the year ahead!";
}
