"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getQualifiedTeamMembers } from "@/lib/actions/team-capabilities";
import type { CapabilityLevel } from "@prisma/client";

interface TeamMember {
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  level: CapabilityLevel;
  hasRequiredEquipment: boolean;
}

export interface TeamMemberSelectorProps {
  serviceId?: string;
  value?: string;
  onChange?: (memberId: string | undefined) => void;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  className?: string;
  minLevel?: "learning" | "capable" | "expert";
  showUnqualified?: boolean;
}

const levelColors: Record<CapabilityLevel, { bg: string; text: string; label: string }> = {
  learning: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Learning" },
  capable: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Capable" },
  expert: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Expert" },
};

export function TeamMemberSelector({
  serviceId,
  value,
  onChange,
  disabled = false,
  label,
  helperText,
  error,
  required = false,
  className,
  minLevel,
  showUnqualified = false,
}: TeamMemberSelectorProps) {
  const [members, setMembers] = React.useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputId = React.useId();

  // Fetch qualified team members when service changes
  React.useEffect(() => {
    async function fetchMembers() {
      if (!serviceId) {
        setMembers([]);
        return;
      }

      setIsLoading(true);
      try {
        const qualified = await getQualifiedTeamMembers(serviceId, minLevel);
        setMembers(qualified);
      } catch (err) {
        console.error("Error fetching qualified members:", err);
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMembers();
  }, [serviceId, minLevel]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedMember = members.find((m) => m.id === value);

  const handleSelect = (memberId: string) => {
    onChange?.(memberId === value ? undefined : memberId);
    setIsOpen(false);
  };

  const filteredMembers = showUnqualified
    ? members
    : members.filter((m) => m.hasRequiredEquipment);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "mb-2 block text-sm font-medium transition-colors duration-[var(--duration-fast)]",
            isFocused ? "text-foreground" : "text-foreground-secondary",
            error && "text-[var(--error-text)]"
          )}
        >
          {label}
          {required && <span className="text-[var(--error)] ml-1">*</span>}
        </label>
      )}

      <button
        type="button"
        id={inputId}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled || !serviceId}
        className={cn(
          "w-full flex items-center justify-between gap-3",
          "rounded-[var(--input-radius)] border bg-[var(--background-elevated)]",
          "px-3 py-3 text-sm text-left",
          "transition-all duration-[var(--duration-fast)]",
          isFocused
            ? "border-[var(--input-border-focus)] ring-2 ring-[var(--ring)]/20"
            : "border-[var(--input-border)]",
          error && "border-[var(--error)] ring-2 ring-[var(--error)]/20",
          disabled && "cursor-not-allowed opacity-50",
          !serviceId && "cursor-not-allowed opacity-50"
        )}
      >
        {isLoading ? (
          <span className="text-foreground-muted">Loading team members...</span>
        ) : !serviceId ? (
          <span className="text-foreground-muted">Select a service first</span>
        ) : selectedMember ? (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold">
              {(selectedMember.fullName || selectedMember.email).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {selectedMember.fullName || selectedMember.email}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    levelColors[selectedMember.level].bg,
                    levelColors[selectedMember.level].text
                  )}
                >
                  {levelColors[selectedMember.level].label}
                </span>
                {selectedMember.hasRequiredEquipment ? (
                  <span className="flex items-center gap-1 text-xs text-[var(--success)]">
                    <CheckIcon className="h-3 w-3" />
                    Has equipment
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-amber-400">
                    <WarningIcon className="h-3 w-3" />
                    Missing equipment
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-foreground-muted">
            {filteredMembers.length === 0 ? "No qualified members" : "Select team member"}
          </span>
        )}
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 text-foreground-muted transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && filteredMembers.length > 0 && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full overflow-hidden",
            "rounded-lg border border-[var(--card-border)] bg-[var(--card)]",
            "shadow-lg max-h-60 overflow-y-auto"
          )}
        >
          {filteredMembers.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => handleSelect(member.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors",
                member.id === value
                  ? "bg-[var(--primary)]/10"
                  : "hover:bg-[var(--background-hover)]",
                !member.hasRequiredEquipment && "opacity-75"
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold shrink-0">
                {(member.fullName || member.email).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {member.fullName || member.email}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded",
                      levelColors[member.level].bg,
                      levelColors[member.level].text
                    )}
                  >
                    {levelColors[member.level].label}
                  </span>
                  {member.hasRequiredEquipment ? (
                    <span className="flex items-center gap-1 text-xs text-[var(--success)]">
                      <CheckIcon className="h-3 w-3" />
                      Has equipment
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-400">
                      <WarningIcon className="h-3 w-3" />
                      Missing equipment
                    </span>
                  )}
                </div>
              </div>
              {member.id === value && (
                <CheckIcon className="h-4 w-4 text-[var(--primary)] shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* No qualified members message */}
      {isOpen && filteredMembers.length === 0 && serviceId && !isLoading && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full",
            "rounded-lg border border-[var(--card-border)] bg-[var(--card)]",
            "shadow-lg p-4 text-center"
          )}
        >
          <UsersIcon className="mx-auto h-8 w-8 text-foreground-muted" />
          <p className="mt-2 text-sm text-foreground">No qualified team members</p>
          <p className="mt-1 text-xs text-foreground-muted">
            Assign team members to this service in Settings → Team
          </p>
        </div>
      )}

      {(error || helperText) && (
        <p
          className={cn(
            "mt-2 text-xs transition-colors",
            error ? "text-[var(--error-text)]" : "text-foreground-muted"
          )}
          role={error ? "alert" : undefined}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.168-.169 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.457-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        clipRule="evenodd"
      />
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

export default TeamMemberSelector;
