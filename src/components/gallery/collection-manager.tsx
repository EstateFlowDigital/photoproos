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
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  getGalleryCollections,
  createGalleryCollection,
  updateGalleryCollection,
  deleteGalleryCollection,
  reorderGalleryCollections,
  type GalleryCollectionInput,
} from "@/lib/actions/gallery-collections";

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  coverAssetId: string | null;
  _count: {
    assets: number;
  };
  assets: Array<{
    thumbnailUrl: string | null;
    mediumUrl: string | null;
  }>;
}

interface CollectionManagerProps {
  galleryId: string;
  onCollectionSelect?: (collectionId: string | null) => void;
  selectedCollectionId?: string | null;
  photos?: Array<{ id: string; thumbnailUrl?: string | null }>;
}

interface SortableCollectionItemProps {
  collection: Collection;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableCollectionItem({
  collection,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: SortableCollectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: collection.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const coverImage = collection.assets[0]?.thumbnailUrl || collection.assets[0]?.mediumUrl;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-3 rounded-lg border p-2 transition-all",
        isSelected
          ? "border-[var(--primary)] bg-[var(--primary)]/5"
          : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--border-hover)]"
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripIcon className="h-4 w-4" />
      </button>

      {/* Cover thumbnail */}
      <div
        onClick={onSelect}
        className="h-12 w-12 shrink-0 cursor-pointer overflow-x-auto rounded-md bg-[var(--background)]"
      >
        {coverImage ? (
          <img
            src={coverImage}
            alt={collection.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FolderIcon className="h-5 w-5 text-foreground-muted" />
          </div>
        )}
      </div>

      {/* Name and count */}
      <div onClick={onSelect} className="min-w-0 flex-1 cursor-pointer">
        <p className="truncate text-sm font-medium text-foreground">
          {collection.name}
        </p>
        <p className="text-xs text-foreground-muted">
          {collection._count.assets} photo{collection._count.assets !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Actions - always visible on mobile, hover on desktop */}
      <div className="flex items-center gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
        <button
          onClick={onEdit}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
          aria-label="Edit collection"
        >
          <EditIcon className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-foreground-muted hover:bg-[var(--error)]/10 hover:text-[var(--error)]"
          aria-label="Delete collection"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function CollectionManager({
  galleryId,
  onCollectionSelect,
  selectedCollectionId,
  photos = [],
}: CollectionManagerProps) {
  const { showToast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [formData, setFormData] = useState<GalleryCollectionInput>({
    name: "",
    description: "",
    coverAssetId: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load collections
  useEffect(() => {
    loadCollections();
  }, [galleryId]);

  async function loadCollections() {
    setIsLoading(true);
    try {
      const result = await getGalleryCollections(galleryId);
      if (result.success && result.data) {
        setCollections(result.data as Collection[]);
      } else {
        showToast("error" in result ? result.error : "Failed to load collections", "error");
      }
    } catch {
      showToast("Failed to load collections", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      let newOrder: Collection[] = [];
      setCollections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        newOrder = arrayMove(items, oldIndex, newIndex);
        return newOrder;
      });

      // Persist to database
      try {
        const result = await reorderGalleryCollections(
          galleryId,
          newOrder.map((c) => c.id)
        );
        if (result.success) {
          showToast("Collection order saved", "success");
        } else {
          showToast(result.error || "Failed to save order", "error");
          await loadCollections();
        }
      } catch {
        showToast("Failed to save order", "error");
        await loadCollections();
      }
    }
  }

  async function handleCreate() {
    if (!formData.name.trim()) {
      showToast("Collection name is required", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createGalleryCollection(galleryId, {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        coverAssetId: formData.coverAssetId,
      });

      if (result.success) {
        showToast("Collection created", "success");
        setIsCreateOpen(false);
        setFormData({ name: "", description: "", coverAssetId: null });
        await loadCollections();
      } else {
        showToast(result.error || "Failed to create collection", "error");
      }
    } catch {
      showToast("Failed to create collection", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate() {
    if (!editingCollection || !formData.name.trim()) {
      showToast("Collection name is required", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateGalleryCollection(editingCollection.id, {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        coverAssetId: formData.coverAssetId,
      });

      if (result.success) {
        showToast("Collection updated", "success");
        setIsEditOpen(false);
        setEditingCollection(null);
        setFormData({ name: "", description: "", coverAssetId: null });
        await loadCollections();
      } else {
        showToast(result.error || "Failed to update collection", "error");
      }
    } catch {
      showToast("Failed to update collection", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!editingCollection) return;

    setIsSubmitting(true);
    try {
      const result = await deleteGalleryCollection(editingCollection.id);

      if (result.success) {
        showToast("Collection deleted", "success");
        setIsDeleteOpen(false);
        setEditingCollection(null);
        // Clear selection if deleted collection was selected
        if (selectedCollectionId === editingCollection.id) {
          onCollectionSelect?.(null);
        }
        await loadCollections();
      } else {
        showToast(result.error || "Failed to delete collection", "error");
      }
    } catch {
      showToast("Failed to delete collection", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function openEdit(collection: Collection) {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description || "",
      coverAssetId: collection.coverAssetId,
    });
    setIsEditOpen(true);
  }

  function openDelete(collection: Collection) {
    setEditingCollection(collection);
    setIsDeleteOpen(true);
  }

  const totalPhotoCount = photos.length;
  const uncategorizedCount = totalPhotoCount - collections.reduce((sum, c) => sum + c._count.assets, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h3 className="text-sm font-semibold text-foreground">Collections</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFormData({ name: "", description: "", coverAssetId: null });
            setIsCreateOpen(true);
          }}
          className="h-7 px-2 text-xs"
        >
          <PlusIcon className="mr-1 h-3.5 w-3.5" />
          New
        </Button>
      </div>

      {/* All Photos button */}
      <button
        onClick={() => onCollectionSelect?.(null)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg border p-2 transition-all",
          selectedCollectionId === null
            ? "border-[var(--primary)] bg-[var(--primary)]/5"
            : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--border-hover)]"
        )}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[var(--background)]">
          <GridIcon className="h-5 w-5 text-foreground-muted" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-medium text-foreground">All Photos</p>
          <p className="text-xs text-foreground-muted">{totalPhotoCount} photos</p>
        </div>
      </button>

      {/* Uncategorized */}
      {uncategorizedCount > 0 && collections.length > 0 && (
        <button
          onClick={() => onCollectionSelect?.("uncategorized")}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg border p-2 transition-all",
            selectedCollectionId === "uncategorized"
              ? "border-[var(--primary)] bg-[var(--primary)]/5"
              : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--border-hover)]"
          )}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[var(--background)]">
            <InboxIcon className="h-5 w-5 text-foreground-muted" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium text-foreground">Uncategorized</p>
            <p className="text-xs text-foreground-muted">{uncategorizedCount} photos</p>
          </div>
        </button>
      )}

      {/* Collection list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-[var(--background)]"
            />
          ))}
        </div>
      ) : collections.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={collections.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {collections.map((collection) => (
                <SortableCollectionItem
                  key={collection.id}
                  collection={collection}
                  isSelected={selectedCollectionId === collection.id}
                  onSelect={() => onCollectionSelect?.(collection.id)}
                  onEdit={() => openEdit(collection)}
                  onDelete={() => openDelete(collection)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="rounded-lg border border-dashed border-[var(--card-border)] p-6 text-center">
          <FolderIcon className="mx-auto h-8 w-8 text-foreground-muted" />
          <p className="mt-2 text-sm font-medium text-foreground">No collections yet</p>
          <p className="mt-1 text-xs text-foreground-muted">
            Create collections to organize photos
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFormData({ name: "", description: "", coverAssetId: null });
              setIsCreateOpen(true);
            }}
            className="mt-3"
          >
            <PlusIcon className="mr-1.5 h-3.5 w-3.5" />
            Create Collection
          </Button>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
            <DialogDescription>
              Organize your photos into collections
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Name <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Ceremony, Reception, Portraits"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Description
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description for this collection"
                  rows={2}
                  className="w-full resize-none rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsCreateOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              loading={isSubmitting}
            >
              Create Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription>
              Update collection details
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Name <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Collection name"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Description
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={2}
                  className="w-full resize-none rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              {photos.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Cover Photo
                  </label>
                  <div className="grid max-h-40 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 overflow-y-auto rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-2">
                    {photos.slice(0, 20).map((photo) => (
                      <button
                        key={photo.id}
                        onClick={() => setFormData({ ...formData, coverAssetId: photo.id })}
                        className={cn(
                          "aspect-square overflow-hidden rounded",
                          formData.coverAssetId === photo.id
                            ? "ring-2 ring-[var(--primary)] ring-offset-1"
                            : "hover:opacity-80"
                        )}
                      >
                        <img
                          src={photo.thumbnailUrl || ""}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsEditOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdate}
              loading={isSubmitting}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete Collection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{editingCollection?.name}&rdquo;? Photos in this collection will not be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isSubmitting}
            >
              Delete Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Icons
function GripIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3V6ZM3 15.75a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2.25Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3v-2.25Z" clipRule="evenodd" />
    </svg>
  );
}

function InboxIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6.912 3a3 3 0 0 0-2.868 2.118l-2.411 7.838a3 3 0 0 0-.133.882V18a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-4.162c0-.299-.045-.596-.133-.882l-2.412-7.838A3 3 0 0 0 17.088 3H6.912Zm13.823 9.75-2.213-7.191A1.5 1.5 0 0 0 17.088 4.5H6.912a1.5 1.5 0 0 0-1.434 1.059L3.265 12.75H6.11a3 3 0 0 1 2.684 1.658l.256.513a1.5 1.5 0 0 0 1.342.829h3.218a1.5 1.5 0 0 0 1.342-.83l.256-.512a3 3 0 0 1 2.684-1.658h2.844Z" clipRule="evenodd" />
    </svg>
  );
}
