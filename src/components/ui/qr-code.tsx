"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
  logo?: string;
  backgroundColor?: string;
  foregroundColor?: string;
}

export function QRCodeDisplay({
  value,
  size = 200,
  className = "",
  backgroundColor = "#ffffff",
  foregroundColor = "#000000",
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 2,
          color: {
            dark: foregroundColor,
            light: backgroundColor,
          },
          errorCorrectionLevel: "M",
        },
        (err) => {
          if (err) {
            setError("Failed to generate QR code");
            console.error("QR Code generation error:", err);
          }
        }
      );
    }
  }, [value, size, backgroundColor, foregroundColor]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-[var(--background)] rounded-lg ${className}`} style={{ width: size, height: size }}>
        <span className="text-xs text-foreground-muted">QR Error</span>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`rounded-lg ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

interface QRCodeModalProps {
  url: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export function QRCodeModal({ url, title, isOpen, onClose }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownloadQR = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
        errorCorrectionLevel: "H",
      });

      const link = document.createElement("a");
      link.download = `${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-qr-code.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download QR code:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[var(--card)] rounded-xl border border-[var(--card-border)] shadow-2xl m-4 overflow-hidden">
        <div className="flex items-start justify-between gap-4 flex-wrap p-5 border-b border-[var(--card-border)]">
          <h2 className="text-lg font-semibold text-foreground">Gallery QR Code</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)] transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-xl">
            <QRCodeDisplay value={url} size={200} />
          </div>

          <p className="text-sm text-foreground-muted text-center">
            Scan to access <span className="font-medium text-foreground">{title}</span>
          </p>

          <div className="w-full space-y-2">
            <button
              onClick={handleCopyLink}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              {copied ? (
                <>
                  <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                  Copied!
                </>
              ) : (
                <>
                  <CopyIcon className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </button>

            <button
              onClick={handleDownloadQR}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              <DownloadIcon className="h-4 w-4" />
              Download QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
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

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}
