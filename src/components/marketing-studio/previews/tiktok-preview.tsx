"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Music2,
  Plus,
  BadgeCheck,
} from "lucide-react";

interface TikTokPreviewProps {
  type?: "video" | "photo";
  caption: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  likes?: number;
  comments?: number;
  bookmarks?: number;
  shares?: number;
  soundName?: string;
  isVerified?: boolean;
  children?: React.ReactNode;
  className?: string;
}

function formatCount(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

function formatCaption(text: string): React.ReactNode {
  // Split by hashtags and mentions
  const parts = text.split(/(#\w+|@\w+)/g);

  return parts.map((part, index) => {
    if (part.startsWith("#") || part.startsWith("@")) {
      return (
        <span key={index} className="font-semibold">
          {part}
        </span>
      );
    }
    return part;
  });
}

export function TikTokPreview({
  type = "video",
  caption,
  authorName,
  authorHandle,
  authorAvatar,
  likes = 0,
  comments = 0,
  bookmarks = 0,
  shares = 0,
  soundName = "Original sound",
  isVerified = false,
  children,
  className,
}: TikTokPreviewProps) {
  return (
    <div
      className={cn(
        "tiktok-preview w-[360px] h-[640px] bg-black text-white font-['TikTokFont',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] relative overflow-hidden rounded-lg",
        className
      )}
    >
      {/* Video/Image Content */}
      <div className="absolute inset-0">
        {children || (
          <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
            <span className="text-white/30 text-sm">Video preview</span>
          </div>
        )}
      </div>

      {/* Gradient overlay at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

      {/* Right side actions */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
        {/* Avatar with follow button */}
        <div className="relative">
          {authorAvatar ? (
            <img
              src={authorAvatar}
              alt={authorName}
              className="h-12 w-12 rounded-full object-cover border-2 border-white"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-[#fe2c55] flex items-center justify-center border-2 border-white">
              <span className="text-sm font-bold text-white">
                {authorName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <button className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-[#fe2c55] flex items-center justify-center">
            <Plus className="h-3 w-3 text-white" strokeWidth={3} />
          </button>
        </div>

        {/* Like */}
        <button className="flex flex-col items-center">
          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs font-semibold mt-1">{formatCount(likes)}</span>
        </button>

        {/* Comments */}
        <button className="flex flex-col items-center">
          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs font-semibold mt-1">{formatCount(comments)}</span>
        </button>

        {/* Bookmark */}
        <button className="flex flex-col items-center">
          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
            <Bookmark className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs font-semibold mt-1">{formatCount(bookmarks)}</span>
        </button>

        {/* Share */}
        <button className="flex flex-col items-center">
          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
            <Share2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs font-semibold mt-1">{formatCount(shares)}</span>
        </button>

        {/* Spinning disc */}
        <div className="h-11 w-11 rounded-full bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 flex items-center justify-center border-4 border-gray-800 animate-spin-slow">
          {authorAvatar ? (
            <img
              src={authorAvatar}
              alt=""
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <Music2 className="h-3 w-3 text-white" />
          )}
        </div>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 p-4 pr-20">
        {/* Username */}
        <div className="flex items-center gap-1 mb-2">
          <span className="font-bold text-[16px]">@{authorHandle}</span>
          {isVerified && (
            <BadgeCheck className="h-4 w-4 text-[#20d5ec]" />
          )}
        </div>

        {/* Caption */}
        <div className="text-sm leading-snug mb-3 line-clamp-3">
          {formatCaption(caption)}
        </div>

        {/* Sound */}
        <div className="flex items-center gap-2">
          <Music2 className="h-4 w-4" />
          <div className="overflow-hidden">
            <span className="text-sm whitespace-nowrap animate-marquee">
              {soundName} - {authorName}
            </span>
          </div>
        </div>
      </div>

      {/* Add custom animation styles */}
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
