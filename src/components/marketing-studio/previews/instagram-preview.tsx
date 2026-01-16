"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { InstagramPreviewProps } from "../types";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Props extends InstagramPreviewProps {
  className?: string;
  children?: React.ReactNode; // For mockup content
  slideCount?: number; // For carousel mode
  currentSlide?: number; // Current slide index (0-based)
  onSlideChange?: (index: number) => void; // Callback when slide changes
}

export function InstagramPreview({
  type = "feed",
  image,
  caption,
  username,
  avatar,
  likes,
  comments,
  timestamp,
  hashtags,
  isVerified,
  className,
  children,
  slideCount = 1,
  currentSlide = 0,
  onSlideChange,
}: Props) {
  const [isLiked, setIsLiked] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);
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

  // Split caption and hashtags
  const displayCaption = caption || "";
  const displayHashtags = hashtags.length > 0 ? hashtags.join(" ") : "";
  const fullCaption = displayHashtags
    ? `${displayCaption}\n\n${displayHashtags}`
    : displayCaption;
  const shouldTruncate = fullCaption.length > 125 && !showMore;
  const truncatedCaption = shouldTruncate
    ? fullCaption.slice(0, 125).trim() + "..."
    : fullCaption;

  if (type === "story") {
    return (
      <div
        className={cn(
          "instagram-preview instagram-story relative w-[270px] h-[480px] rounded-2xl overflow-hidden bg-black",
          className
        )}
      >
        {/* Story Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-3">
          {/* Progress Bar */}
          <div className="h-0.5 bg-white/30 rounded-full mb-3">
            <div className="h-full w-1/3 bg-white rounded-full" />
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-0.5">
              <div className="h-full w-full rounded-full bg-black overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt={username} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold">
                    {username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <span className="text-white text-sm font-medium">{username}</span>
            <span className="text-white/60 text-xs">{timestamp}</span>
          </div>
        </div>

        {/* Story Content */}
        <div className="absolute inset-0">
          {children ? (
            <div className="h-full w-full flex items-center justify-center">
              {children}
            </div>
          ) : image ? (
            <img src={image} alt="Story" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
              <span className="text-white/50 text-sm">Add content</span>
            </div>
          )}
        </div>

        {/* Story Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Send message"
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm placeholder:text-white/60"
              readOnly
            />
            <Heart className="h-6 w-6 text-white" />
            <Send className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    );
  }

  // Feed post
  return (
    <div
      className={cn(
        "instagram-preview instagram-feed w-[320px] bg-white rounded-lg overflow-hidden border border-gray-200",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-0.5">
            <div className="h-full w-full rounded-full bg-white overflow-hidden">
              {avatar ? (
                <img src={avatar} alt={username} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-gray-900">{username}</span>
              {isVerified && (
                <svg className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                </svg>
              )}
            </div>
          </div>
        </div>
        <button className="text-gray-900">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Image/Content */}
      <div className="aspect-square bg-gray-100 relative">
        {children ? (
          <div className="h-full w-full">{children}</div>
        ) : image ? (
          <img src={image} alt="Post" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-50">
            <span className="text-gray-400 text-sm">Add content</span>
          </div>
        )}

        {/* Carousel Navigation Arrows */}
        {slideCount > 1 && (
          <>
            {currentSlide > 0 && (
              <button
                onClick={() => onSlideChange?.(currentSlide - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4 text-gray-700" />
              </button>
            )}
            {currentSlide < slideCount - 1 && (
              <button
                onClick={() => onSlideChange?.(currentSlide + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4 text-gray-700" />
              </button>
            )}
          </>
        )}

        {/* Carousel Dots */}
        {slideCount > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
            {Array.from({ length: slideCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => onSlideChange?.(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === currentSlide
                    ? "w-1.5 bg-blue-500"
                    : "w-1.5 bg-gray-400/50 hover:bg-gray-400"
                )}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === currentSlide ? "true" : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsLiked(!isLiked)}>
              <Heart
                className={cn(
                  "h-6 w-6 transition-colors",
                  isLiked ? "fill-red-500 text-red-500" : "text-gray-900"
                )}
              />
            </button>
            <button>
              <MessageCircle className="h-6 w-6 text-gray-900" />
            </button>
            <button>
              <Send className="h-6 w-6 text-gray-900" />
            </button>
          </div>
          <button onClick={() => setIsSaved(!isSaved)}>
            <Bookmark
              className={cn(
                "h-6 w-6 transition-colors",
                isSaved ? "fill-gray-900 text-gray-900" : "text-gray-900"
              )}
            />
          </button>
        </div>

        {/* Likes */}
        <div className="text-sm font-semibold text-gray-900 mb-1">
          {formatNumber(likes + (isLiked ? 1 : 0))} likes
        </div>

        {/* Caption */}
        {fullCaption && (
          <div className="text-sm">
            <span className="font-semibold text-gray-900 mr-1">{username}</span>
            <span className="text-gray-900 whitespace-pre-wrap">
              {truncatedCaption.split(/(#\w+)/g).map((part, i) =>
                part.startsWith("#") ? (
                  <span key={i} className="text-[#00376b]">
                    {part}
                  </span>
                ) : (
                  part
                )
              )}
            </span>
            {shouldTruncate && (
              <button
                onClick={() => setShowMore(true)}
                className="text-gray-500 ml-1"
              >
                more
              </button>
            )}
          </div>
        )}

        {/* Comments */}
        {comments > 0 && (
          <button className="text-sm text-gray-500 mt-1">
            View all {formatNumber(comments)} comments
          </button>
        )}

        {/* Timestamp */}
        <div className="text-[10px] text-gray-400 uppercase mt-2">{timestamp}</div>
      </div>
    </div>
  );
}
