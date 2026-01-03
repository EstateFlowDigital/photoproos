"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioUrl: string;
  portfolioName: string;
}

export function QRCodeModal({
  isOpen,
  onClose,
  portfolioUrl,
  portfolioName,
}: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState<"small" | "medium" | "large">("medium");
  const [downloading, setDownloading] = useState(false);

  const sizeMap = {
    small: 200,
    medium: 300,
    large: 400,
  };

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, portfolioUrl, {
        width: sizeMap[size],
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
    }
  }, [isOpen, portfolioUrl, size]);

  const handleDownload = async () => {
    if (!canvasRef.current) return;

    setDownloading(true);
    try {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${portfolioName.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current?.toBlob((b) => {
          if (b) resolve(b);
        }, "image/png");
      });

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
    } catch {
      // Fallback: copy URL instead
      await navigator.clipboard.writeText(portfolioUrl);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Portfolio QR Code
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* QR Code */}
        <div className="mb-6 flex flex-col items-center">
          <div className="rounded-xl bg-white p-4">
            <canvas ref={canvasRef} />
          </div>
          <p className="mt-3 text-center text-sm text-foreground-muted">
            Scan to view portfolio
          </p>
        </div>

        {/* Size Selector */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Size
          </label>
          <div className="flex gap-2">
            {(["small", "medium", "large"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors",
                  size === s
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "border-[var(--card-border)] text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
                )}
              >
                {s} ({sizeMap[s]}px)
              </button>
            ))}
          </div>
        </div>

        {/* URL Display */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Portfolio URL
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2">
            <span className="flex-1 truncate text-sm text-foreground-muted">
              {portfolioUrl}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(portfolioUrl)}
              className="shrink-0 text-foreground-muted transition-colors hover:text-foreground"
              title="Copy URL"
            >
              <CopyIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCopyImage}
            className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            Copy Image
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            {downloading ? "Downloading..." : "Download PNG"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Icons
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}
