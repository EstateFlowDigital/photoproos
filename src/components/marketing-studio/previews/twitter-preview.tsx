"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  Repeat2,
  Heart,
  BarChart2,
  Share,
  Bookmark,
  MoreHorizontal,
  BadgeCheck,
} from "lucide-react";

interface TwitterPreviewProps {
  type?: "tweet" | "quote" | "reply";
  text: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  likes?: number;
  retweets?: number;
  replies?: number;
  views?: number;
  quotes?: number;
  bookmarks?: number;
  timestamp?: string;
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

function formatText(text: string): React.ReactNode {
  // Split by hashtags, mentions, and URLs
  const parts = text.split(/(#\w+|@\w+|https?:\/\/\S+)/g);

  return parts.map((part, index) => {
    if (part.startsWith("#")) {
      return (
        <span key={index} className="text-[#1d9bf0]">
          {part}
        </span>
      );
    }
    if (part.startsWith("@")) {
      return (
        <span key={index} className="text-[#1d9bf0]">
          {part}
        </span>
      );
    }
    if (part.startsWith("http")) {
      return (
        <span key={index} className="text-[#1d9bf0]">
          {part}
        </span>
      );
    }
    return part;
  });
}

export function TwitterPreview({
  type = "tweet",
  text,
  authorName,
  authorHandle,
  authorAvatar,
  likes = 0,
  retweets = 0,
  replies = 0,
  views = 0,
  quotes = 0,
  bookmarks = 0,
  timestamp = "2h",
  isVerified = false,
  children,
  className,
}: TwitterPreviewProps) {
  return (
    <div
      className={cn(
        "twitter-preview w-[598px] bg-black text-white font-['Chirp',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]",
        className
      )}
    >
      <article className="border-b border-[#2f3336] px-4 py-3">
        {/* Author Row */}
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-[#1d9bf0] flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {authorName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-bold text-[15px] text-white truncate">
                  {authorName}
                </span>
                {isVerified && (
                  <BadgeCheck className="h-[18px] w-[18px] text-[#1d9bf0] flex-shrink-0" />
                )}
                <span className="text-[#71767b] text-[15px] truncate">
                  @{authorHandle}
                </span>
                <span className="text-[#71767b] text-[15px]">·</span>
                <span className="text-[#71767b] text-[15px] hover:underline cursor-pointer">
                  {timestamp}
                </span>
              </div>
              <button className="p-2 -m-2 text-[#71767b] hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10 rounded-full transition-colors">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            {/* Tweet Text */}
            <div className="mt-1 text-[15px] leading-5 whitespace-pre-wrap break-words">
              {formatText(text)}
            </div>

            {/* Media Content */}
            {children && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-[#2f3336]">
                {children}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-3 max-w-[425px] -ml-2">
              {/* Reply */}
              <button className="group flex items-center gap-1">
                <div className="p-2 rounded-full text-[#71767b] group-hover:text-[#1d9bf0] group-hover:bg-[#1d9bf0]/10 transition-colors">
                  <MessageCircle className="h-[18px] w-[18px]" />
                </div>
                {replies > 0 && (
                  <span className="text-[13px] text-[#71767b] group-hover:text-[#1d9bf0]">
                    {formatCount(replies)}
                  </span>
                )}
              </button>

              {/* Retweet */}
              <button className="group flex items-center gap-1">
                <div className="p-2 rounded-full text-[#71767b] group-hover:text-[#00ba7c] group-hover:bg-[#00ba7c]/10 transition-colors">
                  <Repeat2 className="h-[18px] w-[18px]" />
                </div>
                {retweets > 0 && (
                  <span className="text-[13px] text-[#71767b] group-hover:text-[#00ba7c]">
                    {formatCount(retweets)}
                  </span>
                )}
              </button>

              {/* Like */}
              <button className="group flex items-center gap-1">
                <div className="p-2 rounded-full text-[#71767b] group-hover:text-[#f91880] group-hover:bg-[#f91880]/10 transition-colors">
                  <Heart className="h-[18px] w-[18px]" />
                </div>
                {likes > 0 && (
                  <span className="text-[13px] text-[#71767b] group-hover:text-[#f91880]">
                    {formatCount(likes)}
                  </span>
                )}
              </button>

              {/* Views */}
              <button className="group flex items-center gap-1">
                <div className="p-2 rounded-full text-[#71767b] group-hover:text-[#1d9bf0] group-hover:bg-[#1d9bf0]/10 transition-colors">
                  <BarChart2 className="h-[18px] w-[18px]" />
                </div>
                {views > 0 && (
                  <span className="text-[13px] text-[#71767b] group-hover:text-[#1d9bf0]">
                    {formatCount(views)}
                  </span>
                )}
              </button>

              {/* Bookmark & Share */}
              <div className="flex items-center">
                <button className="p-2 rounded-full text-[#71767b] hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10 transition-colors">
                  <Bookmark className="h-[18px] w-[18px]" />
                </button>
                <button className="p-2 rounded-full text-[#71767b] hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10 transition-colors">
                  <Share className="h-[18px] w-[18px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
