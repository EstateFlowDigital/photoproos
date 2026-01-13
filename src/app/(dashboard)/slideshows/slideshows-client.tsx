"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Film,
  Play,
  Pause,
  Clock,
  Image,
  Music,
  Share2,
  Download,
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type SlideshowStatus = "draft" | "published" | "archived";

interface Slideshow {
  id: string;
  title: string;
  projectName: string;
  clientName: string;
  status: SlideshowStatus;
  photoCount: number;
  duration: string;
  musicTrack: string;
  views: number;
  createdAt: string;
  publishedAt: string | null;
  thumbnailUrl: string;
}

const MOCK_SLIDESHOWS: Slideshow[] = [
  {
    id: "1",
    title: "Sarah & Michael - Wedding Highlights",
    projectName: "Johnson Wedding",
    clientName: "Sarah Johnson",
    status: "published",
    photoCount: 85,
    duration: "4:32",
    musicTrack: "A Thousand Years",
    views: 156,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnailUrl: "",
  },
  {
    id: "2",
    title: "Davis Family Portraits 2024",
    projectName: "Davis Family Session",
    clientName: "Emily Davis",
    status: "published",
    photoCount: 42,
    duration: "2:15",
    musicTrack: "Home",
    views: 89,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnailUrl: "",
  },
  {
    id: "3",
    title: "Thompson Product Launch",
    projectName: "Thompson Marketing",
    clientName: "Thompson Real Estate",
    status: "draft",
    photoCount: 35,
    duration: "1:48",
    musicTrack: "Upbeat Corporate",
    views: 0,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: null,
    thumbnailUrl: "",
  },
  {
    id: "4",
    title: "Martinez Engagement - Sneak Peek",
    projectName: "Martinez Engagement",
    clientName: "Lauren Martinez",
    status: "published",
    photoCount: 25,
    duration: "1:20",
    musicTrack: "Perfect",
    views: 234,
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnailUrl: "",
  },
  {
    id: "5",
    title: "Wilson Architecture Portfolio",
    projectName: "Wilson Building",
    clientName: "Wilson Architecture",
    status: "archived",
    photoCount: 60,
    duration: "3:05",
    musicTrack: "Ambient Modern",
    views: 45,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnailUrl: "",
  },
];

const STATUS_CONFIG: Record<SlideshowStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  published: { label: "Published", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  archived: { label: "Archived", color: "text-foreground-muted", bg: "bg-[var(--background-tertiary)]" },
};

export function SlideshowsClient() {
  const { showToast } = useToast();
  const [slideshows, setSlideshows] = useState<Slideshow[]>(MOCK_SLIDESHOWS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SlideshowStatus | "all">("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredSlideshows = slideshows.filter((slideshow) => {
    const matchesSearch =
      slideshow.title.toLowerCase().includes(search.toLowerCase()) ||
      slideshow.projectName.toLowerCase().includes(search.toLowerCase()) ||
      slideshow.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || slideshow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePublish = (slideshowId: string) => {
    setSlideshows((prev) =>
      prev.map((s) =>
        s.id === slideshowId
          ? { ...s, status: "published" as SlideshowStatus, publishedAt: new Date().toISOString() }
          : s
      )
    );
    showToast("Slideshow published", "success");
    setOpenMenuId(null);
  };

  const handleDuplicate = (slideshowId: string) => {
    const original = slideshows.find((s) => s.id === slideshowId);
    if (original) {
      const duplicate: Slideshow = {
        ...original,
        id: Date.now().toString(),
        title: `${original.title} (Copy)`,
        status: "draft",
        views: 0,
        createdAt: new Date().toISOString(),
        publishedAt: null,
      };
      setSlideshows((prev) => [duplicate, ...prev]);
      showToast("Slideshow duplicated", "success");
    }
    setOpenMenuId(null);
  };

  const handleDelete = (slideshowId: string) => {
    setSlideshows((prev) => prev.filter((s) => s.id !== slideshowId));
    showToast("Slideshow deleted", "success");
    setOpenMenuId(null);
  };

  const handleCopyLink = (slideshowId: string) => {
    navigator.clipboard.writeText(`https://gallery.example.com/slideshow/${slideshowId}`);
    showToast("Link copied to clipboard", "success");
    setOpenMenuId(null);
  };

  const stats = {
    total: slideshows.length,
    published: slideshows.filter((s) => s.status === "published").length,
    totalViews: slideshows.reduce((sum, s) => sum + s.views, 0),
    totalPhotos: slideshows.reduce((sum, s) => sum + s.photoCount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Slideshows</p>
            <Film className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Published</p>
            <Play className="h-4 w-4 text-[var(--success)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{stats.published}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Views</p>
            <Eye className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--primary)]">{stats.totalViews}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Photos</p>
            <Image className="h-4 w-4 text-[var(--warning)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalPhotos}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search slideshows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SlideshowStatus | "all")}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <Link href="/slideshows/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Create Slideshow
          </Button>
        </Link>
      </div>

      {/* Slideshows Grid */}
      {filteredSlideshows.length === 0 ? (
        <div className="card p-12 text-center">
          <Film className="h-12 w-12 text-foreground-muted mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No slideshows found</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {search || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first slideshow to get started"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSlideshows.map((slideshow) => {
            const statusConfig = STATUS_CONFIG[slideshow.status];

            return (
              <div key={slideshow.id} className="card overflow-hidden">
                {/* Thumbnail */}
                <div className="aspect-video bg-[var(--background-tertiary)] relative flex items-center justify-center">
                  <Film className="h-12 w-12 text-foreground-muted" />
                  <div className="absolute top-2 right-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 rounded px-2 py-0.5 text-xs text-white">
                    <Clock className="h-3 w-3" />
                    {slideshow.duration}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{slideshow.title}</h3>
                      <p className="text-sm text-foreground-muted truncate">{slideshow.clientName}</p>
                    </div>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenMenuId(openMenuId === slideshow.id ? null : slideshow.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openMenuId === slideshow.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                          <Link
                            href={`/slideshows/${slideshow.id}`}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </Link>
                          {slideshow.status === "draft" && (
                            <button
                              onClick={() => handlePublish(slideshow.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                            >
                              <Play className="h-4 w-4" />
                              Publish
                            </button>
                          )}
                          {slideshow.status === "published" && (
                            <button
                              onClick={() => handleCopyLink(slideshow.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                            >
                              <Share2 className="h-4 w-4" />
                              Copy Link
                            </button>
                          )}
                          <button
                            onClick={() => handleDuplicate(slideshow.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                          >
                            <Copy className="h-4 w-4" />
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleDelete(slideshow.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-hover)]"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-foreground-muted">
                    <span className="flex items-center gap-1">
                      <Image className="h-3.5 w-3.5" />
                      {slideshow.photoCount} photos
                    </span>
                    <span className="flex items-center gap-1">
                      <Music className="h-3.5 w-3.5" />
                      {slideshow.musicTrack}
                    </span>
                  </div>

                  {slideshow.status === "published" && (
                    <div className="mt-3 pt-3 border-t border-[var(--card-border)] flex items-center justify-between text-xs text-foreground-muted">
                      <span>{slideshow.views} views</span>
                      <span>Published {formatDate(slideshow.publishedAt!)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
