"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Star,
  Phone,
  Mail,
  MapPin,
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  ExternalLink,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type VendorCategory = "venue" | "florist" | "catering" | "dj" | "makeup" | "planner" | "other";

interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  rating: number;
  referralCount: number;
  notes: string;
  isPreferred: boolean;
}

const MOCK_VENDORS: Vendor[] = [
  {
    id: "1",
    name: "Rosewood Manor",
    category: "venue",
    contactName: "Jennifer Adams",
    email: "events@rosewoodmanor.com",
    phone: "(555) 111-2222",
    website: "rosewoodmanor.com",
    location: "Los Angeles, CA",
    rating: 5,
    referralCount: 12,
    notes: "Beautiful outdoor ceremony space. 20% referral commission.",
    isPreferred: true,
  },
  {
    id: "2",
    name: "Bloom & Petals",
    category: "florist",
    contactName: "Maria Garcia",
    email: "maria@bloomandpetals.com",
    phone: "(555) 222-3333",
    website: "bloomandpetals.com",
    location: "Beverly Hills, CA",
    rating: 5,
    referralCount: 8,
    notes: "Specializes in romantic, garden-style arrangements.",
    isPreferred: true,
  },
  {
    id: "3",
    name: "Taste of Excellence",
    category: "catering",
    contactName: "Chef Robert Kim",
    email: "catering@tasteofexcellence.com",
    phone: "(555) 333-4444",
    website: "tasteofexcellence.com",
    location: "Santa Monica, CA",
    rating: 4,
    referralCount: 5,
    notes: "Farm-to-table menu options. Great for outdoor events.",
    isPreferred: false,
  },
  {
    id: "4",
    name: "DJ Soundwave",
    category: "dj",
    contactName: "Marcus Johnson",
    email: "marcus@djsoundwave.com",
    phone: "(555) 444-5555",
    website: "djsoundwave.com",
    location: "Los Angeles, CA",
    rating: 5,
    referralCount: 15,
    notes: "Great with crowd. Always gets people dancing.",
    isPreferred: true,
  },
  {
    id: "5",
    name: "Glam Squad Beauty",
    category: "makeup",
    contactName: "Ashley Chen",
    email: "ashley@glamsquad.com",
    phone: "(555) 555-6666",
    website: "glamsquadbeauty.com",
    location: "West Hollywood, CA",
    rating: 5,
    referralCount: 10,
    notes: "Airbrush specialist. Very professional team.",
    isPreferred: true,
  },
  {
    id: "6",
    name: "Perfect Day Planning",
    category: "planner",
    contactName: "Sarah Williams",
    email: "sarah@perfectdayplanning.com",
    phone: "(555) 666-7777",
    website: "perfectdayplanning.com",
    location: "Pasadena, CA",
    rating: 4,
    referralCount: 3,
    notes: "Full-service wedding planning. Good communication.",
    isPreferred: false,
  },
];

const CATEGORY_CONFIG: Record<VendorCategory, { label: string; color: string; bg: string }> = {
  venue: { label: "Venue", color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
  florist: { label: "Florist", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  catering: { label: "Catering", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  dj: { label: "DJ/Music", color: "text-[var(--secondary)]", bg: "bg-[var(--secondary)]/10" },
  makeup: { label: "Hair & Makeup", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  planner: { label: "Planner", color: "text-[var(--ai)]", bg: "bg-[var(--ai)]/10" },
  other: { label: "Other", color: "text-foreground-muted", bg: "bg-[var(--background-tertiary)]" },
};

export function VendorsClient() {
  const { showToast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>(MOCK_VENDORS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<VendorCategory | "all">("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(search.toLowerCase()) ||
      vendor.contactName.toLowerCase().includes(search.toLowerCase()) ||
      vendor.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || vendor.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (vendorId: string) => {
    setVendors((prev) => prev.filter((v) => v.id !== vendorId));
    showToast("Vendor removed", "success");
    setOpenMenuId(null);
  };

  const handleTogglePreferred = (vendorId: string) => {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === vendorId ? { ...v, isPreferred: !v.isPreferred } : v
      )
    );
    showToast("Vendor updated", "success");
  };

  const stats = {
    total: vendors.length,
    preferred: vendors.filter((v) => v.isPreferred).length,
    totalReferrals: vendors.reduce((sum, v) => sum + v.referralCount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Vendors</p>
            <Users className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Preferred Vendors</p>
            <Star className="h-4 w-4 text-[var(--warning)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--warning)]">{stats.preferred}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Referrals</p>
            <Tag className="h-4 w-4 text-[var(--success)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{stats.totalReferrals}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as VendorCategory | "all")}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Add Vendor
        </Button>
      </div>

      {/* Vendors List */}
      {filteredVendors.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="h-12 w-12 text-foreground-muted mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No vendors found</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {search || categoryFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Add your first vendor to get started"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVendors.map((vendor) => {
            const categoryConfig = CATEGORY_CONFIG[vendor.category];

            return (
              <div key={vendor.id} className="card p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground truncate">{vendor.name}</h3>
                      {vendor.isPreferred && (
                        <Star className="h-4 w-4 text-[var(--warning)] fill-[var(--warning)] shrink-0" />
                      )}
                    </div>
                    <span className={`inline-flex mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${categoryConfig.bg} ${categoryConfig.color}`}>
                      {categoryConfig.label}
                    </span>
                  </div>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpenMenuId(openMenuId === vendor.id ? null : vendor.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    {openMenuId === vendor.id && (
                      <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                        <button
                          onClick={() => handleTogglePreferred(vendor.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                        >
                          <Star className="h-4 w-4" />
                          {vendor.isPreferred ? "Remove Preferred" : "Mark Preferred"}
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]">
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(vendor.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-hover)]"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-foreground-muted">
                    <Users className="h-3.5 w-3.5" />
                    <span className="truncate">{vendor.contactName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground-muted">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground-muted">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{vendor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground-muted">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{vendor.location}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--card-border)] flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < vendor.rating ? "text-[var(--warning)] fill-[var(--warning)]" : "text-foreground-muted"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-foreground-muted">{vendor.referralCount} referrals</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
