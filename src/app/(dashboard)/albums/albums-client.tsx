"use client";

import * as React from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  BookOpen,
  Image,
  Eye,
  Edit,
  Trash2,
  Download,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Printer,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Album {
  id: string;
  name: string;
  client: string;
  project: string;
  template: string;
  pages: number;
  images: number;
  status: "draft" | "designing" | "review" | "approved" | "ordered" | "shipped";
  coverType: "leather" | "linen" | "fabric" | "photo";
  size: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

const mockAlbums: Album[] = [
  {
    id: "1",
    name: "Anderson Wedding Album",
    client: "Sarah & James Anderson",
    project: "Anderson Wedding",
    template: "Classic Elegance",
    pages: 40,
    images: 85,
    status: "review",
    coverType: "leather",
    size: "12x12",
    price: 850,
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-22T14:30:00Z",
  },
  {
    id: "2",
    name: "Thompson Family Album",
    client: "Thompson Family",
    project: "Thompson Family Session",
    template: "Modern Minimal",
    pages: 20,
    images: 42,
    status: "approved",
    coverType: "linen",
    size: "10x10",
    price: 450,
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "3",
    name: "Corporate Event 2024",
    client: "TechCorp Inc",
    project: "Annual Gala",
    template: "Executive",
    pages: 30,
    images: 65,
    status: "designing",
    coverType: "fabric",
    size: "11x14",
    price: 650,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-21T16:00:00Z",
  },
  {
    id: "4",
    name: "Baby's First Year",
    client: "Johnson Family",
    project: "Baby Milestone Sessions",
    template: "Storybook",
    pages: 24,
    images: 48,
    status: "shipped",
    coverType: "photo",
    size: "8x8",
    price: 350,
    createdAt: "2023-12-01T00:00:00Z",
    updatedAt: "2024-01-15T09:00:00Z",
  },
  {
    id: "5",
    name: "Davis Anniversary",
    client: "Mr. & Mrs. Davis",
    project: "50th Anniversary",
    template: "Vintage Romance",
    pages: 36,
    images: 72,
    status: "draft",
    coverType: "leather",
    size: "12x12",
    price: 750,
    createdAt: "2024-01-18T00:00:00Z",
    updatedAt: "2024-01-18T00:00:00Z",
  },
];

const statusConfig = {
  draft: { label: "Draft", icon: Clock, color: "text-[var(--foreground-muted)]", bg: "bg-[var(--background-tertiary)]" },
  designing: { label: "Designing", icon: Edit, color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  review: { label: "In Review", icon: Eye, color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  approved: { label: "Approved", icon: CheckCircle, color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  ordered: { label: "Ordered", icon: Printer, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
  shipped: { label: "Shipped", icon: Send, color: "text-[var(--ai)]", bg: "bg-[var(--ai)]/10" },
};

const coverConfig = {
  leather: { label: "Leather", color: "text-amber-600" },
  linen: { label: "Linen", color: "text-stone-500" },
  fabric: { label: "Fabric", color: "text-indigo-500" },
  photo: { label: "Photo Cover", color: "text-teal-500" },
};

export function AlbumsClient() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredAlbums = mockAlbums.filter((album) => {
    const matchesSearch =
      album.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || album.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockAlbums.length,
    inProgress: mockAlbums.filter((a) => ["draft", "designing", "review"].includes(a.status)).length,
    totalRevenue: mockAlbums.reduce((acc, a) => acc + a.price, 0),
    avgPages: Math.round(mockAlbums.reduce((acc, a) => acc + a.pages, 0) / mockAlbums.length),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary)]/10">
              <BookOpen className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Total Albums</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--warning)]/10">
              <Clock className="w-5 h-5 text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">In Progress</p>
              <p className="text-2xl font-semibold">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--success)]/10">
              <Image className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Avg Pages</p>
              <p className="text-2xl font-semibold">{stats.avgPages}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--info)]/10">
              <Printer className="w-5 h-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Total Revenue</p>
              <p className="text-2xl font-semibold">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
          <input
            type="text"
            placeholder="Search albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="designing">Designing</option>
            <option value="review">In Review</option>
            <option value="approved">Approved</option>
            <option value="ordered">Ordered</option>
            <option value="shipped">Shipped</option>
          </select>
          <button
            onClick={() =>
              toast({
                title: "Create Album",
                description: "Opening album designer...",
              })
            }
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Album
          </button>
        </div>
      </div>

      {/* Albums Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlbums.map((album) => {
          const status = statusConfig[album.status];
          const cover = coverConfig[album.coverType];
          const StatusIcon = status.icon;

          return (
            <div key={album.id} className="card overflow-hidden">
              {/* Cover Preview */}
              <div className="aspect-[4/3] bg-[var(--background-tertiary)] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-[var(--foreground-muted)]" />
                </div>
                <div className="absolute top-2 right-2">
                  <span className={"inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium " + status.color + " " + status.bg}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{album.name}</h3>
                    <p className="text-sm text-[var(--foreground-muted)]">{album.client}</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === album.id ? null : album.id)}
                      className="p-1 hover:bg-[var(--background-elevated)] rounded transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenuId === album.id && (
                      <div className="absolute right-0 top-8 w-40 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => {
                            toast({ title: "Edit Album", description: "Opening album designer..." });
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background-tertiary)] transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Design
                        </button>
                        <button
                          onClick={() => {
                            toast({ title: "Preview", description: "Opening album preview..." });
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background-tertiary)] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>
                        <button
                          onClick={() => {
                            toast({ title: "Send for Review", description: "Sending to client..." });
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background-tertiary)] transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          Send to Client
                        </button>
                        <button
                          onClick={() => {
                            toast({
                              title: "Delete Album",
                              description: "Album deleted",
                              variant: "destructive",
                            });
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs px-2 py-1 bg-[var(--background-tertiary)] rounded">{album.template}</span>
                  <span className={"text-xs px-2 py-1 rounded " + cover.color}>{cover.label}</span>
                  <span className="text-xs px-2 py-1 bg-[var(--background-tertiary)] rounded">{album.size}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-[var(--foreground-muted)]">
                  <div className="flex items-center gap-3">
                    <span>{album.pages} pages</span>
                    <span>{album.images} photos</span>
                  </div>
                  <span className="font-semibold text-[var(--foreground)]">{formatCurrency(album.price)}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-[var(--border)] text-xs text-[var(--foreground-muted)]">
                  Updated {formatDate(album.updatedAt)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAlbums.length === 0 && (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-[var(--foreground-muted)] mb-4" />
          <h3 className="text-lg font-medium mb-2">No albums found</h3>
          <p className="text-[var(--foreground-muted)]">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first photo album to get started"}
          </p>
        </div>
      )}
    </div>
  );
}
