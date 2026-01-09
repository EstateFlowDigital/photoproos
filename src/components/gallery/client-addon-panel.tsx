"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getAvailableAddons,
  requestAddon,
  getClientAddonRequests,
  approveAddonQuote,
  declineAddonQuote,
} from "@/lib/actions/gallery-addons";
import {
  Package,
  Sparkles,
  Sofa,
  Megaphone,
  Film,
  Printer,
  Palette,
  Eraser,
  Clock,
  DollarSign,
  Check,
  X,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { GalleryAddonCategory, GalleryAddonRequestStatus } from "@prisma/client";

interface Photo {
  id: string;
  thumbnailUrl?: string | null;
  filename: string;
}

interface ClientAddonPanelProps {
  projectId: string;
  deliverySlug?: string;
  photos: Photo[];
  className?: string;
}

interface GalleryAddon {
  id: string;
  name: string;
  description: string | null;
  iconName: string | null;
  priceCents: number | null;
  pricePerItem: boolean;
  category: GalleryAddonCategory;
  estimatedTurnaround: string | null;
  imageUrl: string | null;
  requiresSelection: boolean;
  maxPhotos: number | null;
  alreadyRequested: boolean;
  requestStatus: GalleryAddonRequestStatus | null;
}

interface AddonRequest {
  id: string;
  status: GalleryAddonRequestStatus;
  notes: string | null;
  selectedPhotos: string[];
  quoteCents: number | null;
  quoteDescription: string | null;
  createdAt: Date;
  addon: {
    name: string;
    category: GalleryAddonCategory;
  };
}

const CATEGORY_ICONS: Record<GalleryAddonCategory, React.ReactNode> = {
  enhancement: <Sparkles className="h-4 w-4" />,
  virtual_staging: <Sofa className="h-4 w-4" />,
  marketing: <Megaphone className="h-4 w-4" />,
  video: <Film className="h-4 w-4" />,
  print: <Printer className="h-4 w-4" />,
  editing: <Palette className="h-4 w-4" />,
  removal: <Eraser className="h-4 w-4" />,
  other: <Package className="h-4 w-4" />,
};

const STATUS_LABELS: Record<GalleryAddonRequestStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-yellow-500" },
  quoted: { label: "Quote Received", color: "text-blue-500" },
  approved: { label: "Approved", color: "text-green-500" },
  in_progress: { label: "In Progress", color: "text-blue-500" },
  completed: { label: "Completed", color: "text-green-500" },
  declined: { label: "Declined", color: "text-[var(--foreground-muted)]" },
  cancelled: { label: "Cancelled", color: "text-[var(--foreground-muted)]" },
};

export function ClientAddonPanel({
  projectId,
  deliverySlug,
  photos,
  className,
}: ClientAddonPanelProps) {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [addons, setAddons] = useState<GalleryAddon[]>([]);
  const [requests, setRequests] = useState<AddonRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<GalleryAddon | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"browse" | "requests">("browse");

  // Load addons and requests when panel opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, projectId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [addonsResult, requestsResult] = await Promise.all([
        getAvailableAddons(projectId, deliverySlug),
        getClientAddonRequests(projectId, deliverySlug),
      ]);

      if (addonsResult.success && addonsResult.data) {
        setAddons(addonsResult.data.addons as GalleryAddon[]);
      }
      if (requestsResult.success && requestsResult.data) {
        setRequests(requestsResult.data.requests as AddonRequest[]);
      }
    } catch (error) {
      console.error("Error loading addons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAddon = (addon: GalleryAddon) => {
    setSelectedAddon(addon);
    setSelectedPhotos(new Set());
    setNotes("");
  };

  const togglePhotoSelection = (photoId: string) => {
    if (!selectedAddon) return;

    setSelectedPhotos((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        // Check max photos limit
        if (selectedAddon.maxPhotos && next.size >= selectedAddon.maxPhotos) {
          showToast(`Maximum ${selectedAddon.maxPhotos} photos allowed`, "error");
          return prev;
        }
        next.add(photoId);
      }
      return next;
    });
  };

  const handleSubmitRequest = async () => {
    if (!selectedAddon) return;

    if (selectedAddon.requiresSelection && selectedPhotos.size === 0) {
      showToast("Please select at least one photo", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await requestAddon(
        {
          addonId: selectedAddon.id,
          projectId,
          notes: notes.trim() || null,
          selectedPhotos: Array.from(selectedPhotos),
        },
        deliverySlug
      );

      if (result.success) {
        showToast("Request submitted successfully!", "success");
        setSelectedAddon(null);
        setSelectedPhotos(new Set());
        setNotes("");
        loadData(); // Refresh data
        setActiveTab("requests");
      } else if (!result.success) {
        showToast(result.error || "Failed to submit request", "error");
      }
    } catch (error) {
      showToast("An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveQuote = async (requestId: string) => {
    setIsSubmitting(true);
    try {
      const result = await approveAddonQuote(requestId, deliverySlug);
      if (result.success) {
        showToast("Quote approved!", "success");
        loadData();
      } else if (!result.success) {
        showToast(result.error || "Failed to approve quote", "error");
      }
    } catch (error) {
      showToast("An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeclineQuote = async (requestId: string) => {
    setIsSubmitting(true);
    try {
      const result = await declineAddonQuote(requestId, deliverySlug);
      if (result.success) {
        showToast("Quote declined", "success");
        loadData();
      } else if (!result.success) {
        showToast(result.error || "Failed to decline quote", "error");
      }
    } catch (error) {
      showToast("An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingRequests = requests.filter((r) =>
    ["pending", "quoted", "approved", "in_progress"].includes(r.status)
  );

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90",
          className
        )}
      >
        <ShoppingBag className="h-4 w-4" />
        <span>Add-ons</span>
        {pendingRequests.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
            {pendingRequests.length}
          </span>
        )}
      </button>

      {/* Full-screen Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b border-[var(--card-border)] pb-4">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Gallery Add-ons
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--foreground-muted)]" />
            </div>
          ) : selectedAddon ? (
            /* Add-on Detail / Photo Selection View */
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center gap-3 p-4 border-b border-[var(--card-border)]">
                <button
                  onClick={() => setSelectedAddon(null)}
                  className="p-1 rounded hover:bg-[var(--background-hover)]"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </button>
                <div className="flex-1">
                  <h3 className="font-medium text-[var(--foreground)]">
                    {selectedAddon.name}
                  </h3>
                  {selectedAddon.description && (
                    <p className="text-sm text-[var(--foreground-muted)]">
                      {selectedAddon.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {selectedAddon.priceCents !== null ? (
                    <div className="font-medium text-[var(--foreground)]">
                      ${(selectedAddon.priceCents / 100).toFixed(2)}
                      {selectedAddon.pricePerItem && (
                        <span className="text-sm text-[var(--foreground-muted)]">/photo</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-[var(--primary)]">Request Quote</div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedAddon.requiresSelection && (
                  <>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-[var(--foreground)]">
                        Select Photos
                        {selectedAddon.maxPhotos && (
                          <span className="text-[var(--foreground-muted)] font-normal ml-1">
                            (max {selectedAddon.maxPhotos})
                          </span>
                        )}
                      </label>
                      <span className="text-sm text-[var(--foreground-muted)]">
                        {selectedPhotos.size} selected
                      </span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto p-1">
                      {photos.map((photo) => (
                        <button
                          key={photo.id}
                          onClick={() => togglePhotoSelection(photo.id)}
                          className={cn(
                            "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                            selectedPhotos.has(photo.id)
                              ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/30"
                              : "border-transparent hover:border-[var(--primary)]/50"
                          )}
                        >
                          {photo.thumbnailUrl ? (
                            <img
                              src={photo.thumbnailUrl}
                              alt={photo.filename}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-[var(--background-tertiary)]">
                              <ImageIcon className="h-6 w-6 text-[var(--foreground-muted)]" />
                            </div>
                          )}
                          {selectedPhotos.has(photo.id) && (
                            <div className="absolute inset-0 bg-[var(--primary)]/20 flex items-center justify-center">
                              <Check className="h-6 w-6 text-[var(--primary)]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Notes or Special Instructions
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any specific requirements or instructions..."
                    className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-background)] px-3 py-2 text-sm placeholder:text-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    rows={3}
                  />
                </div>

                {selectedAddon.estimatedTurnaround && (
                  <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                    <Clock className="h-4 w-4" />
                    Estimated turnaround: {selectedAddon.estimatedTurnaround}
                  </div>
                )}
              </div>

              <div className="border-t border-[var(--card-border)] p-4">
                <Button
                  onClick={handleSubmitRequest}
                  disabled={isSubmitting || (selectedAddon.requiresSelection && selectedPhotos.size === 0)}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : selectedAddon.priceCents !== null ? (
                    <>
                      Request Add-on
                      {selectedAddon.pricePerItem && selectedPhotos.size > 0 && (
                        <span className="ml-2">
                          (${((selectedAddon.priceCents * selectedPhotos.size) / 100).toFixed(2)})
                        </span>
                      )}
                    </>
                  ) : (
                    "Request Quote"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Main Browse / Requests View */
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Tabs */}
              <div className="flex border-b border-[var(--card-border)]">
                <button
                  onClick={() => setActiveTab("browse")}
                  className={cn(
                    "px-4 py-3 text-sm font-medium transition-colors relative",
                    activeTab === "browse"
                      ? "text-[var(--foreground)]"
                      : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  )}
                >
                  Browse Add-ons
                  {activeTab === "browse" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("requests")}
                  className={cn(
                    "px-4 py-3 text-sm font-medium transition-colors relative flex items-center gap-2",
                    activeTab === "requests"
                      ? "text-[var(--foreground)]"
                      : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  )}
                >
                  My Requests
                  {requests.length > 0 && (
                    <span className="px-1.5 py-0.5 text-xs rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                      {requests.length}
                    </span>
                  )}
                  {activeTab === "requests" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]" />
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === "browse" ? (
                  addons.length === 0 ? (
                    <div className="text-center py-12 text-[var(--foreground-muted)]">
                      <Package className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      <p>No add-ons available for this gallery</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {addons.map((addon) => (
                        <button
                          key={addon.id}
                          onClick={() => !addon.alreadyRequested && handleSelectAddon(addon)}
                          disabled={addon.alreadyRequested}
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-lg border text-left transition-colors",
                            addon.alreadyRequested
                              ? "border-[var(--card-border)] bg-[var(--card)] opacity-60 cursor-not-allowed"
                              : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--primary)]/50"
                          )}
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                            {CATEGORY_ICONS[addon.category]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[var(--foreground)]">
                                {addon.name}
                              </span>
                              {addon.alreadyRequested && addon.requestStatus && (
                                <span className={cn(
                                  "text-xs px-1.5 py-0.5 rounded-full",
                                  STATUS_LABELS[addon.requestStatus].color,
                                  "bg-current/10"
                                )}>
                                  {STATUS_LABELS[addon.requestStatus].label}
                                </span>
                              )}
                            </div>
                            {addon.description && (
                              <p className="text-sm text-[var(--foreground-muted)] mt-0.5 line-clamp-2">
                                {addon.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-[var(--foreground-muted)]">
                              {addon.priceCents !== null ? (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  ${(addon.priceCents / 100).toFixed(2)}
                                  {addon.pricePerItem && "/photo"}
                                </span>
                              ) : (
                                <span className="text-[var(--primary)]">Request Quote</span>
                              )}
                              {addon.estimatedTurnaround && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {addon.estimatedTurnaround}
                                </span>
                              )}
                              {addon.requiresSelection && (
                                <span className="flex items-center gap-1">
                                  <ImageIcon className="h-3 w-3" />
                                  Photo selection required
                                </span>
                              )}
                            </div>
                          </div>
                          {!addon.alreadyRequested && (
                            <ChevronRight className="h-5 w-5 text-[var(--foreground-muted)] flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )
                ) : requests.length === 0 ? (
                  <div className="text-center py-12 text-[var(--foreground-muted)]">
                    <Package className="h-8 w-8 mx-auto mb-3 opacity-50" />
                    <p>You haven't requested any add-ons yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--card)]"
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[var(--foreground)]">
                                {request.addon.name}
                              </span>
                              <span className={cn(
                                "text-xs px-1.5 py-0.5 rounded-full",
                                STATUS_LABELS[request.status].color,
                                "bg-current/10"
                              )}>
                                {STATUS_LABELS[request.status].label}
                              </span>
                            </div>
                            {request.notes && (
                              <p className="text-sm text-[var(--foreground-muted)] mt-1">
                                {request.notes}
                              </p>
                            )}
                            {request.selectedPhotos.length > 0 && (
                              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                                {request.selectedPhotos.length} photo(s) selected
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quote received - show approve/decline */}
                        {request.status === "quoted" && request.quoteCents !== null && (
                          <div className="mt-4 p-3 rounded-lg bg-[var(--background-tertiary)]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-[var(--foreground)]">
                                Quote
                              </span>
                              <span className="font-semibold text-[var(--foreground)]">
                                ${(request.quoteCents / 100).toFixed(2)}
                              </span>
                            </div>
                            {request.quoteDescription && (
                              <p className="text-sm text-[var(--foreground-muted)] mb-3">
                                {request.quoteDescription}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveQuote(request.id)}
                                disabled={isSubmitting}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeclineQuote(request.id)}
                                disabled={isSubmitting}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
