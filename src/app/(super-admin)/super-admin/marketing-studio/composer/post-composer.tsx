"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { PlatformId, PostFormat, Layer, LayerType, TextLayer, ImageLayer, ShapeLayer, MockupLayer } from "@/components/marketing-studio/types";
import type { IndustryId } from "@/components/mockups/types";
import { PLATFORMS, PLATFORM_LIST } from "@/lib/marketing-studio/platforms";
import { getMockupById } from "@/components/mockups/mockup-registry";
import { getIndustriesArray } from "@/lib/constants/industries";
import { exportToPng, copyToClipboard } from "@/lib/mockups/export";
import { getTemplateById, type Template } from "@/lib/marketing-studio/templates";
import { InstagramPreview } from "@/components/marketing-studio/previews/instagram-preview";
import { LinkedInPreview } from "@/components/marketing-studio/previews/linkedin-preview";
import { TwitterPreview } from "@/components/marketing-studio/previews/twitter-preview";
import { FacebookPreview } from "@/components/marketing-studio/previews/facebook-preview";
import { TikTokPreview } from "@/components/marketing-studio/previews/tiktok-preview";
import { PinterestPreview } from "@/components/marketing-studio/previews/pinterest-preview";
import { CaptionEditor } from "@/components/marketing-studio/composer/caption-editor";
import { MockupPicker } from "@/components/marketing-studio/composer/mockup-picker";
import { LayersPanel } from "@/components/marketing-studio/composer/layers-panel";
import { PropertiesPanel } from "@/components/marketing-studio/composer/properties-panel";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  Copy,
  ImageIcon,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  ChevronDown,
  Layers,
  Settings2,
  X,
  Sun,
  Moon,
  Palette,
  LayoutTemplate,
  Upload,
  Trash2,
  Menu,
  PanelLeftClose,
  PanelRightClose,
  Type,
  Square,
} from "lucide-react";

// Content type for the preview
type ContentType = "mockup" | "template" | "image";

// Custom TikTok icon (not in lucide-react)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

// Custom Pinterest icon (simplified)
function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.4.04-3.44l1.4-5.95s-.36-.72-.36-1.78c0-1.66.96-2.9 2.16-2.9 1.02 0 1.52.77 1.52 1.68 0 1.02-.65 2.55-.99 3.97-.28 1.19.6 2.16 1.78 2.16 2.13 0 3.77-2.25 3.77-5.49 0-2.87-2.06-4.88-5-4.88-3.41 0-5.41 2.55-5.41 5.2 0 1.02.39 2.13.89 2.73a.35.35 0 0 1 .08.34l-.33 1.35c-.05.22-.18.27-.41.16-1.53-.72-2.49-2.96-2.49-4.77 0-3.88 2.82-7.45 8.14-7.45 4.28 0 7.6 3.05 7.6 7.12 0 4.25-2.68 7.67-6.4 7.67-1.25 0-2.42-.65-2.82-1.42l-.77 2.93c-.28 1.07-1.03 2.42-1.54 3.24A12 12 0 1 0 12 0z" />
    </svg>
  );
}

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  facebook: Facebook,
  tiktok: TikTokIcon,
  pinterest: PinterestIcon,
};

const PLATFORM_NAMES: Record<string, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  twitter: "Twitter/X",
  facebook: "Facebook",
  tiktok: "TikTok",
  pinterest: "Pinterest",
};

// Generate unique layer IDs
let layerIdCounter = 0;
const generateLayerId = () => `layer-${Date.now()}-${++layerIdCounter}`;

export function PostComposer() {
  const searchParams = useSearchParams();

  // State
  const [selectedPlatform, setSelectedPlatform] = React.useState<PlatformId>("instagram");
  const [selectedFormat, setSelectedFormat] = React.useState<PostFormat>("feed");
  const [contentType, setContentType] = React.useState<ContentType>("mockup");
  const [selectedMockupId, setSelectedMockupId] = React.useState<string | undefined>();
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | undefined>();
  const [customImage, setCustomImage] = React.useState<string | undefined>();
  const [industry, setIndustry] = React.useState<IndustryId>("real_estate");
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");
  const [primaryColor, setPrimaryColor] = React.useState("#3b82f6");
  const [caption, setCaption] = React.useState("");
  const [isExporting, setIsExporting] = React.useState(false);
  const [showMockupPicker, setShowMockupPicker] = React.useState(false);
  const [showRightSidebar, setShowRightSidebar] = React.useState(true);
  const [showLayersPanel, setShowLayersPanel] = React.useState(false);
  const [rightPanelTab, setRightPanelTab] = React.useState<"settings" | "properties">("settings");

  // Composition state
  const [layers, setLayers] = React.useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = React.useState<string | null>(null);

  // Preview engagement data (editable in future)
  const [engagement] = React.useState({
    likes: 1247,
    comments: 48,
    shares: 12,
    views: 8543,
    reactions: 892,
    reposts: 34,
  });

  // Refs
  const previewRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Get the selected layer
  const selectedLayer = React.useMemo(
    () => layers.find((l) => l.id === selectedLayerId) || null,
    [layers, selectedLayerId]
  );

  // Derived data
  const industries = getIndustriesArray();
  const selectedMockup = selectedMockupId ? getMockupById(selectedMockupId) : undefined;
  const platformConfig = PLATFORMS[selectedPlatform];

  // Initialize from URL params
  React.useEffect(() => {
    const source = searchParams.get("source");
    const mockupId = searchParams.get("mockup");
    const templateId = searchParams.get("template");

    // Load mockup if specified
    if (source === "mockup" && mockupId) {
      setSelectedMockupId(mockupId);
      setContentType("mockup");
      setShowMockupPicker(true);
    }

    // Load template if specified
    if (templateId) {
      const template = getTemplateById(templateId);
      if (template) {
        setSelectedTemplate(template);
        setContentType("template");
        // Apply template settings
        if (template.platforms.length > 0) {
          setSelectedPlatform(template.platforms[0]);
        }
        setSelectedFormat(template.format);
        if (template.captionTemplate) {
          setCaption(template.captionTemplate);
        }
        // Apply template colors if it has a gradient background
        if (template.layout.background === "gradient" && template.layout.gradientFrom) {
          setPrimaryColor(template.layout.gradientFrom);
        } else if (template.layout.background === "solid" && template.layout.backgroundColor) {
          const bgColor = template.layout.backgroundColor;
          if (bgColor && bgColor !== "#0a0a0a" && bgColor !== "#ffffff") {
            setPrimaryColor(bgColor);
          }
        }
      }
    }
  }, [searchParams]);

  // Handle mockup selection
  const handleMockupSelect = React.useCallback((mockupId: string) => {
    setSelectedMockupId(mockupId);
    setContentType("mockup");
  }, []);

  // Handle image upload
  const handleImageUpload = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCustomImage(ev.target?.result as string);
        setContentType("image");
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Handle export
  const handleExport = React.useCallback(async () => {
    if (!previewRef.current) return;

    setIsExporting(true);
    try {
      const filename = `photoproos-${selectedPlatform}-${selectedFormat}-${Date.now()}`;
      await exportToPng(previewRef.current, filename, {
        scale: 2,
        backgroundColor: theme === "dark" ? "#0a0a0a" : "#ffffff",
      });
      toast.success("Exported as PNG");
    } catch (error) {
      toast.error("Failed to export");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  }, [selectedPlatform, selectedFormat, theme]);

  // Handle copy to clipboard
  const handleCopy = React.useCallback(async () => {
    if (!previewRef.current) return;

    setIsExporting(true);
    try {
      await copyToClipboard(previewRef.current, {
        scale: 2,
        backgroundColor: theme === "dark" ? "#0a0a0a" : "#ffffff",
      });
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  }, [theme]);

  // Extract hashtags from caption
  const hashtags = React.useMemo(() => {
    const matches = caption.match(/#\w+/g) || [];
    return matches;
  }, [caption]);

  // Layer manipulation callbacks
  const handleAddLayer = React.useCallback((type: LayerType) => {
    const baseLayer = {
      id: generateLayerId(),
      visible: true,
      locked: false,
      opacity: 100,
      position: { x: 50, y: 50 },
      size: { width: 200, height: 100 },
      rotation: 0,
      zIndex: layers.length,
    };

    let newLayer: Layer;

    switch (type) {
      case "text":
        newLayer = {
          ...baseLayer,
          type: "text",
          name: `Text ${layers.filter((l) => l.type === "text").length + 1}`,
          content: "Your text here",
          fontFamily: "Inter",
          fontSize: 24,
          fontWeight: 500,
          color: "#ffffff",
          textAlign: "center",
          lineHeight: 1.4,
        } as TextLayer;
        break;
      case "image":
        newLayer = {
          ...baseLayer,
          type: "image",
          name: `Image ${layers.filter((l) => l.type === "image").length + 1}`,
          src: "",
          objectFit: "cover",
          size: { width: 300, height: 200 },
        } as ImageLayer;
        break;
      case "shape":
        newLayer = {
          ...baseLayer,
          type: "shape",
          name: `Shape ${layers.filter((l) => l.type === "shape").length + 1}`,
          shapeType: "rectangle",
          fill: "#3b82f6",
          stroke: "transparent",
          strokeWidth: 0,
          borderRadius: 8,
        } as ShapeLayer;
        break;
      case "mockup":
        newLayer = {
          ...baseLayer,
          type: "mockup",
          name: `Mockup ${layers.filter((l) => l.type === "mockup").length + 1}`,
          mockupId: selectedMockupId || "",
          industry: industry,
          theme: theme,
          primaryColor: primaryColor,
          scale: 0.35,
          size: { width: 400, height: 300 },
        } as MockupLayer;
        break;
      default:
        return;
    }

    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
    toast.success(`Added ${type} layer`);
  }, [layers, selectedMockupId, industry, theme, primaryColor]);

  const handleDeleteLayer = React.useCallback((id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
  }, [selectedLayerId]);

  const handleToggleVisibility = React.useCallback((id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  }, []);

  const handleToggleLock = React.useCallback((id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l))
    );
  }, []);

  const handleReorderLayers = React.useCallback((fromIndex: number, toIndex: number) => {
    setLayers((prev) => {
      const sorted = [...prev].sort((a, b) => b.zIndex - a.zIndex);
      const [moved] = sorted.splice(fromIndex, 1);
      sorted.splice(toIndex, 0, moved);
      // Update zIndex based on new order
      return sorted.map((layer, idx) => ({
        ...layer,
        zIndex: sorted.length - 1 - idx,
      }));
    });
  }, []);

  const handleDuplicateLayer = React.useCallback((id: string) => {
    const layer = layers.find((l) => l.id === id);
    if (!layer) return;

    const newLayer = {
      ...layer,
      id: generateLayerId(),
      name: `${layer.name} (copy)`,
      position: { x: layer.position.x + 20, y: layer.position.y + 20 },
      zIndex: layers.length,
    };

    setLayers((prev) => [...prev, newLayer as Layer]);
    setSelectedLayerId(newLayer.id);
    toast.success("Layer duplicated");
  }, [layers]);

  const handleUpdateLayer = React.useCallback((id: string, updates: Partial<Layer>) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  }, []);

  // Render a single layer
  const renderLayer = React.useCallback((layer: Layer) => {
    if (!layer.visible) return null;

    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: `${layer.position.x}px`,
      top: `${layer.position.y}px`,
      width: `${layer.size.width}px`,
      height: `${layer.size.height}px`,
      opacity: layer.opacity / 100,
      transform: `rotate(${layer.rotation}deg)`,
      zIndex: layer.zIndex,
      pointerEvents: layer.locked ? "none" : "auto",
    };

    switch (layer.type) {
      case "text": {
        const textLayer = layer as TextLayer;
        return (
          <div
            key={layer.id}
            style={{
              ...baseStyle,
              fontFamily: textLayer.fontFamily,
              fontSize: `${textLayer.fontSize}px`,
              fontWeight: textLayer.fontWeight,
              color: textLayer.color,
              textAlign: textLayer.textAlign,
              lineHeight: textLayer.lineHeight,
              display: "flex",
              alignItems: "center",
              justifyContent: textLayer.textAlign === "center" ? "center" : textLayer.textAlign === "right" ? "flex-end" : "flex-start",
            }}
            className={cn(
              "cursor-move select-none whitespace-pre-wrap",
              selectedLayerId === layer.id && "ring-2 ring-[var(--primary)] ring-offset-1"
            )}
            onClick={() => {
              setSelectedLayerId(layer.id);
              setRightPanelTab("properties");
            }}
          >
            {textLayer.content}
          </div>
        );
      }
      case "shape": {
        const shapeLayer = layer as ShapeLayer;
        return (
          <div
            key={layer.id}
            style={{
              ...baseStyle,
              backgroundColor: shapeLayer.fill,
              border: shapeLayer.strokeWidth > 0 ? `${shapeLayer.strokeWidth}px solid ${shapeLayer.stroke}` : undefined,
              borderRadius: shapeLayer.shapeType === "circle" ? "50%" : shapeLayer.borderRadius ? `${shapeLayer.borderRadius}px` : undefined,
            }}
            className={cn(
              "cursor-move",
              selectedLayerId === layer.id && "ring-2 ring-[var(--primary)] ring-offset-1"
            )}
            onClick={() => {
              setSelectedLayerId(layer.id);
              setRightPanelTab("properties");
            }}
          />
        );
      }
      case "image": {
        const imageLayer = layer as ImageLayer;
        return (
          <div
            key={layer.id}
            style={baseStyle}
            className={cn(
              "cursor-move overflow-hidden",
              selectedLayerId === layer.id && "ring-2 ring-[var(--primary)] ring-offset-1"
            )}
            onClick={() => {
              setSelectedLayerId(layer.id);
              setRightPanelTab("properties");
            }}
          >
            {imageLayer.src ? (
              <img
                src={imageLayer.src}
                alt={layer.name}
                style={{ objectFit: imageLayer.objectFit }}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-[var(--background-hover)] flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-[var(--foreground-muted)]" aria-hidden="true" />
              </div>
            )}
          </div>
        );
      }
      case "mockup": {
        const mockupLayer = layer as MockupLayer;
        const mockup = getMockupById(mockupLayer.mockupId);
        if (!mockup) return null;
        const MockupComponent = mockup.component;
        const mockupData = mockup.getDefaultData(mockupLayer.industry as IndustryId);
        return (
          <div
            key={layer.id}
            style={baseStyle}
            className={cn(
              "cursor-move overflow-hidden",
              selectedLayerId === layer.id && "ring-2 ring-[var(--primary)] ring-offset-1"
            )}
            onClick={() => {
              setSelectedLayerId(layer.id);
              setRightPanelTab("properties");
            }}
          >
            <div
              className="origin-top-left"
              style={{ transform: `scale(${mockupLayer.scale})` }}
            >
              <MockupComponent
                data={mockupData}
                theme={mockupLayer.theme}
                primaryColor={mockupLayer.primaryColor}
                industry={mockupLayer.industry as IndustryId}
              />
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  }, [selectedLayerId]);

  // Render the content based on content type
  const renderContent = React.useCallback(() => {
    // If there are layers, render them on a canvas
    if (layers.length > 0) {
      return (
        <div className="relative w-full h-full bg-[var(--background)]">
          {/* Background layer (base content) */}
          {contentType === "mockup" && selectedMockup && (
            <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
              <div className="transform scale-[0.35] origin-center">
                {(() => {
                  const MockupComponent = selectedMockup.component;
                  const mockupData = selectedMockup.getDefaultData(industry);
                  return (
                    <MockupComponent
                      data={mockupData}
                      theme={theme}
                      primaryColor={primaryColor}
                      industry={industry}
                    />
                  );
                })()}
              </div>
            </div>
          )}
          {contentType === "image" && customImage && (
            <img
              src={customImage}
              alt="Custom uploaded content"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {contentType === "template" && selectedTemplate && (
            <div
              className="absolute inset-0"
              style={{
                background: selectedTemplate.layout.background === "gradient"
                  ? `linear-gradient(${selectedTemplate.layout.gradientAngle || 135}deg, ${selectedTemplate.layout.gradientFrom}, ${selectedTemplate.layout.gradientTo})`
                  : selectedTemplate.layout.backgroundColor || "#1a1a1a"
              }}
            />
          )}

          {/* Render layers */}
          {[...layers].sort((a, b) => a.zIndex - b.zIndex).map(renderLayer)}
        </div>
      );
    }

    // Template content - render as static graphic
    if (contentType === "template" && selectedTemplate) {
      const { layout } = selectedTemplate;

      // Build background style
      const bgStyle: React.CSSProperties = {};
      if (layout.background === "gradient") {
        bgStyle.background = `linear-gradient(${layout.gradientAngle || 135}deg, ${layout.gradientFrom}, ${layout.gradientTo})`;
      } else if (layout.background === "solid") {
        bgStyle.backgroundColor = layout.backgroundColor || "#1a1a1a";
      } else {
        bgStyle.backgroundColor = "#1a1a1a";
      }

      return (
        <div
          className="w-full h-full flex flex-col items-center justify-center p-6"
          style={bgStyle}
        >
          {layout.elements.map((element, idx) => {
            if (element.type === "text") {
              return (
                <div
                  key={idx}
                  className="text-white text-center"
                  style={{
                    fontSize: element.size.height > 15 ? "1.5rem" : element.size.height > 10 ? "1rem" : "0.75rem",
                    fontWeight: element.size.height > 12 ? 700 : 500,
                    marginBottom: "0.5rem",
                    opacity: element.size.height > 10 ? 1 : 0.8,
                  }}
                >
                  {element.content || ""}
                </div>
              );
            }
            if (element.type === "logo") {
              return (
                <div
                  key={idx}
                  className="flex items-center justify-center mt-4"
                >
                  <div className="text-white/80 text-sm font-medium">PhotoProOS</div>
                </div>
              );
            }
            if (element.type === "image") {
              return (
                <div
                  key={idx}
                  className="bg-white/10 rounded-lg flex items-center justify-center"
                  style={{
                    width: `${element.size.width}%`,
                    height: `${element.size.height}%`,
                    position: "absolute",
                    left: `${element.position.x}%`,
                    top: `${element.position.y}%`,
                  }}
                >
                  <ImageIcon className="h-8 w-8 text-white/40" aria-hidden="true" />
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }

    // Mockup content - render with scale constraint
    if (contentType === "mockup" && selectedMockup) {
      const MockupComponent = selectedMockup.component;
      const mockupData = selectedMockup.getDefaultData(industry);
      return (
        <div className="w-full h-full overflow-hidden flex items-center justify-center bg-[var(--background)]">
          <div className="transform scale-[0.35] origin-center">
            <MockupComponent
              data={mockupData}
              theme={theme}
              primaryColor={primaryColor}
              industry={industry}
            />
          </div>
        </div>
      );
    }

    // Custom image content
    if (contentType === "image" && customImage) {
      return (
        <img
          src={customImage}
          alt="Custom uploaded content"
          className="w-full h-full object-cover"
        />
      );
    }

    // No content - placeholder
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[var(--primary)]/20 to-[var(--ai)]/20">
        <ImageIcon className="h-12 w-12 text-[var(--foreground-muted)] mb-3" aria-hidden="true" />
        <p className="text-sm text-[var(--foreground-muted)] text-center max-w-[200px]">
          Select a mockup, template, or upload an image
        </p>
      </div>
    );
  }, [contentType, selectedTemplate, selectedMockup, industry, theme, primaryColor, customImage, layers, renderLayer]);

  // Render platform preview
  const renderPreview = React.useCallback(() => {
    const content = renderContent();

    switch (selectedPlatform) {
      case "instagram":
        return (
          <InstagramPreview
            type={selectedFormat as "feed" | "story" | "reel" | "carousel"}
            caption={caption}
            username="photoproos"
            avatar={undefined}
            likes={engagement.likes}
            comments={engagement.comments}
            timestamp="2 hours ago"
            hashtags={hashtags}
            isVerified={true}
          >
            {content}
          </InstagramPreview>
        );

      case "linkedin":
        return (
          <LinkedInPreview
            type={selectedFormat as "post" | "article"}
            text={caption}
            authorName="PhotoProOS"
            authorTitle="The Business OS for Photographers"
            authorAvatar={undefined}
            reactions={engagement.reactions}
            comments={engagement.comments}
            reposts={engagement.reposts}
            connectionDegree="1st"
          >
            {content}
          </LinkedInPreview>
        );

      case "twitter":
        return (
          <TwitterPreview
            type="tweet"
            text={caption}
            authorName="PhotoProOS"
            authorHandle="photoproos"
            authorAvatar={undefined}
            likes={engagement.likes}
            retweets={engagement.reposts}
            replies={engagement.comments}
            views={engagement.views}
            timestamp="2h"
            isVerified={true}
          >
            {content}
          </TwitterPreview>
        );

      case "facebook":
        return (
          <FacebookPreview
            type={selectedFormat as "post" | "story"}
            text={caption}
            authorName="PhotoProOS"
            authorAvatar={undefined}
            reactions={engagement.reactions}
            comments={engagement.comments}
            shares={engagement.shares}
            timestamp="2h"
            privacy="public"
          >
            {content}
          </FacebookPreview>
        );

      case "tiktok":
        return (
          <TikTokPreview
            type="video"
            caption={caption}
            authorName="PhotoProOS"
            authorHandle="photoproos"
            authorAvatar={undefined}
            likes={engagement.likes}
            comments={engagement.comments}
            bookmarks={engagement.reactions}
            shares={engagement.shares}
            soundName="Original sound"
            isVerified={true}
          >
            {content}
          </TikTokPreview>
        );

      case "pinterest":
        return (
          <PinterestPreview
            type="pin"
            title={caption.split("\n")[0] || "Photography Inspiration"}
            description={caption}
            authorName="PhotoProOS"
            authorAvatar={undefined}
            boardName="Photography"
            saves={engagement.reactions}
            sourceUrl="photoproos.com"
          >
            {content}
          </PinterestPreview>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 bg-[var(--card)] rounded-lg border border-[var(--card-border)]">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-[var(--foreground-muted)] mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm text-[var(--foreground-muted)]">
                Preview coming soon for {platformConfig.name}
              </p>
            </div>
          </div>
        );
    }
  }, [selectedPlatform, selectedFormat, caption, engagement, hashtags, platformConfig.name, renderContent]);

  return (
    <div className="post-composer flex flex-col h-[calc(100vh-64px)]">
      {/* Top Bar */}
      <header className="flex-shrink-0 border-b border-[var(--card-border)] bg-[var(--card)] px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left - Back and Title */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/super-admin/marketing-studio"
              className="flex items-center gap-1 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-lg p-1"
              aria-label="Back to Marketing Studio"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="h-6 w-px bg-[var(--card-border)] hidden sm:block" aria-hidden="true" />
            <h1 className="text-base sm:text-lg font-semibold text-[var(--foreground)]">
              Post Composer
            </h1>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            {/* Layers panel toggle */}
            <button
              onClick={() => setShowLayersPanel(!showLayersPanel)}
              className={cn(
                "hidden md:flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                showLayersPanel
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-hover)]"
              )}
              aria-label={showLayersPanel ? "Hide layers panel" : "Show layers panel"}
              aria-pressed={showLayersPanel}
            >
              <Layers className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Layers</span>
              {layers.length > 0 && (
                <span className="text-xs opacity-70">({layers.length})</span>
              )}
            </button>
            {/* Mobile toggle for right sidebar */}
            <button
              onClick={() => setShowRightSidebar(!showRightSidebar)}
              className="lg:hidden flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)] hover:bg-[var(--background-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              aria-label={showRightSidebar ? "Hide settings panel" : "Show settings panel"}
              aria-expanded={showRightSidebar}
            >
              {showRightSidebar ? (
                <PanelRightClose className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Menu className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
            <button
              onClick={handleCopy}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 sm:px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-hover)] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              aria-label="Copy to clipboard"
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Copy</span>
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 sm:px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              aria-label="Export as PNG"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Export PNG</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Layers Panel */}
        {showLayersPanel && (
          <aside
            className="hidden md:flex w-64 flex-shrink-0 border-r border-[var(--card-border)] bg-[var(--background-secondary)] flex-col"
            aria-label="Layers panel"
          >
            <LayersPanel
              layers={layers}
              selectedLayerId={selectedLayerId}
              onSelectLayer={setSelectedLayerId}
              onAddLayer={handleAddLayer}
              onDeleteLayer={handleDeleteLayer}
              onToggleVisibility={handleToggleVisibility}
              onToggleLock={handleToggleLock}
              onReorderLayers={handleReorderLayers}
              onDuplicateLayer={handleDuplicateLayer}
              className="flex-1"
            />
          </aside>
        )}

        {/* Left Sidebar - Mockup Picker */}
        {showMockupPicker && !showLayersPanel && (
          <aside
            className="hidden md:flex w-64 flex-shrink-0 border-r border-[var(--card-border)] bg-[var(--background-secondary)] flex-col"
            aria-label="Mockup picker"
          >
            <div className="flex items-center justify-between p-3 border-b border-[var(--card-border)]">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
                <span className="text-sm font-medium text-[var(--foreground)]">Mockups</span>
              </div>
              <button
                onClick={() => setShowMockupPicker(false)}
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded p-1"
                aria-label="Close mockup picker"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <MockupPicker
              selectedMockupId={selectedMockupId}
              onSelect={handleMockupSelect}
              industry={industry}
              className="flex-1"
            />
          </aside>
        )}

        {/* Center - Canvas/Preview */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Platform Selector */}
          <nav
            className="flex-shrink-0 border-b border-[var(--card-border)] bg-[var(--card)] p-2 sm:p-3"
            aria-label="Platform and format selection"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              {/* Platform tabs */}
              <div
                className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0"
                role="tablist"
                aria-label="Social media platforms"
              >
                {PLATFORM_LIST.map((platform) => {
                  const Icon = PLATFORM_ICONS[platform.id] || ImageIcon;
                  const isSelected = selectedPlatform === platform.id;
                  return (
                    <button
                      key={platform.id}
                      onClick={() => {
                        setSelectedPlatform(platform.id);
                        setSelectedFormat(platform.formats[0]);
                      }}
                      role="tab"
                      aria-selected={isSelected}
                      aria-label={`${platform.name} preview`}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                        isSelected
                          ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="hidden sm:inline">{platform.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Format selector */}
              <div
                className="flex items-center gap-1 flex-shrink-0"
                role="tablist"
                aria-label="Post format"
              >
                {platformConfig.formats.map((format) => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    role="tab"
                    aria-selected={selectedFormat === format}
                    aria-label={`${format} format`}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                      selectedFormat === format
                        ? "bg-[var(--foreground)] text-[var(--background)]"
                        : "text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]"
                    )}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Preview Area */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 bg-[var(--background)]">
            <div className="flex justify-center">
              <div ref={previewRef} className="inline-block max-w-full">
                {renderPreview()}
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Settings & Caption */}
        <aside
          className={cn(
            "w-full sm:w-80 lg:w-72 flex-shrink-0 border-l border-[var(--card-border)] bg-[var(--background-secondary)] flex flex-col overflow-hidden",
            "fixed inset-y-0 right-0 z-40 lg:relative lg:inset-auto",
            "transform transition-transform duration-200 ease-in-out",
            showRightSidebar ? "translate-x-0" : "translate-x-full lg:translate-x-0 lg:hidden"
          )}
          aria-label="Post settings and caption"
        >
          {/* Tab Switcher */}
          <div className="flex items-center justify-between p-2 border-b border-[var(--card-border)]">
            <div className="flex items-center gap-1" role="tablist" aria-label="Panel tabs">
              <button
                onClick={() => setRightPanelTab("settings")}
                role="tab"
                aria-selected={rightPanelTab === "settings"}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                  rightPanelTab === "settings"
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]"
                )}
              >
                <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
                Settings
              </button>
              <button
                onClick={() => setRightPanelTab("properties")}
                role="tab"
                aria-selected={rightPanelTab === "properties"}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                  rightPanelTab === "properties"
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]"
                )}
              >
                <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                Properties
              </button>
            </div>
            {/* Mobile close button */}
            <button
              onClick={() => setShowRightSidebar(false)}
              className="lg:hidden text-[var(--foreground-muted)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded p-1"
              aria-label="Close settings panel"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Properties Panel Tab */}
          {rightPanelTab === "properties" && (
            <PropertiesPanel
              layer={selectedLayer}
              onUpdateLayer={handleUpdateLayer}
              className="flex-1 overflow-hidden"
            />
          )}

          {/* Settings Tab */}
          {rightPanelTab === "settings" && (
            <>
          {/* Content Type Selector */}
          <div className="flex-shrink-0 p-3 border-b border-[var(--card-border)]">
            <label id="content-type-label" className="block text-xs text-[var(--foreground-muted)] mb-2">
              Content Type
            </label>
            <div
              className="grid grid-cols-3 gap-1.5"
              role="group"
              aria-labelledby="content-type-label"
            >
              <button
                onClick={() => {
                  setContentType("mockup");
                  setShowMockupPicker(true);
                }}
                aria-pressed={contentType === "mockup"}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                  contentType === "mockup"
                    ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30"
                    : "bg-[var(--background)] border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                )}
              >
                <Layers className="h-4 w-4" aria-hidden="true" />
                Mockup
              </button>
              <button
                onClick={() => setContentType("template")}
                aria-pressed={contentType === "template"}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                  contentType === "template"
                    ? "bg-[var(--ai)]/10 text-[var(--ai)] border border-[var(--ai)]/30"
                    : "bg-[var(--background)] border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                )}
              >
                <LayoutTemplate className="h-4 w-4" aria-hidden="true" />
                Template
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                aria-pressed={contentType === "image"}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                  contentType === "image"
                    ? "bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30"
                    : "bg-[var(--background)] border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                )}
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                Image
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="sr-only"
              aria-label="Upload image"
            />
          </div>

          {/* Template Selector (when template mode) */}
          {contentType === "template" && (
            <div className="flex-shrink-0 p-3 border-b border-[var(--card-border)]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-[var(--foreground-muted)]">Template</label>
                <Link
                  href="/super-admin/marketing-studio/templates"
                  className="text-xs text-[var(--primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded"
                >
                  Browse all
                </Link>
              </div>
              {selectedTemplate ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="h-8 w-8 rounded flex-shrink-0"
                      style={{
                        background: selectedTemplate.layout.background === "gradient"
                          ? `linear-gradient(${selectedTemplate.layout.gradientAngle || 135}deg, ${selectedTemplate.layout.gradientFrom}, ${selectedTemplate.layout.gradientTo})`
                          : selectedTemplate.layout.backgroundColor || "#1a1a1a"
                      }}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-medium text-[var(--foreground)] truncate">
                      {selectedTemplate.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedTemplate(undefined)}
                    className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded p-1"
                    aria-label="Remove selected template"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/super-admin/marketing-studio/templates"
                  className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-[var(--border)] text-xs text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                >
                  <LayoutTemplate className="h-4 w-4" aria-hidden="true" />
                  Choose a template
                </Link>
              )}
            </div>
          )}

          {/* Custom Image (when image mode) */}
          {contentType === "image" && customImage && (
            <div className="flex-shrink-0 p-3 border-b border-[var(--card-border)]">
              <label className="block text-xs text-[var(--foreground-muted)] mb-2">
                Uploaded Image
              </label>
              <div className="relative rounded-lg overflow-hidden border border-[var(--border)]">
                <img src={customImage} alt="Uploaded content preview" className="w-full h-20 object-cover" />
                <button
                  onClick={() => {
                    setCustomImage(undefined);
                    setContentType("mockup");
                  }}
                  className="absolute top-1 right-1 p-1 rounded bg-black/50 text-white hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="Remove uploaded image"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="flex-shrink-0 p-3 border-b border-[var(--card-border)]">
            <div className="flex items-center gap-2 mb-3">
              <Settings2 className="h-3.5 w-3.5 text-[var(--foreground-muted)]" aria-hidden="true" />
              <span className="text-xs font-medium text-[var(--foreground)]">Settings</span>
            </div>

            <div className="space-y-2.5">
              {/* Industry selector */}
              <div>
                <label htmlFor="industry-select" className="block text-xs text-[var(--foreground-muted)] mb-1">
                  Industry
                </label>
                <div className="relative">
                  <select
                    id="industry-select"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value as IndustryId)}
                    className="w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 pr-7 text-xs text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
                  >
                    {industries.map((ind) => (
                      <option key={ind.id} value={ind.id}>
                        {ind.shortName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--foreground-muted)] pointer-events-none" aria-hidden="true" />
                </div>
              </div>

              {/* Theme and Color */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--background-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
                  aria-pressed={theme === "dark"}
                >
                  {theme === "dark" ? (
                    <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {theme === "dark" ? "Dark" : "Light"}
                </button>
                <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5">
                  <Palette className="h-3.5 w-3.5 text-[var(--foreground-muted)]" aria-hidden="true" />
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-4 w-4 cursor-pointer appearance-none rounded border-0 bg-transparent"
                    aria-label="Primary color"
                  />
                </div>
              </div>

              {/* Quick links */}
              <div className="flex gap-1.5 pt-1">
                <Link
                  href="/super-admin/marketing-studio/templates"
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                >
                  <LayoutTemplate className="h-3 w-3" aria-hidden="true" />
                  Templates
                </Link>
                <Link
                  href="/super-admin/marketing-studio/brand-kit"
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                >
                  <Palette className="h-3 w-3" aria-hidden="true" />
                  Brand Kit
                </Link>
              </div>
            </div>
          </div>

          {/* Caption Editor */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="flex items-center gap-2 px-3 pt-3 pb-1">
              <span id="caption-label" className="text-xs font-medium text-[var(--foreground)]">Caption</span>
            </div>
            <div className="flex-1 px-3 pb-3 overflow-auto">
              <CaptionEditor
                value={caption}
                onChange={setCaption}
                platform={selectedPlatform}
                industry={industry}
                placeholder={`Write your ${platformConfig.name} caption...`}
              />
            </div>
          </div>

          {/* Selected Mockup Info */}
          {contentType === "mockup" && selectedMockup && (
            <div className="flex-shrink-0 p-3 border-t border-[var(--card-border)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-7 w-7 rounded bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                    <Layers className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[var(--foreground)] truncate">
                      {selectedMockup.name}
                    </p>
                    <p className="text-[10px] text-[var(--foreground-muted)]">
                      Mockup selected
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMockupId(undefined)}
                  className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded p-1"
                  aria-label="Remove selected mockup"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
            </>
          )}
        </aside>

        {/* Mobile overlay when sidebar is open */}
        {showRightSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setShowRightSidebar(false)}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
