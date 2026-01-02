"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { createTaskFromBooking } from "@/lib/actions/projects";

interface BookingProjectActionProps {
  bookingId: string;
}

export function BookingProjectAction({ bookingId }: BookingProjectActionProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isAddingToProject, setIsAddingToProject] = useState(false);

  const handleAddToProject = async () => {
    setIsAddingToProject(true);
    try {
      const result = await createTaskFromBooking(bookingId);
      if (result.success && result.taskId) {
        showToast("Added to project board", "success");
        router.push(`/projects`);
      } else if (!result.success) {
        showToast(result.error || "Failed to add to project", "error");
      }
    } catch {
      showToast("Failed to add to project", "error");
    } finally {
      setIsAddingToProject(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAddToProject}
      disabled={isAddingToProject}
      className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
    >
      <ProjectIcon className="h-4 w-4 text-foreground-muted" />
      {isAddingToProject ? "Adding..." : "Add to Project"}
    </button>
  );
}

function ProjectIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6 4.75A.75.75 0 0 1 6.75 4h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 4.75ZM6 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 10Zm0 5.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75ZM1.99 4.75a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM1.99 15.25a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM1.99 10a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1V10Z" clipRule="evenodd" />
    </svg>
  );
}
