"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  getGalleryCollections,
  createGalleryCollection,
  addAssetsToCollection,
  removeAssetsFromCollection,
} from "@/lib/actions/gallery-collections";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  _count: {
    assets: number;
  };
  assets: Array<{
    thumbnailUrl: string | null;
    mediumUrl: string | null;
  }>;
}

interface AssignToCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  galleryId: string;
  selectedAssetIds: string[];
  onSuccess?: (assignedCollectionId: string | null) => void;
}

export function AssignToCollectionModal({
  open,
  onOpenChange,
  galleryId,
  selectedAssetIds,
  onSuccess,
}: AssignToCollectionModalProps) {
  const { showToast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  // Load collections when modal opens
  useEffect(() => {
    if (open) {
      loadCollections();
    }
  }, [open, galleryId]);

  async function loadCollections() {
    setIsLoading(true);
    try {
      const result = await getGalleryCollections(galleryId);
      if (result.success && result.data) {
        setCollections(result.data as Collection[]);
      }
    } catch {
      showToast("Failed to load collections", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAssign() {
    if (!selectedCollectionId) {
      showToast("Please select a collection", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addAssetsToCollection(selectedCollectionId, selectedAssetIds);

      if (result.success) {
        showToast(`${selectedAssetIds.length} photo${selectedAssetIds.length !== 1 ? "s" : ""} added to collection`, "success");
        const assignedId = selectedCollectionId;
        onOpenChange(false);
        setSelectedCollectionId(null);
        onSuccess?.(assignedId);
      } else {
        showToast(result.error || "Failed to assign photos", "error");
      }
    } catch {
      showToast("Failed to assign photos", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemoveFromCollection() {
    setIsSubmitting(true);
    try {
      const result = await removeAssetsFromCollection(selectedAssetIds);

      if (result.success) {
        showToast(`${selectedAssetIds.length} photo${selectedAssetIds.length !== 1 ? "s" : ""} removed from collection`, "success");
        onOpenChange(false);
        onSuccess?.(null); // null means removed from collection
      } else {
        showToast(result.error || "Failed to remove photos", "error");
      }
    } catch {
      showToast("Failed to remove photos", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateAndAssign() {
    if (!newCollectionName.trim()) {
      showToast("Collection name is required", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create the collection
      const createResult = await createGalleryCollection(galleryId, {
        name: newCollectionName.trim(),
      });

      if (!createResult.success) {
        showToast(createResult.error || "Failed to create collection", "error");
        return;
      }

      // Assign photos to the new collection
      const assignResult = await addAssetsToCollection(createResult.data.id, selectedAssetIds);

      if (assignResult.success) {
        showToast(`Created "${newCollectionName}" and added ${selectedAssetIds.length} photo${selectedAssetIds.length !== 1 ? "s" : ""}`, "success");
        const newCollectionId = createResult.data.id;
        onOpenChange(false);
        setNewCollectionName("");
        setShowNewCollectionForm(false);
        onSuccess?.(newCollectionId);
      } else {
        showToast(assignResult.error || "Failed to assign photos", "error");
      }
    } catch {
      showToast("Failed to create collection", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
          <DialogDescription>
            Move {selectedAssetIds.length} selected photo{selectedAssetIds.length !== 1 ? "s" : ""} to a collection
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {showNewCollectionForm ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="new-collection-name" className="mb-1.5 block text-sm font-medium text-foreground">
                  Collection Name
                </label>
                <input
                  id="new-collection-name"
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g., Favorites, Ceremony, Portraits"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  autoFocus
                  aria-describedby="collection-name-hint"
                />
                <p id="collection-name-hint" className="sr-only">Enter a name for your new collection</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowNewCollectionForm(false);
                  setNewCollectionName("");
                }}
                className="text-sm text-foreground-muted hover:text-foreground"
              >
                ← Back to collection list
              </button>
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-lg bg-[var(--background)]"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {/* Create new collection button */}
              <button
                type="button"
                onClick={() => setShowNewCollectionForm(true)}
                className="flex w-full items-center gap-3 rounded-lg border border-dashed border-[var(--card-border)] p-3 text-left transition-all hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--primary)]/10">
                  <PlusIcon className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Create New Collection</p>
                  <p className="text-xs text-foreground-muted">Add photos to a new collection</p>
                </div>
              </button>

              {/* Remove from collection option */}
              <button
                type="button"
                onClick={() => setSelectedCollectionId("remove")}
                aria-pressed={selectedCollectionId === "remove"}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
                  selectedCollectionId === "remove"
                    ? "border-[var(--primary)] bg-[var(--primary)]/5"
                    : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--background)]">
                  <RemoveIcon className="h-5 w-5 text-foreground-muted" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Remove from Collection</p>
                  <p className="text-xs text-foreground-muted">Move to uncategorized</p>
                </div>
              </button>

              {/* Existing collections */}
              {collections.map((collection) => {
                const coverImage = collection.assets[0]?.thumbnailUrl || collection.assets[0]?.mediumUrl;
                return (
                  <button
                    type="button"
                    key={collection.id}
                    onClick={() => setSelectedCollectionId(collection.id)}
                    aria-pressed={selectedCollectionId === collection.id}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
                      selectedCollectionId === collection.id
                        ? "border-[var(--primary)] bg-[var(--primary)]/5"
                        : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                    )}
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-[var(--background)]">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <FolderIcon className="h-5 w-5 text-foreground-muted" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {collection.name}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {collection._count.assets} photo{collection._count.assets !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {selectedCollectionId === collection.id && (
                      <CheckIcon className="h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                    )}
                  </button>
                );
              })}

              {collections.length === 0 && (
                <p className="py-4 text-center text-sm text-foreground-muted">
                  No collections yet. Create one to get started.
                </p>
              )}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          {showNewCollectionForm ? (
            <Button
              variant="primary"
              onClick={handleCreateAndAssign}
              loading={isSubmitting}
              disabled={!newCollectionName.trim()}
            >
              Create & Add Photos
            </Button>
          ) : selectedCollectionId === "remove" ? (
            <Button
              variant="primary"
              onClick={handleRemoveFromCollection}
              loading={isSubmitting}
            >
              Remove from Collection
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleAssign}
              loading={isSubmitting}
              disabled={!selectedCollectionId}
            >
              Add to Collection
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Icons - decorative SVGs with aria-hidden for accessibility
interface IconProps {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

function PlusIcon({ className, "aria-hidden": ariaHidden = true }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden={ariaHidden}>
      <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

function FolderIcon({ className, "aria-hidden": ariaHidden = true }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden={ariaHidden}>
      <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
    </svg>
  );
}

function CheckIcon({ className, "aria-hidden": ariaHidden = true }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden={ariaHidden}>
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
  );
}

function RemoveIcon({ className, "aria-hidden": ariaHidden = true }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden={ariaHidden}>
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
    </svg>
  );
}
