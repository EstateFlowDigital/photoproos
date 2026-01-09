"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createInvoiceCheckoutSession, verifyInvoicePayment } from "@/lib/actions/stripe-checkout";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitCents: number;
  totalCents: number;
  itemType: string;
}

interface Payment {
  id: string;
  amountCents: number;
  paidAt: string | null;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  status: string;
  currency: string;
  issueDate: string;
  dueDate: string;
  paidAt: string | null;
  subtotalCents: number;
  taxCents: number;
  discountCents: number;
  totalCents: number;
  lateFeeAppliedCents: number;
  paidAmountCents: number;
  notes: string | null;
  clientName: string | null;
  clientEmail: string | null;
  clientCompany: string | null;
  lineItems: LineItem[];
  payments: Payment[];
}

interface OrganizationData {
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
}

interface Props {
  invoice: InvoiceData;
  organization: OrganizationData;
  balance: number;
  isFullyPaid: boolean;
  canAcceptPayment: boolean;
  paymentStatus: string | null;
  sessionId: string | null;
}

function formatCurrency(cents: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    sent: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-500",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.sent}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function PayInvoiceClient({
  invoice,
  organization,
  balance,
  isFullyPaid,
  canAcceptPayment,
  paymentStatus,
  sessionId,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);

  // Verify payment on success redirect
  useEffect(() => {
    if (paymentStatus === "success" && sessionId && !verificationComplete) {
      setVerificationComplete(true);
      verifyInvoicePayment(sessionId).then((result) => {
        if (result.success && result.data.paid) {
          setPaymentVerified(true);
        }
      });
    }
  }, [paymentStatus, sessionId, verificationComplete]);

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createInvoiceCheckoutSession(
        invoice.id,
        invoice.clientEmail || undefined
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = result.data.checkoutUrl;
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const primaryColor = organization.primaryColor || "#3b82f6";
  const isOverdue = invoice.status === "overdue" || new Date(invoice.dueDate) < new Date();
  const showPaymentSuccess = paymentStatus === "success" || paymentVerified || isFullyPaid;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {organization.logoUrl ? (
                <Image
                  src={organization.logoUrl}
                  alt={organization.name}
                  width={48}
                  height={48}
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  {organization.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {organization.name}
                </h1>
                <p className="text-sm text-gray-500">Invoice Payment</p>
              </div>
            </div>
            <StatusBadge status={showPaymentSuccess ? "paid" : invoice.status} />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Payment Success Banner */}
        {showPaymentSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-medium text-green-800">Payment Successful</h3>
                <p className="text-sm text-green-700">
                  Thank you! Your payment has been received.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Cancelled Banner */}
        {paymentStatus === "cancelled" && !showPaymentSuccess && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h3 className="font-medium text-yellow-800">Payment Cancelled</h3>
                <p className="text-sm text-yellow-700">
                  Your payment was not completed. You can try again below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Invoice Header */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Invoice {invoice.invoiceNumber}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Issued {formatDate(invoice.issueDate)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Due Date</p>
                <p
                  className={`font-medium ${isOverdue && !showPaymentSuccess ? "text-red-600" : "text-gray-900"}`}
                >
                  {formatDate(invoice.dueDate)}
                </p>
                {isOverdue && !showPaymentSuccess && (
                  <p className="text-xs text-red-500 mt-1">Overdue</p>
                )}
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Bill To
            </p>
            <p className="font-medium text-gray-900">
              {invoice.clientName || "Client"}
            </p>
            {invoice.clientCompany && (
              <p className="text-sm text-gray-600">{invoice.clientCompany}</p>
            )}
            {invoice.clientEmail && (
              <p className="text-sm text-gray-600">{invoice.clientEmail}</p>
            )}
          </div>

          {/* Line Items */}
          <div className="px-6 py-4 overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="text-left pb-3">Description</th>
                  <th className="text-right pb-3">Qty</th>
                  <th className="text-right pb-3">Price</th>
                  <th className="text-right pb-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="py-3 text-sm text-gray-600 text-right">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-sm text-gray-600 text-right">
                      {formatCurrency(item.unitCents, invoice.currency)}
                    </td>
                    <td className="py-3 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(item.totalCents, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  {formatCurrency(invoice.subtotalCents, invoice.currency)}
                </span>
              </div>

              {invoice.taxCents > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">
                    {formatCurrency(invoice.taxCents, invoice.currency)}
                  </span>
                </div>
              )}

              {invoice.discountCents > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">
                    -{formatCurrency(invoice.discountCents, invoice.currency)}
                  </span>
                </div>
              )}

              {invoice.lateFeeAppliedCents > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">Late Fee</span>
                  <span className="text-red-600">
                    {formatCurrency(invoice.lateFeeAppliedCents, invoice.currency)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600">Invoice Total</span>
                <span className="text-gray-900 font-medium">
                  {formatCurrency(
                    invoice.totalCents + invoice.lateFeeAppliedCents,
                    invoice.currency
                  )}
                </span>
              </div>

              {invoice.paidAmountCents > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Paid</span>
                  <span className="text-green-600">
                    -{formatCurrency(invoice.paidAmountCents, invoice.currency)}
                  </span>
                </div>
              )}

              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">
                  {showPaymentSuccess ? "Amount Paid" : "Balance Due"}
                </span>
                <span
                  className="text-xl font-bold"
                  style={{ color: showPaymentSuccess ? "#16a34a" : primaryColor }}
                >
                  {formatCurrency(
                    showPaymentSuccess
                      ? invoice.totalCents + invoice.lateFeeAppliedCents
                      : balance,
                    invoice.currency
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {invoice.payments.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Payment History
              </h3>
              <div className="space-y-2">
                {invoice.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between text-sm bg-green-50 rounded-lg px-3 py-2"
                  >
                    <span className="text-green-700">
                      {payment.paidAt
                        ? formatDate(payment.paidAt)
                        : "Payment received"}
                    </span>
                    <span className="text-green-700 font-medium">
                      {formatCurrency(payment.amountCents, invoice.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="px-6 py-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {invoice.notes}
              </p>
            </div>
          )}

          {/* Pay Button */}
          {!showPaymentSuccess && balance > 0 && (
            <div className="px-6 py-6 border-t border-gray-100">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              {canAcceptPayment ? (
                <button
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
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
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay {formatCurrency(balance, invoice.currency)}
                    </>
                  )}
                </button>
              ) : (
                <div className="text-center text-sm text-gray-500">
                  <p>Online payment is not available for this invoice.</p>
                  <p className="mt-1">
                    Please contact {organization.name} for payment options.
                  </p>
                </div>
              )}

              <p className="text-center text-xs text-gray-400 mt-4">
                Secure payment powered by Stripe
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-sm text-gray-400">
          Questions about this invoice? Contact{" "}
          <span className="text-gray-600">{organization.name}</span>
        </p>
      </footer>
    </div>
  );
}
