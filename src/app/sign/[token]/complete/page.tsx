"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSigningCompletion } from "@/lib/actions/contract-signing";
import { Loader2, CheckCircle2, FileText, Mail } from "lucide-react";

interface CompletionData {
  contractName: string;
  signerName: string;
  signedAt: Date;
  contractFullySigned: boolean;
  organization: {
    name: string;
    logoUrl: string | null;
    publicEmail: string | null;
  } | null;
}

export default function SigningCompletePage() {
  const params = useParams();
  const token = (params?.token as string) || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CompletionData | null>(null);

  useEffect(() => {
    async function loadCompletion() {
      try {
        const result = await getSigningCompletion(token);
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error);
        }
      } catch {
        setError("Failed to load confirmation");
      } finally {
        setLoading(false);
      }
    }

    loadCompletion();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto mb-4" />
          <p className="text-[#a7a7a7]">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#141414] rounded-xl border border-[rgba(255,255,255,0.08)] p-8 max-w-md w-full text-center">
          <p className="text-[#a7a7a7]">{error || "Unable to load confirmation"}</p>
        </div>
      </div>
    );
  }

  const signedDate = new Date(data.signedAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Success Card */}
        <div className="bg-[#141414] rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[var(--success)]/10 to-[var(--success)]/10 border-b border-[var(--success)]/20 p-8 text-center">
            <div className="w-16 h-16 bg-[var(--success)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[var(--success)]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Document Signed Successfully
            </h1>
            <p className="text-[#a7a7a7]">
              Thank you for signing this document
            </p>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            {/* Document Info */}
            <div className="flex items-start gap-4 p-4 bg-[#1a1a1a] rounded-lg">
              <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-white font-medium">{data.contractName}</p>
                <p className="text-[#7c7c7c] text-sm mt-1">
                  Signed by {data.signerName}
                </p>
                <p className="text-[#7c7c7c] text-sm">{signedDate}</p>
              </div>
            </div>

            {/* Status */}
            {data.contractFullySigned ? (
              <div className="p-4 bg-[var(--success)]/10 border border-[var(--success)]/20 rounded-lg">
                <p className="text-[var(--success)] text-sm">
                  <strong>All signatures complete.</strong> All parties have signed this document.
                  A copy will be sent to all signers.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-lg">
                <p className="text-[var(--warning)] text-sm">
                  <strong>Awaiting other signatures.</strong> Other parties still need to sign
                  this document. You&apos;ll receive a copy once everyone has signed.
                </p>
              </div>
            )}

            {/* Organization Contact */}
            {data.organization && (
              <div className="pt-4 border-t border-[rgba(255,255,255,0.08)]">
                <p className="text-[#7c7c7c] text-sm mb-3">
                  This document was sent by:
                </p>
                <div className="flex items-center gap-3">
                  {data.organization.logoUrl ? (
                    <img
                      src={data.organization.logoUrl}
                      alt={data.organization.name}
                      className="h-8 w-auto"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {data.organization.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{data.organization.name}</p>
                    {data.organization.publicEmail && (
                      <a
                        href={`mailto:${data.organization.publicEmail}`}
                        className="text-[var(--primary)] text-sm hover:underline flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        {data.organization.publicEmail}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-[#0d0d0d] border-t border-[rgba(255,255,255,0.08)]">
            <p className="text-[#7c7c7c] text-xs text-center">
              A confirmation email has been sent to your email address.
              Please keep it for your records.
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <p className="text-[#7c7c7c] text-xs">
            Secured by PhotoProOS
          </p>
        </div>
      </div>
    </div>
  );
}
