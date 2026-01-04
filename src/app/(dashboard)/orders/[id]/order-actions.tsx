"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { updateOrderStatus } from "@/lib/actions/orders";
import { useToast } from "@/components/ui/toast";

type OrderStatus = "cart" | "pending" | "paid" | "processing" | "completed" | "cancelled";

interface OrderActionsProps {
  orderId: string;
  orderNumber: string;
  currentStatus: string;
  hasInvoice: boolean;
  hasBooking: boolean;
}

const STATUS_TRANSITIONS: Record<string, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "completed", "cancelled"],
  processing: ["completed", "cancelled"],
  completed: [],
  cancelled: ["pending"],
  cart: ["pending", "cancelled"],
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Mark as Pending",
  paid: "Mark as Paid",
  processing: "Mark as Processing",
  completed: "Mark as Completed",
  cancelled: "Cancel Order",
};

export function OrderActions({
  orderId,
  orderNumber,
  currentStatus,
  hasInvoice,
  hasBooking,
}: OrderActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);

  const availableTransitions = STATUS_TRANSITIONS[currentStatus] || [];

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setMenuOpen(false);
    startTransition(async () => {
      try {
        const result = await updateOrderStatus(orderId, newStatus);
        if (result.success) {
          showToast(`Order ${orderNumber} updated to ${newStatus}`, "success");
          router.refresh();
        } else {
          showToast(result.error || "Failed to update order status", "error");
        }
      } catch {
        showToast("Failed to update order status", "error");
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Orders
      </Link>

      {/* Status Actions Dropdown */}
      {availableTransitions.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <LoadingSpinner className="h-4 w-4" />
                Updating...
              </>
            ) : (
              <>
                Update Status
                <ChevronDownIcon className="h-4 w-4" />
              </>
            )}
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] shadow-xl z-20 overflow-hidden">
                {availableTransitions.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-[var(--background-hover)]",
                      status === "cancelled"
                        ? "text-[var(--error)]"
                        : "text-foreground"
                    )}
                  >
                    {STATUS_LABELS[status] || status}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Quick Actions */}
      {!hasInvoice && currentStatus !== "cancelled" && (
        <Link
          href={`/invoices/create?orderId=${orderId}`}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
        >
          <InvoiceIcon className="h-4 w-4" />
          Create Invoice
        </Link>
      )}

      {!hasBooking && currentStatus !== "cancelled" && (
        <Link
          href={`/scheduling/create?orderId=${orderId}`}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
        >
          <CalendarIcon className="h-4 w-4" />
          Schedule
        </Link>
      )}
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function InvoiceIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );
}
