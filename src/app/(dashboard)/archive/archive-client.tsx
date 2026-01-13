"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Archive,
  Search,
  RotateCcw,
  Trash2,
  MoreHorizontal,
  FolderClosed,
  Users,
  FileText,
  Image,
  Calendar,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type ArchiveType = "project" | "client" | "invoice" | "gallery" | "booking";

interface ArchivedItem {
  id: string;
  type: ArchiveType;
  name: string;
  description: string;
  archivedAt: string;
  archivedBy: string;
  originalLink: string;
}

const MOCK_ARCHIVED_ITEMS: ArchivedItem[] = [
  {
    id: "1",
    type: "project",
    name: "Smith Wedding 2024",
    description: "Wedding photography project - delivered 450 images",
    archivedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    archivedBy: "System",
    originalLink: "/projects/1",
  },
  {
    id: "2",
    type: "client",
    name: "Thompson Real Estate",
    description: "Commercial real estate client - 12 completed projects",
    archivedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    archivedBy: "John Smith",
    originalLink: "/clients/2",
  },
  {
    id: "3",
    type: "gallery",
    name: "Johnson Family Portraits",
    description: "Family portrait session - 85 images delivered",
    archivedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    archivedBy: "System",
    originalLink: "/galleries/3",
  },
  {
    id: "4",
    type: "invoice",
    name: "INV-2024-0089",
    description: "Davis Corporate Headshots - $2,500 paid",
    archivedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    archivedBy: "System",
    originalLink: "/invoices/4",
  },
  {
    id: "5",
    type: "project",
    name: "Martinez Product Shoot",
    description: "E-commerce product photography - 200 images",
    archivedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    archivedBy: "John Smith",
    originalLink: "/projects/5",
  },
  {
    id: "6",
    type: "booking",
    name: "Wilson Engagement Session",
    description: "Outdoor engagement photos - completed 2024-06-15",
    archivedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    archivedBy: "System",
    originalLink: "/calendar/6",
  },
  {
    id: "7",
    type: "client",
    name: "Brown Architecture",
    description: "Architecture client - 5 completed projects",
    archivedAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
    archivedBy: "John Smith",
    originalLink: "/clients/7",
  },
  {
    id: "8",
    type: "gallery",
    name: "Anderson Wedding Gallery",
    description: "Wedding reception - 320 images delivered",
    archivedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    archivedBy: "System",
    originalLink: "/galleries/8",
  },
];

const TYPE_CONFIG: Record<ArchiveType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  project: { label: "Project", icon: FolderClosed, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
  client: { label: "Client", icon: Users, color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  invoice: { label: "Invoice", icon: FileText, color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  gallery: { label: "Gallery", icon: Image, color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  booking: { label: "Booking", icon: Calendar, color: "text-[var(--secondary)]", bg: "bg-[var(--secondary)]/10" },
};

export function ArchiveClient() {
  const { showToast } = useToast();
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>(MOCK_ARCHIVED_ITEMS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ArchiveType | "all">("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const filteredItems = archivedItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleRestore = (itemId: string) => {
    setArchivedItems((prev) => prev.filter((i) => i.id !== itemId));
    showToast("Item restored successfully", "success");
    setOpenMenuId(null);
  };

  const handleDelete = (itemId: string) => {
    setArchivedItems((prev) => prev.filter((i) => i.id !== itemId));
    showToast("Item permanently deleted", "success");
    setOpenMenuId(null);
  };

  const stats = {
    total: archivedItems.length,
    projects: archivedItems.filter((i) => i.type === "project").length,
    clients: archivedItems.filter((i) => i.type === "client").length,
    galleries: archivedItems.filter((i) => i.type === "gallery").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Archived</p>
            <Archive className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Projects</p>
            <FolderClosed className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--primary)]">{stats.projects}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Clients</p>
            <Users className="h-4 w-4 text-[var(--success)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{stats.clients}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Galleries</p>
            <Image className="h-4 w-4 text-[var(--info)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--info)]">{stats.galleries}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search archived items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-foreground-muted" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ArchiveType | "all")}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All Types</option>
            <option value="project">Projects</option>
            <option value="client">Clients</option>
            <option value="invoice">Invoices</option>
            <option value="gallery">Galleries</option>
            <option value="booking">Bookings</option>
          </select>
        </div>
      </div>

      {/* Archived Items List */}
      {filteredItems.length === 0 ? (
        <div className="card p-12 text-center">
          <Archive className="h-12 w-12 text-foreground-muted mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No archived items</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {search || typeFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Items you archive will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const typeConfig = TYPE_CONFIG[item.type];
            const TypeIcon = typeConfig.icon;

            return (
              <div
                key={item.id}
                className="card p-4 flex items-center justify-between gap-4 hover:bg-[var(--background-hover)] transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${typeConfig.bg}`}>
                    <TypeIcon className={`h-5 w-5 ${typeConfig.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-foreground truncate">{item.name}</h4>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeConfig.bg} ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>
                    </div>
                    <p className="text-xs text-foreground-muted truncate">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-foreground-muted">Archived {formatRelativeTime(item.archivedAt)}</p>
                    <p className="text-xs text-foreground-muted">by {item.archivedBy}</p>
                  </div>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    {openMenuId === item.id && (
                      <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                        <button
                          onClick={() => handleRestore(item.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Restore
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-hover)]"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Forever
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

      {/* Info Card */}
      <div className="card p-6 bg-[var(--background-tertiary)]">
        <h3 className="font-medium text-foreground mb-2">About Archived Items</h3>
        <p className="text-sm text-foreground-muted">
          Archived items are hidden from active views but can be restored at any time. Items are
          automatically archived after 90 days of inactivity. Permanently deleted items cannot be
          recovered.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/settings/archive">
            <Button variant="outline" size="sm">
              Archive Settings
            </Button>
          </Link>
          <Link href="/trash">
            <Button variant="outline" size="sm">
              View Trash
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
