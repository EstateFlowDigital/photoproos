"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  primaryColor?: string;
}

export function ShareButtons({
  url,
  title,
  description = "",
  imageUrl = "",
  primaryColor = "#3b82f6",
}: ShareButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedImage = encodeURIComponent(imageUrl);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    const shareUrl = shareLinks[platform];
    window.open(
      shareUrl,
      "share",
      "width=600,height=400,resizable=yes,scrollbars=yes"
    );
  };

  // Native share if available
  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Share Menu */}
      <div
        className={cn(
          "absolute bottom-14 right-0 mb-2 overflow-x-auto rounded-xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-md transition-all duration-200",
          isOpen
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        )}
      >
        <div className="p-2">
          <p className="mb-2 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/50">
            Share this portfolio
          </p>

          {/* Twitter/X */}
          <button
            onClick={() => handleShare("twitter")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-white transition-colors hover:bg-white/10"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black">
              <XIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">X (Twitter)</span>
          </button>

          {/* Facebook */}
          <button
            onClick={() => handleShare("facebook")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-white transition-colors hover:bg-white/10"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1877F2]">
              <FacebookIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">Facebook</span>
          </button>

          {/* LinkedIn */}
          <button
            onClick={() => handleShare("linkedin")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-white transition-colors hover:bg-white/10"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0A66C2]">
              <LinkedInIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">LinkedIn</span>
          </button>

          {/* Pinterest */}
          <button
            onClick={() => handleShare("pinterest")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-white transition-colors hover:bg-white/10"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E60023]">
              <PinterestIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">Pinterest</span>
          </button>

          <div className="my-2 border-t border-white/10" />

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-white transition-colors hover:bg-white/10"
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              {copied ? (
                <CheckIcon className="h-4 w-4 text-white" />
              ) : (
                <LinkIcon className="h-4 w-4 text-white" />
              )}
            </div>
            <span className="text-sm font-medium">
              {copied ? "Copied!" : "Copy Link"}
            </span>
          </button>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => {
          if (typeof navigator !== "undefined" && "share" in navigator) {
            handleNativeShare();
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-105",
          isOpen ? "bg-white/20" : "bg-black/80"
        )}
        style={{
          backgroundColor: isOpen ? undefined : primaryColor,
        }}
        title="Share this portfolio"
      >
        {isOpen ? (
          <CloseIcon className="h-5 w-5 text-white" />
        ) : (
          <ShareIcon className="h-5 w-5 text-white" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Icons
function ShareIcon({ className }: { className?: string }) {
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
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
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

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
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
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
