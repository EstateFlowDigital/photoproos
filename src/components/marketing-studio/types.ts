/**
 * Marketing Studio Types
 *
 * Type definitions for the Social Media Marketing Suite
 */

// Platform types
export type PlatformId =
  | "instagram"
  | "linkedin"
  | "twitter"
  | "facebook"
  | "tiktok"
  | "pinterest";

export type PostFormat =
  | "feed"
  | "story"
  | "reel"
  | "carousel"
  | "article"
  | "tweet"
  | "cover"
  | "pin";

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  icon: string;
  color: string;
  formats: PostFormat[];
  characterLimit: number;
  hashtagLimit: number;
  dimensions: {
    [key in PostFormat]?: { width: number; height: number };
  };
}

// Post content types
export interface PostContent {
  image?: string;
  mockupId?: string;
  caption: string;
  hashtags: string[];
  mentions: string[];
}

// Instagram-specific preview props
export interface InstagramPreviewProps {
  type: "feed" | "story" | "reel" | "carousel";
  image?: string;
  caption: string;
  username: string;
  avatar?: string;
  likes: number;
  comments: number;
  timestamp: string;
  hashtags: string[];
  isVerified?: boolean;
}

// LinkedIn-specific preview props
export interface LinkedInPreviewProps {
  type: "post" | "article";
  image?: string;
  text: string;
  authorName: string;
  authorTitle: string;
  authorAvatar?: string;
  reactions: number;
  comments: number;
  reposts: number;
  connectionDegree?: "1st" | "2nd" | "3rd";
}

// Twitter/X-specific preview props
export interface TwitterPreviewProps {
  type: "tweet" | "card";
  image?: string;
  text: string;
  username: string;
  displayName: string;
  avatar?: string;
  likes: number;
  retweets: number;
  replies: number;
  views: number;
  timestamp: string;
  isVerified?: boolean;
}

// Facebook-specific preview props
export interface FacebookPreviewProps {
  type: "post" | "story" | "cover";
  image?: string;
  text: string;
  authorName: string;
  authorAvatar?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
}

// TikTok-specific preview props
export interface TikTokPreviewProps {
  type: "cover" | "profile";
  image?: string;
  caption: string;
  username: string;
  avatar?: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  soundName?: string;
}

// Pinterest-specific preview props
export interface PinterestPreviewProps {
  image?: string;
  title: string;
  description: string;
  boardName?: string;
  saves: number;
  authorName: string;
  authorAvatar?: string;
}

// Generic preview props union
export type PlatformPreviewProps =
  | { platform: "instagram" } & InstagramPreviewProps
  | { platform: "linkedin" } & LinkedInPreviewProps
  | { platform: "twitter" } & TwitterPreviewProps
  | { platform: "facebook" } & FacebookPreviewProps
  | { platform: "tiktok" } & TikTokPreviewProps
  | { platform: "pinterest" } & PinterestPreviewProps;

// Caption editor types
export interface CaptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  platform: PlatformId;
  characterLimit?: number;
  placeholder?: string;
  showHashtagSuggestions?: boolean;
}

// Mockup picker types
export interface MockupPickerProps {
  selectedMockupId?: string;
  onSelect: (mockupId: string) => void;
  industry?: string;
}

// Composer canvas types
export interface ComposerCanvasProps {
  content: PostContent;
  platform: PlatformId;
  format: PostFormat;
  onContentChange: (content: PostContent) => void;
}

// Brand Kit types
export interface BrandKit {
  id: string;
  businessName: string;
  tagline?: string;
  logo?: {
    full?: string;
    icon?: string;
    light?: string;
    dark?: string;
  };
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  gradients?: {
    name: string;
    from: string;
    to: string;
    angle: number;
  }[];
  headlineFont?: string;
  bodyFont?: string;
  handles: {
    platform: PlatformId;
    username: string;
  }[];
  defaultHashtags: string[];
  watermarks?: {
    name: string;
    image: string;
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
    opacity: number;
  }[];
}

// Export options
export interface ExportOptions {
  format: "png" | "jpeg" | "webp" | "pdf";
  scale: 1 | 2 | 3;
  quality?: number; // 0-100 for JPEG
  includeWatermark?: boolean;
}

// Post draft types
export interface PostDraft {
  id: string;
  content: PostContent;
  platforms: PlatformId[];
  format: PostFormat;
  scheduledAt?: Date;
  status: "draft" | "scheduled" | "published" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

// Calendar types
export interface CalendarPost {
  id: string;
  draft: PostDraft;
  date: Date;
  platforms: PlatformId[];
}

export type CalendarView = "month" | "week" | "board" | "grid";

// Layer composition types
export type LayerType = "image" | "mockup" | "text" | "shape" | "logo";

export interface LayerBase {
  id: string;
  type: LayerType;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  zIndex: number;
}

export interface ImageLayer extends LayerBase {
  type: "image";
  src: string;
  objectFit: "cover" | "contain" | "fill";
}

export interface MockupLayer extends LayerBase {
  type: "mockup";
  mockupId: string;
  industry: string;
  theme: "light" | "dark";
  primaryColor: string;
  scale: number;
}

export interface TextLayer extends LayerBase {
  type: "text";
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 400 | 500 | 600 | 700 | 800;
  color: string;
  textAlign: "left" | "center" | "right";
  lineHeight: number;
}

export interface ShapeLayer extends LayerBase {
  type: "shape";
  shapeType: "rectangle" | "circle" | "line";
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius?: number;
}

export interface LogoLayer extends LayerBase {
  type: "logo";
  variant: "full" | "icon" | "text";
}

export type Layer = ImageLayer | MockupLayer | TextLayer | ShapeLayer | LogoLayer;

export interface CompositionState {
  layers: Layer[];
  selectedLayerId: string | null;
  canvasSize: { width: number; height: number };
  backgroundColor: string;
  backgroundGradient?: {
    from: string;
    to: string;
    angle: number;
  };
}
