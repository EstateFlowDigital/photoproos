"use client";

import { useState } from "react";
import { AgreementSignature } from "@/components/portal/agreement-signature";
import { Checkbox } from "@/components/ui/checkbox";
import type { FormFieldType, LegalAgreementType } from "@prisma/client";

interface TemplateField {
  id: string;
  label: string;
  type: FormFieldType;
  placeholder: string | null;
  helpText: string | null;
  isRequired: boolean;
  sortOrder: number;
  section: string | null;
  sectionOrder: number;
  validation: unknown;
  conditionalOn: string | null;
  conditionalValue: string | null;
}

interface TemplateAgreement {
  id: string;
  agreementType: LegalAgreementType;
  title: string;
  content: string;
  isRequired: boolean;
  requiresSignature: boolean;
  sortOrder: number;
}

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  industry: string;
  fields: TemplateField[];
  legalAgreements: TemplateAgreement[];
}

interface QuestionnairePreviewClientProps {
  template: Template;
}

type FormValues = Record<string, string | string[] | boolean>;

interface SignatureState {
  signatureData: string | null;
  signatureType: "drawn" | "typed" | null;
}

export function QuestionnairePreviewClient({ template }: QuestionnairePreviewClientProps) {
  const [values, setValues] = useState<FormValues>({});
  const [agreementStates, setAgreementStates] = useState<Record<string, boolean>>({});
  const [signatureStates, setSignatureStates] = useState<Record<string, SignatureState>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [deviceView, setDeviceView] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // Group fields by section
  const sections = template.fields.reduce(
    (acc, field) => {
      const sectionName = field.section || "General Information";
      if (!acc[sectionName]) {
        acc[sectionName] = [];
      }
      acc[sectionName].push(field);
      return acc;
    },
    {} as Record<string, TemplateField[]>
  );

  const handleFieldChange = (fieldLabel: string, value: string | string[] | boolean) => {
    setValues((prev) => ({ ...prev, [fieldLabel]: value }));
  };

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

  const handleAgreementAccept = (agreementId: string, accepted: boolean) => {
    const agreement = template.legalAgreements.find((a) => a.id === agreementId);

    if (accepted && agreement?.requiresSignature) {
      const sigState = signatureStates[agreementId];
      if (!sigState?.signatureData) {
        return; // Don't accept without signature
      }
    }

    setAgreementStates((prev) => ({ ...prev, [agreementId]: accepted }));
  };

  const handleSubmit = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Calculate completion
  const requiredFields = template.fields.filter((f) => f.isRequired);
  const completedRequired = requiredFields.filter((f) => {
    const value = values[f.label];
    return value !== undefined && value !== null && value !== "";
  });

  const requiredAgreements = template.legalAgreements.filter((a) => a.isRequired);
  const acceptedRequiredAgreements = requiredAgreements.filter((a) => {
    if (!agreementStates[a.id]) return false;
    if (a.requiresSignature) {
      const sigState = signatureStates[a.id];
      return sigState?.signatureData !== null && sigState?.signatureData !== undefined;
    }
    return true;
  });

  const agreementsNeedingSignature = requiredAgreements.filter((a) => {
    if (!a.requiresSignature) return false;
    const sigState = signatureStates[a.id];
    return !sigState?.signatureData;
  });

  const isComplete =
    completedRequired.length >= requiredFields.length &&
    acceptedRequiredAgreements.length >= requiredAgreements.length;

  const totalRequired = requiredFields.length + requiredAgreements.length;
  const completedCount = completedRequired.length + acceptedRequiredAgreements.length;
  const progress = totalRequired > 0 ? Math.round((completedCount / totalRequired) * 100) : 100;

  const getDeviceWidth = () => {
    switch (deviceView) {
      case "mobile": return "max-w-[375px]";
      case "tablet": return "max-w-[768px]";
      default: return "max-w-4xl";
    }
  };

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className={`mx-auto px-6 ${getDeviceWidth()}`}>
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--card-border)] p-12 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-[var(--success)]/20 flex items-center justify-center mb-6">
              <CheckIcon className="h-10 w-10 text-[var(--success)]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Preview Complete!</h1>
            <p className="text-[var(--foreground-secondary)] mb-6">
              This is what your clients see after submitting.
              In production, their responses would be saved.
            </p>
            <button
              onClick={() => {
                setShowSuccess(false);
                setValues({});
                setAgreementStates({});
                setSignatureStates({});
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
            >
              <RefreshIcon className="w-4 h-4" />
              Reset Preview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Device Selector */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="flex items-center justify-center gap-2 p-1 bg-[var(--card)] rounded-lg w-fit mx-auto border border-[var(--card-border)]">
          <button
            onClick={() => setDeviceView("desktop")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              deviceView === "desktop"
                ? "bg-[var(--background-tertiary)] text-white"
                : "text-[var(--foreground-muted)] hover:text-white"
            }`}
          >
            <DesktopIcon className="w-4 h-4" />
            Desktop
          </button>
          <button
            onClick={() => setDeviceView("tablet")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              deviceView === "tablet"
                ? "bg-[var(--background-tertiary)] text-white"
                : "text-[var(--foreground-muted)] hover:text-white"
            }`}
          >
            <TabletIcon className="w-4 h-4" />
            Tablet
          </button>
          <button
            onClick={() => setDeviceView("mobile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              deviceView === "mobile"
                ? "bg-[var(--background-tertiary)] text-white"
                : "text-[var(--foreground-muted)] hover:text-white"
            }`}
          >
            <MobileIcon className="w-4 h-4" />
            Mobile
          </button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className={`mx-auto px-4 transition-all duration-300 ${getDeviceWidth()}`}>
        {/* Device Frame */}
        <div className={`bg-[var(--background-tertiary)] rounded-2xl border-2 border-[var(--border-visible)] overflow-hidden shadow-2xl ${
          deviceView === "mobile" ? "rounded-[2rem]" : ""
        }`}>
          {/* Browser Chrome */}
          <div className="bg-[var(--background-tertiary)] px-4 py-3 flex items-center gap-3 border-b border-[var(--border-visible)]">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
              <div className="w-3 h-3 rounded-full bg-[#f97316]" />
              <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
            </div>
            <div className="flex-1 bg-[var(--background-tertiary)] rounded-lg px-4 py-1.5 text-sm text-[var(--foreground-muted)] text-center truncate">
              portal.yourdomain.com/questionnaires/{template.slug}
            </div>
          </div>

          {/* Portal Header */}
          <div className="bg-[var(--card)] border-b border-[var(--card-border)] px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">← Back to Portal</p>
                <h1 className="text-lg font-semibold text-white mt-1">{template.name}</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-white">{progress}% complete</p>
                </div>
                <div className="h-2 w-24 rounded-full bg-[var(--background-tertiary)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--primary)] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Questionnaire Content */}
          <div className="bg-[var(--background)] min-h-[500px] max-h-[70vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Sample Booking Info */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                <p className="text-sm text-[var(--foreground-muted)]">This questionnaire is for:</p>
                <p className="text-lg font-medium text-white">Sample Booking - Preview</p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Form Sections */}
              {Object.entries(sections).map(([sectionName, fields]) => (
                <section key={sectionName} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
                  <div className="border-b border-[var(--card-border)] px-6 py-4">
                    <h2 className="text-lg font-medium text-white">{sectionName}</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    {fields.map((field) => (
                      <PreviewField
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
              {template.legalAgreements.length > 0 && (
                <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
                  <div className="border-b border-[var(--card-border)] px-6 py-4">
                    <h2 className="text-lg font-medium text-white">Legal Agreements</h2>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      Please review and accept the following agreements
                    </p>
                  </div>
                  <div className="p-6 space-y-8">
                    {template.legalAgreements.map((agreement) => {
                      const isAccepted = agreementStates[agreement.id];
                      const sigState = signatureStates[agreement.id];
                      const hasSignature = sigState?.signatureData !== null && sigState?.signatureData !== undefined;

                      return (
                        <div
                          key={agreement.id}
                          className={`space-y-4 pb-6 border-b border-[var(--card-border)] last:border-0 last:pb-0 ${
                            agreement.requiresSignature ? "bg-[var(--background)] -mx-6 px-6 py-6 first:-mt-2" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                              <h3 className="font-medium text-white">
                                {agreement.title}
                                {agreement.isRequired && (
                                  <span className="ml-1 text-[var(--error)]">*</span>
                                )}
                              </h3>
                              {agreement.requiresSignature && (
                                <span className="inline-flex items-center gap-1 mt-1 text-xs text-[var(--warning)]">
                                  <SignatureIcon className="w-3 h-3" />
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
                                __html: agreement.content.replace(/\n/g, "<br />"),
                              }}
                            />
                          </div>

                          {/* Signature Pad */}
                          {agreement.requiresSignature && !isAccepted && (
                            <div className="pt-2">
                              <p className="text-sm text-white mb-3 font-medium">
                                Your Signature
                              </p>
                              <AgreementSignature
                                onSignatureChange={(signatureData, signatureType) =>
                                  handleSignatureChange(agreement.id, signatureData, signatureType)
                                }
                                disabled={isAccepted}
                              />
                            </div>
                          )}

                          {/* Show stored signature */}
                          {agreement.requiresSignature && isAccepted && hasSignature && (
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
                                Signed just now (preview)
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
                              disabled={isAccepted || (agreement.requiresSignature && !hasSignature)}
                              className="mt-0.5"
                            />
                            <span className="text-sm text-white">
                              {agreement.requiresSignature ? (
                                <>
                                  I have read, understand, and agree to the {agreement.title}.
                                  I confirm that the signature above is my legal signature.
                                </>
                              ) : (
                                <>I have read and agree to the {agreement.title}</>
                              )}
                            </span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Submit Button */}
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
                  onClick={handleSubmit}
                  disabled={!isComplete}
                  className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Questionnaire
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="max-w-2xl mx-auto mt-8 px-4">
        <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-[var(--ai)]/10 text-[var(--ai)]">
              <InfoIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-white mb-1">Preview Mode</h3>
              <p className="text-sm text-[var(--foreground-secondary)]">
                This preview shows exactly what your clients will see when completing this questionnaire.
                Test the form fields, signature pad, and submission flow. No data is saved in preview mode.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Preview Field Component
function PreviewField({
  field,
  value,
  onChange,
}: {
  field: TemplateField;
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

// Icons
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.312.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
    </svg>
  );
}

function DesktopIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M14 6H6v8h8V6Z" />
      <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h13A1.5 1.5 0 0 1 18 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 12.5v-9ZM3.5 3.5h13v9h-13v-9Z" clipRule="evenodd" />
      <path d="M5 18a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 5 18ZM7 16.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5Z" />
    </svg>
  );
}

function TabletIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5 1a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H5Zm0 1.5h10a.5.5 0 0 1 .5.5v14a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5Z" clipRule="evenodd" />
      <path d="M10 16.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
    </svg>
  );
}

function MobileIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M8 16.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z" />
      <path fillRule="evenodd" d="M4 4a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V4Zm3-1.5A1.5 1.5 0 0 0 5.5 4v12A1.5 1.5 0 0 0 7 17.5h6a1.5 1.5 0 0 0 1.5-1.5V4A1.5 1.5 0 0 0 13 2.5H7Z" clipRule="evenodd" />
    </svg>
  );
}

function SignatureIcon({ className }: { className?: string }) {
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

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
    </svg>
  );
}
