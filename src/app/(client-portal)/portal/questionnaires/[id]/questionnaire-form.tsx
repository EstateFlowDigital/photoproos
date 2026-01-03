"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import type { PortalQuestionnaireWithRelations } from "@/lib/actions/questionnaire-portal";
import {
  saveQuestionnaireProgress,
  submitQuestionnaireResponses,
  acceptAgreement,
} from "@/lib/actions/questionnaire-portal";

interface QuestionnaireFormProps {
  questionnaire: PortalQuestionnaireWithRelations;
}

type FormValues = Record<string, string | string[] | boolean>;

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

  const handleAgreementAccept = async (agreementId: string, accepted: boolean) => {
    setAgreementStates((prev) => ({ ...prev, [agreementId]: accepted }));

    if (accepted) {
      startTransition(async () => {
        const result = await acceptAgreement({
          questionnaireId: questionnaire.id,
          agreementId,
        });

        if (!result.success) {
          setAgreementStates((prev) => ({ ...prev, [agreementId]: false }));
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
    } catch (err) {
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
    return agreement && agreementStates[agreement.id];
  });

  const isComplete =
    completedRequired.length >= requiredFields.length &&
    acceptedRequiredAgreements.length >= requiredAgreements.length;

  const totalRequired = requiredFields.length + requiredAgreements.length;
  const completedCount = completedRequired.length + acceptedRequiredAgreements.length;
  const progress = totalRequired > 0 ? Math.round((completedCount / totalRequired) * 100) : 100;

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-[#22c55e]/20 flex items-center justify-center mb-6">
            <CheckIcon className="h-8 w-8 text-[#22c55e]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Questionnaire Submitted</h1>
          <p className="mt-3 text-[#a7a7a7]">
            Thank you for completing the questionnaire. Your photographer will review your
            responses and reach out if they have any questions.
          </p>
          <Link
            href="/portal"
            className="mt-6 inline-block rounded-lg bg-[#3b82f6] px-6 py-3 text-sm font-medium text-white hover:bg-[#3b82f6]/90"
          >
            Return to Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#262626] bg-[#141414]">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/portal"
                className="text-sm text-[#7c7c7c] hover:text-white transition-colors"
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
                  <p className="text-xs text-[#7c7c7c]">
                    {isSaving ? "Saving..." : `Saved ${formatTime(lastSaved)}`}
                  </p>
                )}
              </div>
              <div className="h-2 w-32 rounded-full bg-[#262626] overflow-hidden">
                <div
                  className="h-full bg-[#3b82f6] transition-all duration-300"
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
          <div className="mb-8 rounded-xl border border-[#262626] bg-[#141414] p-4">
            <p className="text-sm text-[#7c7c7c]">This questionnaire is for:</p>
            <p className="text-lg font-medium text-white">{questionnaire.booking.title}</p>
            <p className="text-sm text-[#7c7c7c]">
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
          <div className="mb-6 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 px-4 py-3 text-sm text-[#ef4444]">
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
            <section key={sectionName} className="rounded-xl border border-[#262626] bg-[#141414]">
              <div className="border-b border-[#262626] px-6 py-4">
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
            <section className="rounded-xl border border-[#262626] bg-[#141414]">
              <div className="border-b border-[#262626] px-6 py-4">
                <h2 className="text-lg font-medium text-white">Legal Agreements</h2>
                <p className="text-sm text-[#7c7c7c]">
                  Please review and accept the following agreements
                </p>
              </div>
              <div className="p-6 space-y-6">
                {questionnaire.template.legalAgreements.map((legalAgreement) => {
                  const agreement = questionnaire.agreements.find(
                    (a) => a.agreementType === legalAgreement.agreementType
                  );
                  if (!agreement) return null;

                  return (
                    <div key={legalAgreement.id} className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-white">
                            {legalAgreement.title}
                            {legalAgreement.isRequired && (
                              <span className="ml-1 text-[#ef4444]">*</span>
                            )}
                          </h3>
                        </div>
                        {agreementStates[agreement.id] && (
                          <span className="rounded-full bg-[#22c55e]/20 px-2 py-0.5 text-xs text-[#22c55e]">
                            Accepted
                          </span>
                        )}
                      </div>
                      <div className="max-h-40 overflow-y-auto rounded-lg border border-[#262626] bg-[#0a0a0a] p-4 text-sm text-[#a7a7a7]">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: legalAgreement.content.replace(/\n/g, "<br />"),
                          }}
                        />
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreementStates[agreement.id] || false}
                          onChange={(e) => handleAgreementAccept(agreement.id, e.target.checked)}
                          disabled={isPending}
                          className="h-5 w-5 rounded border-[#262626] bg-[#0a0a0a] text-[#3b82f6] focus:ring-[#3b82f6] disabled:opacity-50"
                        />
                        <span className="text-sm text-white">
                          I have read and agree to the {legalAgreement.title}
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Submit button */}
          <div className="flex items-center justify-between rounded-xl border border-[#262626] bg-[#141414] p-6">
            <div>
              <p className="text-sm text-[#7c7c7c]">
                {isComplete
                  ? "All required fields and agreements completed"
                  : `${requiredFields.length - completedRequired.length} required fields remaining`}
              </p>
            </div>
            <button
              type="submit"
              disabled={!isComplete || isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#3b82f6]/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
    "w-full rounded-lg border border-[#262626] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder:text-[#7c7c7c] focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]";

  return (
    <div>
      <label className="block text-sm font-medium text-white mb-2">
        {field.label}
        {field.isRequired && <span className="ml-1 text-[#ef4444]">*</span>}
      </label>
      {field.helpText && (
        <p className="mb-2 text-xs text-[#7c7c7c]">{field.helpText}</p>
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
          <input
            type="checkbox"
            checked={(value as boolean) || false}
            onChange={(e) => onChange(e.target.checked)}
            className="h-5 w-5 rounded border-[#262626] bg-[#0a0a0a] text-[#3b82f6] focus:ring-[#3b82f6]"
          />
          <span className="text-sm text-[#a7a7a7]">{field.placeholder || "Yes"}</span>
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
                className="h-4 w-4 border-[#262626] bg-[#0a0a0a] text-[#3b82f6] focus:ring-[#3b82f6]"
              />
              <span className="text-sm text-[#a7a7a7]">{opt}</span>
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
