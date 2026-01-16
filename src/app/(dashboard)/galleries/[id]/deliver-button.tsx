"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { deliverGallery } from "@/lib/actions/galleries";
import { cn } from "@/lib/utils";

interface DeliverButtonProps {
  galleryId: string;
}

function SendIcon({ className }: { className?: string }) {
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
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function DeliverButton({ galleryId }: DeliverButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isDelivering, setIsDelivering] = useState(false);

  const handleDeliver = async () => {
    setIsDelivering(true);
    try {
      const result = await deliverGallery(galleryId);
      if (result.success) {
        if (result.data?.emailSent) {
          showToast("Gallery delivered and email sent!", "success");
        } else if (result.data?.emailError) {
          showToast("Gallery delivered successfully!", "success");
          setTimeout(() => {
            showToast(`Email not sent: ${result.data?.emailError}`, "error");
          }, 500);
        } else {
          showToast("Gallery delivered successfully!", "success");
        }
        router.refresh();
      } else {
        showToast(result.error || "Failed to deliver gallery", "error");
      }
    } catch {
      showToast("Failed to deliver gallery", "error");
    } finally {
      setIsDelivering(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDeliver}
      disabled={isDelivering}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] p-2.5 md:px-4 md:py-2.5 text-sm font-medium text-white transition-colors",
        isDelivering
          ? "opacity-70 cursor-not-allowed"
          : "hover:bg-[var(--primary)]/90"
      )}
      title="Deliver Gallery"
    >
      {isDelivering ? (
        <LoadingSpinner className="h-4 w-4" />
      ) : (
        <SendIcon className="h-4 w-4" />
      )}
      <span className="hidden md:inline">
        {isDelivering ? "Delivering..." : "Deliver Gallery"}
      </span>
    </button>
  );
}
