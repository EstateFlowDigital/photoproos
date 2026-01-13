"use client";

import { useState } from "react";
import {
  Star,
  MessageSquare,
  TrendingUp,
  ThumbsUp,
  Plus,
  Search,
  MoreHorizontal,
  ExternalLink,
  Reply,
  Flag,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type ReviewSource = "google" | "yelp" | "facebook" | "theknot" | "weddingwire" | "internal";
type ReviewStatus = "published" | "pending" | "hidden";

interface Review {
  id: string;
  clientName: string;
  clientPhoto: string | null;
  rating: number;
  title: string;
  content: string;
  source: ReviewSource;
  status: ReviewStatus;
  projectName: string | null;
  response: string | null;
  createdAt: string;
  respondedAt: string | null;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: "1",
    clientName: "Sarah Johnson",
    clientPhoto: null,
    rating: 5,
    title: "Absolutely stunning wedding photos!",
    content: "We couldn't be happier with our wedding photos. The photographer captured every moment perfectly and was so easy to work with. Highly recommend!",
    source: "google",
    status: "published",
    projectName: "Johnson Wedding",
    response: "Thank you so much, Sarah! It was such a pleasure to capture your special day. Wishing you both a lifetime of happiness!",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    respondedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    clientName: "Michael Chen",
    clientPhoto: null,
    rating: 5,
    title: "Professional and creative",
    content: "Our corporate headshots turned out amazing. The team was professional, efficient, and made everyone feel comfortable in front of the camera.",
    source: "yelp",
    status: "published",
    projectName: "Chen Corporate Headshots",
    response: null,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    respondedAt: null,
  },
  {
    id: "3",
    clientName: "Emily Davis",
    clientPhoto: null,
    rating: 4,
    title: "Great family photos",
    content: "Really enjoyed our family session at the park. The photos captured our kids' personalities perfectly. Would love a bit more variety in poses next time.",
    source: "facebook",
    status: "published",
    projectName: "Davis Family Portraits",
    response: "Thank you for the feedback, Emily! We're so glad you love the photos. We'll definitely incorporate more variety in our next session together!",
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    respondedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    clientName: "Lauren Martinez",
    clientPhoto: null,
    rating: 5,
    title: "Best engagement photos ever!",
    content: "Our engagement photos exceeded all expectations. The photographer knew exactly how to make us feel relaxed and natural. Can't wait for our wedding!",
    source: "theknot",
    status: "pending",
    projectName: "Martinez Engagement",
    response: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    respondedAt: null,
  },
  {
    id: "5",
    clientName: "David Thompson",
    clientPhoto: null,
    rating: 5,
    title: "Incredible attention to detail",
    content: "The product photos for our new collection were absolutely perfect. Every detail was captured beautifully. Will definitely be working together again.",
    source: "google",
    status: "published",
    projectName: "Thompson Product Photography",
    response: null,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    respondedAt: null,
  },
];

const SOURCE_CONFIG: Record<ReviewSource, { label: string; color: string }> = {
  google: { label: "Google", color: "text-[#4285f4]" },
  yelp: { label: "Yelp", color: "text-[#d32323]" },
  facebook: { label: "Facebook", color: "text-[#1877f2]" },
  theknot: { label: "The Knot", color: "text-[#00b5ad]" },
  weddingwire: { label: "WeddingWire", color: "text-[#e91e63]" },
  internal: { label: "Internal", color: "text-foreground-muted" },
};

const STATUS_CONFIG: Record<ReviewStatus, { label: string; color: string; bg: string }> = {
  published: { label: "Published", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  pending: { label: "Pending", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  hidden: { label: "Hidden", color: "text-foreground-muted", bg: "bg-[var(--background-tertiary)]" },
};

export function ReviewsClient() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<ReviewSource | "all">("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.clientName.toLowerCase().includes(search.toLowerCase()) ||
      review.content.toLowerCase().includes(search.toLowerCase()) ||
      review.title.toLowerCase().includes(search.toLowerCase());
    const matchesSource = sourceFilter === "all" || review.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const handleHide = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, status: r.status === "hidden" ? "published" : "hidden" } : r
      )
    );
    showToast("Review visibility updated", "success");
    setOpenMenuId(null);
  };

  // Calculate stats
  const publishedReviews = reviews.filter((r) => r.status === "published");
  const avgRating = publishedReviews.length > 0
    ? publishedReviews.reduce((sum, r) => sum + r.rating, 0) / publishedReviews.length
    : 0;
  const pendingResponse = reviews.filter((r) => !r.response && r.status === "published").length;
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;

  const stats = {
    totalReviews: reviews.length,
    avgRating: avgRating.toFixed(1),
    pendingResponse,
    fiveStarPercent: reviews.length > 0 ? Math.round((fiveStarCount / reviews.length) * 100) : 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Reviews</p>
            <MessageSquare className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalReviews}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Average Rating</p>
            <Star className="h-4 w-4 text-[var(--warning)] fill-[var(--warning)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--warning)]">{stats.avgRating}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Pending Response</p>
            <Reply className="h-4 w-4 text-[var(--info)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--info)]">{stats.pendingResponse}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">5-Star Reviews</p>
            <TrendingUp className="h-4 w-4 text-[var(--success)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{stats.fiveStarPercent}%</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as ReviewSource | "all")}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All Sources</option>
            {Object.entries(SOURCE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Request Review
        </Button>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="card p-12 text-center">
          <Star className="h-12 w-12 text-foreground-muted mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No reviews found</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {search || sourceFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Start collecting reviews from your clients"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const sourceConfig = SOURCE_CONFIG[review.source];
            const statusConfig = STATUS_CONFIG[review.status];

            return (
              <div key={review.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-medium text-foreground">{review.clientName}</span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? "text-[var(--warning)] fill-[var(--warning)]" : "text-foreground-muted"}`}
                          />
                        ))}
                      </div>
                      <span className={`text-xs font-medium ${sourceConfig.color}`}>
                        {sourceConfig.label}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    <h4 className="mt-2 font-medium text-foreground">{review.title}</h4>
                    <p className="mt-1 text-sm text-foreground-muted">{review.content}</p>

                    {review.response && (
                      <div className="mt-3 pl-4 border-l-2 border-[var(--primary)]">
                        <p className="text-xs text-[var(--primary)] font-medium">Your response:</p>
                        <p className="text-sm text-foreground-muted">{review.response}</p>
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-4 text-xs text-foreground-muted">
                      <span>{formatDate(review.createdAt)}</span>
                      {review.projectName && (
                        <span>{review.projectName}</span>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpenMenuId(openMenuId === review.id ? null : review.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    {openMenuId === review.id && (
                      <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                        {!review.response && (
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]">
                            <Reply className="h-4 w-4" />
                            Respond
                          </button>
                        )}
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]">
                          <ExternalLink className="h-4 w-4" />
                          View on {sourceConfig.label}
                        </button>
                        <button
                          onClick={() => handleHide(review.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                        >
                          <Eye className="h-4 w-4" />
                          {review.status === "hidden" ? "Show" : "Hide"}
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-hover)]">
                          <Flag className="h-4 w-4" />
                          Report
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
