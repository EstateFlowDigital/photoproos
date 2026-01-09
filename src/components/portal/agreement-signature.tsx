"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import SignaturePad from "signature_pad";

type SignatureMode = "draw" | "type";

interface AgreementSignatureProps {
  /**
   * Called when a valid signature is provided
   */
  onSignatureChange: (signatureData: string | null, signatureType: "drawn" | "typed" | null) => void;
  /**
   * Disable the signature pad
   */
  disabled?: boolean;
  /**
   * Initial signature mode
   */
  defaultMode?: SignatureMode;
  /**
   * Additional class name for styling
   */
  className?: string;
}

export function AgreementSignature({
  onSignatureChange,
  disabled = false,
  defaultMode = "draw",
  className = "",
}: AgreementSignatureProps) {
  const [signatureMode, setSignatureMode] = useState<SignatureMode>(defaultMode);
  const [typedSignature, setTypedSignature] = useState("");
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize signature pad
  useEffect(() => {
    if (!canvasRef.current || signatureMode !== "draw") return;

    const canvas = canvasRef.current;
    signaturePadRef.current = new SignaturePad(canvas, {
      backgroundColor: "rgb(255, 255, 255)",
      penColor: "rgb(0, 0, 0)",
      minWidth: 0.5,
      maxWidth: 2.5,
    });

    // Handle resize
    const resizeCanvas = () => {
      if (!canvas || !signaturePadRef.current) return;

      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const container = containerRef.current;
      if (!container) return;

      // Get container width for responsive sizing
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = 150 * ratio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = "150px";

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(ratio, ratio);
      }

      signaturePadRef.current.clear();
      setHasDrawnSignature(false);
    };

    // Initial resize
    resizeCanvas();

    // Listen for resize
    window.addEventListener("resize", resizeCanvas);

    // Listen for signature strokes
    signaturePadRef.current.addEventListener("endStroke", () => {
      setHasDrawnSignature(true);
    });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      signaturePadRef.current?.off();
    };
  }, [signatureMode]);

  // Update parent when signature changes
  useEffect(() => {
    const signatureData = getSignatureData();
    if (signatureData) {
      onSignatureChange(signatureData, signatureMode === "draw" ? "drawn" : "typed");
    } else {
      onSignatureChange(null, null);
    }
  }, [typedSignature, hasDrawnSignature, signatureMode]);

  const getSignatureData = useCallback((): string | null => {
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
  }, [signatureMode, typedSignature]);

  const clearSignature = () => {
    if (signatureMode === "draw" && signaturePadRef.current) {
      signaturePadRef.current.clear();
      setHasDrawnSignature(false);
    }
    setTypedSignature("");
  };

  const handleModeSwitch = (mode: SignatureMode) => {
    if (mode === signatureMode) return;

    // Clear current signature when switching modes
    if (signatureMode === "draw" && signaturePadRef.current) {
      signaturePadRef.current.clear();
      setHasDrawnSignature(false);
    }
    setTypedSignature("");
    setSignatureMode(mode);
  };

  const hasSignature = signatureMode === "draw" ? hasDrawnSignature : typedSignature.trim().length > 0;

  return (
    <div className={`space-y-3 ${className}`} ref={containerRef}>
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleModeSwitch("draw")}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-colors ${
            signatureMode === "draw"
              ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]"
              : "border-[var(--card-border)] text-[var(--foreground-muted)] hover:text-white hover:border-[var(--border-visible)]"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <PenIcon className="w-4 h-4" />
          Draw
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch("type")}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-colors ${
            signatureMode === "type"
              ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]"
              : "border-[var(--card-border)] text-[var(--foreground-muted)] hover:text-white hover:border-[var(--border-visible)]"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <TypeIcon className="w-4 h-4" />
          Type
        </button>
      </div>

      {/* Signature Input */}
      {signatureMode === "draw" ? (
        <div className="relative bg-white rounded-lg overflow-hidden border border-[var(--card-border)]">
          <canvas
            ref={canvasRef}
            className={`w-full cursor-crosshair ${disabled ? "pointer-events-none opacity-50" : ""}`}
            style={{ height: "150px", touchAction: "none" }}
          />
          {!hasDrawnSignature && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[#999] text-sm">Sign here</span>
            </div>
          )}
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={typedSignature}
            onChange={(e) => setTypedSignature(e.target.value)}
            placeholder="Type your full legal name"
            disabled={disabled}
            className="w-full bg-white text-black px-4 py-4 rounded-lg text-center text-2xl italic border border-[var(--card-border)] placeholder:text-[var(--foreground-muted)] disabled:opacity-50"
            style={{ fontFamily: "'Dancing Script', cursive, Georgia, serif" }}
          />
        </div>
      )}

      {/* Clear button and info */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <button
          type="button"
          onClick={clearSignature}
          disabled={disabled || !hasSignature}
          className="text-sm text-[var(--foreground-muted)] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear signature
        </button>
        {hasSignature && (
          <span className="text-xs text-[var(--success)] flex items-center gap-1">
            <CheckIcon className="w-3 h-3" />
            Signature captured
          </span>
        )}
      </div>
    </div>
  );
}

// Icons
function PenIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
    </svg>
  );
}

function TypeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 2a.75.75 0 0 1 .75.75v.258a33.186 33.186 0 0 1 6.668.83.75.75 0 0 1-.336 1.461 31.28 31.28 0 0 0-1.103-.232l1.702 7.545a.75.75 0 0 1-.387.832A4.981 4.981 0 0 1 15 14c-.825 0-1.606-.2-2.294-.556a.75.75 0 0 1-.387-.832l1.77-7.849a31.743 31.743 0 0 0-3.339-.254v11.505l1.5 1.5a.75.75 0 1 1-1.06 1.06l-.69-.69-.69.69a.75.75 0 0 1-1.06-1.06l1.5-1.5V4.509c-1.129.026-2.243.112-3.339.254l1.77 7.85a.75.75 0 0 1-.387.83A4.981 4.981 0 0 1 5 14a4.981 4.981 0 0 1-2.294-.556.75.75 0 0 1-.387-.832l1.702-7.545c-.37.07-.738.148-1.103.232a.75.75 0 0 1-.336-1.462 33.186 33.186 0 0 1 6.668-.829V2.75A.75.75 0 0 1 10 2ZM5 11.524l-1.145 5.075c.367.18.775.28 1.145.28.37 0 .778-.1 1.145-.28L5 11.524Zm10 0 1.145 5.075A3.479 3.479 0 0 1 15 16.88c-.37 0-.778-.1-1.145-.28L15 11.524Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}
