"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  createProjectExpense,
  getReceiptUploadUrl,
} from "@/lib/actions/project-expenses";
import type { ExpenseCategory, PaymentMethod } from "@prisma/client";

// ============================================================================
// Types
// ============================================================================

interface MobileExpenseEntryProps {
  projectId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: "travel", label: "Travel", icon: "car" },
  { value: "materials", label: "Materials", icon: "package" },
  { value: "equipment", label: "Equipment", icon: "tool" },
  { value: "software", label: "Software", icon: "code" },
  { value: "labor", label: "Labor", icon: "users" },
  { value: "marketing", label: "Marketing", icon: "megaphone" },
  { value: "fees", label: "Fees", icon: "file-text" },
  { value: "insurance", label: "Insurance", icon: "shield" },
  { value: "other", label: "Other", icon: "more-horizontal" },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "bank_transfer", label: "Transfer" },
  { value: "other", label: "Other" },
];

// ============================================================================
// Component
// ============================================================================

export function MobileExpenseEntry({
  projectId,
  onSuccess,
  onCancel,
  className,
}: MobileExpenseEntryProps) {
  const [step, setStep] = useState<"amount" | "details" | "receipt">("amount");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("other");
  const [vendor, setVendor] = useState("");
  const [isPaid, setIsPaid] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Amount input handling
  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const cleaned = value.replace(/[^0-9.]/g, "");
    // Ensure only one decimal point
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;
    setAmount(cleaned);
  };

  // Quick amount buttons
  const addQuickAmount = (add: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + add).toFixed(2));
  };

  // Receipt file handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  // Upload receipt to storage
  const uploadReceipt = async (): Promise<string | null> => {
    if (!receiptFile) return null;

    try {
      setIsUploading(true);
      const result = await getReceiptUploadUrl(
        projectId,
        receiptFile.name,
        receiptFile.type
      );

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to get upload URL");
      }

      // Upload to presigned URL
      const uploadResponse = await fetch(result.data.uploadUrl, {
        method: "PUT",
        body: receiptFile,
        headers: {
          "Content-Type": receiptFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload receipt");
      }

      return result.data.publicUrl;
    } catch (err) {
      console.error("Receipt upload error:", err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  // Submit expense
  const handleSubmit = async () => {
    const amountValue = parseFloat(amount);
    if (!amountValue || amountValue <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload receipt if present
      let receiptUrl: string | null = null;
      if (receiptFile) {
        receiptUrl = await uploadReceipt();
      }

      const amountCents = Math.round(amountValue * 100);

      const result = await createProjectExpense(projectId, {
        description: description.trim(),
        category,
        amountCents,
        vendor: vendor.trim() || undefined,
        isPaid,
        paymentMethod: paymentMethod || undefined,
        receiptUrl: receiptUrl || undefined,
        expenseDate: new Date(),
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to save expense");
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate steps
  const goNext = () => {
    if (step === "amount") {
      if (!amount || parseFloat(amount) <= 0) {
        setError("Please enter an amount");
        return;
      }
      setError(null);
      setStep("details");
    } else if (step === "details") {
      if (!description.trim()) {
        setError("Please enter a description");
        return;
      }
      setError(null);
      setStep("receipt");
    }
  };

  const goBack = () => {
    setError(null);
    if (step === "details") setStep("amount");
    else if (step === "receipt") setStep("details");
  };

  return (
    <div className={cn("mobile-expense-entry", className)}>
      {/* Header */}
      <div className="mobile-expense-header">
        <button
          type="button"
          onClick={step === "amount" ? onCancel : goBack}
          className="mobile-expense-back-btn"
        >
          {step === "amount" ? (
            <XIcon className="h-6 w-6" />
          ) : (
            <ChevronLeftIcon className="h-6 w-6" />
          )}
        </button>
        <h2 className="mobile-expense-title">
          {step === "amount" && "New Expense"}
          {step === "details" && "Details"}
          {step === "receipt" && "Receipt"}
        </h2>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Progress indicator */}
      <div className="mobile-expense-progress">
        <div className={cn("progress-dot", step === "amount" && "active")} />
        <div className={cn("progress-dot", step === "details" && "active")} />
        <div className={cn("progress-dot", step === "receipt" && "active")} />
      </div>

      {/* Error message */}
      {error && (
        <div className="mobile-expense-error">
          <AlertCircleIcon className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Step: Amount */}
      {step === "amount" && (
        <div className="mobile-expense-step">
          <div className="mobile-amount-display">
            <span className="mobile-amount-currency">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="mobile-amount-input"
              autoFocus
            />
          </div>

          {/* Quick amounts */}
          <div className="mobile-quick-amounts">
            <button
              type="button"
              onClick={() => addQuickAmount(5)}
              className="mobile-quick-amount-btn"
            >
              +$5
            </button>
            <button
              type="button"
              onClick={() => addQuickAmount(10)}
              className="mobile-quick-amount-btn"
            >
              +$10
            </button>
            <button
              type="button"
              onClick={() => addQuickAmount(20)}
              className="mobile-quick-amount-btn"
            >
              +$20
            </button>
            <button
              type="button"
              onClick={() => addQuickAmount(50)}
              className="mobile-quick-amount-btn"
            >
              +$50
            </button>
            <button
              type="button"
              onClick={() => addQuickAmount(100)}
              className="mobile-quick-amount-btn"
            >
              +$100
            </button>
          </div>

          <button
            type="button"
            onClick={goNext}
            disabled={!amount || parseFloat(amount) <= 0}
            className="mobile-expense-continue-btn"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step: Details */}
      {step === "details" && (
        <div className="mobile-expense-step">
          {/* Description */}
          <div className="mobile-field">
            <label className="mobile-field-label">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this expense for?"
              className="mobile-field-input"
              autoFocus
            />
          </div>

          {/* Category */}
          <div className="mobile-field">
            <label className="mobile-field-label">Category</label>
            <div className="mobile-category-grid">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    "mobile-category-btn",
                    category === cat.value && "active"
                  )}
                >
                  <CategoryIcon category={cat.value} className="h-5 w-5" />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Vendor (optional) */}
          <div className="mobile-field">
            <label className="mobile-field-label">Vendor (optional)</label>
            <input
              type="text"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="Where did you purchase this?"
              className="mobile-field-input"
            />
          </div>

          {/* Payment status */}
          <div className="mobile-field">
            <label className="mobile-field-label">Payment Status</label>
            <div className="mobile-toggle-group">
              <button
                type="button"
                onClick={() => setIsPaid(true)}
                className={cn("mobile-toggle-btn", isPaid && "active")}
              >
                Paid
              </button>
              <button
                type="button"
                onClick={() => setIsPaid(false)}
                className={cn("mobile-toggle-btn", !isPaid && "active")}
              >
                Unpaid
              </button>
            </div>
          </div>

          {/* Payment method (if paid) */}
          {isPaid && (
            <div className="mobile-field">
              <label className="mobile-field-label">Payment Method</label>
              <div className="mobile-payment-methods">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setPaymentMethod(method.value)}
                    className={cn(
                      "mobile-payment-btn",
                      paymentMethod === method.value && "active"
                    )}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={goNext}
            disabled={!description.trim()}
            className="mobile-expense-continue-btn"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step: Receipt */}
      {step === "receipt" && (
        <div className="mobile-expense-step">
          <div className="mobile-receipt-section">
            {receiptPreview ? (
              <div className="mobile-receipt-preview">
                <img
                  src={receiptPreview}
                  alt="Receipt preview"
                  className="mobile-receipt-image"
                />
                <button
                  type="button"
                  onClick={removeReceipt}
                  className="mobile-receipt-remove"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="mobile-receipt-options">
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="camera-input"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="mobile-receipt-btn"
                >
                  <CameraIcon className="h-8 w-8" />
                  <span>Take Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mobile-receipt-btn"
                >
                  <ImageIcon className="h-8 w-8" />
                  <span>Choose File</span>
                </button>
              </div>
            )}

            <p className="mobile-receipt-hint">
              Adding a receipt is optional but recommended for record keeping.
            </p>
          </div>

          {/* Summary */}
          <div className="mobile-expense-summary">
            <div className="summary-row">
              <span className="summary-label">Amount</span>
              <span className="summary-value">${parseFloat(amount).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Description</span>
              <span className="summary-value">{description}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Category</span>
              <span className="summary-value">
                {EXPENSE_CATEGORIES.find((c) => c.value === category)?.label}
              </span>
            </div>
            {vendor && (
              <div className="summary-row">
                <span className="summary-label">Vendor</span>
                <span className="summary-value">{vendor}</span>
              </div>
            )}
            <div className="summary-row">
              <span className="summary-label">Status</span>
              <span className="summary-value">{isPaid ? "Paid" : "Unpaid"}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="mobile-expense-submit-btn"
          >
            {isSubmitting || isUploading ? (
              <>
                <LoadingSpinner className="h-5 w-5" />
                <span>{isUploading ? "Uploading..." : "Saving..."}</span>
              </>
            ) : (
              <>
                <CheckIcon className="h-5 w-5" />
                <span>Save Expense</span>
              </>
            )}
          </button>
        </div>
      )}

      <style jsx>{`
        .mobile-expense-entry {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--card);
          border-radius: var(--card-radius);
        }

        .mobile-expense-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid var(--card-border);
        }

        .mobile-expense-back-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: var(--foreground-muted);
          transition: all 0.15s ease;
        }

        .mobile-expense-back-btn:hover {
          background: var(--background-hover);
          color: var(--foreground);
        }

        .mobile-expense-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--foreground);
        }

        .mobile-expense-progress {
          display: flex;
          gap: 8px;
          justify-content: center;
          padding: 12px;
        }

        .progress-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--border);
          transition: all 0.2s ease;
        }

        .progress-dot.active {
          background: var(--primary);
          width: 24px;
          border-radius: 4px;
        }

        .mobile-expense-error {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 16px 16px;
          padding: 12px;
          border-radius: 8px;
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
          font-size: 14px;
        }

        .mobile-expense-step {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 16px;
          overflow-y: auto;
        }

        /* Amount step */
        .mobile-amount-display {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 32px 0;
        }

        .mobile-amount-currency {
          font-size: 48px;
          font-weight: 300;
          color: var(--foreground-muted);
          margin-right: 4px;
        }

        .mobile-amount-input {
          font-size: 56px;
          font-weight: 700;
          color: var(--foreground);
          background: transparent;
          border: none;
          outline: none;
          width: 200px;
          text-align: left;
        }

        .mobile-amount-input::placeholder {
          color: var(--foreground-muted);
        }

        .mobile-quick-amounts {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .mobile-quick-amount-btn {
          padding: 10px 16px;
          border-radius: 20px;
          background: var(--background-tertiary);
          color: var(--foreground);
          font-size: 14px;
          font-weight: 500;
          transition: all 0.15s ease;
        }

        .mobile-quick-amount-btn:hover {
          background: var(--primary);
          color: white;
        }

        /* Details step */
        .mobile-field {
          margin-bottom: 20px;
        }

        .mobile-field-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--foreground-muted);
          margin-bottom: 8px;
        }

        .mobile-field-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid var(--card-border);
          background: var(--background-tertiary);
          color: var(--foreground);
          font-size: 16px;
          transition: all 0.15s ease;
        }

        .mobile-field-input:focus {
          border-color: var(--primary);
          outline: none;
        }

        .mobile-category-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .mobile-category-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px 8px;
          border-radius: 12px;
          background: var(--background-tertiary);
          color: var(--foreground-muted);
          font-size: 12px;
          transition: all 0.15s ease;
        }

        .mobile-category-btn.active {
          background: var(--primary);
          color: white;
        }

        .mobile-toggle-group {
          display: flex;
          gap: 8px;
        }

        .mobile-toggle-btn {
          flex: 1;
          padding: 14px;
          border-radius: 12px;
          background: var(--background-tertiary);
          color: var(--foreground-muted);
          font-size: 14px;
          font-weight: 500;
          transition: all 0.15s ease;
        }

        .mobile-toggle-btn.active {
          background: var(--primary);
          color: white;
        }

        .mobile-payment-methods {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .mobile-payment-btn {
          padding: 10px 16px;
          border-radius: 20px;
          background: var(--background-tertiary);
          color: var(--foreground-muted);
          font-size: 13px;
          font-weight: 500;
          transition: all 0.15s ease;
        }

        .mobile-payment-btn.active {
          background: var(--primary);
          color: white;
        }

        /* Receipt step */
        .mobile-receipt-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .mobile-receipt-options {
          display: flex;
          gap: 16px;
          margin: 24px 0;
        }

        .mobile-receipt-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 24px 32px;
          border-radius: 16px;
          background: var(--background-tertiary);
          color: var(--foreground);
          font-size: 14px;
          transition: all 0.15s ease;
        }

        .mobile-receipt-btn:hover {
          background: var(--background-hover);
        }

        .mobile-receipt-preview {
          position: relative;
          max-width: 200px;
          max-height: 200px;
          border-radius: 12px;
          overflow: hidden;
          margin: 16px 0;
        }

        .mobile-receipt-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mobile-receipt-remove {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          color: white;
        }

        .mobile-receipt-hint {
          font-size: 13px;
          color: var(--foreground-muted);
          text-align: center;
          margin: 16px 0;
        }

        .mobile-expense-summary {
          background: var(--background-tertiary);
          border-radius: 12px;
          padding: 16px;
          margin: 16px 0;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid var(--card-border);
        }

        .summary-row:last-child {
          border-bottom: none;
        }

        .summary-label {
          font-size: 13px;
          color: var(--foreground-muted);
        }

        .summary-value {
          font-size: 13px;
          font-weight: 500;
          color: var(--foreground);
        }

        /* Buttons */
        .mobile-expense-continue-btn,
        .mobile-expense-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 16px;
          margin-top: auto;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.15s ease;
        }

        .mobile-expense-continue-btn {
          background: var(--primary);
          color: white;
        }

        .mobile-expense-continue-btn:disabled {
          background: var(--background-tertiary);
          color: var(--foreground-muted);
        }

        .mobile-expense-submit-btn {
          background: var(--success);
          color: white;
        }

        .mobile-expense-submit-btn:disabled {
          background: var(--background-tertiary);
          color: var(--foreground-muted);
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function AlertCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function CategoryIcon({ category, className }: { category: ExpenseCategory; className?: string }) {
  const icons: Record<ExpenseCategory, JSX.Element> = {
    travel: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
    materials: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    equipment: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    software: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    labor: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    marketing: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    fees: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    insurance: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    other: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
    ),
  };

  return icons[category] || icons.other;
}

export default MobileExpenseEntry;
