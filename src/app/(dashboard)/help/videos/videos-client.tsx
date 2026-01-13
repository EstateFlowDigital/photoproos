"use client";

import { useState } from "react";
import { Play, Clock, Search, Filter, BookOpen, Zap, CreditCard, Users, Image, Calendar } from "lucide-react";

// Video tutorial data
const VIDEO_CATEGORIES = [
  { id: "all", label: "All Videos", icon: Play },
  { id: "getting-started", label: "Getting Started", icon: BookOpen },
  { id: "galleries", label: "Galleries", icon: Image },
  { id: "clients", label: "Clients & CRM", icon: Users },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "scheduling", label: "Scheduling", icon: Calendar },
  { id: "automation", label: "Automation", icon: Zap },
];

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  thumbnail: string;
  videoUrl?: string;
  isNew?: boolean;
  isPopular?: boolean;
}

const VIDEOS: VideoTutorial[] = [
  // Getting Started
  {
    id: "welcome",
    title: "Welcome to PhotoProOS",
    description: "A quick tour of the platform and its key features. Learn how to navigate the dashboard and get started.",
    duration: "4:32",
    category: "getting-started",
    thumbnail: "/thumbnails/welcome.jpg",
    isPopular: true,
  },
  {
    id: "setup-account",
    title: "Setting Up Your Account",
    description: "Configure your profile, business details, branding, and preferences to personalize your experience.",
    duration: "6:15",
    category: "getting-started",
    thumbnail: "/thumbnails/setup.jpg",
    isNew: true,
  },
  {
    id: "first-client",
    title: "Adding Your First Client",
    description: "Learn how to create client profiles, add contact information, and organize your client database.",
    duration: "3:48",
    category: "getting-started",
    thumbnail: "/thumbnails/first-client.jpg",
  },
  // Galleries
  {
    id: "create-gallery",
    title: "Creating a Photo Gallery",
    description: "Step-by-step guide to creating beautiful client galleries, uploading photos, and customizing layouts.",
    duration: "8:22",
    category: "galleries",
    thumbnail: "/thumbnails/gallery.jpg",
    isPopular: true,
  },
  {
    id: "gallery-settings",
    title: "Gallery Privacy & Settings",
    description: "Configure password protection, download options, expiration dates, and privacy settings for galleries.",
    duration: "5:10",
    category: "galleries",
    thumbnail: "/thumbnails/settings.jpg",
  },
  {
    id: "pay-to-unlock",
    title: "Pay-to-Unlock Galleries",
    description: "Set up payment requirements before clients can download photos. Perfect for maximizing revenue.",
    duration: "6:45",
    category: "galleries",
    thumbnail: "/thumbnails/pay-unlock.jpg",
    isNew: true,
  },
  {
    id: "photo-proofing",
    title: "Client Proofing Workflow",
    description: "Allow clients to select their favorite photos, leave comments, and approve final selections.",
    duration: "7:18",
    category: "galleries",
    thumbnail: "/thumbnails/proofing.jpg",
  },
  // Clients & CRM
  {
    id: "client-management",
    title: "Client Management Overview",
    description: "Manage your entire client database, track communication history, and organize with tags.",
    duration: "5:55",
    category: "clients",
    thumbnail: "/thumbnails/clients.jpg",
    isPopular: true,
  },
  {
    id: "client-portal",
    title: "The Client Portal",
    description: "Give clients their own portal to access galleries, invoices, contracts, and questionnaires.",
    duration: "4:30",
    category: "clients",
    thumbnail: "/thumbnails/portal.jpg",
  },
  {
    id: "questionnaires",
    title: "Creating Questionnaires",
    description: "Build custom questionnaires to gather information from clients before shoots.",
    duration: "6:12",
    category: "clients",
    thumbnail: "/thumbnails/questionnaires.jpg",
  },
  // Payments
  {
    id: "stripe-setup",
    title: "Setting Up Stripe Payments",
    description: "Connect your Stripe account to accept credit card payments from clients.",
    duration: "4:45",
    category: "payments",
    thumbnail: "/thumbnails/stripe.jpg",
    isPopular: true,
  },
  {
    id: "create-invoice",
    title: "Creating & Sending Invoices",
    description: "Generate professional invoices, customize line items, and send to clients for payment.",
    duration: "5:30",
    category: "payments",
    thumbnail: "/thumbnails/invoice.jpg",
  },
  {
    id: "payment-plans",
    title: "Setting Up Payment Plans",
    description: "Allow clients to pay in installments with automated payment reminders.",
    duration: "4:20",
    category: "payments",
    thumbnail: "/thumbnails/payment-plans.jpg",
  },
  // Scheduling
  {
    id: "availability",
    title: "Setting Your Availability",
    description: "Configure your working hours, blocked dates, and booking buffer times.",
    duration: "3:55",
    category: "scheduling",
    thumbnail: "/thumbnails/availability.jpg",
  },
  {
    id: "booking-forms",
    title: "Creating Booking Forms",
    description: "Build custom booking forms for different services and embed them on your website.",
    duration: "6:40",
    category: "scheduling",
    thumbnail: "/thumbnails/booking.jpg",
    isNew: true,
  },
  {
    id: "calendar-sync",
    title: "Calendar Integration",
    description: "Sync with Google Calendar or iCal to keep all your appointments in one place.",
    duration: "4:10",
    category: "scheduling",
    thumbnail: "/thumbnails/calendar.jpg",
  },
  // Automation
  {
    id: "workflow-basics",
    title: "Workflow Automation Basics",
    description: "Introduction to automating repetitive tasks and streamlining your photography business.",
    duration: "7:25",
    category: "automation",
    thumbnail: "/thumbnails/workflow.jpg",
    isPopular: true,
  },
  {
    id: "email-templates",
    title: "Email Templates & Sequences",
    description: "Create reusable email templates and automated sequences for client communication.",
    duration: "5:50",
    category: "automation",
    thumbnail: "/thumbnails/email.jpg",
  },
  {
    id: "automated-reminders",
    title: "Automated Reminders",
    description: "Set up automatic reminders for payments, questionnaires, and upcoming sessions.",
    duration: "4:15",
    category: "automation",
    thumbnail: "/thumbnails/reminders.jpg",
  },
];

export function VideoTutorialsClient() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);

  const filteredVideos = VIDEOS.filter((video) => {
    const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularVideos = VIDEOS.filter((v) => v.isPopular);
  const newVideos = VIDEOS.filter((v) => v.isNew);

  return (
    <div className="space-y-8">
      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search tutorials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground-muted">
          <Filter className="h-4 w-4" />
          {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {VIDEO_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--card)] text-foreground-secondary hover:bg-[var(--background-hover)]"
            }`}
          >
            <category.icon className="h-4 w-4" />
            {category.label}
          </button>
        ))}
      </div>

      {/* Featured Sections (only show when no filter) */}
      {selectedCategory === "all" && !searchQuery && (
        <>
          {/* Popular Videos */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Popular Tutorials</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {popularVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={() => setSelectedVideo(video)}
                />
              ))}
            </div>
          </section>

          {/* New Videos */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Recently Added</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {newVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={() => setSelectedVideo(video)}
                  variant="horizontal"
                />
              ))}
            </div>
          </section>
        </>
      )}

      {/* All Videos Grid */}
      <section>
        {(selectedCategory !== "all" || searchQuery) && (
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {selectedCategory === "all" ? "Search Results" : VIDEO_CATEGORIES.find((c) => c.id === selectedCategory)?.label}
          </h2>
        )}
        {selectedCategory === "all" && !searchQuery && (
          <h2 className="mb-4 text-lg font-semibold text-foreground">All Tutorials</h2>
        )}

        {filteredVideos.length === 0 ? (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
            <p className="text-foreground-muted">No videos match your search.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-2 text-sm text-[var(--primary)] hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={() => setSelectedVideo(video)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}

interface VideoCardProps {
  video: VideoTutorial;
  onClick: () => void;
  variant?: "default" | "horizontal";
}

function VideoCard({ video, onClick, variant = "default" }: VideoCardProps) {
  const categoryInfo = VIDEO_CATEGORIES.find((c) => c.id === video.category);

  if (variant === "horizontal") {
    return (
      <button
        onClick={onClick}
        className="group flex gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 text-left transition-all hover:border-[var(--primary)]/30 hover:shadow-md"
      >
        {/* Thumbnail */}
        <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-[var(--background-tertiary)]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-white opacity-90 transition-transform group-hover:scale-110">
              <Play className="h-5 w-5 fill-current" />
            </div>
          </div>
          <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {video.duration}
          </div>
          {video.isNew && (
            <div className="absolute left-1 top-1 rounded bg-[var(--primary)] px-1.5 py-0.5 text-[10px] font-medium text-white">
              New
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-[var(--primary)]">
            {video.title}
          </h3>
          <p className="mt-1 text-sm text-foreground-muted line-clamp-2">{video.description}</p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="group flex flex-col rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden text-left transition-all hover:border-[var(--primary)]/30 hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full bg-[var(--background-tertiary)]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-white opacity-90 transition-transform group-hover:scale-110">
            <Play className="h-6 w-6 fill-current" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
          <Clock className="h-3 w-3" />
          {video.duration}
        </div>
        {video.isNew && (
          <div className="absolute left-2 top-2 rounded bg-[var(--primary)] px-2 py-1 text-xs font-medium text-white">
            New
          </div>
        )}
        {video.isPopular && !video.isNew && (
          <div className="absolute left-2 top-2 rounded bg-[var(--warning)] px-2 py-1 text-xs font-medium text-white">
            Popular
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 text-xs text-foreground-muted">
          {categoryInfo && <categoryInfo.icon className="h-3 w-3" />}
          {categoryInfo?.label}
        </div>
        <h3 className="mt-2 font-medium text-foreground line-clamp-2 group-hover:text-[var(--primary)]">
          {video.title}
        </h3>
        <p className="mt-1 text-sm text-foreground-muted line-clamp-2">{video.description}</p>
      </div>
    </button>
  );
}

interface VideoModalProps {
  video: VideoTutorial;
  onClose: () => void;
}

function VideoModal({ video, onClose }: VideoModalProps) {
  const categoryInfo = VIDEO_CATEGORIES.find((c) => c.id === video.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-4xl rounded-xl bg-[var(--card)] overflow-hidden">
        {/* Video Player Area */}
        <div className="relative aspect-video w-full bg-black">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary)] mb-4">
              <Play className="h-10 w-10 fill-current" />
            </div>
            <p className="text-sm text-white/70">Video player would load here</p>
            <p className="text-xs text-white/50 mt-1">Duration: {video.duration}</p>
          </div>
        </div>

        {/* Info */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-foreground-muted mb-2">
                {categoryInfo && <categoryInfo.icon className="h-4 w-4" />}
                {categoryInfo?.label}
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4" />
                {video.duration}
              </div>
              <h2 className="text-xl font-semibold text-foreground">{video.title}</h2>
              <p className="mt-2 text-foreground-muted">{video.description}</p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-lg bg-[var(--background-tertiary)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--card-border)]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
