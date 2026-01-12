"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Users,
  Hash,
  Search,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";
import { createConversation } from "@/lib/actions/conversations";
import type { ConversationType } from "@prisma/client";

interface TeamMember {
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  role: string;
}

interface NewConversationPageClientProps {
  type: "direct" | "group" | "channel";
  teamMembers: TeamMember[];
  currentUserId: string;
}

const TYPE_CONFIG = {
  direct: {
    icon: MessageSquare,
    label: "Direct Message",
    description: "Start a one-on-one conversation",
    selectLabel: "Select a team member to message",
    minMembers: 1,
    maxMembers: 1,
  },
  group: {
    icon: Users,
    label: "Group Chat",
    description: "Create a group conversation with multiple team members",
    selectLabel: "Select team members to add",
    minMembers: 1,
    maxMembers: 50,
  },
  channel: {
    icon: Hash,
    label: "Channel",
    description: "Create a topic-based channel for the team",
    selectLabel: "Select members to include (optional)",
    minMembers: 0,
    maxMembers: 50,
  },
};

export function NewConversationPageClient({
  type,
  teamMembers,
  currentUserId: _currentUserId,
}: NewConversationPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [conversationName, setConversationName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  // Filter members by search query
  const filteredMembers = teamMembers.filter(
    (m) =>
      m.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMember = (memberId: string) => {
    if (type === "direct") {
      // For DM, just select the one member
      setSelectedMembers([memberId]);
    } else {
      // For group/channel, toggle selection
      setSelectedMembers((prev) =>
        prev.includes(memberId)
          ? prev.filter((id) => id !== memberId)
          : [...prev, memberId]
      );
    }
  };

  const handleCreate = () => {
    setError(null);

    // Validation
    if (selectedMembers.length < config.minMembers) {
      setError(`Please select at least ${config.minMembers} member(s)`);
      return;
    }

    if ((type === "group" || type === "channel") && !conversationName.trim()) {
      setError("Please enter a name for the conversation");
      return;
    }

    startTransition(async () => {
      const result = await createConversation({
        type: type as ConversationType,
        name: type === "direct" ? undefined : conversationName.trim() || undefined,
        participantUserIds: selectedMembers,
      });

      if (result.success) {
        router.push(`/messages/${result.data.id}`);
      } else {
        setError(result.error);
      }
    });
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    return email.charAt(0).toUpperCase();
  };

  const selectedMemberDetails = teamMembers.filter((m) =>
    selectedMembers.includes(m.id)
  );

  return (
    <div className="flex flex-1 flex-col bg-[var(--card)]">
      {/* Header */}
      <header className="flex items-center gap-4 border-b border-[var(--card-border)] px-6 py-4">
        <button
          onClick={() => router.push("/messages")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] transition-colors"
          aria-label="Back to messages"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--foreground)]">
              New {config.label}
            </h1>
            <p className="text-sm text-[var(--foreground-muted)]">
              {config.description}
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden p-6">
        {/* Name Input (for group/channel) */}
        {(type === "group" || type === "channel") && (
          <div className="mb-6">
            <label
              htmlFor="conversation-name"
              className="block text-sm font-medium text-[var(--foreground)] mb-2"
            >
              {type === "channel" ? "Channel Name" : "Group Name"}
            </label>
            <input
              type="text"
              id="conversation-name"
              value={conversationName}
              onChange={(e) => setConversationName(e.target.value)}
              placeholder={
                type === "channel" ? "e.g. general, announcements" : "e.g. Project Team"
              }
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
        )}

        {/* Selected Members */}
        {selectedMemberDetails.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium text-[var(--foreground-muted)] mb-2">
              Selected ({selectedMemberDetails.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedMemberDetails.map((member) => (
                <div
                  key={member.id}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 pl-1 pr-2 py-1 text-sm"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white text-xs font-medium">
                    {getInitials(member.fullName, member.email)}
                  </div>
                  <span className="text-[var(--foreground)]">
                    {member.fullName || member.email}
                  </span>
                  <button
                    onClick={() => toggleMember(member.id)}
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full hover:bg-[var(--background-hover)]"
                    aria-label={`Remove ${member.fullName || member.email}`}
                  >
                    <X className="h-3 w-3 text-[var(--foreground-muted)]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] py-3 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        {/* Team Members List */}
        <div className="flex-1 overflow-y-auto">
          <div className="text-sm font-medium text-[var(--foreground-muted)] mb-2">
            {config.selectLabel}
          </div>

          {filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-[var(--foreground-muted)] mb-3" />
              <p className="text-sm text-[var(--foreground-muted)]">
                {searchQuery
                  ? "No team members match your search"
                  : "No team members available"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredMembers.map((member) => {
                const isSelected = selectedMembers.includes(member.id);
                return (
                  <button
                    key={member.id}
                    onClick={() => toggleMember(member.id)}
                    className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                      isSelected
                        ? "bg-[var(--primary)]/10 border border-[var(--primary)]"
                        : "hover:bg-[var(--background-hover)] border border-transparent"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={`${member.fullName || member.email}'s avatar`}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-400 to-gray-500 text-white text-sm font-medium">
                          {getInitials(member.fullName, member.email)}
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[var(--foreground)] truncate">
                        {member.fullName || member.email}
                      </div>
                      <div className="text-sm text-[var(--foreground-muted)] truncate">
                        {member.email}
                      </div>
                    </div>

                    {/* Role Badge */}
                    <span className="rounded-full bg-[var(--background-tertiary)] px-2 py-0.5 text-xs text-[var(--foreground-muted)] capitalize">
                      {member.role}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 px-4 py-3">
            <p className="text-sm text-[var(--error)]">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3 border-t border-[var(--card-border)] pt-4">
          <button
            onClick={() => router.push("/messages")}
            className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background-hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isPending || selectedMembers.length < config.minMembers}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating...
              </>
            ) : (
              <>
                <Icon className="h-4 w-4" />
                {type === "direct"
                  ? "Start Conversation"
                  : type === "group"
                    ? "Create Group"
                    : "Create Channel"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
