"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  MoreHorizontal,
  ExternalLink,
  Share2,
  Heart,
} from "lucide-react";

interface PinterestPreviewProps {
  type?: "pin" | "idea";
  title?: string;
  description?: string;
  authorName: string;
  authorAvatar?: string;
  boardName?: string;
  saves?: number;
  sourceUrl?: string;
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

export function PinterestPreview({
  type = "pin",
  title,
  description,
  authorName,
  authorAvatar,
  boardName,
  saves = 0,
  sourceUrl,
  children,
  className,
}: PinterestPreviewProps) {
  // Pin card (2:3 ratio)
  return (
    <div
      className={cn(
        "pinterest-preview w-[236px] font-['Helvetica_Neue',Helvetica,Arial,sans-serif]",
        className
      )}
    >
      {/* Pin Card */}
      <div className="group relative rounded-2xl overflow-hidden bg-[#f0f0f0]">
        {/* Image container - 2:3 aspect ratio */}
        <div className="relative aspect-[2/3]">
          {children || (
            <div className="w-full h-full bg-gradient-to-b from-[#e9e9e9] to-[#d4d4d4] flex items-center justify-center">
              <span className="text-[#767676] text-sm">Pin image</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Top actions */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
              {/* Save button */}
              <button className="px-4 py-2.5 rounded-full bg-[#e60023] text-white font-bold text-sm hover:bg-[#ad081b] transition-colors">
                Save
              </button>

              {/* Board selector */}
              {boardName && (
                <button className="px-3 py-2 rounded-full bg-white/90 text-black font-semibold text-sm hover:bg-white transition-colors flex items-center gap-1">
                  {boardName}
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 19.5L5 12.5l1.5-1.5 5.5 5.5 5.5-5.5 1.5 1.5z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Bottom actions */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              {/* Source link */}
              {sourceUrl && (
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/90 text-black text-sm hover:bg-white transition-colors">
                  <ExternalLink className="h-4 w-4" />
                  <span className="max-w-[100px] truncate">{sourceUrl}</span>
                </button>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <button className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                  <Share2 className="h-4 w-4 text-black" />
                </button>
                <button className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                  <MoreHorizontal className="h-4 w-4 text-black" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pin info */}
      <div className="pt-2 px-1">
        {/* Title */}
        {title && (
          <h3 className="text-[14px] font-semibold text-[#111111] line-clamp-2 leading-snug">
            {title}
          </h3>
        )}

        {/* Description */}
        {description && (
          <p className="text-[12px] text-[#767676] line-clamp-2 mt-0.5">
            {description}
          </p>
        )}

        {/* Author row */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Avatar */}
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-[#e60023] flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">
                  {authorName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Name */}
            <span className="text-[12px] font-semibold text-[#111111] truncate">
              {authorName}
            </span>
          </div>

          {/* Saves count */}
          {saves > 0 && (
            <div className="flex items-center gap-1 text-[12px] text-[#767676]">
              <Heart className="h-3 w-3" />
              <span>{formatCount(saves)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Idea Pin variant for stories/videos
export function PinterestIdeaPreview({
  title,
  authorName,
  authorAvatar,
  views = 0,
  children,
  className,
}: {
  title?: string;
  authorName: string;
  authorAvatar?: string;
  views?: number;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pinterest-idea-preview w-[236px] font-['Helvetica_Neue',Helvetica,Arial,sans-serif]",
        className
      )}
    >
      {/* Idea card - taller aspect ratio */}
      <div className="group relative rounded-2xl overflow-hidden bg-[#f0f0f0]">
        <div className="relative aspect-[9/16]">
          {children || (
            <div className="w-full h-full bg-gradient-to-b from-[#e9e9e9] to-[#d4d4d4] flex items-center justify-center">
              <span className="text-[#767676] text-sm">Idea Pin</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

          {/* Bottom content */}
          <div className="absolute inset-x-0 bottom-0 p-3">
            {/* Title */}
            {title && (
              <h3 className="text-white font-bold text-[14px] line-clamp-2 mb-2">
                {title}
              </h3>
            )}

            {/* Author row */}
            <div className="flex items-center gap-2">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-[#e60023] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">
                    {authorName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-white text-[12px] font-semibold">
                {authorName}
              </span>
            </div>
          </div>

          {/* Idea Pin badge */}
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-white/90 text-[10px] font-bold text-black">
            Idea Pin
          </div>

          {/* Save button on hover */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="px-3 py-1.5 rounded-full bg-[#e60023] text-white font-bold text-[12px] hover:bg-[#ad081b] transition-colors">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
