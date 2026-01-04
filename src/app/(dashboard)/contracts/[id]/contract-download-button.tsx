"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { generateContractPdf } from "@/lib/actions/contract-pdf";

interface ContractDownloadButtonProps {
  contractId: string;
}

export function ContractDownloadButton({ contractId }: ContractDownloadButtonProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const result = await generateContractPdf(contractId);

      if (!result.success || !result.pdfBuffer) {
        showToast(result.error || "Failed to generate contract PDF", "error");
        return;
      }

      // Convert base64 to blob and download
      const byteCharacters = atob(result.pdfBuffer);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename || `contract-${contractId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Contract PDF downloaded", "success");
    } catch {
      showToast("Failed to download contract", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className="flex items-center gap-3 w-full rounded-lg border border-[var(--card-border)] px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-secondary)] disabled:opacity-50"
    >
      <DownloadIcon className="h-4 w-4 text-foreground-muted" />
      {isLoading ? "Generating PDF..." : "Download PDF"}
    </button>
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
