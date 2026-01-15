"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { LinkedInPreviewProps } from "../types";
import {
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Send,
  MoreHorizontal,
  Globe,
} from "lucide-react";

interface Props extends LinkedInPreviewProps {
  className?: string;
  children?: React.ReactNode; // For mockup content
}

// LinkedIn reaction icons
function LikeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.46 11l-3.91-3.91a7 7 0 01-1.69-2.74l-.49-1.47A2.76 2.76 0 0010.76 1 2.75 2.75 0 008 3.74v1.12a9.19 9.19 0 00.46 2.85L8.89 9H4.12A2.12 2.12 0 002 11.12a2.16 2.16 0 00.92 1.76A2.11 2.11 0 002 14.62a2.14 2.14 0 001.28 2 2 2 0 00-.28 1 2.12 2.12 0 002 2.12v.14A2.12 2.12 0 007.12 22h7.49a8.08 8.08 0 003.58-.84l.31-.16H21V11zM19 19h-1l-.73.37a6.14 6.14 0 01-2.69.63H7.72a1 1 0 01-1-.72l-.25-.87-.85-.41A1 1 0 015 17l.17-1-.76-.74A1 1 0 014.27 14l.66-1.09-.73-.72a1 1 0 01.09-1.46l.81-.59H12a1 1 0 00.95-1.32l-.75-2.27A7.14 7.14 0 0112 4.86v-1.1a.76.76 0 01.76-.75.77.77 0 01.74.62l.49 1.47a9 9 0 002.16 3.52l3.35 3.35V19z" />
    </svg>
  );
}

function CelebrateIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M11.08 7.5a1 1 0 10-2 0 1 1 0 002 0zm5 0a1 1 0 10-2 0 1 1 0 002 0zm2.68 2.21a1 1 0 00-.66-.1l-2.78.57a3.31 3.31 0 00-2.16-3.63l2.4-2.65A1 1 0 0015.1 2.5a1 1 0 00-.73.36l-2.67 2.95a3.18 3.18 0 00-3.37.09L5.54 3a1 1 0 00-1.41.18 1 1 0 00.19 1.4L7.11 7a3.3 3.3 0 00.28 3.77l-4.3 5.35a1 1 0 00.14 1.4 1 1 0 001.41-.14l4.3-5.35a3.29 3.29 0 003.35.31l2.57 3.1a1 1 0 001.4.14 1 1 0 00.14-1.4l-2.57-3.1a3.31 3.31 0 00-.07-3.49l2.86-.58 1.19 5.73a1 1 0 002-.41l-1.19-5.73a1 1 0 00-.47-.59zM9 9.5a1.31 1.31 0 111.31 1.31A1.31 1.31 0 019 9.5z" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z" />
    </svg>
  );
}

export function LinkedInPreview({
  type = "post",
  image,
  text,
  authorName,
  authorTitle,
  authorAvatar,
  reactions,
  comments,
  reposts,
  connectionDegree = "1st",
  className,
  children,
}: Props) {
  const [showMore, setShowMore] = React.useState(false);

  // Format numbers with K suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  };

  // Truncate text
  const shouldTruncate = text.length > 200 && !showMore;
  const truncatedText = shouldTruncate ? text.slice(0, 200).trim() + "..." : text;

  return (
    <div
      className={cn(
        "linkedin-preview w-[320px] bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="p-3 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            {/* Avatar */}
            <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 shrink-0">
              {authorAvatar ? (
                <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-[#0a66c2] flex items-center justify-center text-white text-lg font-semibold">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Author Info */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-gray-900 hover:text-[#0a66c2] hover:underline cursor-pointer truncate">
                  {authorName}
                </span>
                <span className="text-xs text-gray-500">
                  {"\u2022"} {connectionDegree}
                </span>
              </div>
              <span className="text-xs text-gray-600 truncate">{authorTitle}</span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>Now</span>
                <span>{"\u2022"}</span>
                <Globe className="h-3 w-3" />
              </div>
            </div>
          </div>

          <button className="text-gray-500 hover:bg-gray-100 p-1 rounded">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Text Content */}
      {text && (
        <div className="px-3 pb-2">
          <p className="text-sm text-gray-900 whitespace-pre-wrap">
            {truncatedText.split(/(#\w+)/g).map((part, i) =>
              part.startsWith("#") ? (
                <span key={i} className="text-[#0a66c2] hover:underline cursor-pointer">
                  {part}
                </span>
              ) : (
                part
              )
            )}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setShowMore(true)}
              className="text-sm text-gray-500 hover:text-[#0a66c2] hover:underline"
            >
              ...see more
            </button>
          )}
        </div>
      )}

      {/* Image/Content */}
      <div className="bg-gray-100">
        {children ? (
          <div className="aspect-[1.91/1]">{children}</div>
        ) : image ? (
          <img src={image} alt="Post" className="w-full aspect-[1.91/1] object-cover" />
        ) : (
          <div className="w-full aspect-[1.91/1] flex items-center justify-center bg-gray-50">
            <span className="text-gray-400 text-sm">Add content</span>
          </div>
        )}
      </div>

      {/* Reactions Summary */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center">
          {/* Reaction icons */}
          <div className="flex -space-x-1">
            <div className="h-4 w-4 rounded-full bg-[#0a66c2] flex items-center justify-center">
              <LikeIcon className="h-2.5 w-2.5 text-white" />
            </div>
            <div className="h-4 w-4 rounded-full bg-[#44712e] flex items-center justify-center">
              <CelebrateIcon className="h-2.5 w-2.5 text-white" />
            </div>
            <div className="h-4 w-4 rounded-full bg-[#df704d] flex items-center justify-center">
              <HeartIcon className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <span className="ml-2 text-xs text-gray-500">{formatNumber(reactions)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{formatNumber(comments)} comments</span>
          <span>{"\u2022"}</span>
          <span>{formatNumber(reposts)} reposts</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-2 py-1 flex items-center justify-between">
        <button className="flex-1 flex items-center justify-center gap-1 py-3 text-gray-600 hover:bg-gray-100 rounded transition-colors">
          <ThumbsUp className="h-5 w-5" />
          <span className="text-xs font-semibold">Like</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 py-3 text-gray-600 hover:bg-gray-100 rounded transition-colors">
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs font-semibold">Comment</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 py-3 text-gray-600 hover:bg-gray-100 rounded transition-colors">
          <Repeat2 className="h-5 w-5" />
          <span className="text-xs font-semibold">Repost</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 py-3 text-gray-600 hover:bg-gray-100 rounded transition-colors">
          <Send className="h-5 w-5" />
          <span className="text-xs font-semibold">Send</span>
        </button>
      </div>
    </div>
  );
}
