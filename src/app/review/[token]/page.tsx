import { getReviewRequestByToken } from "@/lib/actions/review-gate";
import { ReviewClient } from "./review-client";
import { AlertCircle, Clock } from "lucide-react";

interface ReviewPageProps {
  params: Promise<{ token: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { token } = await params;
  const result = await getReviewRequestByToken(token);

  // Error states
  if (!result.success) {
    const isExpired = result.error.includes("expired");

    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--error)]/10">
            {isExpired ? (
              <Clock className="h-8 w-8 text-[var(--error)]" />
            ) : (
              <AlertCircle className="h-8 w-8 text-[var(--error)]" />
            )}
          </div>
          <h1 className="mt-6 text-2xl font-bold text-white">
            {isExpired ? "Review Request Expired" : "Review Not Found"}
          </h1>
          <p className="mt-3 text-gray-400">
            {isExpired
              ? "This review request has expired and is no longer available."
              : "We couldn't find this review request. It may have been removed or the link is invalid."}
          </p>
        </div>
      </div>
    );
  }

  const request = result.data;

  // Already responded
  if (request.hasResponded) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-500/10">
            <svg
              className="h-8 w-8 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-bold text-white">
            Already Submitted
          </h1>
          <p className="mt-3 text-gray-400">
            You have already submitted your feedback. Thank you for your response!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-element="review-page">
      <ReviewClient
        token={token}
        organizationName={request.organization.name}
        logoUrl={request.organization.logoUrl}
        primaryColor={request.organization.primaryColor || "#3b82f6"}
        clientName={request.clientName}
        platforms={request.platforms}
        preferredPlatform={request.preferredPlatform}
      />
    </div>
  );
}
