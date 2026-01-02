// Webinar data for PhotoProOS

export interface Webinar {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  date: string;
  time?: string;
  duration: string;
  host: {
    name: string;
    role: string;
  };
  status: "upcoming" | "past";
  views?: string;
  videoUrl?: string; // YouTube embed URL for past webinars
  topics: string[];
  takeaways: string[];
}

export const webinars: Webinar[] = [
  // Upcoming
  {
    slug: "pay-to-unlock-galleries",
    title: "Maximizing Revenue with Pay-to-Unlock Galleries",
    description: "Learn how to set up pay-to-unlock galleries and increase your revenue per client by 40%.",
    longDescription: `In this live webinar, we'll dive deep into the pay-to-unlock feature that's helping photographers increase their revenue by an average of 40%.

You'll learn how to price your galleries effectively, create compelling preview experiences, and handle the entire payment flow seamlessly.

Whether you're a real estate photographer looking to monetize your delivery process or a portrait photographer wanting to streamline payments, this session will give you actionable strategies you can implement immediately.`,
    date: "January 15, 2025",
    time: "2:00 PM EST",
    duration: "45 min",
    host: {
      name: "Sarah Chen",
      role: "Product Lead",
    },
    status: "upcoming",
    topics: [
      "Setting up pay-to-unlock on your galleries",
      "Pricing strategies that maximize conversion",
      "Creating compelling preview experiences",
      "Handling payments and Stripe integration",
      "Following up after payment",
    ],
    takeaways: [
      "Configure pay-to-unlock galleries in under 5 minutes",
      "Price your work confidently based on value",
      "Reduce payment friction for clients",
      "Track revenue and gallery performance",
    ],
  },
  {
    slug: "automating-workflow",
    title: "Automating Your Photography Workflow",
    description: "Discover how to save 10+ hours per week by automating delivery, reminders, and client communication.",
    longDescription: `Time is your most valuable asset. In this comprehensive workshop, we'll show you how to automate the repetitive tasks that eat up your week.

From automatic gallery delivery notifications to scheduled follow-ups, you'll learn how to build workflows that run themselves while you focus on what you do best—capturing amazing photos.

We'll cover practical examples you can implement immediately, including email templates, automation triggers, and integration tips.`,
    date: "January 22, 2025",
    time: "1:00 PM EST",
    duration: "60 min",
    host: {
      name: "Marcus Johnson",
      role: "Customer Success",
    },
    status: "upcoming",
    topics: [
      "Identifying automation opportunities",
      "Setting up automatic notifications",
      "Creating email templates that convert",
      "Scheduling follow-ups and reminders",
      "Measuring time savings",
    ],
    takeaways: [
      "Build your first automation in 10 minutes",
      "Create professional email templates",
      "Set up automatic gallery notifications",
      "Track client engagement automatically",
    ],
  },
  // Past webinars
  {
    slug: "getting-started",
    title: "Getting Started with PhotoProOS",
    description: "A complete walkthrough of PhotoProOS features and how to set up your account for success.",
    longDescription: `This foundational webinar covers everything you need to know to get started with PhotoProOS. Whether you're brand new or looking to make sure you're using all the features available to you, this session has something for everyone.

We cover account setup, branding customization, gallery creation, client management, and payment processing—all the essentials to run your photography business from one platform.`,
    date: "December 10, 2024",
    duration: "45 min",
    host: {
      name: "Marcus Johnson",
      role: "Customer Success",
    },
    status: "past",
    views: "1,247",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    topics: [
      "Account setup and configuration",
      "Customizing your branding",
      "Creating your first gallery",
      "Adding and managing clients",
      "Setting up payments with Stripe",
    ],
    takeaways: [
      "Complete account setup in under 30 minutes",
      "Upload and organize your first gallery",
      "Add your first client",
      "Connect your Stripe account",
    ],
  },
  {
    slug: "real-estate-masterclass",
    title: "Real Estate Photography Business Masterclass",
    description: "Tips and strategies from top real estate photographers using PhotoProOS.",
    longDescription: `Join us for an in-depth masterclass specifically designed for real estate photographers. We've brought together insights from some of the most successful real estate photographers on our platform to share what's working for them.

Learn about pricing strategies, turnaround time optimization, agent relationship building, and how to scale your real estate photography business using PhotoProOS.`,
    date: "November 28, 2024",
    duration: "60 min",
    host: {
      name: "David Park",
      role: "Industry Expert",
    },
    status: "past",
    views: "892",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    topics: [
      "Pricing strategies for real estate",
      "Optimizing turnaround times",
      "Building agent relationships",
      "Gallery delivery best practices",
      "Scaling with PhotoProOS",
    ],
    takeaways: [
      "Price your real estate packages competitively",
      "Deliver galleries in under 24 hours",
      "Create repeat business with agents",
      "Use templates to speed up workflow",
    ],
  },
  {
    slug: "holiday-mini-sessions",
    title: "Holiday Mini Sessions: Planning & Pricing",
    description: "How to plan, price, and deliver profitable mini sessions during the holiday season.",
    longDescription: `Mini sessions are a fantastic way to boost your income during the holiday season. But without proper planning, they can quickly become overwhelming.

In this practical workshop, we cover everything from setting up your schedule to pricing, marketing, and delivering galleries efficiently. You'll leave with a complete playbook for running profitable mini sessions.`,
    date: "November 15, 2024",
    duration: "45 min",
    host: {
      name: "Sarah Chen",
      role: "Product Lead",
    },
    status: "past",
    views: "756",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    topics: [
      "Planning your mini session calendar",
      "Pricing for profitability",
      "Marketing your sessions",
      "Streamlining the booking process",
      "Efficient gallery delivery",
    ],
    takeaways: [
      "Create a mini session schedule that works",
      "Price sessions for maximum profit",
      "Use PhotoProOS for booking and delivery",
      "Deliver galleries same-day",
    ],
  },
  {
    slug: "client-relationships",
    title: "Building Client Relationships That Last",
    description: "Strategies for turning one-time clients into repeat customers and referral sources.",
    longDescription: `Your existing clients are your best source of future business. But building lasting relationships takes intentional effort and the right systems.

In this session, we explore proven strategies for client retention, including communication best practices, follow-up sequences, and referral programs. Learn how to turn every client into a long-term relationship.`,
    date: "October 30, 2024",
    duration: "50 min",
    host: {
      name: "Marcus Johnson",
      role: "Customer Success",
    },
    status: "past",
    views: "634",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    topics: [
      "Client communication best practices",
      "Follow-up sequences that work",
      "Building a referral program",
      "Staying top of mind",
      "Using CRM effectively",
    ],
    takeaways: [
      "Create a client communication plan",
      "Set up automated follow-ups",
      "Launch a simple referral program",
      "Track client relationships in PhotoProOS",
    ],
  },
];

// Helper functions
export function getWebinar(slug: string): Webinar | undefined {
  return webinars.find((w) => w.slug === slug);
}

export function getUpcomingWebinars(): Webinar[] {
  return webinars.filter((w) => w.status === "upcoming");
}

export function getPastWebinars(): Webinar[] {
  return webinars.filter((w) => w.status === "past");
}

export function getAllWebinars(): Webinar[] {
  return webinars;
}

export function getRelatedWebinars(currentSlug: string, limit = 2): Webinar[] {
  return webinars.filter((w) => w.slug !== currentSlug && w.status === "past").slice(0, limit);
}
