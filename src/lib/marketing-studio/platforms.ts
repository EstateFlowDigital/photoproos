/**
 * Platform Configurations
 *
 * Configuration data for all supported social media platforms
 */

import type { PlatformConfig, PlatformId, PostFormat } from "@/components/marketing-studio/types";

export const PLATFORMS: Record<PlatformId, PlatformConfig> = {
  instagram: {
    id: "instagram",
    name: "Instagram",
    icon: "instagram",
    color: "#E4405F",
    formats: ["feed", "story", "reel", "carousel"],
    characterLimit: 2200,
    hashtagLimit: 30,
    dimensions: {
      feed: { width: 1080, height: 1080 },
      story: { width: 1080, height: 1920 },
      reel: { width: 1080, height: 1920 },
      carousel: { width: 1080, height: 1080 },
    },
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    icon: "linkedin",
    color: "#0A66C2",
    formats: ["post", "article"],
    characterLimit: 3000,
    hashtagLimit: 5,
    dimensions: {
      post: { width: 1200, height: 627 },
      article: { width: 1200, height: 1200 },
    },
  },
  twitter: {
    id: "twitter",
    name: "X (Twitter)",
    icon: "twitter",
    color: "#000000",
    formats: ["tweet", "card"],
    characterLimit: 280,
    hashtagLimit: 10,
    dimensions: {
      tweet: { width: 1200, height: 675 },
      card: { width: 1600, height: 900 },
    },
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    icon: "facebook",
    color: "#1877F2",
    formats: ["post", "story", "cover"],
    characterLimit: 63206,
    hashtagLimit: 30,
    dimensions: {
      post: { width: 1200, height: 630 },
      story: { width: 1080, height: 1920 },
      cover: { width: 851, height: 315 },
    },
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    icon: "video",
    color: "#000000",
    formats: ["cover"],
    characterLimit: 2200,
    hashtagLimit: 100,
    dimensions: {
      cover: { width: 1080, height: 1920 },
    },
  },
  pinterest: {
    id: "pinterest",
    name: "Pinterest",
    icon: "pin",
    color: "#BD081C",
    formats: ["pin"],
    characterLimit: 500,
    hashtagLimit: 20,
    dimensions: {
      pin: { width: 1000, height: 1500 },
    },
  },
};

export const PLATFORM_LIST = Object.values(PLATFORMS);

export function getPlatformConfig(platformId: PlatformId): PlatformConfig {
  return PLATFORMS[platformId];
}

export function getPlatformDimensions(
  platformId: PlatformId,
  format: PostFormat
): { width: number; height: number } | undefined {
  return PLATFORMS[platformId]?.dimensions[format];
}

export function getPlatformCharacterLimit(platformId: PlatformId): number {
  return PLATFORMS[platformId]?.characterLimit ?? 2200;
}

export function getPlatformHashtagLimit(platformId: PlatformId): number {
  return PLATFORMS[platformId]?.hashtagLimit ?? 30;
}

// Photography-specific hashtags by industry
export const INDUSTRY_HASHTAGS: Record<string, string[]> = {
  real_estate: [
    "#realestatephotography",
    "#realestatemedia",
    "#propertyphotography",
    "#architecturephotography",
    "#realestate",
    "#homephotography",
    "#listingphotos",
    "#realtor",
    "#propertymarketing",
    "#luxuryrealestate",
  ],
  commercial: [
    "#commercialphotography",
    "#corporatephotography",
    "#headshots",
    "#businessphotography",
    "#professionalheadshots",
    "#corporateheadshots",
    "#brandphotography",
    "#linkedinheadshot",
    "#businessportrait",
    "#teamheadshots",
  ],
  events: [
    "#weddingphotography",
    "#weddingphotographer",
    "#eventphotography",
    "#eventphotographer",
    "#bridetobe",
    "#weddingday",
    "#weddinginspo",
    "#corporateevents",
    "#weddingmoments",
    "#weddingseason",
  ],
  portraits: [
    "#portraitphotography",
    "#familyphotographer",
    "#familyportraits",
    "#seniorphotography",
    "#familyphotos",
    "#childphotography",
    "#portraitphotographer",
    "#newbornphotography",
    "#maternityphotography",
    "#familysession",
  ],
  food: [
    "#foodphotography",
    "#foodphotographer",
    "#restaurantphotography",
    "#foodstyling",
    "#foodstagram",
    "#culinaryphotography",
    "#foodart",
    "#chefsofinstagram",
    "#restaurantmarketing",
    "#menuphotography",
  ],
  product: [
    "#productphotography",
    "#productphotographer",
    "#commercialproduct",
    "#ecommercephotography",
    "#amazonphotography",
    "#productshots",
    "#brandphotography",
    "#packagingdesign",
    "#stilllifephotography",
    "#catalogphotography",
  ],
};

// General photography hashtags
export const GENERAL_HASHTAGS = [
  "#photography",
  "#photographer",
  "#photooftheday",
  "#professionalphotographer",
  "#photoproos",
];

export function getSuggestedHashtags(industry?: string): string[] {
  const industryTags = industry ? INDUSTRY_HASHTAGS[industry] ?? [] : [];
  return [...industryTags, ...GENERAL_HASHTAGS].slice(0, 20);
}
