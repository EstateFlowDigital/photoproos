"use client";

import { useState, useCallback } from "react";
import { createOrder, createOrderCheckoutSession } from "@/lib/actions/orders";

interface CartItem {
  type: "bundle" | "service";
  id: string;
  name: string;
  priceCents: number;
  quantity?: number;
  // Sqft pricing fields (for bundles)
  sqft?: number;
  pricingTierId?: string;
  pricingTierName?: string | null;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderPageId: string;
  cartItems: CartItem[];
  subtotalCents: number;
  primaryColor: string;
}

export function CheckoutModal({
  isOpen,
  onClose,
  orderPageId,
  cartItems,
  subtotalCents,
  primaryColor,
}: CheckoutModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientCompany: "",
    preferredTime: "" as "" | "morning" | "afternoon" | "evening",
    clientNotes: "",
    flexibleDates: true,
  });

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Transform cart items to match the schema
      const items = cartItems.map((item) => {
        if (item.type === "bundle") {
          return {
            type: "bundle" as const,
            id: item.id,
            name: item.name,
            priceCents: item.priceCents,
            // Include sqft pricing data
            sqft: item.sqft,
            pricingTierId: item.pricingTierId,
            pricingTierName: item.pricingTierName,
          };
        }
        return {
          type: "service" as const,
          id: item.id,
          name: item.name,
          priceCents: item.priceCents,
          quantity: item.quantity || 1,
        };
      });

      // Create the order
      const orderResult = await createOrder({
        orderPageId,
        items,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone || null,
        clientCompany: formData.clientCompany || null,
        preferredTime: formData.preferredTime || null,
        clientNotes: formData.clientNotes || null,
        flexibleDates: formData.flexibleDates,
      });

      if (!orderResult.success) {
        setError(orderResult.error);
        setIsSubmitting(false);
        return;
      }

      // Create Stripe checkout session
      const checkoutResult = await createOrderCheckoutSession(
        orderResult.data.orderId,
        orderResult.data.sessionToken
      );

      if (!checkoutResult.success) {
        setError(checkoutResult.error);
        setIsSubmitting(false);
        return;
      }

      // Save session token to localStorage for confirmation page
      localStorage.setItem(`order_${orderResult.data.orderId}`, orderResult.data.sessionToken);

      // Redirect to Stripe checkout
      window.location.href = checkoutResult.data.checkoutUrl;
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-[#262626] bg-[#141414] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#262626] bg-[#141414] px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Complete Your Order</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#7c7c7c] transition-colors hover:bg-[#262626] hover:text-white"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Contact Information */}
            <div>
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-[#7c7c7c]">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="clientName"
                    className="mb-1.5 block text-sm font-medium text-white"
                  >
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="clientName"
                    name="clientName"
                    required
                    value={formData.clientName}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-[#262626] bg-[#0a0a0a] px-4 py-2.5 text-white placeholder:text-[#7c7c7c] focus:border-[#454545] focus:outline-none focus:ring-1 focus:ring-[#454545]"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="clientEmail"
                    className="mb-1.5 block text-sm font-medium text-white"
                  >
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="clientEmail"
                    name="clientEmail"
                    required
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-[#262626] bg-[#0a0a0a] px-4 py-2.5 text-white placeholder:text-[#7c7c7c] focus:border-[#454545] focus:outline-none focus:ring-1 focus:ring-[#454545]"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="clientPhone"
                      className="mb-1.5 block text-sm font-medium text-white"
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="clientPhone"
                      name="clientPhone"
                      value={formData.clientPhone}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-[#262626] bg-[#0a0a0a] px-4 py-2.5 text-white placeholder:text-[#7c7c7c] focus:border-[#454545] focus:outline-none focus:ring-1 focus:ring-[#454545]"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="clientCompany"
                      className="mb-1.5 block text-sm font-medium text-white"
                    >
                      Company
                    </label>
                    <input
                      type="text"
                      id="clientCompany"
                      name="clientCompany"
                      value={formData.clientCompany}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-[#262626] bg-[#0a0a0a] px-4 py-2.5 text-white placeholder:text-[#7c7c7c] focus:border-[#454545] focus:outline-none focus:ring-1 focus:ring-[#454545]"
                      placeholder="ABC Realty"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Scheduling Preferences */}
            <div>
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-[#7c7c7c]">
                Scheduling Preferences
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="preferredTime"
                    className="mb-1.5 block text-sm font-medium text-white"
                  >
                    Preferred Time of Day
                  </label>
                  <select
                    id="preferredTime"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-[#262626] bg-[#0a0a0a] px-4 py-2.5 text-white focus:border-[#454545] focus:outline-none focus:ring-1 focus:ring-[#454545]"
                  >
                    <option value="">No preference</option>
                    <option value="morning">Morning (8am - 12pm)</option>
                    <option value="afternoon">Afternoon (12pm - 5pm)</option>
                    <option value="evening">Evening (5pm - 8pm)</option>
                  </select>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="flexibleDates"
                    checked={formData.flexibleDates}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-[#262626] bg-[#0a0a0a] text-blue-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-sm text-[#a7a7a7]">
                    I&apos;m flexible on scheduling dates
                  </span>
                </label>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label
                htmlFor="clientNotes"
                className="mb-1.5 block text-sm font-medium text-white"
              >
                Additional Notes
              </label>
              <textarea
                id="clientNotes"
                name="clientNotes"
                rows={3}
                value={formData.clientNotes}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-[#262626] bg-[#0a0a0a] px-4 py-2.5 text-white placeholder:text-[#7c7c7c] focus:border-[#454545] focus:outline-none focus:ring-1 focus:ring-[#454545] resize-none"
                placeholder="Any special requests or details about the property..."
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-6 rounded-lg border border-[#262626] bg-[#0a0a0a] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#7c7c7c]">Subtotal</span>
              <span className="font-medium text-white">
                {formatPrice(subtotalCents)}
              </span>
            </div>
            <p className="mt-2 text-xs text-[#7c7c7c]">
              Tax will be calculated at checkout
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-lg py-3.5 text-base font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: primaryColor }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner className="h-5 w-5" />
                Processing...
              </span>
            ) : (
              "Continue to Payment"
            )}
          </button>

          <p className="mt-3 text-center text-xs text-[#7c7c7c]">
            You&apos;ll be redirected to secure checkout powered by Stripe
          </p>
        </form>
      </div>
    </div>
  );
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
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
