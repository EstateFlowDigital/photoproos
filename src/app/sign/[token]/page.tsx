"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SignaturePad from "signature_pad";
import { getContractForSigning, signContract } from "@/lib/actions/contract-signing";
import { Loader2, CheckCircle2, AlertCircle, Pen, Type, FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { sanitizeRichText } from "@/lib/sanitize";

interface ContractData {
  contract: {
    id: string;
    name: string;
    content: string;
    status: string;
  };
  signer: {
    id: string;
    email: string;
    name: string | null;
  };
  client: {
    fullName: string | null;
    company: string | null;
  } | null;
  organization: {
    name: string;
    logoUrl: string | null;
    primaryColor: string | null;
  } | null;
  signers: Array<{
    id: string;
    email: string;
    name: string | null;
    signedAt: Date | null;
    hasSigned: boolean;
  }>;
}

type SignatureMode = "draw" | "type";

export default function ContractSigningPage() {
  const params = useParams();
  const router = useRouter();
  const token =
    (Array.isArray(params?.token) ? params?.token[0] : (params?.token as string | undefined)) ?? "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [signatureMode, setSignatureMode] = useState<SignatureMode>("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContract, setShowContract] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  // Load contract data
  useEffect(() => {
    async function loadContract() {
      try {
        const result = await getContractForSigning(token);
        if (result.success) {
          setContractData(result.data);
        } else {
          setError(result.error);
        }
      } catch {
        setError("Failed to load contract");
      } finally {
        setLoading(false);
      }
    }

    loadContract();
  }, [token]);

  // Initialize signature pad
  useEffect(() => {
    if (canvasRef.current && signatureMode === "draw") {
      signaturePadRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: "rgb(255, 255, 255)",
        penColor: "rgb(0, 0, 0)",
      });

      // Handle resize
      const resizeCanvas = () => {
        if (canvasRef.current && signaturePadRef.current) {
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          const canvas = canvasRef.current;
          canvas.width = canvas.offsetWidth * ratio;
          canvas.height = canvas.offsetHeight * ratio;
          canvas.getContext("2d")?.scale(ratio, ratio);
          signaturePadRef.current.clear();
        }
      };

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      return () => {
        window.removeEventListener("resize", resizeCanvas);
        signaturePadRef.current?.off();
      };
    }
  }, [signatureMode, contractData]);

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
    setTypedSignature("");
  };

  const getSignatureData = (): string | null => {
    if (signatureMode === "draw") {
      if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
        return null;
      }
      return signaturePadRef.current.toDataURL("image/png");
    } else {
      if (!typedSignature.trim()) {
        return null;
      }
      // Create a canvas with the typed signature
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.font = "italic 32px 'Dancing Script', cursive, Georgia, serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);

      return canvas.toDataURL("image/png");
    }
  };

  const handleSubmit = async () => {
    if (!hasAgreed) {
      setError("Please agree to sign this document electronically");
      return;
    }

    const signatureData = getSignatureData();
    if (!signatureData) {
      setError("Please provide your signature");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signContract({
        signingToken: token,
        signatureData,
        signatureType: signatureMode === "draw" ? "drawn" : "typed",
        consentText: "I agree to sign this document electronically",
      });

      if (result.success) {
        router.push(result.data.redirectUrl);
      } else {
        setError(result.error);
      }
    } catch {
      setError("Failed to submit signature");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto mb-4" />
          <p className="text-[var(--foreground-secondary)]">Loading contract...</p>
        </div>
      </div>
    );
  }

  if (error && !contractData) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-[var(--error)] mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-2">Unable to Load Contract</h1>
          <p className="text-[var(--foreground-secondary)]">{error}</p>
        </div>
      </div>
    );
  }

  if (!contractData) return null;

  const { contract, signer, organization, signers } = contractData;
  const primaryColor = organization?.primaryColor || "#3b82f6";

  return (
    <div data-element="contract-sign-page" className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-[var(--card)] border-b border-[var(--card-border)] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {organization?.logoUrl ? (
              <img
                src={organization.logoUrl}
                alt={organization.name}
                className="h-8 w-auto"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                {organization?.name?.[0] || "P"}
              </div>
            )}
            <span className="text-white font-medium">{organization?.name}</span>
          </div>
          <div className="text-sm text-[var(--foreground-muted)]">
            Signing as: <span className="text-white">{signer.name || signer.email}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Contract Info */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">{contract.name}</h1>
          <p className="text-[var(--foreground-muted)]">Please review and sign this document</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contract Content */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] overflow-x-auto">
              <div className="flex items-start justify-between gap-4 flex-wrap px-4 py-3 border-b border-[var(--card-border)]">
                <div className="flex items-center gap-2 text-white">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Contract Document</span>
                </div>
                <button
                  onClick={() => setShowContract(!showContract)}
                  className="text-sm text-[var(--foreground-muted)] hover:text-white transition-colors"
                >
                  {showContract ? "Collapse" : "Expand"}
                </button>
              </div>
              {showContract && (
                <div
                  className="p-6 max-h-[500px] overflow-y-auto prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(contract.content) }}
                />
              )}
            </div>

            {/* Signature Section */}
            <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] mt-6 overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--card-border)]">
                <h2 className="text-white font-medium">Your Signature</h2>
              </div>
              <div className="p-6">
                {/* Signature Mode Toggle */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => {
                      setSignatureMode("draw");
                      setTypedSignature("");
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-colors ${
                      signatureMode === "draw"
                        ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]"
                        : "border-[var(--card-border)] text-[var(--foreground-muted)] hover:text-white"
                    }`}
                  >
                    <Pen className="w-4 h-4" />
                    Draw
                  </button>
                  <button
                    onClick={() => {
                      setSignatureMode("type");
                      signaturePadRef.current?.clear();
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-colors ${
                      signatureMode === "type"
                        ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]"
                        : "border-[var(--card-border)] text-[var(--foreground-muted)] hover:text-white"
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    Type
                  </button>
                </div>

                {/* Signature Input */}
                {signatureMode === "draw" ? (
                  <div className="bg-white rounded-lg overflow-hidden mb-4">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-32 cursor-crosshair"
                    />
                  </div>
                ) : (
                  <div className="mb-4">
                    <input
                      type="text"
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                      placeholder="Type your full name"
                      className="w-full bg-white text-black px-4 py-3 rounded-lg text-center text-2xl italic font-serif"
                      style={{ fontFamily: "'Dancing Script', cursive, Georgia, serif" }}
                    />
                  </div>
                )}

                <button
                  onClick={clearSignature}
                  className="text-sm text-[var(--foreground-muted)] hover:text-white transition-colors"
                >
                  Clear signature
                </button>

                {/* Agreement Checkbox */}
                <div className="mt-6 pt-6 border-t border-[var(--card-border)]">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={hasAgreed}
                      onCheckedChange={(checked) => setHasAgreed(checked === true)}
                      className="mt-1"
                    />
                    <span className="text-sm text-[var(--foreground-secondary)]">
                      I agree to sign this document electronically and understand that my
                      electronic signature has the same legal effect as a handwritten signature.
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-lg">
                    <p className="text-[var(--error)] text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !hasAgreed}
                  className="mt-6 w-full py-3 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: primaryColor, opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing...
                    </span>
                  ) : (
                    "Sign Document"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Signers Status */}
            <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] overflow-x-auto">
              <div className="px-4 py-3 border-b border-[var(--card-border)]">
                <h2 className="text-white font-medium">Signers</h2>
              </div>
              <div className="p-4 space-y-3">
                {signers.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-start justify-between gap-4 flex-wrap p-3 rounded-lg bg-[var(--background-tertiary)]"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">
                        {s.name || s.email}
                      </p>
                      {s.name && (
                        <p className="text-[var(--foreground-muted)] text-xs">{s.email}</p>
                      )}
                    </div>
                    {s.hasSigned ? (
                      <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                    ) : s.id === signer.id ? (
                      <span className="text-xs px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded">
                        You
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--foreground-muted)]">Pending</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Security Info */}
            <div className="mt-6 p-4 bg-[var(--card)] rounded-xl border border-[var(--card-border)]">
              <h3 className="text-white text-sm font-medium mb-2">Secure Signing</h3>
              <p className="text-[var(--foreground-muted)] text-xs leading-relaxed">
                This document is encrypted and your signature will be securely stored.
                Your IP address and timestamp will be recorded for verification.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
