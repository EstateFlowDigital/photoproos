"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  MailIcon,
  MessageIcon,
} from "@/components/ui/settings-icons";
import {
  Star,
  ExternalLink,
  GripVertical,
  TrendingUp,
  Users,
  MessageSquare,
  Image,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { ReviewPlatformType } from "@prisma/client";
import {
  createReviewPlatform,
  updateReviewPlatform,
  deleteReviewPlatform,
  updateReviewGateSettings,
  reorderReviewPlatforms,
  type ReviewGateSettings,
  type ReviewStats,
} from "@/lib/actions/review-gate";

// =============================================================================
// Constants
// =============================================================================

const PLATFORM_TYPE_LABELS: Record<ReviewPlatformType, string> = {
  google_business: "Google Business",
  yelp: "Yelp",
  tripadvisor: "TripAdvisor",
  facebook: "Facebook",
  thumbtack: "Thumbtack",
  wedding_wire: "WeddingWire",
  the_knot: "The Knot",
  custom: "Custom Platform",
};

const PLATFORM_TYPE_ICONS: Record<ReviewPlatformType, string> = {
  google_business: "G",
  yelp: "Y",
  tripadvisor: "T",
  facebook: "f",
  thumbtack: "T",
  wedding_wire: "W",
  the_knot: "K",
  custom: "?",
};

const PLATFORM_TYPE_COLORS: Record<ReviewPlatformType, string> = {
  google_business: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  yelp: "bg-red-500/10 text-red-400 border-red-500/20",
  tripadvisor: "bg-green-500/10 text-green-400 border-green-500/20",
  facebook: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  thumbtack: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  wedding_wire: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  the_knot: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  custom: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const PLATFORM_OPTIONS = Object.entries(PLATFORM_TYPE_LABELS).map(
  ([value, label]) => ({
    value,
    label,
  })
);

// =============================================================================
// Types
// =============================================================================

interface Platform {
  id: string;
  type: ReviewPlatformType;
  name: string;
  url: string;
  iconUrl: string | null;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ReviewsSettingsClientProps {
  platforms: Platform[];
  settings: ReviewGateSettings;
  stats: ReviewStats | null;
}

interface PlatformFormData {
  type: ReviewPlatformType;
  name: string;
  url: string;
}

// =============================================================================
// Component
// =============================================================================

export function ReviewsSettingsClient({
  platforms: initialPlatforms,
  settings: initialSettings,
  stats,
}: ReviewsSettingsClientProps) {
  const { showToast } = useToast();
  const [platforms, setPlatforms] = useState(initialPlatforms);
  const [settings, setSettings] = useState(initialSettings);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<PlatformFormData>({
    type: "google_business",
    name: "",
    url: "",
  });

  // ==========================================================================
  // Settings Handlers
  // ==========================================================================

  const handleSettingChange = async (
    key: keyof ReviewGateSettings,
    value: boolean | number
  ) => {
    const oldValue = settings[key];
    setSettings((prev) => ({ ...prev, [key]: value }));

    const result = await updateReviewGateSettings({ [key]: value });
    if (!result.success) {
      setSettings((prev) => ({ ...prev, [key]: oldValue }));
      showToast(result.error, "error");
    }
  };

  // ==========================================================================
  // Platform Handlers
  // ==========================================================================

  const openCreateModal = () => {
    setEditingPlatform(null);
    setFormData({
      type: "google_business",
      name: "",
      url: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (platform: Platform) => {
    setEditingPlatform(platform);
    setFormData({
      type: platform.type,
      name: platform.name,
      url: platform.url,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlatform(null);
    setFormData({ type: "google_business", name: "", url: "" });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      showToast("Name and URL are required", "error");
      return;
    }

    // Basic URL validation
    try {
      new URL(formData.url);
    } catch {
      showToast("Please enter a valid URL", "error");
      return;
    }

    setIsSubmitting(true);

    if (editingPlatform) {
      const result = await updateReviewPlatform(editingPlatform.id, {
        name: formData.name,
        url: formData.url,
      });

      if (result.success) {
        setPlatforms((prev) =>
          prev.map((p) =>
            p.id === editingPlatform.id
              ? { ...p, name: formData.name, url: formData.url }
              : p
          )
        );
        showToast("Platform updated", "success");
        closeModal();
      } else {
        showToast(result.error, "error");
      }
    } else {
      const result = await createReviewPlatform({
        type: formData.type,
        name: formData.name,
        url: formData.url,
      });

      if (result.success) {
        // Refresh to get the new platform
        window.location.reload();
      } else {
        showToast(result.error, "error");
      }
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (platformId: string) => {
    const result = await deleteReviewPlatform(platformId);
    if (result.success) {
      setPlatforms((prev) => prev.filter((p) => p.id !== platformId));
      showToast("Platform removed", "success");
    } else {
      showToast(result.error, "error");
    }
    setDeleteConfirmId(null);
  };

  const handleTogglePlatform = async (platform: Platform) => {
    const newState = !platform.isActive;
    setPlatforms((prev) =>
      prev.map((p) => (p.id === platform.id ? { ...p, isActive: newState } : p))
    );

    const result = await updateReviewPlatform(platform.id, {
      isActive: newState,
    });
    if (!result.success) {
      setPlatforms((prev) =>
        prev.map((p) =>
          p.id === platform.id ? { ...p, isActive: !newState } : p
        )
      );
      showToast(result.error, "error");
    }
  };

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      {stats && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Reviews"
              value={stats.completedRequests}
              icon={<Star className="h-4 w-4" />}
            />
            <StatCard
              label="Average Rating"
              value={stats.averageRating.toFixed(1)}
              icon={<TrendingUp className="h-4 w-4" />}
              suffix="/ 5"
            />
            <StatCard
              label="Response Rate"
              value={`${stats.responseRate}%`}
              icon={<Users className="h-4 w-4" />}
            />
            <StatCard
              label="Platform Clicks"
              value={stats.platformClicks}
              icon={<ExternalLink className="h-4 w-4" />}
            />
          </div>
          <div className="flex justify-end">
            <Link
              href="/settings/reviews/requests"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors"
            >
              View all review requests
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Master Toggle */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Review Collection
            </h2>
            <p className="mt-1 text-sm text-foreground-muted">
              Enable the review gate system to collect feedback from clients.
              Happy clients (4-5 stars) are redirected to public review
              platforms.
            </p>
          </div>
          <Switch
            checked={settings.reviewGateEnabled}
            onCheckedChange={(checked) =>
              handleSettingChange("reviewGateEnabled", checked)
            }
          />
        </div>
      </section>

      {/* Review Platforms */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
        <div className="flex items-center justify-between border-b border-[var(--card-border)] p-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Review Platforms
            </h2>
            <p className="mt-0.5 text-sm text-foreground-muted">
              Configure where happy clients can leave public reviews
            </p>
          </div>
          <Button onClick={openCreateModal} size="sm">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Platform
          </Button>
        </div>

        {platforms.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--background-secondary)]">
              <Star className="h-6 w-6 text-foreground-muted" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-foreground">
              No platforms configured
            </h3>
            <p className="mt-1 text-sm text-foreground-muted">
              Add your review platforms to start collecting public reviews
            </p>
            <Button onClick={openCreateModal} className="mt-4" size="sm">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Your First Platform
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--card-border)]">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className={cn(
                  "flex items-center gap-4 p-4 transition-opacity",
                  !platform.isActive && "opacity-50"
                )}
              >
                <GripVertical className="h-4 w-4 cursor-grab text-foreground-muted" />

                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border font-bold",
                    PLATFORM_TYPE_COLORS[platform.type]
                  )}
                >
                  {PLATFORM_TYPE_ICONS[platform.type]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground truncate">
                      {platform.name}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs border",
                        PLATFORM_TYPE_COLORS[platform.type]
                      )}
                    >
                      {PLATFORM_TYPE_LABELS[platform.type]}
                    </span>
                  </div>
                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-foreground-muted hover:text-[var(--primary)] truncate block"
                  >
                    {platform.url}
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={platform.isActive}
                    onCheckedChange={() => handleTogglePlatform(platform)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(platform)}
                  >
                    <EditIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirmId(platform.id)}
                  >
                    <TrashIcon className="h-4 w-4 text-[var(--error)]" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Touchpoint Settings */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
        <div className="border-b border-[var(--card-border)] p-4">
          <h2 className="text-base font-semibold text-foreground">
            Touchpoint Settings
          </h2>
          <p className="mt-0.5 text-sm text-foreground-muted">
            Control where and when review requests are sent
          </p>
        </div>

        <div className="divide-y divide-[var(--card-border)]">
          {/* Delivery Email */}
          <TouchpointSetting
            icon={<MailIcon className="h-5 w-5" />}
            title="Gallery Delivery Email"
            description="Include a review request button in gallery delivery emails"
            enabled={settings.reviewGateDeliveryEmailEnabled}
            onChange={(checked) =>
              handleSettingChange("reviewGateDeliveryEmailEnabled", checked)
            }
            disabled={!settings.reviewGateEnabled}
          />

          {/* Follow-up Email */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--background-secondary)] text-foreground-muted">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    Automated Follow-up Email
                  </h3>
                  <p className="mt-0.5 text-sm text-foreground-muted">
                    Send a review request email automatically after gallery
                    delivery
                  </p>
                  {settings.reviewGateFollowupEnabled && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm text-foreground-muted">
                        Send after
                      </span>
                      <Select
                        value={String(settings.reviewGateFollowupDays)}
                        options={[
                          { value: "3", label: "3 days" },
                          { value: "5", label: "5 days" },
                          { value: "7", label: "7 days" },
                          { value: "10", label: "10 days" },
                          { value: "14", label: "14 days" },
                        ]}
                        onChange={(e) =>
                          handleSettingChange(
                            "reviewGateFollowupDays",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-28"
                      />
                    </div>
                  )}
                </div>
              </div>
              <Switch
                checked={settings.reviewGateFollowupEnabled}
                onCheckedChange={(checked) =>
                  handleSettingChange("reviewGateFollowupEnabled", checked)
                }
                disabled={!settings.reviewGateEnabled}
              />
            </div>
          </div>

          {/* Chat */}
          <TouchpointSetting
            icon={<MessageIcon className="h-5 w-5" />}
            title="Chat Quick Action"
            description="Show a quick action button to send review requests in conversations"
            enabled={settings.reviewGateChatEnabled}
            onChange={(checked) =>
              handleSettingChange("reviewGateChatEnabled", checked)
            }
            disabled={!settings.reviewGateEnabled}
          />

          {/* Gallery Prompt */}
          <TouchpointSetting
            icon={<Image className="h-5 w-5" />}
            title="Gallery Page Prompt"
            description="Show a review prompt modal when clients view their gallery"
            enabled={settings.reviewGateGalleryPromptEnabled}
            onChange={(checked) =>
              handleSettingChange("reviewGateGalleryPromptEnabled", checked)
            }
            disabled={!settings.reviewGateEnabled}
          />
        </div>
      </section>

      {/* How it Works */}
      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-base font-semibold text-foreground">
          How Review Gate Works
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <StepCard
            number={1}
            title="Client Rates Experience"
            description="Clients click the review link and rate their experience from 1-5 stars"
          />
          <StepCard
            number={2}
            title="Smart Routing"
            description="Low ratings (1-3) go to a private feedback form. High ratings (4-5) are shown your review platforms"
          />
          <StepCard
            number={3}
            title="Collect Reviews"
            description="Happy clients are directed to leave public reviews on Google, Yelp, etc."
          />
        </div>
      </section>

      {/* Platform Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPlatform ? "Edit Platform" : "Add Review Platform"}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {!editingPlatform && (
              <div>
                <label className="text-sm font-medium text-foreground">
                  Platform Type
                </label>
                <Select
                  value={formData.type}
                  options={PLATFORM_OPTIONS}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: e.target.value as ReviewPlatformType,
                      name:
                        prev.name || PLATFORM_TYPE_LABELS[e.target.value as ReviewPlatformType],
                    }))
                  }
                  className="mt-1.5"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground">
                Display Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Leave us a Google Review"
                className="mt-1.5 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Review Page URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://g.page/r/..."
                className="mt-1.5 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
              <p className="mt-1.5 text-xs text-foreground-muted">
                Enter the direct link to your review page
              </p>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : editingPlatform
                  ? "Save Changes"
                  : "Add Platform"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Platform</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--error)]/10">
                <AlertCircle className="h-5 w-5 text-[var(--error)]" />
              </div>
              <div>
                <p className="text-sm text-foreground">
                  Are you sure you want to remove this review platform? This
                  action cannot be undone.
                </p>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Remove Platform
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function StatCard({
  label,
  value,
  icon,
  suffix,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-center gap-2 text-foreground-muted">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {suffix && (
          <span className="text-sm text-foreground-muted">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function TouchpointSetting({
  icon,
  title,
  description,
  enabled,
  onChange,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--background-secondary)] text-foreground-muted">
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-foreground">{title}</h3>
          <p className="mt-0.5 text-sm text-foreground-muted">{description}</p>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
        {number}
      </div>
      <h3 className="mt-3 font-medium text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-foreground-muted">{description}</p>
    </div>
  );
}
