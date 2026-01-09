"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementActive,
  type AnnouncementListItem,
  type CreateAnnouncementInput,
} from "@/lib/actions/super-admin";
import type {
  AnnouncementType,
  AnnouncementPriority,
  AnnouncementAudience,
} from "@prisma/client";

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function ToggleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="12" x="2" y="6" rx="6" ry="6" />
      <circle cx="8" cy="12" r="2" />
    </svg>
  );
}

function MegaphoneIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m3 11 18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// Type labels and colors
const TYPE_CONFIG: Record<
  AnnouncementType,
  { label: string; color: string; bgColor: string }
> = {
  info: {
    label: "Info",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  feature: {
    label: "Feature",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  maintenance: {
    label: "Maintenance",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
  },
  warning: {
    label: "Warning",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
  },
  success: {
    label: "Success",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
  },
  update: {
    label: "Update",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
  promotion: {
    label: "Promotion",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
  },
};

const PRIORITY_CONFIG: Record<
  AnnouncementPriority,
  { label: string; color: string }
> = {
  low: { label: "Low", color: "text-[var(--foreground-muted)]" },
  medium: { label: "Medium", color: "text-blue-400" },
  high: { label: "High", color: "text-orange-400" },
  urgent: { label: "Urgent", color: "text-red-400" },
};

const AUDIENCE_LABELS: Record<AnnouncementAudience, string> = {
  all: "All Users",
  free_users: "Free Plan Users",
  paid_users: "Paid Plan Users",
  starter_users: "Starter Plan",
  pro_users: "Pro Plan",
  enterprise: "Enterprise",
  specific_orgs: "Specific Organizations",
};

interface AnnouncementsPageClientProps {
  initialAnnouncements: AnnouncementListItem[];
  totalAnnouncements: number;
  stats: {
    total: number;
    active: number;
    expired: number;
    byType: Record<AnnouncementType, number>;
    byPriority: Record<AnnouncementPriority, number>;
    totalReads: number;
    totalDismissals: number;
  } | null;
}

export function AnnouncementsPageClient({
  initialAnnouncements,
  totalAnnouncements,
  stats,
}: AnnouncementsPageClientProps) {
  const [announcements, setAnnouncements] =
    useState<AnnouncementListItem[]>(initialAnnouncements);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<AnnouncementListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [formData, setFormData] = useState<CreateAnnouncementInput>({
    title: "",
    content: "",
    type: "info",
    priority: "medium",
    audience: "all",
    dismissible: true,
    showBanner: true,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      type: "info",
      priority: "medium",
      audience: "all",
      dismissible: true,
      showBanner: true,
    });
  };

  const handleCreate = () => {
    startTransition(async () => {
      const result = await createAnnouncement(formData);
      if (result.success && result.data) {
        setAnnouncements([result.data, ...announcements]);
        setIsCreateModalOpen(false);
        resetForm();
        toast.success("Announcement created successfully");
      } else {
        toast.error(result.error || "Failed to create announcement");
      }
    });
  };

  const handleUpdate = () => {
    if (!editingAnnouncement) return;

    startTransition(async () => {
      const result = await updateAnnouncement(editingAnnouncement.id, formData);
      if (result.success && result.data) {
        setAnnouncements(
          announcements.map((a) =>
            a.id === editingAnnouncement.id ? result.data! : a
          )
        );
        setEditingAnnouncement(null);
        resetForm();
        toast.success("Announcement updated successfully");
      } else {
        toast.error(result.error || "Failed to update announcement");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    startTransition(async () => {
      const result = await deleteAnnouncement(id);
      if (result.success) {
        setAnnouncements(announcements.filter((a) => a.id !== id));
        toast.success("Announcement deleted");
      } else {
        toast.error(result.error || "Failed to delete announcement");
      }
    });
  };

  const handleToggleActive = (announcement: AnnouncementListItem) => {
    startTransition(async () => {
      const result = await toggleAnnouncementActive(announcement.id);
      if (result.success && result.data) {
        setAnnouncements(
          announcements.map((a) =>
            a.id === announcement.id
              ? { ...a, isActive: result.data!.isActive }
              : a
          )
        );
        toast.success(
          result.data.isActive
            ? "Announcement activated"
            : "Announcement deactivated"
        );
      } else {
        toast.error(result.error || "Failed to toggle announcement");
      }
    });
  };

  const openEditModal = (announcement: AnnouncementListItem) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
      audience: announcement.audience,
      targetOrgIds: announcement.targetOrgIds,
      dismissible: announcement.dismissible,
      showBanner: announcement.showBanner,
      bannerColor: announcement.bannerColor || undefined,
      ctaLabel: announcement.ctaLabel || undefined,
      ctaUrl: announcement.ctaUrl || undefined,
      expiresAt: announcement.expiresAt || undefined,
    });
    setEditingAnnouncement(announcement);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Announcements
          </h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Broadcast messages to users across the platform
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            "bg-[var(--primary)] text-white",
            "hover:bg-[var(--primary)]/90",
            "transition-colors font-medium"
          )}
        >
          <PlusIcon className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
              <MegaphoneIcon className="w-4 h-4" />
              <span className="text-sm">Total</span>
            </div>
            <p className="text-2xl font-semibold text-[var(--foreground)]">
              {stats.total}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <ToggleIcon className="w-4 h-4" />
              <span className="text-sm">Active</span>
            </div>
            <p className="text-2xl font-semibold text-[var(--foreground)]">
              {stats.active}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <EyeIcon className="w-4 h-4" />
              <span className="text-sm">Total Reads</span>
            </div>
            <p className="text-2xl font-semibold text-[var(--foreground)]">
              {stats.totalReads.toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
              <UsersIcon className="w-4 h-4" />
              <span className="text-sm">Dismissed</span>
            </div>
            <p className="text-2xl font-semibold text-[var(--foreground)]">
              {stats.totalDismissals.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="rounded-lg border border-[var(--border)] overflow-hidden">
        <div className="bg-[var(--card)] px-4 py-3 border-b border-[var(--border)]">
          <h2 className="font-medium text-[var(--foreground)]">
            All Announcements ({totalAnnouncements})
          </h2>
        </div>

        {announcements.length === 0 ? (
          <div className="p-8 text-center">
            <MegaphoneIcon className="w-12 h-12 mx-auto text-[var(--foreground-muted)] mb-4" />
            <p className="text-[var(--foreground-muted)]">
              No announcements yet. Create your first one!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={cn(
                  "p-4 hover:bg-[var(--background-tertiary)] transition-colors",
                  !announcement.isActive && "opacity-60"
                )}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-[var(--foreground)] truncate">
                        {announcement.title}
                      </h3>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium",
                          TYPE_CONFIG[announcement.type].bgColor,
                          TYPE_CONFIG[announcement.type].color
                        )}
                      >
                        {TYPE_CONFIG[announcement.type].label}
                      </span>
                      <span
                        className={cn(
                          "text-xs",
                          PRIORITY_CONFIG[announcement.priority].color
                        )}
                      >
                        {PRIORITY_CONFIG[announcement.priority].label}
                      </span>
                      {!announcement.isActive && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--background-tertiary)] text-[var(--foreground-muted)]">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--foreground-muted)] line-clamp-2 mb-2">
                      {announcement.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
                      <span>
                        Audience: {AUDIENCE_LABELS[announcement.audience]}
                      </span>
                      <span>
                        {announcement._count.readStatuses} reads
                      </span>
                      <span>Created {formatDate(announcement.createdAt)}</span>
                      {announcement.expiresAt && (
                        <span>
                          Expires {formatDate(announcement.expiresAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(announcement)}
                      disabled={isPending}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        announcement.isActive
                          ? "text-green-400 hover:bg-green-500/10"
                          : "text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)]"
                      )}
                      title={
                        announcement.isActive ? "Deactivate" : "Activate"
                      }
                    >
                      <ToggleIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(announcement)}
                      disabled={isPending}
                      className="p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)] transition-colors"
                      title="Edit"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      disabled={isPending}
                      className="p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || editingAnnouncement) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--card)] rounded-lg shadow-xl border border-[var(--border)]">
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--card)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {editingAnnouncement
                  ? "Edit Announcement"
                  : "Create Announcement"}
              </h2>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingAnnouncement(null);
                  resetForm();
                }}
                className="p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)] transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Announcement title..."
                  className={cn(
                    "w-full px-3 py-2 rounded-lg",
                    "bg-[var(--background)] border border-[var(--border)]",
                    "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                    "focus:outline-none focus:border-[var(--primary)]"
                  )}
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Write your announcement..."
                  rows={4}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg resize-none",
                    "bg-[var(--background)] border border-[var(--border)]",
                    "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                    "focus:outline-none focus:border-[var(--primary)]"
                  )}
                />
              </div>

              {/* Type & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as AnnouncementType,
                      })
                    }
                    className={cn(
                      "w-full px-3 py-2 rounded-lg",
                      "bg-[var(--background)] border border-[var(--border)]",
                      "text-[var(--foreground)]",
                      "focus:outline-none focus:border-[var(--primary)]"
                    )}
                  >
                    {Object.entries(TYPE_CONFIG).map(([value, config]) => (
                      <option key={value} value={value}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as AnnouncementPriority,
                      })
                    }
                    className={cn(
                      "w-full px-3 py-2 rounded-lg",
                      "bg-[var(--background)] border border-[var(--border)]",
                      "text-[var(--foreground)]",
                      "focus:outline-none focus:border-[var(--primary)]"
                    )}
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                      <option key={value} value={value}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Audience */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Target Audience
                </label>
                <select
                  value={formData.audience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      audience: e.target.value as AnnouncementAudience,
                    })
                  }
                  className={cn(
                    "w-full px-3 py-2 rounded-lg",
                    "bg-[var(--background)] border border-[var(--border)]",
                    "text-[var(--foreground)]",
                    "focus:outline-none focus:border-[var(--primary)]"
                  )}
                >
                  {Object.entries(AUDIENCE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    CTA Button Label (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.ctaLabel || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, ctaLabel: e.target.value })
                    }
                    placeholder="Learn More"
                    className={cn(
                      "w-full px-3 py-2 rounded-lg",
                      "bg-[var(--background)] border border-[var(--border)]",
                      "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                      "focus:outline-none focus:border-[var(--primary)]"
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    CTA URL (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.ctaUrl || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, ctaUrl: e.target.value })
                    }
                    placeholder="https://..."
                    className={cn(
                      "w-full px-3 py-2 rounded-lg",
                      "bg-[var(--background)] border border-[var(--border)]",
                      "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                      "focus:outline-none focus:border-[var(--primary)]"
                    )}
                  />
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dismissible}
                    onChange={(e) =>
                      setFormData({ ...formData, dismissible: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-[var(--border)] bg-[var(--background)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--foreground)]">
                    Dismissible
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showBanner}
                    onChange={(e) =>
                      setFormData({ ...formData, showBanner: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-[var(--border)] bg-[var(--background)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--foreground)]">
                    Show as Banner
                  </span>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 flex items-center justify-end gap-3 p-4 border-t border-[var(--border)] bg-[var(--card)]">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingAnnouncement(null);
                  resetForm();
                }}
                className={cn(
                  "px-4 py-2 rounded-lg",
                  "text-[var(--foreground)] bg-[var(--background-tertiary)]",
                  "hover:bg-[var(--background-hover)] transition-colors"
                )}
              >
                Cancel
              </button>
              <button
                onClick={editingAnnouncement ? handleUpdate : handleCreate}
                disabled={isPending || !formData.title || !formData.content}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium",
                  "bg-[var(--primary)] text-white",
                  "hover:bg-[var(--primary)]/90 transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isPending
                  ? "Saving..."
                  : editingAnnouncement
                  ? "Update"
                  : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
