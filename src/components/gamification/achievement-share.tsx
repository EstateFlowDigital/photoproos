"use client";

import { useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Share2,
  Copy,
  Check,
  X,
  Twitter,
  Linkedin,
  Link2,
} from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { AchievementBadge } from "./achievement-badge";
import type { AchievementRarity, AchievementCategory } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

export interface ShareableAchievement {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xpReward: number;
  unlockedAt?: Date;
}

interface AchievementShareButtonProps {
  achievement: ShareableAchievement;
  userName?: string;
  className?: string;
}

interface AchievementShareModalProps {
  achievement: ShareableAchievement;
  userName?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ShareOption {
  id: string;
  name: string;
  icon: typeof Twitter;
  color: string;
  onClick: (text: string, url: string) => void;
}

// ============================================================================
// HELPERS
// ============================================================================

function generateShareText(achievement: ShareableAchievement, userName?: string): string {
  const name = userName ? `${userName} just` : "I just";
  return `${name} unlocked the "${achievement.name}" achievement on ListingLens! ${getRarityEmoji(achievement.rarity)}`;
}

function getRarityEmoji(rarity: AchievementRarity): string {
  switch (rarity) {
    case "legendary":
      return "🏆";
    case "epic":
      return "💎";
    case "rare":
      return "⭐";
    case "uncommon":
      return "🎯";
    default:
      return "✨";
  }
}

function generateShareUrl(achievement: ShareableAchievement): string {
  // This would typically link to a public achievement page
  // For now, we'll use a placeholder URL structure
  if (typeof window !== "undefined") {
    return `${window.location.origin}/achievements/${achievement.slug}`;
  }
  return `/achievements/${achievement.slug}`;
}

// Share handlers
function shareToTwitter(text: string, _url: string): void {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(twitterUrl, "_blank", "noopener,noreferrer");
}

function shareToLinkedIn(text: string, url: string): void {
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`;
  window.open(linkedInUrl, "_blank", "noopener,noreferrer");
}

// ============================================================================
// SHARE OPTIONS
// ============================================================================

const shareOptions: ShareOption[] = [
  {
    id: "twitter",
    name: "Twitter / X",
    icon: Twitter,
    color: "hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]",
    onClick: shareToTwitter,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]",
    onClick: shareToLinkedIn,
  },
];

// ============================================================================
// SHARE BUTTON
// ============================================================================

export const AchievementShareButton = memo(function AchievementShareButton({
  achievement,
  userName,
  className,
}: AchievementShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          "bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]",
          className
        )}
        aria-label="Share achievement"
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
        Share
      </button>

      <AchievementShareModal
        achievement={achievement}
        userName={userName}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
});

// ============================================================================
// SHARE MODAL
// ============================================================================

export const AchievementShareModal = memo(function AchievementShareModal({
  achievement,
  userName,
  isOpen,
  onClose,
}: AchievementShareModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const shareText = generateShareText(achievement, userName);
  const shareUrl = generateShareUrl(achievement);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [shareUrl]);

  const handleShare = useCallback(
    (option: ShareOption) => {
      option.onClick(shareText, shareUrl);
      onClose();
    },
    [shareText, shareUrl, onClose]
  );

  const overlayVariants = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  const modalVariants = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.95, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 10 },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={overlayVariants.initial}
            animate={overlayVariants.animate}
            exit={overlayVariants.exit}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={modalVariants.initial}
            animate={modalVariants.animate}
            exit={modalVariants.exit}
            transition={prefersReducedMotion ? { duration: 0.15 } : { type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-title"
          >
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 flex-wrap px-5 py-4 border-b border-[var(--card-border)]">
                <h2 id="share-title" className="text-lg font-semibold text-[var(--foreground)]">
                  Share Achievement
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)] transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* Achievement Preview */}
              <div className="p-5 border-b border-[var(--card-border)]">
                <div className="flex items-center gap-4 rounded-xl bg-[var(--background-secondary)] p-4">
                  <AchievementBadge
                    achievement={{
                      slug: achievement.slug,
                      name: achievement.name,
                      description: achievement.description,
                      icon: achievement.icon,
                      category: achievement.category,
                      rarity: achievement.rarity,
                      xpReward: achievement.xpReward,
                      trigger: { type: "manual" as const },
                    }}
                    isUnlocked={true}
                    size="sm"
                    showName={false}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--foreground)] truncate">
                      {achievement.name}
                    </p>
                    <p className="text-xs text-[var(--foreground-muted)] truncate">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Share Preview Text */}
              <div className="px-5 py-4 border-b border-[var(--card-border)]">
                <p className="text-xs text-[var(--foreground-muted)] mb-2">Preview</p>
                <p className="text-sm text-[var(--foreground)]">{shareText}</p>
              </div>

              {/* Share Options */}
              <div className="p-5">
                <p className="text-xs text-[var(--foreground-muted)] mb-3">Share to</p>
                <div className="grid grid-cols-2 gap-3">
                  {shareOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleShare(option)}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] px-4 py-3 text-sm font-medium transition-colors",
                          "text-[var(--foreground)]",
                          option.color
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {option.name}
                      </button>
                    );
                  })}
                </div>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className={cn(
                    "mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] px-4 py-3 text-sm font-medium transition-colors",
                    copied
                      ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30"
                      : "text-[var(--foreground)] hover:bg-[var(--background-hover)]"
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4" aria-hidden="true" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

// ============================================================================
// INLINE SHARE ICONS
// ============================================================================

interface AchievementShareIconsProps {
  achievement: ShareableAchievement;
  userName?: string;
  size?: "sm" | "md";
  className?: string;
}

export const AchievementShareIcons = memo(function AchievementShareIcons({
  achievement,
  userName,
  size = "md",
  className,
}: AchievementShareIconsProps) {
  const [copied, setCopied] = useState(false);

  const shareText = generateShareText(achievement, userName);
  const shareUrl = generateShareUrl(achievement);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [shareUrl]);

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const buttonSize = size === "sm" ? "p-1.5" : "p-2";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        onClick={() => shareToTwitter(shareText, shareUrl)}
        className={cn(
          "rounded-lg transition-colors",
          "text-[var(--foreground-muted)] hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]",
          buttonSize
        )}
        aria-label="Share to Twitter"
      >
        <Twitter className={iconSize} aria-hidden="true" />
      </button>
      <button
        onClick={() => shareToLinkedIn(shareText, shareUrl)}
        className={cn(
          "rounded-lg transition-colors",
          "text-[var(--foreground-muted)] hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]",
          buttonSize
        )}
        aria-label="Share to LinkedIn"
      >
        <Linkedin className={iconSize} aria-hidden="true" />
      </button>
      <button
        onClick={handleCopyLink}
        className={cn(
          "rounded-lg transition-colors",
          copied
            ? "bg-[var(--success)]/10 text-[var(--success)]"
            : "text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]",
          buttonSize
        )}
        aria-label={copied ? "Copied" : "Copy link"}
      >
        {copied ? (
          <Check className={iconSize} aria-hidden="true" />
        ) : (
          <Copy className={iconSize} aria-hidden="true" />
        )}
      </button>
    </div>
  );
});

// ============================================================================
// HOOK FOR SHARE FUNCTIONALITY
// ============================================================================

export function useAchievementShare(achievement: ShareableAchievement, userName?: string) {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = generateShareText(achievement, userName);
  const shareUrl = generateShareUrl(achievement);

  const shareToTwitter = useCallback(() => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  }, [shareText]);

  const shareToLinkedIn = useCallback(() => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`;
    window.open(linkedInUrl, "_blank", "noopener,noreferrer");
  }, [shareText, shareUrl]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (error) {
      console.error("Failed to copy:", error);
      return false;
    }
  }, [shareUrl]);

  const nativeShare = useCallback(async () => {
    if (navigator.share) {
      setIsSharing(true);
      try {
        await navigator.share({
          title: `Achievement Unlocked: ${achievement.name}`,
          text: shareText,
          url: shareUrl,
        });
        return true;
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Share failed:", error);
        }
        return false;
      } finally {
        setIsSharing(false);
      }
    }
    return false;
  }, [achievement.name, shareText, shareUrl]);

  return {
    shareText,
    shareUrl,
    isSharing,
    copied,
    shareToTwitter,
    shareToLinkedIn,
    copyLink,
    nativeShare,
    canNativeShare: typeof navigator !== "undefined" && !!navigator.share,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  ShareableAchievement,
  AchievementShareButtonProps,
  AchievementShareModalProps,
  AchievementShareIconsProps,
};
