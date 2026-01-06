"use client";

import { useState, useEffect, useTransition } from "react";
import { cn } from "@/lib/utils";
import type { BookingCrewRole } from "@prisma/client";
import {
  getBookingCrew,
  getAvailableCrewMembers,
  addCrewMember,
  updateCrewMember,
  removeCrewMember,
  getSmartCrewSuggestions,
} from "@/lib/actions/booking-crew";
import type { CapabilityLevel } from "@prisma/client";

// ============================================================================
// SUGGESTION TYPES
// ============================================================================

type SuggestionReason =
  | { type: "expert"; serviceName: string }
  | { type: "capable"; serviceName: string }
  | { type: "learning"; serviceName: string }
  | { type: "available" }
  | { type: "has_equipment"; equipmentNames: string[] };

interface CrewSuggestion {
  userId: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  reasons: SuggestionReason[];
  capabilityLevel: CapabilityLevel | null;
  score: number;
}

// ============================================================================
// TYPES
// ============================================================================

interface CrewMember {
  id: string;
  userId: string;
  role: BookingCrewRole;
  notes: string | null;
  hourlyRate: number | null;
  confirmed: boolean;
  confirmedAt: Date | null;
  declinedAt: Date | null;
  declineNote: string | null;
  user: {
    id: string;
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
    phone: string | null;
  };
}

interface AvailableMember {
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  isAlreadyAssigned: boolean;
}

interface BookingCrewPanelProps {
  bookingId: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ROLE_LABELS: Record<BookingCrewRole, string> = {
  lead_photographer: "Lead Photographer",
  second_shooter: "Second Shooter",
  assistant: "Assistant",
  videographer: "Videographer",
  stylist: "Stylist",
  makeup_artist: "Makeup Artist",
  other: "Other",
};

const ROLE_OPTIONS: { value: BookingCrewRole; label: string }[] = [
  { value: "lead_photographer", label: "Lead Photographer" },
  { value: "second_shooter", label: "Second Shooter" },
  { value: "assistant", label: "Assistant" },
  { value: "videographer", label: "Videographer" },
  { value: "stylist", label: "Stylist" },
  { value: "makeup_artist", label: "Makeup Artist" },
  { value: "other", label: "Other" },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function BookingCrewPanel({ bookingId }: BookingCrewPanelProps) {
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [availableMembers, setAvailableMembers] = useState<AvailableMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCrew, setEditingCrew] = useState<CrewMember | null>(null);
  const [isPending, startTransition] = useTransition();

  // Fetch crew data
  useEffect(() => {
    async function loadCrew() {
      setIsLoading(true);
      setError(null);

      const result = await getBookingCrew(bookingId);
      if (!result.success) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      setCrew(result.data.crew);
      setIsLoading(false);
    }

    loadCrew();
  }, [bookingId]);

  const [suggestions, setSuggestions] = useState<CrewSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Load available members and suggestions when modal opens
  useEffect(() => {
    if (!showAddModal) return;

    async function loadData() {
      setLoadingSuggestions(true);

      // Load both in parallel
      const [availableResult, suggestionsResult] = await Promise.all([
        getAvailableCrewMembers(bookingId),
        getSmartCrewSuggestions(bookingId),
      ]);

      if (availableResult.success) {
        setAvailableMembers(availableResult.data.members);
      }

      if (suggestionsResult.success) {
        setSuggestions(suggestionsResult.data.suggestions);
      }

      setLoadingSuggestions(false);
    }

    loadData();
  }, [showAddModal, bookingId]);

  const handleAddCrew = async (userId: string, role: BookingCrewRole) => {
    startTransition(async () => {
      const result = await addCrewMember({ bookingId, userId, role });
      if (result.success) {
        // Refresh crew list
        const crewResult = await getBookingCrew(bookingId);
        if (crewResult.success) {
          setCrew(crewResult.data.crew);
        }
        setShowAddModal(false);
      }
    });
  };

  const handleUpdateCrew = async (crewId: string, role: BookingCrewRole, notes?: string) => {
    startTransition(async () => {
      const result = await updateCrewMember({ crewId, role, notes });
      if (result.success) {
        // Refresh crew list
        const crewResult = await getBookingCrew(bookingId);
        if (crewResult.success) {
          setCrew(crewResult.data.crew);
        }
        setEditingCrew(null);
      }
    });
  };

  const handleRemoveCrew = async (crewId: string) => {
    if (!confirm("Are you sure you want to remove this crew member?")) return;

    startTransition(async () => {
      const result = await removeCrewMember(crewId);
      if (result.success) {
        setCrew((prev) => prev.filter((c) => c.id !== crewId));
      }
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Crew</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Crew</h2>
        </div>
        <p className="text-sm text-[var(--error)]">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Crew</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Add
          </button>
        </div>

        {crew.length === 0 ? (
          <div className="text-center py-8">
            <UsersIcon className="mx-auto h-10 w-10 text-foreground-muted mb-3" />
            <p className="text-sm text-foreground-muted">No crew members assigned</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-sm font-medium text-[var(--primary)] hover:underline"
            >
              Add crew member
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {crew.map((member) => (
              <CrewMemberCard
                key={member.id}
                member={member}
                onEdit={() => setEditingCrew(member)}
                onRemove={() => handleRemoveCrew(member.id)}
                isPending={isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Crew Modal */}
      {showAddModal && (
        <AddCrewModal
          availableMembers={availableMembers.filter((m) => !m.isAlreadyAssigned)}
          suggestions={suggestions}
          loadingSuggestions={loadingSuggestions}
          onAdd={handleAddCrew}
          onClose={() => setShowAddModal(false)}
          isPending={isPending}
        />
      )}

      {/* Edit Crew Modal */}
      {editingCrew && (
        <EditCrewModal
          member={editingCrew}
          onSave={handleUpdateCrew}
          onClose={() => setEditingCrew(null)}
          isPending={isPending}
        />
      )}
    </>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function CrewMemberCard({
  member,
  onEdit,
  onRemove,
  isPending,
}: {
  member: CrewMember;
  onEdit: () => void;
  onRemove: () => void;
  isPending: boolean;
}) {
  const statusColor = member.declinedAt
    ? "text-[var(--error)]"
    : member.confirmed
      ? "text-[var(--success)]"
      : "text-[var(--warning)]";

  const statusLabel = member.declinedAt
    ? "Declined"
    : member.confirmed
      ? "Confirmed"
      : "Pending";

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-3">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {member.user.avatarUrl ? (
          <img
            src={member.user.avatarUrl}
            alt={member.user.fullName || member.user.email}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-semibold">
            {(member.user.fullName || member.user.email).charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground truncate">
            {member.user.fullName || member.user.email}
          </p>
          <span className={cn("text-xs font-medium", statusColor)}>
            {statusLabel}
          </span>
        </div>
        <p className="text-sm text-foreground-muted">{ROLE_LABELS[member.role]}</p>
        {member.notes && (
          <p className="text-xs text-foreground-muted mt-1 truncate">{member.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onEdit}
          disabled={isPending}
          className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50"
          title="Edit"
        >
          <EditIcon className="h-4 w-4" />
        </button>
        <button
          onClick={onRemove}
          disabled={isPending}
          className="p-2 rounded-lg text-foreground-muted hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors disabled:opacity-50"
          title="Remove"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function AddCrewModal({
  availableMembers,
  suggestions,
  loadingSuggestions,
  onAdd,
  onClose,
  isPending,
}: {
  availableMembers: AvailableMember[];
  suggestions: CrewSuggestion[];
  loadingSuggestions: boolean;
  onAdd: (userId: string, role: BookingCrewRole) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<BookingCrewRole>("second_shooter");
  const [viewMode, setViewMode] = useState<"suggestions" | "all">("suggestions");

  // Get reason badge color and text
  const getReasonBadge = (reason: SuggestionReason) => {
    switch (reason.type) {
      case "expert":
        return {
          color: "bg-[var(--success)]/10 text-[var(--success)]",
          text: `Expert: ${reason.serviceName}`,
        };
      case "capable":
        return {
          color: "bg-[var(--primary)]/10 text-[var(--primary)]",
          text: `Capable: ${reason.serviceName}`,
        };
      case "learning":
        return {
          color: "bg-[var(--warning)]/10 text-[var(--warning)]",
          text: `Learning: ${reason.serviceName}`,
        };
      case "available":
        return {
          color: "bg-[var(--success)]/10 text-[var(--success)]",
          text: "Available",
        };
      case "has_equipment":
        return {
          color: "bg-[var(--ai)]/10 text-[var(--ai)]",
          text: `Has: ${reason.equipmentNames.slice(0, 2).join(", ")}${reason.equipmentNames.length > 2 ? "..." : ""}`,
        };
    }
  };

  const isUnavailable = (suggestion: CrewSuggestion) => {
    return !suggestion.reasons.some((r) => r.type === "available");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Add Crew Member</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)] transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setViewMode("suggestions")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              viewMode === "suggestions"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background)] text-foreground-secondary hover:text-foreground"
            )}
          >
            <SparklesIcon className="h-4 w-4 inline-block mr-1.5" />
            Smart Suggestions
          </button>
          <button
            onClick={() => setViewMode("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              viewMode === "all"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background)] text-foreground-secondary hover:text-foreground"
            )}
          >
            All Members
          </button>
        </div>

        {loadingSuggestions ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          </div>
        ) : viewMode === "suggestions" ? (
          <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-2">
            {suggestions.length === 0 ? (
              <p className="text-sm text-foreground-muted py-4 text-center">
                No suggestions available. Try viewing all members.
              </p>
            ) : (
              suggestions.map((suggestion) => {
                const unavailable = isUnavailable(suggestion);
                return (
                  <button
                    key={suggestion.userId}
                    onClick={() => {
                      setSelectedUser(suggestion.userId);
                    }}
                    disabled={unavailable}
                    className={cn(
                      "w-full flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                      selectedUser === suggestion.userId
                        ? "border-[var(--primary)] bg-[var(--primary)]/5"
                        : unavailable
                          ? "border-[var(--card-border)] bg-[var(--background)] opacity-50 cursor-not-allowed"
                          : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--border-hover)]"
                    )}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {suggestion.avatarUrl ? (
                        <img
                          src={suggestion.avatarUrl}
                          alt={suggestion.fullName || suggestion.email}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-semibold">
                          {(suggestion.fullName || suggestion.email).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">
                          {suggestion.fullName || suggestion.email}
                        </p>
                        {suggestion.score >= 100 && (
                          <span className="text-xs font-medium text-[var(--success)]">
                            Top Match
                          </span>
                        )}
                      </div>

                      {/* Reason badges */}
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {suggestion.reasons.map((reason, idx) => {
                          const badge = getReasonBadge(reason);
                          return (
                            <span
                              key={idx}
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                badge.color
                              )}
                            >
                              {badge.text}
                            </span>
                          );
                        })}
                        {unavailable && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--error)]/10 text-[var(--error)]">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {selectedUser === suggestion.userId && (
                      <CheckCircleIcon className="h-5 w-5 text-[var(--primary)] flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            {availableMembers.length === 0 ? (
              <p className="text-sm text-foreground-muted py-4 text-center">
                No available team members to add.
              </p>
            ) : (
              <div className="space-y-2">
                {availableMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedUser(member.id)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                      selectedUser === member.id
                        ? "border-[var(--primary)] bg-[var(--primary)]/5"
                        : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--border-hover)]"
                    )}
                  >
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.fullName || member.email}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-semibold">
                        {(member.fullName || member.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {member.fullName || member.email}
                      </p>
                      <p className="text-sm text-foreground-muted truncate">{member.email}</p>
                    </div>
                    {selectedUser === member.id && (
                      <CheckCircleIcon className="h-5 w-5 text-[var(--primary)]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Role Selection */}
        {selectedUser && (
          <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
            <label className="block text-sm font-medium text-foreground-secondary mb-2">
              Assign Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as BookingCrewRole)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--card-border)]">
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedUser && onAdd(selectedUser, selectedRole)}
            disabled={!selectedUser || isPending}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            {isPending ? "Adding..." : "Add Crew"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditCrewModal({
  member,
  onSave,
  onClose,
  isPending,
}: {
  member: CrewMember;
  onSave: (crewId: string, role: BookingCrewRole, notes?: string) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [role, setRole] = useState<BookingCrewRole>(member.role);
  const [notes, setNotes] = useState(member.notes || "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-foreground mb-4">Edit Crew Member</h3>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--card-border)]">
          {member.user.avatarUrl ? (
            <img
              src={member.user.avatarUrl}
              alt={member.user.fullName || member.user.email}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-semibold text-lg">
              {(member.user.fullName || member.user.email).charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium text-foreground">
              {member.user.fullName || member.user.email}
            </p>
            <p className="text-sm text-foreground-muted">{member.user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as BookingCrewRole)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this assignment..."
              rows={3}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(member.id, role, notes || undefined)}
            disabled={isPending}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ICONS
// ============================================================================

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}
