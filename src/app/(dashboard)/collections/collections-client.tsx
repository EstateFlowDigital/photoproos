"use client";

import * as React from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  FolderOpen,
  Image,
  Eye,
  Share2,
  Download,
  Edit,
  Trash2,
  Globe,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Collection {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  imageCount: number;
  projectCount: number;
  visibility: "public" | "private" | "unlisted";
  category: "portfolio" | "marketing" | "personal" | "client";
  views: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

const mockCollections: Collection[] = [
  {
    id: "1",
    name: "Best of 2024",
    description: "Curated selection of our finest work from 2024",
    coverImage: "/placeholder.jpg",
    imageCount: 48,
    projectCount: 12,
    visibility: "public",
    category: "portfolio",
    views: 1250,
    downloads: 45,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "2",
    name: "Wedding Highlights",
    description: "Beautiful moments from wedding photography",
    coverImage: "/placeholder.jpg",
    imageCount: 85,
    projectCount: 8,
    visibility: "public",
    category: "portfolio",
    views: 890,
    downloads: 32,
    createdAt: "2023-11-15T00:00:00Z",
    updatedAt: "2024-01-18T10:00:00Z",
  },
  {
    id: "3",
    name: "Social Media Assets",
    description: "Images optimized for Instagram and Facebook",
    coverImage: "/placeholder.jpg",
    imageCount: 120,
    projectCount: 15,
    visibility: "private",
    category: "marketing",
    views: 0,
    downloads: 156,
    createdAt: "2023-10-01T00:00:00Z",
    updatedAt: "2024-01-22T09:00:00Z",
  },
  {
    id: "4",
    name: "Client Favorites",
    description: "Most requested images across all sessions",
    coverImage: "/placeholder.jpg",
    imageCount: 64,
    projectCount: 20,
    visibility: "unlisted",
    category: "client",
    views: 340,
    downloads: 89,
    createdAt: "2023-12-01T00:00:00Z",
    updatedAt: "2024-01-15T16:00:00Z",
  },
  {
    id: "5",
    name: "Portrait Collection",
    description: "Professional headshots and portrait work",
    coverImage: "/placeholder.jpg",
    imageCount: 56,
    projectCount: 14,
    visibility: "public",
    category: "portfolio",
    views: 720,
    downloads: 28,
    createdAt: "2023-09-01T00:00:00Z",
    updatedAt: "2024-01-10T11:00:00Z",
  },
];

const visibilityConfig = {
  public: { label: "Public", icon: Globe, color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  private: { label: "Private", icon: Lock, color: "text-[var(--foreground-muted)]", bg: "bg-[var(--background-tertiary)]" },
  unlisted: { label: "Unlisted", icon: Eye, color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
};

const categoryConfig = {
  portfolio: { label: "Portfolio", color: "text-[var(--primary)]" },
  marketing: { label: "Marketing", color: "text-[var(--warning)]" },
  personal: { label: "Personal", color: "text-[var(--info)]" },
  client: { label: "Client", color: "text-[var(--success)]" },
};

export function CollectionsClient() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredCollections = mockCollections.filter((collection) => {
    const matchesSearch =
      collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || collection.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: mockCollections.length,
    totalImages: mockCollections.reduce((acc, c) => acc + c.imageCount, 0),
    totalViews: mockCollections.reduce((acc, c) => acc + c.views, 0),
    publicCount: mockCollections.filter((c) => c.visibility === "public").length,
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
              <FolderOpen className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Collections</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--success)]/10">
              <Image className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Total Images</p>
              <p className="text-2xl font-semibold">{stats.totalImages}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--info)]/10">
              <Eye className="w-5 h-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Total Views</p>
              <p className="text-2xl font-semibold">{stats.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--warning)]/10">
              <Globe className="w-5 h-5 text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Public</p>
              <p className="text-2xl font-semibold">{stats.publicCount}</p>
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
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="all">All Categories</option>
            <option value="portfolio">Portfolio</option>
            <option value="marketing">Marketing</option>
            <option value="personal">Personal</option>
            <option value="client">Client</option>
          </select>
          <button
            onClick={() =>
              toast({
                title: "Create Collection",
                description: "Opening collection builder...",
              })
            }
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Collection
          </button>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollections.map((collection) => {
          const visibility = visibilityConfig[collection.visibility];
          const category = categoryConfig[collection.category];
          const VisibilityIcon = visibility.icon;

          return (
            <div key={collection.id} className="card overflow-hidden group">
              {/* Cover Image */}
              <div className="aspect-video bg-[var(--background-tertiary)] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image className="w-12 h-12 text-[var(--foreground-muted)]" />
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${visibility.color} ${visibility.bg}`}>
                    <VisibilityIcon className="w-3 h-3" />
                    {visibility.label}
                  </span>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className={`text-xs font-medium ${category.color}`}>{category.label}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{collection.name}</h3>
                    <p className="text-sm text-[var(--foreground-muted)] line-clamp-2">{collection.description}</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === collection.id ? null : collection.id)}
                      className="p-1 hover:bg-[var(--background-elevated)] rounded transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenuId === collection.id && (
                      <div className="absolute right-0 top-8 w-40 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => {
                            toast({ title: "Share", description: "Share link copied!" });
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background-tertiary)] transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                        <button
                          onClick={() => {
                            toast({ title: "Edit", description: "Opening editor..." });
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background-tertiary)] transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            toast({ title: "Export", description: "Preparing download..." });
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background-tertiary)] transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Export
                        </button>
                        <button
                          onClick={() => {
                            toast({
                              title: "Delete",
                              description: "Collection deleted",
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

                <div className="flex items-center gap-4 text-sm text-[var(--foreground-muted)] mt-3">
                  <div className="flex items-center gap-1">
                    <Image className="w-4 h-4" />
                    <span>{collection.imageCount} images</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FolderOpen className="w-4 h-4" />
                    <span>{collection.projectCount} projects</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
                  <div className="flex items-center gap-3 text-xs text-[var(--foreground-muted)]">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {collection.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {collection.downloads}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--foreground-muted)]">
                    Updated {formatDate(collection.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCollections.length === 0 && (
        <div className="card p-12 text-center">
          <FolderOpen className="w-12 h-12 mx-auto text-[var(--foreground-muted)] mb-4" />
          <h3 className="text-lg font-medium mb-2">No collections found</h3>
          <p className="text-[var(--foreground-muted)]">
            {searchQuery || categoryFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first collection to curate your best work"}
          </p>
        </div>
      )}
    </div>
  );
}
