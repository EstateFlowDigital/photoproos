"use client";

import * as React from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Share2,
  Map,
  Maximize,
  BarChart3,
  ExternalLink,
  Home,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Tour {
  id: string;
  name: string;
  property: string;
  client: string;
  status: "draft" | "processing" | "published" | "archived";
  panoramas: number;
  hotspots: number;
  views: number;
  avgDuration: string;
  createdAt: string;
  publishedAt: string | null;
  thumbnail: string;
}

const statusConfig = {
  draft: { label: "Draft", color: "text-[var(--foreground-muted)]", bg: "bg-[var(--background-secondary)]" },
  processing: { label: "Processing", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  published: { label: "Published", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  archived: { label: "Archived", color: "text-[var(--foreground-muted)]", bg: "bg-[var(--background-secondary)]" },
};

const mockTours: Tour[] = [
  {
    id: "1",
    name: "Luxury Estate Full Tour",
    property: "1234 Oceanview Drive",
    client: "Sarah Mitchell",
    status: "published",
    panoramas: 24,
    hotspots: 18,
    views: 1247,
    avgDuration: "4:32",
    createdAt: "2025-01-08",
    publishedAt: "2025-01-09",
    thumbnail: "/api/placeholder/400/300",
  },
  {
    id: "2",
    name: "Downtown Penthouse 360",
    property: "888 Skyline Tower #PH1",
    client: "Mark Thompson",
    status: "processing",
    panoramas: 12,
    hotspots: 8,
    views: 0,
    avgDuration: "0:00",
    createdAt: "2025-01-11",
    publishedAt: null,
    thumbnail: "/api/placeholder/400/300",
  },
  {
    id: "3",
    name: "Historic Victorian Home",
    property: "456 Heritage Lane",
    client: "Emily Roberts",
    status: "draft",
    panoramas: 8,
    hotspots: 0,
    views: 0,
    avgDuration: "0:00",
    createdAt: "2025-01-10",
    publishedAt: null,
    thumbnail: "/api/placeholder/400/300",
  },
  {
    id: "4",
    name: "Modern Loft Experience",
    property: "200 Arts District Blvd",
    client: "James Chen",
    status: "published",
    panoramas: 10,
    hotspots: 12,
    views: 892,
    avgDuration: "3:15",
    createdAt: "2025-01-05",
    publishedAt: "2025-01-06",
    thumbnail: "/api/placeholder/400/300",
  },
  {
    id: "5",
    name: "Beachfront Villa Tour",
    property: "100 Coastal Highway",
    client: "Amanda White",
    status: "archived",
    panoramas: 16,
    hotspots: 14,
    views: 3421,
    avgDuration: "5:08",
    createdAt: "2024-11-15",
    publishedAt: "2024-11-16",
    thumbnail: "/api/placeholder/400/300",
  },
];

export function ToursClient() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredTours = mockTours.filter((tour) => {
    const matchesSearch =
      tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || tour.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalViews = mockTours.reduce((sum, tour) => sum + tour.views, 0);
  const publishedTours = mockTours.filter((t) => t.status === "published").length;

  const handleCreateTour = () => {
    toast({
      title: "Create Tour",
      description: "Opening tour creation wizard...",
    });
  };

  const handleAction = (action: string, tour: Tour) => {
    setOpenMenuId(null);
    toast({
      title: action,
      description: `${action} for "${tour.name}"`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <Home className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{mockTours.length}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Total Tours</p>
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
              <Maximize className="h-5 w-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{publishedTours}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Published</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ai)]/10">
              <BarChart3 className="h-5 w-5 text-[var(--ai)]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">3:45</p>
              <p className="text-sm text-[var(--foreground-muted)]">Avg Duration</p>
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
              placeholder="Search tours..."
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
            <option value="draft">Draft</option>
            <option value="processing">Processing</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <button
          onClick={handleCreateTour}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Tour
        </button>
      </div>

      {/* Tours Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTours.map((tour) => (
          <div
            key={tour.id}
            className="group rounded-lg border border-[var(--card-border)] bg-[var(--card)] overflow-hidden hover:border-[var(--primary)]/30 transition-colors"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-[var(--background-secondary)]">
              <div className="absolute inset-0 flex items-center justify-center">
                <Home className="h-12 w-12 text-[var(--foreground-muted)]" />
              </div>
              <div className="absolute top-3 left-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[tour.status].bg} ${statusConfig[tour.status].color}`}>
                  {statusConfig[tour.status].label}
                </span>
              </div>
              <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                <Maximize className="h-3 w-3" />
                {tour.panoramas} Panoramas
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-[var(--foreground)] truncate">{tour.name}</h3>
                  <p className="text-sm text-[var(--foreground-muted)] truncate">{tour.property}</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === tour.id ? null : tour.id)}
                    className="rounded p-1 hover:bg-[var(--background-secondary)] transition-colors"
                  >
                    <MoreHorizontal className="h-5 w-5 text-[var(--foreground-muted)]" />
                  </button>
                  {openMenuId === tour.id && (
                    <div className="absolute right-0 top-8 z-10 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                      <button
                        onClick={() => handleAction("View Tour", tour)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Eye className="h-4 w-4" /> View Tour
                      </button>
                      <button
                        onClick={() => handleAction("Edit Tour", tour)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Edit className="h-4 w-4" /> Edit Tour
                      </button>
                      <button
                        onClick={() => handleAction("Edit Hotspots", tour)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Map className="h-4 w-4" /> Edit Hotspots
                      </button>
                      <button
                        onClick={() => handleAction("Share Tour", tour)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <Share2 className="h-4 w-4" /> Share Tour
                      </button>
                      <button
                        onClick={() => handleAction("View Analytics", tour)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      >
                        <BarChart3 className="h-4 w-4" /> View Analytics
                      </button>
                      <hr className="my-1 border-[var(--card-border)]" />
                      <button
                        onClick={() => handleAction("Delete Tour", tour)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-secondary)]"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-[var(--foreground-muted)]">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {tour.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Map className="h-4 w-4" />
                    {tour.hotspots}
                  </span>
                </div>
                {tour.status === "published" && (
                  <button className="flex items-center gap-1 text-[var(--primary)] hover:underline">
                    <ExternalLink className="h-3 w-3" />
                    Open
                  </button>
                )}
              </div>

              <p className="mt-2 text-xs text-[var(--foreground-muted)]">
                Client: {tour.client}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredTours.length === 0 && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <Home className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" />
          <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">No tours found</h3>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first virtual tour to get started"}
          </p>
          <button
            onClick={handleCreateTour}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
          >
            <Plus className="h-4 w-4" />
            Create Tour
          </button>
        </div>
      )}
    </div>
  );
}
