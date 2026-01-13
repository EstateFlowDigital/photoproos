"use client";

import * as React from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Play,
  Edit,
  Trash2,
  Share2,
  Download,
  Clock,
  Eye,
  Video,
  Film,
  Upload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoItem {
  id: string;
  title: string;
  project: string;
  client: string;
  status: "uploading" | "processing" | "ready" | "published";
  duration: string;
  fileSize: string;
  resolution: string;
  views: number;
  downloads: number;
  createdAt: string;
  thumbnail: string;
}

const statusConfig = {
  uploading: { label: "Uploading", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  processing: { label: "Processing", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  ready: { label: "Ready", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  published: { label: "Published", color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
};

const mockVideos: VideoItem[] = [
  {
    id: "1",
    title: "Wedding Highlights - Sarah & Michael",
    project: "Mitchell Wedding",
    client: "Sarah Mitchell",
    status: "published",
    duration: "4:32",
    fileSize: "856 MB",
    resolution: "4K",
    views: 234,
    downloads: 12,
    createdAt: "2025-01-08",
    thumbnail: "/api/placeholder/400/225",
  },
  {
    id: "2",
    title: "Corporate Event Recap",
    project: "TechCorp Annual",
    client: "TechCorp Inc",
    status: "ready",
    duration: "8:15",
    fileSize: "1.2 GB",
    resolution: "4K",
    views: 0,
    downloads: 0,
    createdAt: "2025-01-10",
    thumbnail: "/api/placeholder/400/225",
  },
  {
    id: "3",
    title: "Property Walkthrough",
    project: "Oceanview Listing",
    client: "Mark Thompson",
    status: "processing",
    duration: "2:45",
    fileSize: "420 MB",
    resolution: "4K",
    views: 0,
    downloads: 0,
    createdAt: "2025-01-11",
    thumbnail: "/api/placeholder/400/225",
  },
  {
    id: "4",
    title: "Behind the Scenes Reel",
    project: "Fashion Shoot 2025",
    client: "Style Magazine",
    status: "published",
    duration: "1:30",
    fileSize: "280 MB",
    resolution: "1080p",
    views: 567,
    downloads: 23,
    createdAt: "2025-01-05",
    thumbnail: "/api/placeholder/400/225",
  },
  {
    id: "5",
    title: "Product Commercial",
    project: "Widget Pro Launch",
    client: "Gadget Corp",
    status: "uploading",
    duration: "0:45",
    fileSize: "180 MB",
    resolution: "4K",
    views: 0,
    downloads: 0,
    createdAt: "2025-01-12",
    thumbnail: "/api/placeholder/400/225",
  },
];

export function VideosClient() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredVideos = mockVideos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || video.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalViews = mockVideos.reduce((sum, v) => sum + v.views, 0);
  const totalDownloads = mockVideos.reduce((sum, v) => sum + v.downloads, 0);

  const handleUpload = () => {
    toast({
      title: "Upload Video",
      description: "Opening file selector...",
    });
  };

  const handleAction = (action: string, video: VideoItem) => {
    setOpenMenuId(null);
    toast({
      title: action,
      description: `${action} for "${video.title}"`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <Video className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{mockVideos.length}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Videos</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <Eye className="h-5 w-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{totalViews.toLocaleString()}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Views</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--info)]/10">
              <Download className="h-5 w-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{totalDownloads}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Downloads</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ai)]/10">
              <Clock className="h-5 w-5 text-[var(--ai)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">17:47</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Duration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="uploading">Uploading</option>
            <option value="processing">Processing</option>
            <option value="ready">Ready</option>
            <option value="published">Published</option>
          </select>
        </div>
        <button
          onClick={handleUpload}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Upload Video
        </button>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            className="group rounded-lg border border-[var(--card-border)] bg-[var(--card)] overflow-hidden hover:border-[var(--primary)]/30 transition-colors"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-[var(--background-secondary)]">
              <div className="absolute inset-0 flex items-center justify-center">
                <Film className="h-12 w-12 text-[var(--foreground-muted)]" />
              </div>
              <div className="absolute top-3 left-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[video.status].bg} ${statusConfig[video.status].color}`}>
                  {statusConfig[video.status].label}
                </span>
              </div>
              <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
                <Clock className="h-3 w-3" />
                {video.duration}
              </div>
              {video.status === "ready" || video.status === "published" ? (
                <button
                  onClick={() => handleAction("Play Video", video)}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors"
                >
                  <div className="rounded-full bg-white/90 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-6 w-6 text-[var(--foreground)]" />
                  </div>
                </button>
              ) : null}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-[var(--foreground)] truncate">{video.title}</h3>
                  <p className="text-sm text-[var(--foreground-muted)] truncate">{video.project}</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === video.id ? null : video.id)}
                    className="rounded p-1 hover:bg-[var(--background-secondary)] transition-colors"
                  >
                    <MoreHorizontal className="h-5 w-5 text-[var(--foreground-muted)]" />
                  </button>
                  {openMenuId === video.id && (
                    <div className="absolute right-0 top-8 z-10 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                      <button
                        onClick={() => handleAction("Play Video", video)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Play className="h-4 w-4" /> Play
                      </button>
                      <button
                        onClick={() => handleAction("Edit Video", video)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Edit className="h-4 w-4" /> Edit Details
                      </button>
                      <button
                        onClick={() => handleAction("Share Video", video)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Share2 className="h-4 w-4" /> Share
                      </button>
                      <button
                        onClick={() => handleAction("Download Video", video)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Download className="h-4 w-4" /> Download
                      </button>
                      <hr className="my-1 border-[var(--card-border)]" />
                      <button
                        onClick={() => handleAction("Delete Video", video)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-secondary)]"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-[var(--foreground-muted)]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {video.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    {video.downloads}
                  </span>
                </div>
                <span>{video.resolution}</span>
              </div>

              <p className="mt-2 text-xs text-[var(--foreground-muted)]">
                {video.fileSize} • {video.client}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <Video className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" />
          <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">No videos found</h3>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Upload your first video to get started"}
          </p>
          <button
            onClick={handleUpload}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
          >
            <Upload className="h-4 w-4" />
            Upload Video
          </button>
        </div>
      )}
    </div>
  );
}
