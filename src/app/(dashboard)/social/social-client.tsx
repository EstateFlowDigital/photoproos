"use client";

import * as React from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Instagram,
  Facebook,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Image,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SocialPost {
  id: string;
  content: string;
  platform: "instagram" | "facebook" | "both";
  status: "draft" | "scheduled" | "published" | "failed";
  scheduledFor: string | null;
  publishedAt: string | null;
  imageCount: number;
  project: string | null;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  } | null;
  hashtags: string[];
}

const platformConfig = {
  instagram: { label: "Instagram", icon: Instagram, color: "text-pink-500", bg: "bg-pink-500/10" },
  facebook: { label: "Facebook", icon: Facebook, color: "text-blue-500", bg: "bg-blue-500/10" },
  both: { label: "Both", icon: Share2, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
};

const statusConfig = {
  draft: { label: "Draft", color: "text-[var(--foreground-muted)]", bg: "bg-[var(--background-secondary)]" },
  scheduled: { label: "Scheduled", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  published: { label: "Published", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  failed: { label: "Failed", color: "text-[var(--error)]", bg: "bg-[var(--error)]/10" },
};

const mockPosts: SocialPost[] = [
  {
    id: "1",
    content: "Just delivered this stunning wedding gallery to Sarah & Michael! The sunset ceremony was absolutely magical ✨",
    platform: "instagram",
    status: "published",
    scheduledFor: null,
    publishedAt: "2025-01-08T18:00:00",
    imageCount: 4,
    project: "Mitchell Wedding",
    engagement: { likes: 234, comments: 18, shares: 12 },
    hashtags: ["#weddingphotography", "#sunsetwedding", "#love"],
  },
  {
    id: "2",
    content: "Behind the scenes from yesterday's corporate headshot session. Love working with such a fun team!",
    platform: "both",
    status: "scheduled",
    scheduledFor: "2025-01-13T10:00:00",
    publishedAt: null,
    imageCount: 3,
    project: "TechCorp Headshots",
    engagement: null,
    hashtags: ["#corporatephotography", "#headshots", "#behindthescenes"],
  },
  {
    id: "3",
    content: "New blog post: 5 Tips for Perfect Real Estate Photography 🏠 Link in bio!",
    platform: "facebook",
    status: "published",
    scheduledFor: null,
    publishedAt: "2025-01-10T12:00:00",
    imageCount: 1,
    project: null,
    engagement: { likes: 89, comments: 7, shares: 23 },
    hashtags: ["#realestatephotography", "#photographytips"],
  },
  {
    id: "4",
    content: "Sneak peek from the Roberts family session! Can't wait to share the full gallery 📸",
    platform: "instagram",
    status: "draft",
    scheduledFor: null,
    publishedAt: null,
    imageCount: 2,
    project: "Roberts Family",
    engagement: null,
    hashtags: ["#familyphotography", "#sneakpeek"],
  },
  {
    id: "5",
    content: "Thank you for 10,000 followers! Your support means everything 🎉",
    platform: "both",
    status: "published",
    scheduledFor: null,
    publishedAt: "2025-01-05T15:00:00",
    imageCount: 1,
    project: null,
    engagement: { likes: 567, comments: 89, shares: 34 },
    hashtags: ["#milestone", "#thankyou"],
  },
];

export function SocialClient() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [platformFilter, setPlatformFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredPosts = mockPosts.filter((post) => {
    const matchesSearch =
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.hashtags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPlatform = platformFilter === "all" || post.platform === platformFilter;
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const totalLikes = mockPosts.reduce((sum, p) => sum + (p.engagement?.likes || 0), 0);
  const totalComments = mockPosts.reduce((sum, p) => sum + (p.engagement?.comments || 0), 0);
  const publishedCount = mockPosts.filter((p) => p.status === "published").length;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleCreate = () => {
    toast({
      title: "Create Post",
      description: "Opening post composer...",
    });
  };

  const handleAction = (action: string, post: SocialPost) => {
    setOpenMenuId(null);
    toast({
      title: action,
      description: `${action} for post`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <Image className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{mockPosts.length}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Posts</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--error)]/10">
              <Heart className="h-5 w-5 text-[var(--error)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{totalLikes.toLocaleString()}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Likes</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--info)]/10">
              <MessageCircle className="h-5 w-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{totalComments}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Comments</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <TrendingUp className="h-5 w-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{publishedCount}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Published</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
          >
            <option value="all">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="both">Both</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Post
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const PlatformIcon = platformConfig[post.platform].icon;

          return (
            <div
              key={post.id}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 hover:border-[var(--primary)]/30 transition-colors"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${platformConfig[post.platform].bg} ${platformConfig[post.platform].color}`}>
                      <PlatformIcon className="h-3 w-3" />
                      {platformConfig[post.platform].label}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[post.status].bg} ${statusConfig[post.status].color}`}>
                      {statusConfig[post.status].label}
                    </span>
                  </div>

                  <p className="text-sm text-[var(--foreground)] line-clamp-2">{post.content}</p>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {post.hashtags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs text-[var(--primary)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
                    <span className="flex items-center gap-1">
                      <Image className="h-3 w-3" />
                      {post.imageCount} images
                    </span>
                    {post.project && (
                      <span>From: {post.project}</span>
                    )}
                    {post.status === "scheduled" && post.scheduledFor && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(post.scheduledFor)}
                      </span>
                    )}
                    {post.status === "published" && post.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.publishedAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Engagement & Actions */}
                <div className="flex items-center gap-4">
                  {post.engagement && (
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-[var(--foreground-muted)]">
                        <Heart className="h-4 w-4 text-[var(--error)]" />
                        {post.engagement.likes}
                      </span>
                      <span className="flex items-center gap-1 text-[var(--foreground-muted)]">
                        <MessageCircle className="h-4 w-4 text-[var(--info)]" />
                        {post.engagement.comments}
                      </span>
                      <span className="flex items-center gap-1 text-[var(--foreground-muted)]">
                        <Share2 className="h-4 w-4 text-[var(--success)]" />
                        {post.engagement.shares}
                      </span>
                    </div>
                  )}

                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                      className="rounded p-2 hover:bg-[var(--background-secondary)] transition-colors"
                    >
                      <MoreHorizontal className="h-5 w-5 text-[var(--foreground-muted)]" />
                    </button>
                    {openMenuId === post.id && (
                      <div className="absolute right-0 top-10 z-10 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                        <button
                          onClick={() => handleAction("Preview", post)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <Eye className="h-4 w-4" /> Preview
                        </button>
                        <button
                          onClick={() => handleAction("Edit", post)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                        >
                          <Edit className="h-4 w-4" /> Edit
                        </button>
                        {post.status === "draft" && (
                          <button
                            onClick={() => handleAction("Schedule", post)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                          >
                            <Clock className="h-4 w-4" /> Schedule
                          </button>
                        )}
                        {post.status === "published" && (
                          <button
                            onClick={() => handleAction("View Analytics", post)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                          >
                            <TrendingUp className="h-4 w-4" /> Analytics
                          </button>
                        )}
                        <hr className="my-1 border-[var(--card-border)]" />
                        <button
                          onClick={() => handleAction("Delete", post)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-secondary)]"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPosts.length === 0 && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <Share2 className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" />
          <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">No posts found</h3>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            {searchQuery || platformFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first social media post to get started"}
          </p>
          <button
            onClick={handleCreate}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
          >
            <Plus className="h-4 w-4" />
            Create Post
          </button>
        </div>
      )}
    </div>
  );
}
