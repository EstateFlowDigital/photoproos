"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Globe,
  MoreHorizontal,
  X,
  ThumbsUp,
  MessageCircle,
  Share2,
} from "lucide-react";

interface FacebookPreviewProps {
  type?: "post" | "story";
  text: string;
  authorName: string;
  authorAvatar?: string;
  reactions?: number;
  comments?: number;
  shares?: number;
  timestamp?: string;
  privacy?: "public" | "friends" | "only_me";
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
  // Split by hashtags and mentions
  const parts = text.split(/(#\w+|@\w+)/g);

  return parts.map((part, index) => {
    if (part.startsWith("#") || part.startsWith("@")) {
      return (
        <span key={index} className="text-[#0866ff] hover:underline cursor-pointer">
          {part}
        </span>
      );
    }
    return part;
  });
}

// Facebook reaction icons as SVG
function LikeReaction({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className}>
      <defs>
        <linearGradient id="fb-like-gradient" x1="50%" x2="50%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#18afff" />
          <stop offset="100%" stopColor="#0062df" />
        </linearGradient>
      </defs>
      <circle cx="8" cy="8" r="8" fill="url(#fb-like-gradient)" />
      <path
        d="M12.162 7.338c.176.123.338.245.338.674 0 .43-.229.604-.474.725.1.163.132.36.089.546-.077.344-.392.611-.672.69.121.194.159.385.015.62-.185.295-.346.407-1.058.407H7.5c-.988 0-1.5-.546-1.5-1V7.665c0-1.23 1.467-2.275 1.467-3.13L7.361 3.47c-.005-.065.008-.224.058-.27.08-.079.301-.2.635-.2.218 0 .363.041.534.123.581.277.732.978.732 1.542 0 .271-.414 1.083-.47 1.364 0 0 .867-.192 1.879-.199 1.061-.006 1.749.19 1.749.842 0 .261-.219.523-.316.666z"
        fill="#fff"
      />
    </svg>
  );
}

function LoveReaction({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className}>
      <defs>
        <linearGradient id="fb-love-gradient" x1="50%" x2="50%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#ff6680" />
          <stop offset="100%" stopColor="#e61739" />
        </linearGradient>
      </defs>
      <circle cx="8" cy="8" r="8" fill="url(#fb-love-gradient)" />
      <path
        d="M10.473 4C8.275 4 8 5.824 8 5.824S7.726 4 5.528 4c-2.114 0-2.73 2.222-2.472 3.41C3.736 10.55 8 12.75 8 12.75s4.265-2.2 4.945-5.34c.257-1.188-.36-3.41-2.472-3.41"
        fill="#fff"
      />
    </svg>
  );
}

function CareReaction({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className}>
      <defs>
        <linearGradient id="fb-care-gradient" x1="50%" x2="50%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#f7b125" />
          <stop offset="100%" stopColor="#dd9a08" />
        </linearGradient>
      </defs>
      <circle cx="8" cy="8" r="8" fill="url(#fb-care-gradient)" />
      <path
        d="M8 4.5c-1.657 0-3 1.567-3 3.5 0 1.655 1.122 3.055 2.188 3.703.493.3 1.131.547 1.812.547s1.319-.247 1.812-.547C11.878 11.055 13 9.655 13 8c0-1.933-1.343-3.5-3-3.5H8z"
        fill="#fff"
      />
      <ellipse cx="6.5" cy="7.5" rx=".5" ry=".75" fill="#65676B" />
      <ellipse cx="9.5" cy="7.5" rx=".5" ry=".75" fill="#65676B" />
      <path
        d="M8 10c-.828 0-1.5-.448-1.5-1h3c0 .552-.672 1-1.5 1z"
        fill="#65676B"
      />
    </svg>
  );
}

export function FacebookPreview({
  type = "post",
  text,
  authorName,
  authorAvatar,
  reactions = 0,
  comments = 0,
  shares = 0,
  timestamp = "2h",
  privacy = "public",
  children,
  className,
}: FacebookPreviewProps) {
  if (type === "story") {
    return (
      <div
        className={cn(
          "facebook-story-preview w-[125px] h-[222px] rounded-lg overflow-hidden relative bg-gradient-to-b from-[#0866ff] to-[#0556e8]",
          className
        )}
      >
        {/* Story Content */}
        <div className="absolute inset-0">
          {children || (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white/50 text-xs">Add media</span>
            </div>
          )}
        </div>

        {/* Avatar Ring */}
        <div className="absolute top-2 left-2 p-0.5 rounded-full bg-[#0866ff] ring-2 ring-[#0866ff]">
          {authorAvatar ? (
            <img
              src={authorAvatar}
              alt={authorName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-[#e4e6eb] flex items-center justify-center">
              <span className="text-xs font-semibold text-[#65676b]">
                {authorName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Name at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
          <span className="text-white text-xs font-medium line-clamp-2">
            {authorName}
          </span>
        </div>
      </div>
    );
  }

  // Feed Post
  return (
    <div
      className={cn(
        "facebook-preview w-[500px] bg-white text-[#050505] font-['Segoe_UI','Helvetica_Neue',Helvetica,Arial,sans-serif] rounded-lg shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-3 pb-0">
        <div className="flex gap-2">
          {/* Avatar */}
          {authorAvatar ? (
            <img
              src={authorAvatar}
              alt={authorName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-[#e4e6eb] flex items-center justify-center">
              <span className="text-sm font-semibold text-[#65676b]">
                {authorName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Name and meta */}
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-[15px] text-[#050505] hover:underline cursor-pointer">
                {authorName}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[#65676b] text-[13px]">
              <span>{timestamp}</span>
              <span>·</span>
              {privacy === "public" && <Globe className="h-3 w-3" />}
              {privacy === "friends" && (
                <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3.5 7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm9 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM8 9c2.21 0 4 1.12 4 2.5V13H4v-1.5C4 10.12 5.79 9 8 9z" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button className="p-2 -m-2 text-[#65676b] hover:bg-[#f0f2f5] rounded-full transition-colors">
            <MoreHorizontal className="h-5 w-5" />
          </button>
          <button className="p-2 -m-2 text-[#65676b] hover:bg-[#f0f2f5] rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Text */}
      {text && (
        <div className="px-3 py-2 text-[15px] leading-[1.3333] whitespace-pre-wrap">
          {formatText(text)}
        </div>
      )}

      {/* Media */}
      {children && <div className="w-full">{children}</div>}

      {/* Reactions Summary */}
      {(reactions > 0 || comments > 0 || shares > 0) && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#ced0d4]">
          {/* Reaction icons + count */}
          <div className="flex items-center gap-1">
            {reactions > 0 && (
              <>
                <div className="flex -space-x-1">
                  <LikeReaction className="h-[18px] w-[18px]" />
                  <LoveReaction className="h-[18px] w-[18px]" />
                  <CareReaction className="h-[18px] w-[18px]" />
                </div>
                <span className="text-[15px] text-[#65676b] ml-1">
                  {formatCount(reactions)}
                </span>
              </>
            )}
          </div>

          {/* Comments + Shares */}
          <div className="flex items-center gap-3 text-[15px] text-[#65676b]">
            {comments > 0 && (
              <span className="hover:underline cursor-pointer">
                {formatCount(comments)} comments
              </span>
            )}
            {shares > 0 && (
              <span className="hover:underline cursor-pointer">
                {formatCount(shares)} shares
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-around px-2 py-1">
        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[#65676b] hover:bg-[#f0f2f5] transition-colors">
          <ThumbsUp className="h-5 w-5" />
          <span className="font-semibold text-[15px]">Like</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[#65676b] hover:bg-[#f0f2f5] transition-colors">
          <MessageCircle className="h-5 w-5" />
          <span className="font-semibold text-[15px]">Comment</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[#65676b] hover:bg-[#f0f2f5] transition-colors">
          <Share2 className="h-5 w-5" />
          <span className="font-semibold text-[15px]">Share</span>
        </button>
      </div>
    </div>
  );
}
