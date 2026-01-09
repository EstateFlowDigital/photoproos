"use client";

import { useState, useTransition, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  User,
  Linkedin,
  Twitter,
  Globe,
  X,
} from "lucide-react";
import {
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "@/lib/actions/marketing-cms";
import type { TeamMember } from "@prisma/client";

interface Props {
  members: TeamMember[];
}

export function TeamClient({ members: initialMembers }: Props) {
  const router = useRouter();
  const formId = useId();
  const [isPending, startTransition] = useTransition();
  const [members] = useState(initialMembers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    imageUrl: "",
    linkedIn: "",
    twitter: "",
    website: "",
    isVisible: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      bio: "",
      imageUrl: "",
      linkedIn: "",
      twitter: "",
      website: "",
      isVisible: true,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleEdit = (member: TeamMember) => {
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio || "",
      imageUrl: member.imageUrl || "",
      linkedIn: member.linkedIn || "",
      twitter: member.twitter || "",
      website: member.website || "",
      isVisible: member.isVisible,
    });
    setEditingId(member.id);
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (editingId) {
        const result = await updateTeamMember({ id: editingId, ...formData });
        if (result.success) {
          toast.success("Team member updated");
          router.refresh();
          resetForm();
        } else {
          toast.error(result.error || "Failed to update team member");
        }
      } else {
        const result = await createTeamMember(formData);
        if (result.success) {
          toast.success("Team member added");
          router.refresh();
          resetForm();
        } else {
          toast.error(result.error || "Failed to add team member");
        }
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the team?`)) return;
    startTransition(async () => {
      const result = await deleteTeamMember(id);
      if (result.success) {
        toast.success("Team member removed");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to remove team member");
      }
    });
  };

  const handleToggleVisibility = (member: TeamMember) => {
    startTransition(async () => {
      const result = await updateTeamMember({
        id: member.id,
        isVisible: !member.isVisible,
      });
      if (result.success) {
        toast.success(member.isVisible ? "Hidden" : "Made visible");
        router.refresh();
      } else {
        toast.error("Failed to update visibility");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/super-admin/marketing"
            className={cn(
              "p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
              "min-w-[44px] min-h-[44px] flex items-center justify-center"
            )}
            aria-label="Back to Marketing CMS"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--foreground-muted)]" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
              Team Members
            </h1>
            <p className="text-sm text-[var(--foreground-muted)]">
              {members.length} member{members.length !== 1 ? "s" : ""} on the About page
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={cn(
            "btn btn-primary inline-flex items-center justify-center gap-2",
            "min-h-[44px] px-4 self-start sm:self-auto"
          )}
          aria-expanded={showAddForm}
          aria-controls={`${formId}-form`}
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4" aria-hidden="true" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Member</span>
            </>
          )}
        </button>
      </header>

      {/* Add/Edit Form */}
      {showAddForm && (
        <section
          id={`${formId}-form`}
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6"
          aria-labelledby={`${formId}-title`}
        >
          <h2
            id={`${formId}-title`}
            className="text-lg font-semibold text-[var(--foreground)] mb-4"
          >
            {editingId ? "Edit Team Member" : "New Team Member"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={`${formId}-name`}
                  className="block text-sm font-medium text-[var(--foreground-muted)] mb-1.5"
                >
                  Name <span className="text-red-500" aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </label>
                <input
                  id={`${formId}-name`}
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className={cn(
                    "w-full px-3 py-2.5 rounded-lg min-h-[44px]",
                    "bg-[var(--background-elevated)] border border-[var(--border)]",
                    "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  )}
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label
                  htmlFor={`${formId}-role`}
                  className="block text-sm font-medium text-[var(--foreground-muted)] mb-1.5"
                >
                  Role <span className="text-red-500" aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </label>
                <input
                  id={`${formId}-role`}
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  className={cn(
                    "w-full px-3 py-2.5 rounded-lg min-h-[44px]",
                    "bg-[var(--background-elevated)] border border-[var(--border)]",
                    "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  )}
                  placeholder="Co-Founder & CEO"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor={`${formId}-bio`}
                className="block text-sm font-medium text-[var(--foreground-muted)] mb-1.5"
              >
                Bio
              </label>
              <textarea
                id={`${formId}-bio`}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className={cn(
                  "w-full px-3 py-2.5 rounded-lg",
                  "bg-[var(--background-elevated)] border border-[var(--border)]",
                  "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent",
                  "min-h-[100px] resize-y"
                )}
                placeholder="A brief bio about this team member..."
              />
            </div>

            <div>
              <label
                htmlFor={`${formId}-image`}
                className="block text-sm font-medium text-[var(--foreground-muted)] mb-1.5"
              >
                Profile Image URL
              </label>
              <input
                id={`${formId}-image`}
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className={cn(
                  "w-full px-3 py-2.5 rounded-lg min-h-[44px]",
                  "bg-[var(--background-elevated)] border border-[var(--border)]",
                  "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                )}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-[var(--foreground-muted)] mb-3">
                Social Links
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor={`${formId}-linkedin`} className="sr-only">
                    LinkedIn URL
                  </label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" aria-hidden="true" />
                    <input
                      id={`${formId}-linkedin`}
                      type="url"
                      value={formData.linkedIn}
                      onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                      className={cn(
                        "w-full pl-10 pr-3 py-2.5 rounded-lg min-h-[44px]",
                        "bg-[var(--background-elevated)] border border-[var(--border)]",
                        "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                        "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      )}
                      placeholder="LinkedIn URL"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor={`${formId}-twitter`} className="sr-only">
                    Twitter URL
                  </label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" aria-hidden="true" />
                    <input
                      id={`${formId}-twitter`}
                      type="url"
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      className={cn(
                        "w-full pl-10 pr-3 py-2.5 rounded-lg min-h-[44px]",
                        "bg-[var(--background-elevated)] border border-[var(--border)]",
                        "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                        "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      )}
                      placeholder="Twitter URL"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor={`${formId}-website`} className="sr-only">
                    Website URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" aria-hidden="true" />
                    <input
                      id={`${formId}-website`}
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className={cn(
                        "w-full pl-10 pr-3 py-2.5 rounded-lg min-h-[44px]",
                        "bg-[var(--background-elevated)] border border-[var(--border)]",
                        "text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]",
                        "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      )}
                      placeholder="Website URL"
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={formData.isVisible}
                onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <span className="text-sm text-[var(--foreground)]">Visible on website</span>
            </label>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary min-h-[44px] px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="btn btn-primary min-h-[44px] px-4"
              >
                {isPending ? "Saving..." : editingId ? "Save Changes" : "Add Member"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Team Grid */}
      <section aria-label="Team members list">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.length === 0 ? (
            <div className="col-span-full p-8 sm:p-12 text-center text-[var(--foreground-muted)] rounded-lg border border-[var(--border)]">
              <p>No team members yet. Add your first one above.</p>
            </div>
          ) : (
            members.map((member) => (
              <article
                key={member.id}
                className={cn(
                  "p-4 sm:p-6 rounded-lg border transition-all",
                  member.isVisible
                    ? "bg-[var(--card)] border-[var(--border)]"
                    : "bg-[var(--background-tertiary)] border-[var(--border)] opacity-60"
                )}
                aria-label={`${member.name}, ${member.role}`}
              >
                {/* Header with actions */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt=""
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <div
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--background-tertiary)] flex items-center justify-center flex-shrink-0"
                        aria-hidden="true"
                      >
                        <User className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--foreground-muted)]" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[var(--foreground)] truncate text-sm sm:text-base">
                        {member.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--foreground-muted)] truncate">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <button
                      onClick={() => handleToggleVisibility(member)}
                      disabled={isPending}
                      className={cn(
                        "p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                        "min-w-[36px] min-h-[36px] flex items-center justify-center"
                      )}
                      aria-label={member.isVisible ? `Hide ${member.name}` : `Show ${member.name}`}
                    >
                      {member.isVisible ? (
                        <Eye className="w-4 h-4 text-[var(--foreground-muted)]" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-[var(--foreground-muted)]" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(member)}
                      className={cn(
                        "p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                        "min-w-[36px] min-h-[36px] flex items-center justify-center"
                      )}
                      aria-label={`Edit ${member.name}`}
                    >
                      <Pencil className="w-4 h-4 text-[var(--foreground-muted)]" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id, member.name)}
                      disabled={isPending}
                      className={cn(
                        "p-2 rounded-lg hover:bg-red-500/10 transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500",
                        "min-w-[36px] min-h-[36px] flex items-center justify-center"
                      )}
                      aria-label={`Remove ${member.name}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Bio */}
                {member.bio && (
                  <p className="text-sm text-[var(--foreground-muted)] mb-4 line-clamp-3">
                    {member.bio}
                  </p>
                )}

                {/* Social Links */}
                {(member.linkedIn || member.twitter || member.website) && (
                  <div className="flex items-center gap-2" aria-label="Social links">
                    {member.linkedIn && (
                      <a
                        href={member.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                          "min-w-[36px] min-h-[36px] flex items-center justify-center"
                        )}
                        aria-label={`${member.name}'s LinkedIn profile, opens in new tab`}
                      >
                        <Linkedin className="w-4 h-4 text-[var(--foreground-muted)]" />
                      </a>
                    )}
                    {member.twitter && (
                      <a
                        href={member.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                          "min-w-[36px] min-h-[36px] flex items-center justify-center"
                        )}
                        aria-label={`${member.name}'s Twitter profile, opens in new tab`}
                      >
                        <Twitter className="w-4 h-4 text-[var(--foreground-muted)]" />
                      </a>
                    )}
                    {member.website && (
                      <a
                        href={member.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                          "min-w-[36px] min-h-[36px] flex items-center justify-center"
                        )}
                        aria-label={`${member.name}'s website, opens in new tab`}
                      >
                        <Globe className="w-4 h-4 text-[var(--foreground-muted)]" />
                      </a>
                    )}
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
