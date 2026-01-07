"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import type { PortalQuestionnaireWithRelations } from "@/lib/actions/questionnaire-portal";
import {
  saveQuestionnaireProgress,
  submitQuestionnaireResponses,
  acceptAgreement,
} from "@/lib/actions/questionnaire-portal";
import { AgreementSignature } from "@/components/portal/agreement-signature";
import { Checkbox } from "@/components/ui/checkbox";

interface QuestionnaireFormProps {
  questionnaire: PortalQuestionnaireWithRelations;
}

type FormValues = Record<string, string | string[] | boolean>;

// Track signature data for agreements that require signatures
interface SignatureState {
  signatureData: string | null;
  signatureType: "drawn" | "typed" | "uploaded" | null;
}

export function QuestionnaireForm({ questionnaire }: QuestionnaireFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize form values from existing responses
  const [values, setValues] = useState<FormValues>(() => {
    const initial: FormValues = {};
    questionnaire.responses.forEach((response) => {
      initial[response.fieldLabel] = response.value as string | string[] | boolean;
    });
    return initial;
  });

  // Track agreement states
  const [agreementStates, setAgreementStates] = useState<Record<string, boolean>>(() => {
    const states: Record<string, boolean> = {};
    questionnaire.agreements.forEach((agreement) => {
      states[agreement.id] = agreement.accepted;
    });
    return states;
  });

  // Track signature data for agreements that require signatures
  const [signatureStates, setSignatureStates] = useState<Record<string, SignatureState>>(() => {
    const states: Record<string, SignatureState> = {};
    questionnaire.agreements.forEach((agreement) => {
      states[agreement.id] = {
        signatureData: agreement.signatureData,
        signatureType: agreement.signatureType,
      };
    });
    return states;
  });

  // Group fields by section
  const sections = questionnaire.template.fields.reduce(
    (acc, field) => {
      const sectionName = field.section || "General Information";
      if (!acc[sectionName]) {
        acc[sectionName] = [];
      }
      acc[sectionName].push(field);
      return acc;
    },
    {} as Record<string, typeof questionnaire.template.fields>
  );

  // Auto-save logic
  const saveProgress = useCallback(async () => {
    setIsSaving(true);
    try {
      const responses = Object.entries(values).map(([fieldLabel, value]) => {
        const field = questionnaire.template.fields.find((f) => f.label === fieldLabel);
        return {
          fieldLabel,
          fieldType: field?.type || "text",
          value: value ?? "",
        };
      });

      const result = await saveQuestionnaireProgress({
        questionnaireId: questionnaire.id,
        responses,
      });

      if (result.success) {
        setLastSaved(new Date());
      }
    } catch (err) {
      console.error("Auto-save failed:", err);
    } finally {
      setIsSaving(false);
    }
  }, [values, questionnaire.id, questionnaire.template.fields]);

  // Debounced auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(values).length > 0) {
        saveProgress();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [values, saveProgress]);

  const handleFieldChange = (fieldLabel: string, value: string | string[] | boolean) => {
    setValues((prev) => ({ ...prev, [fieldLabel]: value }));
  };

  // Handle signature changes for agreements that require signatures
  const handleSignatureChange = (
    agreementId: string,
    signatureData: string | null,
    signatureType: "drawn" | "typed" | null
  ) => {
    setSignatureStates((prev) => ({
      ...prev,
      [agreementId]: { signatureData, signatureType },
    }));
  };

  const handleAgreementAccept = async (agreementId: string, accepted: boolean) => {
    // Find the template agreement to check if signature is required
    const agreement = questionnaire.agreements.find((a) => a.id === agreementId);
    const templateAgreement = questionnaire.template.legalAgreements.find(
      (ta) => ta.agreementType === agreement?.agreementType
    );

    // If signature is required, check if we have valid signature data
    if (accepted && templateAgreement?.requiresSignature) {
      const sigState = signatureStates[agreementId];
      if (!sigState?.signatureData) {
        setError("Please provide your signature before accepting this agreement");
        return;
      }
    }

    setAgreementStates((prev) => ({ ...prev, [agreementId]: accepted }));

    if (accepted) {
      const sigState = signatureStates[agreementId];

      startTransition(async () => {
        const result = await acceptAgreement({
          questionnaireId: questionnaire.id,
          agreementId,
          signatureData: sigState?.signatureData || undefined,
          signatureType: sigState?.signatureType || undefined,
        });

        if (!result.success) {
          setAgreementStates((prev) => ({ ...prev, [agreementId]: false }));
          setError(result.error);
        } else {
          setError(null);
        }
      });
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const responses = Object.entries(values).map(([fieldLabel, value]) => {
        const field = questionnaire.template.fields.find((f) => f.label === fieldLabel);
        return {
          fieldLabel,
          fieldType: field?.type || "text",
          value: value ?? "",
        };
      });

      const result = await submitQuestionnaireResponses({
        questionnaireId: questionnaire.id,
        responses,
      });

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error);
      }
    } catch {
      setError("Failed to submit questionnaire. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is complete
  const requiredFields = questionnaire.template.fields.filter((f) => f.isRequired);
  const completedRequired = requiredFields.filter((f) => {
    const value = values[f.label];
    return value !== undefined && value !== null && value !== "";
  });

  const requiredAgreements = questionnaire.template.legalAgreements.filter((a) => a.isRequired);
  const acceptedRequiredAgreements = requiredAgreements.filter((a) => {
    const agreement = questionnaire.agreements.find((ag) => ag.agreementType === a.agreementType);
    if (!agreement || !agreementStates[agreement.id]) return false;

    // If signature is required, check if we have valid signature data
    if (a.requiresSignature) {
      const sigState = signatureStates[agreement.id];
      return sigState?.signatureData !== null && sigState?.signatureData !== undefined;
    }

    return true;
  });

  // Count agreements that need signatures but don't have them yet
  const agreementsNeedingSignature = requiredAgreements.filter((a) => {
    if (!a.requiresSignature) return false;
    const agreement = questionnaire.agreements.find((ag) => ag.agreementType === a.agreementType);
    if (!agreement) return false;
    const sigState = signatureStates[agreement.id];
    return !sigState?.signatureData;
  });

  const isComplete =
    completedRequired.length >= requiredFields.length &&
    acceptedRequiredAgreements.length >= requiredAgreements.length;

  const totalRequired = requiredFields.length + requiredAgreements.length;
  const completedCount = completedRequired.length + acceptedRequiredAgreements.length;
  const progress = totalRequired > 0 ? Math.round((completedCount / totalRequired) * 100) : 100;

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-[var(--success)]/20 flex items-center justify-center mb-6">
            <CheckIcon className="h-8 w-8 text-[var(--success)]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Questionnaire Submitted</h1>
          <p className="mt-3 text-[var(--foreground-secondary)]">
            Thank you for completing the questionnaire. Your photographer will review your
            responses and reach out if they have any questions.
          </p>
          <Link
            href="/portal"
            className="mt-6 inline-block rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
          >
            Return to Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--card-border)] bg-[var(--card)]">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/portal"
                className="text-sm text-[var(--foreground-muted)] hover:text-white transition-colors"
              >
                &larr; Back to Portal
              </Link>
              <h1 className="mt-1 text-lg font-semibold text-white">
                {questionnaire.template.name}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-white">{progress}% complete</p>
                {lastSaved && (
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {isSaving ? "Saving..." : `Saved ${formatTime(lastSaved)}`}
                  </p>
                )}
              </div>
              <div className="h-2 w-32 rounded-full bg-[var(--card-border)] overflow-hidden">
                <div
                  className="h-full bg-[var(--primary)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Booking info */}
        {questionnaire.booking && (
          <div className="mb-8 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <p className="text-sm text-[var(--foreground-muted)]">This questionnaire is for:</p>
            <p className="text-lg font-medium text-white">{questionnaire.booking.title}</p>
            <p className="text-sm text-[var(--foreground-muted)]">
              {new Date(questionnaire.booking.startTime).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 px-4 py-3 text-sm text-[var(--error)]">
            {error}
          </div>
        )}

        {/* Form sections */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-8"
        >
          {Object.entries(sections).map(([sectionName, fields]) => (
            <section key={sectionName} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
              <div className="border-b border-[var(--card-border)] px-6 py-4">
                <h2 className="text-lg font-medium text-white">{sectionName}</h2>
              </div>
              <div className="p-6 space-y-6">
                {fields.map((field) => (
                  <FormField
                    key={field.id}
                    field={field}
                    value={values[field.label]}
                    onChange={(value) => handleFieldChange(field.label, value)}
                  />
                ))}
              </div>
            </section>
          ))}

          {/* Legal Agreements */}
          {questionnaire.template.legalAgreements.length > 0 && (
            <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
              <div className="border-b border-[var(--card-border)] px-6 py-4">
                <h2 className="text-lg font-medium text-white">Legal Agreements</h2>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Please review and accept the following agreements
                </p>
              </div>
              <div className="p-6 space-y-8">
                {questionnaire.template.legalAgreements.map((legalAgreement) => {
                  const agreement = questionnaire.agreements.find(
                    (a) => a.agreementType === legalAgreement.agreementType
                  );
                  if (!agreement) return null;

                  const isAccepted = agreementStates[agreement.id];
                  const sigState = signatureStates[agreement.id];
                  const hasSignature = sigState?.signatureData !== null && sigState?.signatureData !== undefined;

                  return (
                    <div
                      key={legalAgreement.id}
                      className={`space-y-4 pb-6 border-b border-[var(--card-border)] last:border-0 last:pb-0 ${
                        legalAgreement.requiresSignature ? "bg-[var(--background)] -mx-6 px-6 py-6 first:-mt-2" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-white">
                            {legalAgreement.title}
                            {legalAgreement.isRequired && (
                              <span className="ml-1 text-[var(--error)]">*</span>
                            )}
                          </h3>
                          {legalAgreement.requiresSignature && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs text-[var(--warning)]">
                              <SignatureRequiredIcon className="w-3 h-3" />
                              Signature required
                            </span>
                          )}
                        </div>
                        {isAccepted && (
                          <span className="rounded-full bg-[var(--success)]/20 px-2 py-0.5 text-xs text-[var(--success)] flex items-center gap-1">
                            <CheckSmallIcon className="w-3 h-3" />
                            Accepted & Signed
                          </span>
                        )}
                      </div>

                      {/* Agreement Content */}
                      <div className="max-h-48 overflow-y-auto rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 text-sm text-[var(--foreground-secondary)]">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: legalAgreement.content.replace(/\n/g, "<br />"),
                          }}
                        />
                      </div>

                      {/* Signature Pad (if required and not yet accepted) */}
                      {legalAgreement.requiresSignature && !isAccepted && (
                        <div className="pt-2">
                          <p className="text-sm text-white mb-3 font-medium">
                            Your Signature
                          </p>
                          <AgreementSignature
                            onSignatureChange={(signatureData, signatureType) =>
                              handleSignatureChange(agreement.id, signatureData, signatureType)
                            }
                            disabled={isPending || isAccepted}
                          />
                        </div>
                      )}

                      {/* Show stored signature if already signed */}
                      {legalAgreement.requiresSignature && isAccepted && hasSignature && (
                        <div className="pt-2">
                          <p className="text-sm text-[var(--foreground-muted)] mb-2">Your signature:</p>
                          <div className="bg-white rounded-lg p-3 inline-block border border-[var(--card-border)]">
                            <img
                              src={sigState.signatureData!}
                              alt="Your signature"
                              className="h-16 w-auto"
                            />
                          </div>
                          <p className="text-xs text-[var(--foreground-muted)] mt-2">
                            Signed on{" "}
                            {agreement.acceptedAt
                              ? new Date(agreement.acceptedAt).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })
                              : "N/A"}
                          </p>
                        </div>
                      )}

                      {/* Accept checkbox */}
                      <label
                        className={`flex items-start gap-3 cursor-pointer ${
                          isAccepted ? "opacity-75" : ""
                        }`}
                      >
                        <Checkbox
                          checked={isAccepted || false}
                          onCheckedChange={(checked) => handleAgreementAccept(agreement.id, checked === true)}
                          disabled={isPending || isAccepted}
                          className="mt-0.5"
                        />
                        <span className="text-sm text-white">
                          {legalAgreement.requiresSignature ? (
                            <>
                              I have read, understand, and agree to the {legalAgreement.title}.
                              I confirm that the signature above is my legal signature.
                            </>
                          ) : (
                            <>I have read and agree to the {legalAgreement.title}</>
                          )}
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Submit button */}
          <div className="flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div>
              {isComplete ? (
                <p className="text-sm text-[var(--success)]">
                  All required fields and agreements completed
                </p>
              ) : (
                <div className="space-y-1">
                  {requiredFields.length - completedRequired.length > 0 && (
                    <p className="text-sm text-[var(--foreground-muted)]">
                      {requiredFields.length - completedRequired.length} required field{requiredFields.length - completedRequired.length !== 1 ? 's' : ''} remaining
                    </p>
                  )}
                  {requiredAgreements.length - acceptedRequiredAgreements.length > 0 && (
                    <p className="text-sm text-[var(--foreground-muted)]">
                      {requiredAgreements.length - acceptedRequiredAgreements.length} agreement{requiredAgreements.length - acceptedRequiredAgreements.length !== 1 ? 's' : ''} require acceptance
                    </p>
                  )}
                  {agreementsNeedingSignature.length > 0 && (
                    <p className="text-sm text-[var(--warning)]">
                      {agreementsNeedingSignature.length} agreement{agreementsNeedingSignature.length !== 1 ? 's' : ''} need{agreementsNeedingSignature.length === 1 ? 's' : ''} your signature
                    </p>
                  )}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!isComplete || isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Submitting...
                </>
              ) : (
                "Submit Questionnaire"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

// Form field component
function FormField({
  field,
  value,
  onChange,
}: {
  field: PortalQuestionnaireWithRelations["template"]["fields"][0];
  value: string | string[] | boolean | undefined;
  onChange: (value: string | string[] | boolean) => void;
}) {
  const baseInputClass =
    "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-white placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]";

  return (
    <div>
      <label className="block text-sm font-medium text-white mb-2">
        {field.label}
        {field.isRequired && <span className="ml-1 text-[var(--error)]">*</span>}
      </label>
      {field.helpText && (
        <p className="mb-2 text-xs text-[var(--foreground-muted)]">{field.helpText}</p>
      )}

      {field.type === "text" && (
        <input
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || ""}
          className={baseInputClass}
        />
      )}

      {field.type === "email" && (
        <input
          type="email"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || ""}
          className={baseInputClass}
        />
      )}

      {field.type === "phone" && (
        <input
          type="tel"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || ""}
          className={baseInputClass}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || ""}
          rows={4}
          className={baseInputClass + " resize-none"}
        />
      )}

      {field.type === "number" && (
        <input
          type="number"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || ""}
          className={baseInputClass}
        />
      )}

      {field.type === "date" && (
        <input
          type="date"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
        />
      )}

      {field.type === "time" && (
        <input
          type="time"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
        />
      )}

      {field.type === "select" && (
        <select
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
        >
          <option value="">Select an option...</option>
          {(field.validation as { options?: string[] })?.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {field.type === "checkbox" && (
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={(value as boolean) || false}
            onCheckedChange={(checked) => onChange(checked === true)}
          />
          <span className="text-sm text-[var(--foreground-secondary)]">{field.placeholder || "Yes"}</span>
        </label>
      )}

      {field.type === "radio" && (
        <div className="space-y-2">
          {(field.validation as { options?: string[] })?.options?.map((opt) => (
            <label key={opt} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={(value as string) === opt}
                onChange={(e) => onChange(e.target.value)}
                className="mt-0.5 h-4 w-4 rounded-full border-2 border-[var(--border-visible)] bg-transparent accent-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0"
              />
              <span className="text-sm text-[var(--foreground-secondary)]">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {field.type === "url" && (
        <input
          type="url"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || "https://"}
          className={baseInputClass}
        />
      )}

      {field.type === "address" && (
        <textarea
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || "Street address, City, State, ZIP"}
          rows={3}
          className={baseInputClass + " resize-none"}
        />
      )}
    </div>
  );
}

// Helper functions
function formatTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// Icons
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function SignatureRequiredIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
    </svg>
  );
}

function CheckSmallIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
    </svg>
  );
}
