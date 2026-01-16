"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { PlatformId, PostFormat, Layer, LayerType, TextLayer, ImageLayer, ShapeLayer, MockupLayer, GroupLayer, ScreenshotZoneLayer } from "@/components/marketing-studio/types";
import type { IndustryId } from "@/components/mockups/types";
import { PLATFORMS, PLATFORM_LIST } from "@/lib/marketing-studio/platforms";
import { getMockupById } from "@/components/mockups/mockup-registry";
import { getIndustriesArray } from "@/lib/constants/industries";
import { exportToPng, copyToClipboard } from "@/lib/mockups/export";
import { getTemplateById, saveCustomTemplate, type Template, type TemplateCategory, type TemplateLayout } from "@/lib/marketing-studio/templates";
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
import { SaveTemplateModal } from "@/components/marketing-studio/composer/save-template-modal";
import { BatchExportModal } from "@/components/marketing-studio/composer/batch-export-modal";
import { ScreenshotPicker } from "@/components/marketing-studio/composer/screenshot-picker";
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
  Grid3X3,
  Magnet,
  ZoomIn,
  ZoomOut,
  AlignLeft,
  AlignRight,
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignStartVertical,
  AlignEndVertical,
  Lock,
  Clipboard,
  ClipboardPaste,
  Save,
  FolderOpen,
  Group,
  Ungroup,
  FileArchive,
  ChevronLeft,
  ChevronRight,
  Plus,
  Circle,
  Copy as CopyIcon,
  Monitor,
} from "lucide-react";

// Carousel slide type
interface CarouselSlide {
  id: string;
  layers: Layer[];
  bgType: "solid" | "gradient";
  bgColor: string;
  gradientFrom: string;
  gradientTo: string;
  gradientAngle: number;
}

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
  const [showSaveTemplateModal, setShowSaveTemplateModal] = React.useState(false);
  const [showBatchExportModal, setShowBatchExportModal] = React.useState(false);
  const [showScreenshotPicker, setShowScreenshotPicker] = React.useState(false);
  const [targetScreenshotZoneId, setTargetScreenshotZoneId] = React.useState<string | null>(null);

  // Composition state
  const [layers, setLayers] = React.useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = React.useState<string | null>(null);

  // Carousel state
  const [carouselSlides, setCarouselSlides] = React.useState<CarouselSlide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
  const isCarouselMode = selectedFormat === "carousel";

  // Canvas background state
  const [canvasBgType, setCanvasBgType] = React.useState<"solid" | "gradient">("solid");
  const [canvasBgColor, setCanvasBgColor] = React.useState("#0a0a0a");
  const [canvasGradientFrom, setCanvasGradientFrom] = React.useState("#3b82f6");
  const [canvasGradientTo, setCanvasGradientTo] = React.useState("#8b5cf6");
  const [canvasGradientAngle, setCanvasGradientAngle] = React.useState(135);

  // Grid and snap state
  const [showGrid, setShowGrid] = React.useState(false);
  const [snapToGrid, setSnapToGrid] = React.useState(true);
  const [gridSize, setGridSize] = React.useState(20);
  const [alignmentGuides, setAlignmentGuides] = React.useState<{ type: "h" | "v"; position: number }[]>([]);

  // Zoom state
  const [canvasZoom, setCanvasZoom] = React.useState(100);
  const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200];

  // Copied layer style for paste functionality
  const [copiedStyle, setCopiedStyle] = React.useState<{
    opacity: number;
    rotation: number;
    flipX: boolean;
    flipY: boolean;
    // Type-specific styles
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    borderRadius?: number;
    color?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    textAlign?: string;
    lineHeight?: number;
  } | null>(null);

  // Multi-select layers
  const [selectedLayerIds, setSelectedLayerIds] = React.useState<Set<string>>(new Set());

  // Inline text editing state
  const [editingTextLayerId, setEditingTextLayerId] = React.useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = React.useState<string>("");
  const textEditRef = React.useRef<HTMLTextAreaElement>(null);

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

        // Apply template settings
        if (template.platforms.length > 0) {
          setSelectedPlatform(template.platforms[0]);
        }
        setSelectedFormat(template.format);
        if (template.captionTemplate) {
          setCaption(template.captionTemplate);
        }

        // Apply template background to canvas
        if (template.layout.background === "gradient" && template.layout.gradientFrom && template.layout.gradientTo) {
          setCanvasBgType("gradient");
          setCanvasGradientFrom(template.layout.gradientFrom);
          setCanvasGradientTo(template.layout.gradientTo);
          setCanvasGradientAngle(template.layout.gradientAngle || 135);
          setPrimaryColor(template.layout.gradientFrom);
        } else if (template.layout.background === "solid" && template.layout.backgroundColor) {
          setCanvasBgType("solid");
          setCanvasBgColor(template.layout.backgroundColor);
          const bgColor = template.layout.backgroundColor;
          if (bgColor && bgColor !== "#0a0a0a" && bgColor !== "#ffffff") {
            setPrimaryColor(bgColor);
          }
        }

        // Convert template elements to editable layers
        const platformConfig = PLATFORMS[template.platforms[0] || "instagram"];
        const formatDimensions = platformConfig?.dimensions?.[template.format];
        const canvasWidth = formatDimensions?.width || 540;
        const canvasHeight = formatDimensions?.height || 540;

        const templateLayers: Layer[] = template.layout.elements.map((element, idx) => {
          const baseLayer = {
            id: `template-${idx}-${Date.now()}`,
            visible: true,
            locked: false,
            opacity: 100,
            // Convert percentage positions to pixels
            position: {
              x: (element.position.x / 100) * canvasWidth,
              y: (element.position.y / 100) * canvasHeight
            },
            // Convert percentage sizes to pixels
            size: {
              width: (element.size.width / 100) * canvasWidth,
              height: (element.size.height / 100) * canvasHeight
            },
            rotation: 0,
            flipX: false,
            flipY: false,
            zIndex: idx,
          };

          if (element.type === "text") {
            const textLayer: TextLayer = {
              ...baseLayer,
              type: "text",
              name: element.content || `Text ${idx + 1}`,
              content: element.content || "Your text here",
              fontFamily: "Inter",
              fontSize: element.size.height > 15 ? 32 : element.size.height > 10 ? 24 : 16,
              fontWeight: element.size.height > 12 ? 700 : 500,
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.4,
            };
            return textLayer;
          }

          if (element.type === "image") {
            const imageLayer: ImageLayer = {
              ...baseLayer,
              type: "image",
              name: `Image ${idx + 1}`,
              src: "",
              objectFit: "cover",
            };
            return imageLayer;
          }

          if (element.type === "shape") {
            const shapeLayer: ShapeLayer = {
              ...baseLayer,
              type: "shape",
              name: `Shape ${idx + 1}`,
              shapeType: "rectangle",
              fill: "#ffffff",
              stroke: "transparent",
              strokeWidth: 0,
              borderRadius: 0,
            };
            return shapeLayer;
          }

          if (element.type === "logo") {
            const logoTextLayer: TextLayer = {
              ...baseLayer,
              type: "text",
              name: "Logo",
              content: "PhotoProOS",
              fontFamily: "Inter",
              fontSize: 16,
              fontWeight: 600,
              color: "rgba(255,255,255,0.8)",
              textAlign: "center",
              lineHeight: 1.2,
            };
            return logoTextLayer;
          }

          // Handle mockup elements as screenshot zones
          if (element.type === "mockup") {
            const screenshotZoneLayer: ScreenshotZoneLayer = {
              ...baseLayer,
              type: "screenshot-zone",
              name: "Dashboard Screenshot",
              placeholder: "Click to add dashboard screenshot",
              objectFit: "cover",
              borderRadius: 8,
            };
            return screenshotZoneLayer;
          }

          // Default to shape for unknown types
          const defaultLayer: ShapeLayer = {
            ...baseLayer,
            type: "shape",
            name: `Element ${idx + 1}`,
            shapeType: "rectangle",
            fill: "#3b82f6",
            stroke: "transparent",
            strokeWidth: 0,
            borderRadius: 0,
          };
          return defaultLayer;
        });

        // Set layers and switch to layers content type for editing
        setLayers(templateLayers);
        setContentType("layers");
        setShowLayersPanel(true);
        toast.success(`Loaded "${template.name}" template with ${templateLayers.length} editable layers`);
      }
    }
  }, [searchParams]);

  // Handle mockup selection
  const handleMockupSelect = React.useCallback((mockupId: string) => {
    setSelectedMockupId(mockupId);
    setContentType("mockup");
  }, []);

  // Handle screenshot selection for screenshot zones
  const handleScreenshotSelect = React.useCallback((src: string) => {
    if (!targetScreenshotZoneId) return;

    setLayers((prev) =>
      prev.map((layer) => {
        if (layer.id === targetScreenshotZoneId && layer.type === "screenshot-zone") {
          return {
            ...layer,
            src,
          } as ScreenshotZoneLayer;
        }
        return layer;
      })
    );

    setShowScreenshotPicker(false);
    setTargetScreenshotZoneId(null);
    toast.success("Screenshot added to layer");
  }, [targetScreenshotZoneId]);

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

  // Convert current composition to template layout
  const getCurrentTemplateLayout = React.useCallback((): TemplateLayout => {
    const canvasWidth = platformConfig?.previewSize?.width || 540;
    const canvasHeight = platformConfig?.previewSize?.height || 540;

    // Convert layers to template elements (percentages)
    const elements = layers.map((layer) => {
      const baseElement = {
        position: {
          x: (layer.position.x / canvasWidth) * 100,
          y: (layer.position.y / canvasHeight) * 100,
        },
        size: {
          width: (layer.size.width / canvasWidth) * 100,
          height: (layer.size.height / canvasHeight) * 100,
        },
      };

      if (layer.type === "text") {
        const textLayer = layer as TextLayer;
        return {
          ...baseElement,
          type: "text" as const,
          content: textLayer.content,
          style: {
            fontFamily: textLayer.fontFamily,
            fontSize: textLayer.fontSize,
            fontWeight: textLayer.fontWeight,
            color: textLayer.color,
            textAlign: textLayer.textAlign,
          },
        };
      }

      if (layer.type === "shape") {
        const shapeLayer = layer as ShapeLayer;
        return {
          ...baseElement,
          type: "shape" as const,
          style: {
            backgroundColor: shapeLayer.fill,
            borderColor: shapeLayer.stroke,
            borderWidth: shapeLayer.strokeWidth,
            borderRadius: shapeLayer.borderRadius || 0,
          },
        };
      }

      if (layer.type === "image") {
        return {
          ...baseElement,
          type: "image" as const,
        };
      }

      // Default for other types
      return {
        ...baseElement,
        type: "shape" as const,
      };
    });

    return {
      background: canvasBgType,
      backgroundColor: canvasBgType === "solid" ? canvasBgColor : undefined,
      gradientFrom: canvasBgType === "gradient" ? canvasGradientFrom : undefined,
      gradientTo: canvasBgType === "gradient" ? canvasGradientTo : undefined,
      gradientAngle: canvasBgType === "gradient" ? canvasGradientAngle : undefined,
      elements,
    };
  }, [layers, platformConfig, canvasBgType, canvasBgColor, canvasGradientFrom, canvasGradientTo, canvasGradientAngle]);

  // Handle save as template
  const handleSaveAsTemplate = React.useCallback((templateData: {
    name: string;
    description: string;
    category: TemplateCategory;
    platforms: PlatformId[];
    format: PostFormat;
    tags: string[];
    captionTemplate: string;
    layout: TemplateLayout;
  }) => {
    try {
      const savedTemplate = saveCustomTemplate(templateData);
      toast.success(`Template "${savedTemplate.name}" saved successfully!`);
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error("Failed to save template");
    }
  }, []);

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
      flipX: false,
      flipY: false,
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

  // Carousel slide handlers
  const createNewSlide = React.useCallback((): CarouselSlide => ({
    id: `slide-${Date.now()}`,
    layers: [],
    bgType: canvasBgType,
    bgColor: canvasBgColor,
    gradientFrom: canvasGradientFrom,
    gradientTo: canvasGradientTo,
    gradientAngle: canvasGradientAngle,
  }), [canvasBgType, canvasBgColor, canvasGradientFrom, canvasGradientTo, canvasGradientAngle]);

  const handleAddSlide = React.useCallback(() => {
    const newSlide = createNewSlide();
    setCarouselSlides((prev) => [...prev, newSlide]);
    setCurrentSlideIndex(carouselSlides.length); // Go to the new slide
    // Clear current layers for the new slide
    setLayers([]);
    setSelectedLayerId(null);
    toast.success("New slide added");
  }, [createNewSlide, carouselSlides.length]);

  const handleDeleteSlide = React.useCallback((index: number) => {
    if (carouselSlides.length <= 1) {
      toast.error("Carousel must have at least one slide");
      return;
    }

    setCarouselSlides((prev) => prev.filter((_, i) => i !== index));

    // Adjust current slide index if needed
    if (currentSlideIndex >= carouselSlides.length - 1) {
      setCurrentSlideIndex(Math.max(0, carouselSlides.length - 2));
    } else if (currentSlideIndex > index) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }

    toast.success("Slide deleted");
  }, [carouselSlides.length, currentSlideIndex]);

  const handleDuplicateSlide = React.useCallback((index: number) => {
    const slide = carouselSlides[index];
    if (!slide) return;

    const newSlide: CarouselSlide = {
      ...slide,
      id: `slide-${Date.now()}`,
      layers: slide.layers.map((l) => ({ ...l, id: generateLayerId() })),
    };

    const newSlides = [...carouselSlides];
    newSlides.splice(index + 1, 0, newSlide);
    setCarouselSlides(newSlides);
    setCurrentSlideIndex(index + 1);
    setLayers(newSlide.layers);
    toast.success("Slide duplicated");
  }, [carouselSlides]);

  const handleGoToSlide = React.useCallback((index: number) => {
    // Save current slide state
    if (carouselSlides.length > 0 && currentSlideIndex < carouselSlides.length) {
      const updatedSlides = [...carouselSlides];
      updatedSlides[currentSlideIndex] = {
        ...updatedSlides[currentSlideIndex],
        layers,
        bgType: canvasBgType,
        bgColor: canvasBgColor,
        gradientFrom: canvasGradientFrom,
        gradientTo: canvasGradientTo,
        gradientAngle: canvasGradientAngle,
      };
      setCarouselSlides(updatedSlides);
    }

    // Load new slide state
    const targetSlide = carouselSlides[index];
    if (targetSlide) {
      setLayers(targetSlide.layers);
      setCanvasBgType(targetSlide.bgType);
      setCanvasBgColor(targetSlide.bgColor);
      setCanvasGradientFrom(targetSlide.gradientFrom);
      setCanvasGradientTo(targetSlide.gradientTo);
      setCanvasGradientAngle(targetSlide.gradientAngle);
    }

    setCurrentSlideIndex(index);
    setSelectedLayerId(null);
  }, [carouselSlides, currentSlideIndex, layers, canvasBgType, canvasBgColor, canvasGradientFrom, canvasGradientTo, canvasGradientAngle]);

  // Initialize carousel mode
  React.useEffect(() => {
    if (isCarouselMode && carouselSlides.length === 0) {
      // Create first slide with current canvas state
      const initialSlide: CarouselSlide = {
        id: `slide-${Date.now()}`,
        layers: [...layers],
        bgType: canvasBgType,
        bgColor: canvasBgColor,
        gradientFrom: canvasGradientFrom,
        gradientTo: canvasGradientTo,
        gradientAngle: canvasGradientAngle,
      };
      setCarouselSlides([initialSlide]);
      setCurrentSlideIndex(0);
    }
  }, [isCarouselMode]);

  // Save current slide state when layers or background change
  React.useEffect(() => {
    if (isCarouselMode && carouselSlides.length > 0 && currentSlideIndex < carouselSlides.length) {
      const updatedSlides = [...carouselSlides];
      updatedSlides[currentSlideIndex] = {
        ...updatedSlides[currentSlideIndex],
        layers,
        bgType: canvasBgType,
        bgColor: canvasBgColor,
        gradientFrom: canvasGradientFrom,
        gradientTo: canvasGradientTo,
        gradientAngle: canvasGradientAngle,
      };
      setCarouselSlides(updatedSlides);
    }
  }, [layers, canvasBgType, canvasBgColor, canvasGradientFrom, canvasGradientTo, canvasGradientAngle]);

  // Inline text editing handlers
  const handleStartTextEdit = React.useCallback((layerId: string) => {
    const layer = layers.find((l) => l.id === layerId);
    if (!layer || layer.type !== "text" || layer.locked) return;

    const textLayer = layer as TextLayer;
    setEditingTextLayerId(layerId);
    setEditingTextValue(textLayer.content);
    // Focus the textarea after state update
    setTimeout(() => {
      textEditRef.current?.focus();
      textEditRef.current?.select();
    }, 0);
  }, [layers]);

  const handleCommitTextEdit = React.useCallback(() => {
    if (!editingTextLayerId) return;

    // Update the layer with the new text
    if (editingTextValue.trim()) {
      handleUpdateLayer(editingTextLayerId, { content: editingTextValue } as Partial<TextLayer>);
    }

    // Clear editing state
    setEditingTextLayerId(null);
    setEditingTextValue("");
  }, [editingTextLayerId, editingTextValue, handleUpdateLayer]);

  const handleCancelTextEdit = React.useCallback(() => {
    setEditingTextLayerId(null);
    setEditingTextValue("");
  }, []);

  // Drag-and-drop state
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragLayerId, setDragLayerId] = React.useState<string | null>(null);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [layerStart, setLayerStart] = React.useState({ x: 0, y: 0 });
  const canvasRef = React.useRef<HTMLDivElement>(null);

  // Resize state
  type ResizeHandle = "nw" | "n" | "ne" | "w" | "e" | "sw" | "s" | "se";
  const [isResizing, setIsResizing] = React.useState(false);
  const [resizeHandle, setResizeHandle] = React.useState<ResizeHandle | null>(null);
  const [resizeLayerId, setResizeLayerId] = React.useState<string | null>(null);
  const [resizeStart, setResizeStart] = React.useState({ x: 0, y: 0 });
  const [initialLayerBounds, setInitialLayerBounds] = React.useState({ x: 0, y: 0, width: 0, height: 0 });

  // Handle layer drag start with multi-select support
  const handleLayerMouseDown = React.useCallback((e: React.MouseEvent, layerId: string) => {
    const layer = layers.find((l) => l.id === layerId);
    if (!layer || layer.locked) return;

    e.preventDefault();
    e.stopPropagation();

    const isMod = e.metaKey || e.ctrlKey;
    const isShift = e.shiftKey;

    // Multi-select with Cmd/Ctrl or Shift
    if (isMod || isShift) {
      setSelectedLayerIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(layerId)) {
          newSet.delete(layerId);
          // If deselecting, also update single selection
          if (selectedLayerId === layerId) {
            setSelectedLayerId(newSet.size > 0 ? Array.from(newSet)[0] : null);
          }
        } else {
          newSet.add(layerId);
          // Set as primary selection
          setSelectedLayerId(layerId);
        }
        return newSet;
      });
      setRightPanelTab("properties");
      return;
    }

    // Single click - clear multi-selection and select only this layer
    setSelectedLayerIds(new Set([layerId]));
    setIsDragging(true);
    setDragLayerId(layerId);
    setDragStart({ x: e.clientX, y: e.clientY });
    setLayerStart({ x: layer.position.x, y: layer.position.y });
    setSelectedLayerId(layerId);
    setRightPanelTab("properties");
  }, [layers, selectedLayerId]);

  // Snap value to grid
  const snapToGridValue = React.useCallback(
    (value: number): number => {
      if (!snapToGrid) return value;
      return Math.round(value / gridSize) * gridSize;
    },
    [snapToGrid, gridSize]
  );

  // Get snap guides for layer alignment
  const getSnapGuides = React.useCallback(
    (layerId: string, x: number, y: number, width: number, height: number) => {
      if (!snapToGrid) return { x, y, guides: [] as { type: "h" | "v"; position: number }[] };

      const SNAP_THRESHOLD = 8;
      const guides: { type: "h" | "v"; position: number }[] = [];
      let snappedX = x;
      let snappedY = y;

      // Get canvas dimensions (approximate based on platform config)
      const canvasWidth = platformConfig?.previewSize?.width || 540;
      const canvasHeight = platformConfig?.previewSize?.height || 540;

      // Center lines
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;

      // Check layer center against canvas center
      const layerCenterX = x + width / 2;
      const layerCenterY = y + height / 2;

      // Snap to canvas center X
      if (Math.abs(layerCenterX - centerX) < SNAP_THRESHOLD) {
        snappedX = centerX - width / 2;
        guides.push({ type: "v", position: centerX });
      }

      // Snap to canvas center Y
      if (Math.abs(layerCenterY - centerY) < SNAP_THRESHOLD) {
        snappedY = centerY - height / 2;
        guides.push({ type: "h", position: centerY });
      }

      // Check alignment with other layers
      for (const layer of layers) {
        if (layer.id === layerId) continue;

        const otherX = layer.position.x;
        const otherY = layer.position.y;
        const otherWidth = layer.size.width;
        const otherHeight = layer.size.height;
        const otherCenterX = otherX + otherWidth / 2;
        const otherCenterY = otherY + otherHeight / 2;

        // Snap to left edge of other layer
        if (Math.abs(x - otherX) < SNAP_THRESHOLD) {
          snappedX = otherX;
          guides.push({ type: "v", position: otherX });
        }
        // Snap to right edge of other layer
        if (Math.abs(x + width - (otherX + otherWidth)) < SNAP_THRESHOLD) {
          snappedX = otherX + otherWidth - width;
          guides.push({ type: "v", position: otherX + otherWidth });
        }
        // Snap to center X of other layer
        if (Math.abs(layerCenterX - otherCenterX) < SNAP_THRESHOLD) {
          snappedX = otherCenterX - width / 2;
          guides.push({ type: "v", position: otherCenterX });
        }

        // Snap to top edge of other layer
        if (Math.abs(y - otherY) < SNAP_THRESHOLD) {
          snappedY = otherY;
          guides.push({ type: "h", position: otherY });
        }
        // Snap to bottom edge of other layer
        if (Math.abs(y + height - (otherY + otherHeight)) < SNAP_THRESHOLD) {
          snappedY = otherY + otherHeight - height;
          guides.push({ type: "h", position: otherY + otherHeight });
        }
        // Snap to center Y of other layer
        if (Math.abs(layerCenterY - otherCenterY) < SNAP_THRESHOLD) {
          snappedY = otherCenterY - height / 2;
          guides.push({ type: "h", position: otherCenterY });
        }
      }

      // Grid snapping (only if no alignment guides are active)
      if (guides.length === 0) {
        snappedX = snapToGridValue(x);
        snappedY = snapToGridValue(y);
      }

      return { x: snappedX, y: snappedY, guides };
    },
    [snapToGrid, gridSize, layers, platformConfig, snapToGridValue]
  );

  // Handle layer drag
  React.useEffect(() => {
    if (!isDragging || !dragLayerId) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      let newX = Math.max(0, layerStart.x + deltaX);
      let newY = Math.max(0, layerStart.y + deltaY);

      // Get the layer being dragged
      const layer = layers.find((l) => l.id === dragLayerId);
      if (layer) {
        // Apply snapping
        const snapResult = getSnapGuides(dragLayerId, newX, newY, layer.size.width, layer.size.height);
        newX = snapResult.x;
        newY = snapResult.y;
        setAlignmentGuides(snapResult.guides);
      }

      handleUpdateLayer(dragLayerId, {
        position: { x: newX, y: newY },
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragLayerId(null);
      setAlignmentGuides([]);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragLayerId, dragStart, layerStart, handleUpdateLayer, layers, getSnapGuides]);

  // Handle resize start
  const handleResizeMouseDown = React.useCallback(
    (e: React.MouseEvent, layerId: string, handle: ResizeHandle) => {
      const layer = layers.find((l) => l.id === layerId);
      if (!layer || layer.locked) return;

      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);
      setResizeHandle(handle);
      setResizeLayerId(layerId);
      setResizeStart({ x: e.clientX, y: e.clientY });
      setInitialLayerBounds({
        x: layer.position.x,
        y: layer.position.y,
        width: layer.size.width,
        height: layer.size.height,
      });
    },
    [layers]
  );

  // Handle resize drag
  React.useEffect(() => {
    if (!isResizing || !resizeLayerId || !resizeHandle) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newX = initialLayerBounds.x;
      let newY = initialLayerBounds.y;
      let newWidth = initialLayerBounds.width;
      let newHeight = initialLayerBounds.height;

      const minSize = 20; // Minimum layer size

      // Calculate new dimensions based on handle
      switch (resizeHandle) {
        case "se":
          newWidth = Math.max(minSize, initialLayerBounds.width + deltaX);
          newHeight = Math.max(minSize, initialLayerBounds.height + deltaY);
          break;
        case "sw":
          newWidth = Math.max(minSize, initialLayerBounds.width - deltaX);
          newHeight = Math.max(minSize, initialLayerBounds.height + deltaY);
          newX = initialLayerBounds.x + initialLayerBounds.width - newWidth;
          break;
        case "ne":
          newWidth = Math.max(minSize, initialLayerBounds.width + deltaX);
          newHeight = Math.max(minSize, initialLayerBounds.height - deltaY);
          newY = initialLayerBounds.y + initialLayerBounds.height - newHeight;
          break;
        case "nw":
          newWidth = Math.max(minSize, initialLayerBounds.width - deltaX);
          newHeight = Math.max(minSize, initialLayerBounds.height - deltaY);
          newX = initialLayerBounds.x + initialLayerBounds.width - newWidth;
          newY = initialLayerBounds.y + initialLayerBounds.height - newHeight;
          break;
        case "e":
          newWidth = Math.max(minSize, initialLayerBounds.width + deltaX);
          break;
        case "w":
          newWidth = Math.max(minSize, initialLayerBounds.width - deltaX);
          newX = initialLayerBounds.x + initialLayerBounds.width - newWidth;
          break;
        case "s":
          newHeight = Math.max(minSize, initialLayerBounds.height + deltaY);
          break;
        case "n":
          newHeight = Math.max(minSize, initialLayerBounds.height - deltaY);
          newY = initialLayerBounds.y + initialLayerBounds.height - newHeight;
          break;
      }

      // Hold shift for aspect ratio lock (corner handles only)
      if (e.shiftKey && ["nw", "ne", "sw", "se"].includes(resizeHandle)) {
        const aspectRatio = initialLayerBounds.width / initialLayerBounds.height;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          newHeight = newWidth / aspectRatio;
          if (resizeHandle === "nw" || resizeHandle === "ne") {
            newY = initialLayerBounds.y + initialLayerBounds.height - newHeight;
          }
        } else {
          newWidth = newHeight * aspectRatio;
          if (resizeHandle === "nw" || resizeHandle === "sw") {
            newX = initialLayerBounds.x + initialLayerBounds.width - newWidth;
          }
        }
      }

      handleUpdateLayer(resizeLayerId, {
        position: { x: Math.max(0, newX), y: Math.max(0, newY) },
        size: { width: newWidth, height: newHeight },
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeHandle(null);
      setResizeLayerId(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, resizeLayerId, resizeHandle, resizeStart, initialLayerBounds, handleUpdateLayer]);

  // Undo/Redo history
  const [layerHistory, setLayerHistory] = React.useState<Layer[][]>([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  const isUndoRedoRef = React.useRef(false);

  // Save to history when layers change (but not during undo/redo)
  React.useEffect(() => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }
    if (layers.length === 0 && layerHistory.length === 0) return;

    // Don't save during drag or resize operations
    if (isDragging || isResizing) return;

    setLayerHistory((prev) => {
      // Remove any future history if we're not at the end
      const newHistory = prev.slice(0, historyIndex + 1);
      // Add current state
      newHistory.push([...layers]);
      // Keep max 50 history entries
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 49));
  }, [layers, isDragging, isResizing]);

  // Undo handler
  const handleUndo = React.useCallback(() => {
    if (historyIndex <= 0) return;
    isUndoRedoRef.current = true;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setLayers(layerHistory[newIndex] || []);
    toast.success("Undo");
  }, [historyIndex, layerHistory]);

  // Redo handler
  const handleRedo = React.useCallback(() => {
    if (historyIndex >= layerHistory.length - 1) return;
    isUndoRedoRef.current = true;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setLayers(layerHistory[newIndex] || []);
    toast.success("Redo");
  }, [historyIndex, layerHistory]);

  // Alignment handlers
  const handleAlignLayer = React.useCallback(
    (alignment: "left" | "center-h" | "right" | "top" | "center-v" | "bottom") => {
      if (!selectedLayerId) return;
      const layer = layers.find((l) => l.id === selectedLayerId);
      if (!layer || layer.locked) return;

      // Get canvas dimensions from platform config
      const canvasWidth = platformConfig?.previewSize?.width || 540;
      const canvasHeight = platformConfig?.previewSize?.height || 540;

      const newPosition = { ...layer.position };

      switch (alignment) {
        case "left":
          newPosition.x = 0;
          break;
        case "center-h":
          newPosition.x = (canvasWidth - layer.size.width) / 2;
          break;
        case "right":
          newPosition.x = canvasWidth - layer.size.width;
          break;
        case "top":
          newPosition.y = 0;
          break;
        case "center-v":
          newPosition.y = (canvasHeight - layer.size.height) / 2;
          break;
        case "bottom":
          newPosition.y = canvasHeight - layer.size.height;
          break;
      }

      handleUpdateLayer(selectedLayerId, { position: newPosition });
    },
    [selectedLayerId, layers, platformConfig, handleUpdateLayer]
  );

  // Copy layer style
  const handleCopyStyle = React.useCallback(() => {
    if (!selectedLayerId) return;
    const layer = layers.find((l) => l.id === selectedLayerId);
    if (!layer) return;

    const baseStyle = {
      opacity: layer.opacity,
      rotation: layer.rotation,
      flipX: layer.flipX,
      flipY: layer.flipY,
    };

    // Add type-specific styles
    if (layer.type === "shape") {
      const shapeLayer = layer as ShapeLayer;
      setCopiedStyle({
        ...baseStyle,
        fill: shapeLayer.fill,
        stroke: shapeLayer.stroke,
        strokeWidth: shapeLayer.strokeWidth,
        borderRadius: shapeLayer.borderRadius,
      });
    } else if (layer.type === "text") {
      const textLayer = layer as TextLayer;
      setCopiedStyle({
        ...baseStyle,
        color: textLayer.color,
        fontFamily: textLayer.fontFamily,
        fontSize: textLayer.fontSize,
        fontWeight: textLayer.fontWeight,
        textAlign: textLayer.textAlign,
        lineHeight: textLayer.lineHeight,
      });
    } else {
      setCopiedStyle(baseStyle);
    }

    toast.success("Style copied");
  }, [selectedLayerId, layers]);

  // Paste layer style
  const handlePasteStyle = React.useCallback(() => {
    if (!selectedLayerId || !copiedStyle) return;
    const layer = layers.find((l) => l.id === selectedLayerId);
    if (!layer || layer.locked) return;

    const updates: Partial<Layer> = {
      opacity: copiedStyle.opacity,
      rotation: copiedStyle.rotation,
      flipX: copiedStyle.flipX,
      flipY: copiedStyle.flipY,
    };

    // Apply type-specific styles if layer types match
    if (layer.type === "shape" && copiedStyle.fill !== undefined) {
      Object.assign(updates, {
        fill: copiedStyle.fill,
        stroke: copiedStyle.stroke,
        strokeWidth: copiedStyle.strokeWidth,
        borderRadius: copiedStyle.borderRadius,
      });
    } else if (layer.type === "text" && copiedStyle.color !== undefined) {
      Object.assign(updates, {
        color: copiedStyle.color,
        fontFamily: copiedStyle.fontFamily,
        fontSize: copiedStyle.fontSize,
        fontWeight: copiedStyle.fontWeight,
        textAlign: copiedStyle.textAlign,
        lineHeight: copiedStyle.lineHeight,
      });
    }

    handleUpdateLayer(selectedLayerId, updates);
    toast.success("Style pasted");
  }, [selectedLayerId, copiedStyle, layers, handleUpdateLayer]);

  // Quick opacity change handler
  const handleQuickOpacityChange = React.useCallback((opacity: number) => {
    if (!selectedLayerId) return;
    const layer = layers.find((l) => l.id === selectedLayerId);
    if (!layer || layer.locked) return;
    handleUpdateLayer(selectedLayerId, { opacity });
  }, [selectedLayerId, layers, handleUpdateLayer]);

  // Save composition as template
  const handleSaveComposition = React.useCallback(() => {
    if (layers.length === 0) {
      toast.error("Add at least one layer to save");
      return;
    }

    const compositionName = prompt("Enter a name for this composition:");
    if (!compositionName) return;

    const composition = {
      id: `custom-${Date.now()}`,
      name: compositionName,
      createdAt: new Date().toISOString(),
      platform: selectedPlatform,
      format: selectedFormat,
      layers: layers,
      canvasBackground: {
        type: canvasBgType,
        color: canvasBgColor,
        gradientFrom: canvasGradientFrom,
        gradientTo: canvasGradientTo,
        gradientAngle: canvasGradientAngle,
      },
      caption: caption,
    };

    // Get existing saved compositions
    const existingStr = localStorage.getItem("photoproos-saved-compositions");
    const existing = existingStr ? JSON.parse(existingStr) : [];
    existing.push(composition);
    localStorage.setItem("photoproos-saved-compositions", JSON.stringify(existing));

    toast.success(`Saved "${compositionName}"`);
  }, [layers, selectedPlatform, selectedFormat, canvasBgType, canvasBgColor, canvasGradientFrom, canvasGradientTo, canvasGradientAngle, caption]);

  // Load saved compositions list
  const savedCompositions = React.useMemo(() => {
    if (typeof window === "undefined") return [];
    const str = localStorage.getItem("photoproos-saved-compositions");
    return str ? JSON.parse(str) : [];
  }, []);

  // Load a saved composition
  const handleLoadComposition = React.useCallback((compositionId: string) => {
    const compositions = JSON.parse(localStorage.getItem("photoproos-saved-compositions") || "[]");
    const composition = compositions.find((c: { id: string }) => c.id === compositionId);
    if (!composition) return;

    // Apply the saved composition
    setLayers(composition.layers);
    setSelectedPlatform(composition.platform);
    setSelectedFormat(composition.format);
    setCanvasBgType(composition.canvasBackground.type);
    setCanvasBgColor(composition.canvasBackground.color);
    setCanvasGradientFrom(composition.canvasBackground.gradientFrom);
    setCanvasGradientTo(composition.canvasBackground.gradientTo);
    setCanvasGradientAngle(composition.canvasBackground.gradientAngle);
    setCaption(composition.caption || "");

    toast.success(`Loaded "${composition.name}"`);
  }, []);

  // Group selected layers
  const handleGroupLayers = React.useCallback(() => {
    if (selectedLayerIds.size < 2) {
      toast.error("Select at least 2 layers to group");
      return;
    }

    // Get all selected layers
    const selectedLayers = layers.filter((l) => selectedLayerIds.has(l.id) && !l.locked);
    if (selectedLayers.length < 2) {
      toast.error("Select at least 2 unlocked layers to group");
      return;
    }

    // Calculate bounding box for the group
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedLayers.forEach((layer) => {
      minX = Math.min(minX, layer.position.x);
      minY = Math.min(minY, layer.position.y);
      maxX = Math.max(maxX, layer.position.x + layer.size.width);
      maxY = Math.max(maxY, layer.position.y + layer.size.height);
    });

    // Adjust child positions to be relative to group position
    const childLayers = selectedLayers.map((layer) => ({
      ...layer,
      position: {
        x: layer.position.x - minX,
        y: layer.position.y - minY,
      },
    }));

    // Create the group layer
    const groupLayer: GroupLayer = {
      id: generateLayerId(),
      type: "group",
      name: `Group ${layers.filter((l) => l.type === "group").length + 1}`,
      visible: true,
      locked: false,
      opacity: 100,
      position: { x: minX, y: minY },
      size: { width: maxX - minX, height: maxY - minY },
      rotation: 0,
      flipX: false,
      flipY: false,
      zIndex: Math.max(...selectedLayers.map((l) => l.zIndex)),
      children: childLayers as Layer[],
      expanded: false,
    };

    // Remove selected layers and add the group
    setLayers((prev) => [
      ...prev.filter((l) => !selectedLayerIds.has(l.id)),
      groupLayer,
    ]);
    setSelectedLayerId(groupLayer.id);
    setSelectedLayerIds(new Set([groupLayer.id]));
    toast.success(`Grouped ${selectedLayers.length} layers`);
  }, [selectedLayerIds, layers]);

  // Ungroup a group layer
  const handleUngroupLayers = React.useCallback(() => {
    if (!selectedLayerId) return;
    const layer = layers.find((l) => l.id === selectedLayerId);
    if (!layer || layer.type !== "group") {
      toast.error("Select a group to ungroup");
      return;
    }

    const groupLayer = layer as GroupLayer;

    // Restore child layers with absolute positions
    const restoredLayers = groupLayer.children.map((child, idx) => ({
      ...child,
      position: {
        x: child.position.x + groupLayer.position.x,
        y: child.position.y + groupLayer.position.y,
      },
      zIndex: groupLayer.zIndex + idx,
    }));

    // Remove the group and add the child layers
    setLayers((prev) => [
      ...prev.filter((l) => l.id !== selectedLayerId),
      ...restoredLayers as Layer[],
    ]);
    setSelectedLayerId(null);
    setSelectedLayerIds(new Set());
    toast.success(`Ungrouped ${restoredLayers.length} layers`);
  }, [selectedLayerId, layers]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;

      // Delete selected layer(s) (Delete or Backspace)
      if ((e.key === "Delete" || e.key === "Backspace") && (selectedLayerId || selectedLayerIds.size > 0)) {
        e.preventDefault();
        // Delete all multi-selected layers if any
        if (selectedLayerIds.size > 1) {
          selectedLayerIds.forEach((id) => handleDeleteLayer(id));
          setSelectedLayerIds(new Set());
          toast.success(`Deleted ${selectedLayerIds.size} layers`);
        } else if (selectedLayerId) {
          handleDeleteLayer(selectedLayerId);
        }
        return;
      }

      // Escape - Cancel text editing or deselect layer(s)
      if (e.key === "Escape") {
        e.preventDefault();
        // If editing text, cancel the edit
        if (editingTextLayerId) {
          handleCancelTextEdit();
          return;
        }
        // Otherwise deselect layers
        setSelectedLayerId(null);
        setSelectedLayerIds(new Set());
        return;
      }

      // Select all layers (Cmd/Ctrl + A)
      if (isMod && e.key === "a" && layers.length > 0) {
        e.preventDefault();
        const allIds = new Set(layers.filter((l) => !l.locked).map((l) => l.id));
        setSelectedLayerIds(allIds);
        if (allIds.size > 0) {
          setSelectedLayerId(Array.from(allIds)[0]);
        }
        toast.success(`Selected ${allIds.size} layers`);
        return;
      }

      // Undo (Cmd/Ctrl + Z)
      if (isMod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo (Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y)
      if (isMod && ((e.key === "z" && e.shiftKey) || e.key === "y")) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Duplicate layer (Cmd/Ctrl + D)
      if (isMod && e.key === "d" && selectedLayerId) {
        e.preventDefault();
        handleDuplicateLayer(selectedLayerId);
        return;
      }

      // Copy style (Cmd/Ctrl + Shift + C) - when layer selected
      if (isMod && e.shiftKey && e.key === "c" && selectedLayerId) {
        e.preventDefault();
        handleCopyStyle();
        return;
      }

      // Paste style (Cmd/Ctrl + Shift + V) - when layer selected and style copied
      if (isMod && e.shiftKey && e.key === "v" && selectedLayerId && copiedStyle) {
        e.preventDefault();
        handlePasteStyle();
        return;
      }

      // Group layers (Cmd/Ctrl + G)
      if (isMod && e.key === "g" && !e.shiftKey && selectedLayerIds.size >= 2) {
        e.preventDefault();
        handleGroupLayers();
        return;
      }

      // Ungroup layers (Cmd/Ctrl + Shift + G)
      if (isMod && e.shiftKey && e.key === "g" && selectedLayerId) {
        e.preventDefault();
        handleUngroupLayers();
        return;
      }

      // Copy to clipboard (Cmd/Ctrl + C) - only when no text is selected and not shift
      if (isMod && e.key === "c" && !e.shiftKey && !window.getSelection()?.toString()) {
        e.preventDefault();
        handleCopy();
        return;
      }

      // Export (Cmd/Ctrl + E)
      if (isMod && e.key === "e") {
        e.preventDefault();
        handleExport();
        return;
      }

      // Add text layer (T)
      if (e.key === "t" && !isMod) {
        e.preventDefault();
        handleAddLayer("text");
        return;
      }

      // Add image layer (I)
      if (e.key === "i" && !isMod) {
        e.preventDefault();
        handleAddLayer("image");
        return;
      }

      // Add shape layer (S)
      if (e.key === "s" && !isMod) {
        e.preventDefault();
        handleAddLayer("shape");
        return;
      }

      // Move layer with arrow keys
      if (selectedLayerId && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const layer = layers.find((l) => l.id === selectedLayerId);
        if (!layer || layer.locked) return;

        const step = e.shiftKey ? 10 : 1;
        let newX = layer.position.x;
        let newY = layer.position.y;

        switch (e.key) {
          case "ArrowUp":
            newY = Math.max(0, newY - step);
            break;
          case "ArrowDown":
            newY += step;
            break;
          case "ArrowLeft":
            newX = Math.max(0, newX - step);
            break;
          case "ArrowRight":
            newX += step;
            break;
        }

        handleUpdateLayer(selectedLayerId, { position: { x: newX, y: newY } });
        return;
      }

      // Toggle layers panel (L)
      if (e.key === "l" && !isMod) {
        e.preventDefault();
        setShowLayersPanel((prev) => !prev);
        return;
      }

      // Zoom in (Cmd/Ctrl + Plus or =)
      if (isMod && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        setCanvasZoom((prev) => {
          const currentIndex = ZOOM_LEVELS.indexOf(prev);
          if (currentIndex === -1) return Math.min(200, prev + 25);
          return ZOOM_LEVELS[Math.min(currentIndex + 1, ZOOM_LEVELS.length - 1)];
        });
        return;
      }

      // Zoom out (Cmd/Ctrl + Minus)
      if (isMod && e.key === "-") {
        e.preventDefault();
        setCanvasZoom((prev) => {
          const currentIndex = ZOOM_LEVELS.indexOf(prev);
          if (currentIndex === -1) return Math.max(25, prev - 25);
          return ZOOM_LEVELS[Math.max(currentIndex - 1, 0)];
        });
        return;
      }

      // Reset zoom (Cmd/Ctrl + 0)
      if (isMod && e.key === "0") {
        e.preventDefault();
        setCanvasZoom(100);
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedLayerId,
    selectedLayerIds,
    layers,
    handleDeleteLayer,
    handleDuplicateLayer,
    handleUpdateLayer,
    handleUndo,
    handleRedo,
    handleCopy,
    handleExport,
    handleAddLayer,
    handleCopyStyle,
    handlePasteStyle,
    handleGroupLayers,
    handleUngroupLayers,
    copiedStyle,
    editingTextLayerId,
    handleCancelTextEdit,
  ]);

  // Resize handles component for selected layers
  const renderResizeHandles = React.useCallback(
    (layerId: string, locked: boolean) => {
      if (selectedLayerId !== layerId || locked) return null;

      const handles: { position: ResizeHandle; cursor: string; style: React.CSSProperties }[] = [
        { position: "nw", cursor: "nwse-resize", style: { top: -4, left: -4 } },
        { position: "n", cursor: "ns-resize", style: { top: -4, left: "50%", transform: "translateX(-50%)" } },
        { position: "ne", cursor: "nesw-resize", style: { top: -4, right: -4 } },
        { position: "w", cursor: "ew-resize", style: { top: "50%", left: -4, transform: "translateY(-50%)" } },
        { position: "e", cursor: "ew-resize", style: { top: "50%", right: -4, transform: "translateY(-50%)" } },
        { position: "sw", cursor: "nesw-resize", style: { bottom: -4, left: -4 } },
        { position: "s", cursor: "ns-resize", style: { bottom: -4, left: "50%", transform: "translateX(-50%)" } },
        { position: "se", cursor: "nwse-resize", style: { bottom: -4, right: -4 } },
      ];

      return (
        <>
          {handles.map((handle) => (
            <div
              key={handle.position}
              className="absolute w-2 h-2 bg-white border border-[var(--primary)] rounded-sm z-50"
              style={{
                ...handle.style,
                cursor: handle.cursor,
              }}
              onMouseDown={(e) => handleResizeMouseDown(e, layerId, handle.position)}
            />
          ))}
        </>
      );
    },
    [selectedLayerId, handleResizeMouseDown]
  );

  // Render lock badge for locked layers
  const renderLockBadge = React.useCallback((locked: boolean) => {
    if (!locked) return null;
    return (
      <div
        className="absolute -top-2 -right-2 z-50 flex items-center justify-center w-5 h-5 rounded-full bg-[var(--warning)] shadow-md"
        title="Layer is locked"
        aria-label="Locked layer"
      >
        <Lock className="h-3 w-3 text-white" aria-hidden="true" />
      </div>
    );
  }, []);

  // Render a single layer
  const renderLayer = React.useCallback((layer: Layer) => {
    if (!layer.visible) return null;

    const isSelected = selectedLayerId === layer.id;
    const isMultiSelected = selectedLayerIds.has(layer.id);
    const isPrimarySelection = isSelected && selectedLayerIds.size > 1;

    // Build transform string including rotation and flip
    const transforms: string[] = [];
    if (layer.rotation !== 0) transforms.push(`rotate(${layer.rotation}deg)`);
    if (layer.flipX) transforms.push("scaleX(-1)");
    if (layer.flipY) transforms.push("scaleY(-1)");

    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: `${layer.position.x}px`,
      top: `${layer.position.y}px`,
      width: `${layer.size.width}px`,
      height: `${layer.size.height}px`,
      opacity: layer.opacity / 100,
      transform: transforms.length > 0 ? transforms.join(" ") : undefined,
      zIndex: layer.zIndex,
      pointerEvents: layer.locked ? "none" : "auto",
    };

    switch (layer.type) {
      case "text": {
        const textLayer = layer as TextLayer;
        const isEditingThis = editingTextLayerId === layer.id;
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
              alignItems: isEditingThis ? "stretch" : "center",
              justifyContent: textLayer.textAlign === "center" ? "center" : textLayer.textAlign === "right" ? "flex-end" : "flex-start",
              cursor: isEditingThis ? "text" : layer.locked ? "not-allowed" : isDragging && dragLayerId === layer.id ? "grabbing" : "grab",
            }}
            className={cn(
              "whitespace-pre-wrap transition-shadow",
              !isEditingThis && "select-none",
              isSelected && "ring-2 ring-[var(--primary)] ring-offset-1",
              isMultiSelected && !isSelected && "ring-2 ring-[var(--ai)] ring-offset-1",
              isPrimarySelection && "ring-2 ring-[var(--primary)] ring-offset-2",
              isDragging && dragLayerId === layer.id && "opacity-90 shadow-lg"
            )}
            onMouseDown={(e) => {
              if (!isEditingThis) {
                handleLayerMouseDown(e, layer.id);
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (!layer.locked) {
                handleStartTextEdit(layer.id);
              }
            }}
          >
            {isEditingThis ? (
              <textarea
                ref={textEditRef}
                value={editingTextValue}
                onChange={(e) => setEditingTextValue(e.target.value)}
                onBlur={handleCommitTextEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCommitTextEdit();
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    handleCancelTextEdit();
                  }
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  padding: 0,
                  margin: 0,
                  font: "inherit",
                  color: "inherit",
                  textAlign: textLayer.textAlign as React.CSSProperties["textAlign"],
                  lineHeight: textLayer.lineHeight,
                  overflow: "hidden",
                }}
                className="focus:outline-none"
              />
            ) : (
              textLayer.content
            )}
            {!isEditingThis && renderResizeHandles(layer.id, layer.locked)}
            {renderLockBadge(layer.locked)}
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
              cursor: layer.locked ? "not-allowed" : isDragging && dragLayerId === layer.id ? "grabbing" : "grab",
            }}
            className={cn(
              "transition-shadow",
              isSelected && "ring-2 ring-[var(--primary)] ring-offset-1",
              isMultiSelected && !isSelected && "ring-2 ring-[var(--ai)] ring-offset-1",
              isPrimarySelection && "ring-2 ring-[var(--primary)] ring-offset-2",
              isDragging && dragLayerId === layer.id && "opacity-90 shadow-lg"
            )}
            onMouseDown={(e) => handleLayerMouseDown(e, layer.id)}
          >
            {renderResizeHandles(layer.id, layer.locked)}
            {renderLockBadge(layer.locked)}
          </div>
        );
      }
      case "image": {
        const imageLayer = layer as ImageLayer;
        return (
          <div
            key={layer.id}
            style={{
              ...baseStyle,
              cursor: layer.locked ? "not-allowed" : isDragging && dragLayerId === layer.id ? "grabbing" : "grab",
            }}
            className={cn(
              "overflow-hidden transition-shadow",
              isSelected && "ring-2 ring-[var(--primary)] ring-offset-1",
              isMultiSelected && !isSelected && "ring-2 ring-[var(--ai)] ring-offset-1",
              isPrimarySelection && "ring-2 ring-[var(--primary)] ring-offset-2",
              isDragging && dragLayerId === layer.id && "opacity-90 shadow-lg"
            )}
            onMouseDown={(e) => handleLayerMouseDown(e, layer.id)}
          >
            {imageLayer.src ? (
              <img
                src={imageLayer.src}
                alt={layer.name}
                style={{ objectFit: imageLayer.objectFit }}
                className="w-full h-full pointer-events-none"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-[var(--background-hover)] flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-[var(--foreground-muted)]" aria-hidden="true" />
              </div>
            )}
            {renderResizeHandles(layer.id, layer.locked)}
            {renderLockBadge(layer.locked)}
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
            style={{
              ...baseStyle,
              cursor: layer.locked ? "not-allowed" : isDragging && dragLayerId === layer.id ? "grabbing" : "grab",
            }}
            className={cn(
              "overflow-hidden transition-shadow",
              isSelected && "ring-2 ring-[var(--primary)] ring-offset-1",
              isMultiSelected && !isSelected && "ring-2 ring-[var(--ai)] ring-offset-1",
              isPrimarySelection && "ring-2 ring-[var(--primary)] ring-offset-2",
              isDragging && dragLayerId === layer.id && "opacity-90 shadow-lg"
            )}
            onMouseDown={(e) => handleLayerMouseDown(e, layer.id)}
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
            {renderResizeHandles(layer.id, layer.locked)}
            {renderLockBadge(layer.locked)}
          </div>
        );
      }
      case "group": {
        const groupLayer = layer as GroupLayer;
        return (
          <div
            key={layer.id}
            style={{
              ...baseStyle,
              cursor: layer.locked ? "not-allowed" : isDragging && dragLayerId === layer.id ? "grabbing" : "grab",
            }}
            className={cn(
              "overflow-visible transition-shadow",
              isSelected && "ring-2 ring-[var(--primary)] ring-offset-1 ring-dashed",
              isMultiSelected && !isSelected && "ring-2 ring-[var(--ai)] ring-offset-1 ring-dashed",
              isPrimarySelection && "ring-2 ring-[var(--primary)] ring-offset-2 ring-dashed",
              isDragging && dragLayerId === layer.id && "opacity-90 shadow-lg"
            )}
            onMouseDown={(e) => handleLayerMouseDown(e, layer.id)}
          >
            {/* Render child layers with relative positioning */}
            {groupLayer.children.map((child) => {
              if (!child.visible) return null;

              // Build transform for child
              const childTransforms: string[] = [];
              if (child.rotation !== 0) childTransforms.push(`rotate(${child.rotation}deg)`);
              if (child.flipX) childTransforms.push("scaleX(-1)");
              if (child.flipY) childTransforms.push("scaleY(-1)");

              const childStyle: React.CSSProperties = {
                position: "absolute",
                left: `${child.position.x}px`,
                top: `${child.position.y}px`,
                width: `${child.size.width}px`,
                height: `${child.size.height}px`,
                opacity: child.opacity / 100,
                transform: childTransforms.length > 0 ? childTransforms.join(" ") : undefined,
                zIndex: child.zIndex,
                pointerEvents: "none",
              };

              if (child.type === "text") {
                const textChild = child as TextLayer;
                return (
                  <div
                    key={child.id}
                    style={{
                      ...childStyle,
                      fontFamily: textChild.fontFamily,
                      fontSize: `${textChild.fontSize}px`,
                      fontWeight: textChild.fontWeight,
                      color: textChild.color,
                      textAlign: textChild.textAlign,
                      lineHeight: textChild.lineHeight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: textChild.textAlign === "center" ? "center" : textChild.textAlign === "right" ? "flex-end" : "flex-start",
                    }}
                    className="select-none whitespace-pre-wrap"
                  >
                    {textChild.content}
                  </div>
                );
              }

              if (child.type === "shape") {
                const shapeChild = child as ShapeLayer;
                return (
                  <div
                    key={child.id}
                    style={{
                      ...childStyle,
                      backgroundColor: shapeChild.fill,
                      border: shapeChild.strokeWidth > 0 ? `${shapeChild.strokeWidth}px solid ${shapeChild.stroke}` : undefined,
                      borderRadius: shapeChild.shapeType === "circle" ? "50%" : shapeChild.borderRadius ? `${shapeChild.borderRadius}px` : undefined,
                    }}
                  />
                );
              }

              if (child.type === "image") {
                const imgChild = child as ImageLayer;
                return (
                  <div key={child.id} style={childStyle} className="overflow-hidden">
                    {imgChild.src ? (
                      <img
                        src={imgChild.src}
                        alt={child.name}
                        style={{ objectFit: imgChild.objectFit }}
                        className="w-full h-full pointer-events-none"
                        draggable={false}
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--background-hover)] flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-[var(--foreground-muted)]" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                );
              }

              return null;
            })}
            {/* Group border indicator */}
            <div className="absolute inset-0 border border-dashed border-[var(--primary)]/30 rounded pointer-events-none" />
            {/* Group badge */}
            <div
              className="absolute -top-2 -left-2 z-50 flex items-center justify-center px-1.5 py-0.5 rounded bg-[var(--primary)] text-white text-[10px] font-medium shadow-md"
              aria-label="Group layer"
            >
              <Group className="h-2.5 w-2.5 mr-0.5" aria-hidden="true" />
              {groupLayer.children.length}
            </div>
            {renderResizeHandles(layer.id, layer.locked)}
            {renderLockBadge(layer.locked)}
          </div>
        );
      }
      case "screenshot-zone": {
        const screenshotLayer = layer as ScreenshotZoneLayer;
        const hasImage = !!screenshotLayer.src;
        return (
          <div
            key={layer.id}
            style={{
              ...baseStyle,
              borderRadius: screenshotLayer.borderRadius ? `${screenshotLayer.borderRadius}px` : undefined,
              cursor: layer.locked ? "not-allowed" : isDragging && dragLayerId === layer.id ? "grabbing" : "pointer",
            }}
            className={cn(
              "overflow-hidden transition-shadow",
              isSelected && "ring-2 ring-[var(--primary)] ring-offset-1",
              isMultiSelected && !isSelected && "ring-2 ring-[var(--ai)] ring-offset-1",
              isPrimarySelection && "ring-2 ring-[var(--primary)] ring-offset-2",
              isDragging && dragLayerId === layer.id && "opacity-90 shadow-lg"
            )}
            onMouseDown={(e) => handleLayerMouseDown(e, layer.id)}
            onDoubleClick={(e) => {
              if (!layer.locked) {
                e.stopPropagation();
                setTargetScreenshotZoneId(layer.id);
                setShowScreenshotPicker(true);
              }
            }}
          >
            {hasImage ? (
              <img
                src={screenshotLayer.src}
                alt={layer.name}
                style={{
                  objectFit: screenshotLayer.objectFit,
                  borderRadius: screenshotLayer.borderRadius ? `${screenshotLayer.borderRadius}px` : undefined,
                }}
                className="w-full h-full pointer-events-none"
                draggable={false}
              />
            ) : (
              <div
                className="w-full h-full border-2 border-dashed border-[var(--primary)]/50 bg-[var(--primary)]/10 flex flex-col items-center justify-center gap-2"
                style={{
                  borderRadius: screenshotLayer.borderRadius ? `${screenshotLayer.borderRadius}px` : undefined,
                }}
              >
                <Monitor className="h-8 w-8 text-[var(--primary)]/60" aria-hidden="true" />
                <span className="text-xs text-[var(--primary)]/80 font-medium text-center px-2">
                  {screenshotLayer.placeholder || "Click to add screenshot"}
                </span>
              </div>
            )}
            {renderResizeHandles(layer.id, layer.locked)}
            {renderLockBadge(layer.locked)}
          </div>
        );
      }
      default:
        return null;
    }
  }, [selectedLayerId, selectedLayerIds, isDragging, dragLayerId, handleLayerMouseDown, renderResizeHandles, renderLockBadge, setTargetScreenshotZoneId, setShowScreenshotPicker]);

  // Compute canvas background style
  const canvasBgStyle = React.useMemo((): React.CSSProperties => {
    if (canvasBgType === "gradient") {
      return {
        background: `linear-gradient(${canvasGradientAngle}deg, ${canvasGradientFrom}, ${canvasGradientTo})`,
      };
    }
    return {
      backgroundColor: canvasBgColor,
    };
  }, [canvasBgType, canvasBgColor, canvasGradientFrom, canvasGradientTo, canvasGradientAngle]);

  // Render the content based on content type
  const renderContent = React.useCallback(() => {
    // If there are layers, render them on a canvas
    if (layers.length > 0) {
      return (
        <div
          className="relative w-full h-full"
          style={canvasBgStyle}
          ref={canvasRef}
        >
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

          {/* Grid overlay */}
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none z-40"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: `${gridSize}px ${gridSize}px`,
              }}
            />
          )}

          {/* Center guides (always visible when dragging) */}
          {(isDragging || isResizing) && snapToGrid && (
            <>
              {/* Vertical center line */}
              <div
                className="absolute top-0 bottom-0 w-px bg-[var(--primary)]/20 pointer-events-none z-40"
                style={{ left: "50%" }}
              />
              {/* Horizontal center line */}
              <div
                className="absolute left-0 right-0 h-px bg-[var(--primary)]/20 pointer-events-none z-40"
                style={{ top: "50%" }}
              />
            </>
          )}

          {/* Alignment guides */}
          {alignmentGuides.map((guide, idx) => (
            <div
              key={`${guide.type}-${guide.position}-${idx}`}
              className="absolute pointer-events-none z-50"
              style={{
                ...(guide.type === "v"
                  ? {
                      left: `${guide.position}px`,
                      top: 0,
                      bottom: 0,
                      width: "1px",
                      background: "var(--primary)",
                    }
                  : {
                      top: `${guide.position}px`,
                      left: 0,
                      right: 0,
                      height: "1px",
                      background: "var(--primary)",
                    }),
              }}
            />
          ))}

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
  }, [contentType, selectedTemplate, selectedMockup, industry, theme, primaryColor, customImage, layers, renderLayer, canvasBgStyle]);

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
            slideCount={isCarouselMode ? carouselSlides.length : 1}
            currentSlide={currentSlideIndex}
            onSlideChange={handleGoToSlide}
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
  }, [selectedPlatform, selectedFormat, caption, engagement, hashtags, platformConfig.name, renderContent, isCarouselMode, carouselSlides.length, currentSlideIndex, handleGoToSlide]);

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
            {/* Save composition */}
            <button
              onClick={handleSaveComposition}
              disabled={layers.length === 0}
              className="hidden sm:flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 sm:px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-hover)] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              aria-label="Save composition"
              title="Save composition for later"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span className="hidden md:inline">Save</span>
            </button>

            {/* Save as Template */}
            <button
              onClick={() => setShowSaveTemplateModal(true)}
              disabled={layers.length === 0}
              className="hidden sm:flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 sm:px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-hover)] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              aria-label="Save as template"
              title="Save composition as reusable template"
            >
              <LayoutTemplate className="h-4 w-4" aria-hidden="true" />
              <span className="hidden lg:inline">Template</span>
            </button>

            {/* Load saved composition dropdown */}
            {savedCompositions.length > 0 && (
              <div className="relative hidden sm:block">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleLoadComposition(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] pl-3 pr-8 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
                  aria-label="Load saved composition"
                  defaultValue=""
                >
                  <option value="" disabled>Load saved...</option>
                  {savedCompositions.map((comp: { id: string; name: string }) => (
                    <option key={comp.id} value={comp.id}>{comp.name}</option>
                  ))}
                </select>
                <FolderOpen className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)] pointer-events-none" aria-hidden="true" />
              </div>
            )}

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
            <button
              onClick={() => setShowBatchExportModal(true)}
              disabled={layers.length === 0}
              className="hidden sm:flex items-center gap-2 rounded-lg border border-[var(--primary)] bg-transparent px-3 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              aria-label="Batch export to multiple platforms"
              title="Export to multiple platforms as ZIP"
            >
              <FileArchive className="h-4 w-4" aria-hidden="true" />
              <span className="hidden lg:inline">Batch</span>
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

          {/* Zoom & Alignment Toolbar */}
          {layers.length > 0 && (
            <div className="flex-shrink-0 px-4 py-2 border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
              <div className="flex items-center justify-between gap-4">
                {/* Alignment buttons (only when layer selected) */}
                <div className="flex items-center gap-1">
                  {selectedLayerId && (
                    <>
                      <span className="text-xs text-[var(--foreground-muted)] mr-1">Align:</span>
                      <button
                        onClick={() => handleAlignLayer("left")}
                        className="p-1.5 rounded hover:bg-[var(--background-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                        aria-label="Align left"
                        title="Align left"
                      >
                        <AlignLeft className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleAlignLayer("center-h")}
                        className="p-1.5 rounded hover:bg-[var(--background-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                        aria-label="Center horizontally"
                        title="Center horizontally"
                      >
                        <AlignCenterHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleAlignLayer("right")}
                        className="p-1.5 rounded hover:bg-[var(--background-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                        aria-label="Align right"
                        title="Align right"
                      >
                        <AlignRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <div className="w-px h-4 bg-[var(--border)] mx-1" />
                      <button
                        onClick={() => handleAlignLayer("top")}
                        className="p-1.5 rounded hover:bg-[var(--background-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                        aria-label="Align top"
                        title="Align top"
                      >
                        <AlignStartVertical className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleAlignLayer("center-v")}
                        className="p-1.5 rounded hover:bg-[var(--background-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                        aria-label="Center vertically"
                        title="Center vertically"
                      >
                        <AlignCenterVertical className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleAlignLayer("bottom")}
                        className="p-1.5 rounded hover:bg-[var(--background-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                        aria-label="Align bottom"
                        title="Align bottom"
                      >
                        <AlignEndVertical className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </>
                  )}
                  {!selectedLayerId && (
                    <span className="text-xs text-[var(--foreground-muted)]">Select a layer to align</span>
                  )}
                </div>

                {/* Opacity & Style controls (when layer selected) */}
                {selectedLayerId && selectedLayer && (
                  <div className="flex items-center gap-2">
                    {/* Lock indicator */}
                    {selectedLayer.locked && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/30">
                        <Lock className="h-3 w-3 text-[var(--warning)]" aria-hidden="true" />
                        <span className="text-xs text-[var(--warning)]">Locked</span>
                      </div>
                    )}

                    {/* Opacity slider */}
                    <div className="flex items-center gap-1.5">
                      <label htmlFor="toolbar-opacity" className="text-xs text-[var(--foreground-muted)]">
                        Opacity:
                      </label>
                      <input
                        id="toolbar-opacity"
                        type="range"
                        min="0"
                        max="100"
                        value={selectedLayer.opacity}
                        onChange={(e) => handleQuickOpacityChange(Number(e.target.value))}
                        disabled={selectedLayer.locked}
                        className="w-16 h-1 rounded-full bg-[var(--border)] appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--primary)]"
                        aria-label="Layer opacity"
                      />
                      <span className="text-xs text-[var(--foreground)] w-8">{selectedLayer.opacity}%</span>
                    </div>

                    <div className="w-px h-4 bg-[var(--border)]" />

                    {/* Copy/Paste style buttons */}
                    <button
                      onClick={handleCopyStyle}
                      className="p-1.5 rounded hover:bg-[var(--background-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                      aria-label="Copy style (Cmd+Shift+C)"
                      title="Copy style (Cmd+Shift+C)"
                    >
                      <Clipboard className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={handlePasteStyle}
                      disabled={!copiedStyle || selectedLayer.locked}
                      className="p-1.5 rounded hover:bg-[var(--background-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                      aria-label="Paste style (Cmd+Shift+V)"
                      title={copiedStyle ? "Paste style (Cmd+Shift+V)" : "No style copied"}
                    >
                      <ClipboardPaste className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    {copiedStyle && (
                      <span className="text-xs text-[var(--success)]">Style copied</span>
                    )}

                    {/* Multi-select indicator and group buttons */}
                    {selectedLayerIds.size > 1 && (
                      <>
                        <div className="w-px h-4 bg-[var(--border)]" />
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--ai)]/10 border border-[var(--ai)]/30">
                          <span className="text-xs font-medium text-[var(--ai)]">
                            {selectedLayerIds.size} selected
                          </span>
                          <button
                            onClick={() => {
                              setSelectedLayerIds(new Set());
                              setSelectedLayerId(null);
                            }}
                            className="text-[var(--ai)] hover:text-[var(--ai)]/70 focus:outline-none"
                            aria-label="Clear selection"
                          >
                            ×
                          </button>
                        </div>
                        <button
                          onClick={handleGroupLayers}
                          className="p-1.5 rounded hover:bg-[var(--background-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                          aria-label="Group layers (Cmd+G)"
                          title="Group layers (Cmd+G)"
                        >
                          <Group className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </>
                    )}

                    {/* Ungroup button for group layers */}
                    {selectedLayer?.type === "group" && (
                      <>
                        <div className="w-px h-4 bg-[var(--border)]" />
                        <button
                          onClick={handleUngroupLayers}
                          className="p-1.5 rounded hover:bg-[var(--background-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                          aria-label="Ungroup (Cmd+Shift+G)"
                          title="Ungroup (Cmd+Shift+G)"
                        >
                          <Ungroup className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Zoom controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCanvasZoom((prev) => Math.max(25, prev - 25))}
                    disabled={canvasZoom <= 25}
                    className="p-1.5 rounded hover:bg-[var(--background-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <select
                    value={canvasZoom}
                    onChange={(e) => setCanvasZoom(Number(e.target.value))}
                    className="appearance-none rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none cursor-pointer"
                    aria-label="Zoom level"
                  >
                    {ZOOM_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}%
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setCanvasZoom((prev) => Math.min(200, prev + 25))}
                    disabled={canvasZoom >= 200}
                    className="p-1.5 rounded hover:bg-[var(--background-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => setCanvasZoom(100)}
                    className="ml-1 px-2 py-1 rounded text-xs text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                    aria-label="Reset zoom to 100%"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preview Area */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 bg-[var(--background)] flex flex-col">
            <div className="flex-1 flex justify-center items-center">
              <div
                ref={previewRef}
                className="inline-block max-w-full transition-transform origin-center"
                style={{ transform: layers.length > 0 ? `scale(${canvasZoom / 100})` : undefined }}
              >
                {renderPreview()}
              </div>
            </div>

            {/* Carousel Navigation */}
            {isCarouselMode && carouselSlides.length > 0 && (
              <div className="flex-shrink-0 mt-4 flex flex-col items-center gap-3">
                {/* Slide thumbnails */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
                  <button
                    onClick={() => handleGoToSlide(Math.max(0, currentSlideIndex - 1))}
                    disabled={currentSlideIndex === 0}
                    className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {carouselSlides.map((slide, index) => (
                      <button
                        key={slide.id}
                        onClick={() => handleGoToSlide(index)}
                        className={cn(
                          "relative group rounded-lg overflow-hidden transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                          index === currentSlideIndex
                            ? "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--card)]"
                            : "opacity-60 hover:opacity-100"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                        aria-current={index === currentSlideIndex ? "true" : undefined}
                      >
                        {/* Slide thumbnail */}
                        <div
                          className="w-12 h-12 flex items-center justify-center text-xs font-medium"
                          style={{
                            background: slide.bgType === "gradient"
                              ? `linear-gradient(${slide.gradientAngle}deg, ${slide.gradientFrom}, ${slide.gradientTo})`
                              : slide.bgColor,
                          }}
                        >
                          <span className="text-white/80">{index + 1}</span>
                        </div>
                        {/* Delete button on hover (not for first slide if it's the only one) */}
                        {carouselSlides.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSlide(index);
                            }}
                            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Delete slide ${index + 1}`}
                          >
                            <Trash2 className="h-3 w-3 text-white" aria-hidden="true" />
                          </button>
                        )}
                      </button>
                    ))}

                    {/* Add slide button */}
                    {carouselSlides.length < 10 && (
                      <button
                        onClick={handleAddSlide}
                        className="w-12 h-12 rounded-lg border-2 border-dashed border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                        aria-label="Add new slide"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleGoToSlide(Math.min(carouselSlides.length - 1, currentSlideIndex + 1))}
                    disabled={currentSlideIndex === carouselSlides.length - 1}
                    className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Slide info and actions */}
                <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
                  <span>
                    Slide {currentSlideIndex + 1} of {carouselSlides.length}
                  </span>
                  <button
                    onClick={() => handleDuplicateSlide(currentSlideIndex)}
                    className="flex items-center gap-1 hover:text-[var(--foreground)] transition-colors focus:outline-none focus-visible:underline"
                  >
                    <CopyIcon className="h-3 w-3" aria-hidden="true" />
                    Duplicate slide
                  </button>
                </div>
              </div>
            )}
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
              onOpenScreenshotPicker={(layerId) => {
                setTargetScreenshotZoneId(layerId);
                setShowScreenshotPicker(true);
              }}
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

          {/* Canvas Background (only when layers exist) */}
          {layers.length > 0 && (
            <div className="flex-shrink-0 p-3 border-b border-[var(--card-border)]">
              <div className="flex items-center gap-2 mb-3">
                <Square className="h-3.5 w-3.5 text-[var(--foreground-muted)]" aria-hidden="true" />
                <span className="text-xs font-medium text-[var(--foreground)]">Canvas Background</span>
              </div>

              <div className="space-y-2.5">
                {/* Background Type Toggle */}
                <div>
                  <label id="bg-type-label" className="block text-xs text-[var(--foreground-muted)] mb-1.5">
                    Type
                  </label>
                  <div
                    className="flex items-center gap-1"
                    role="group"
                    aria-labelledby="bg-type-label"
                  >
                    <button
                      onClick={() => setCanvasBgType("solid")}
                      aria-pressed={canvasBgType === "solid"}
                      className={cn(
                        "flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                        canvasBgType === "solid"
                          ? "bg-[var(--foreground)] text-[var(--background)]"
                          : "bg-[var(--background)] border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                      )}
                    >
                      Solid
                    </button>
                    <button
                      onClick={() => setCanvasBgType("gradient")}
                      aria-pressed={canvasBgType === "gradient"}
                      className={cn(
                        "flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                        canvasBgType === "gradient"
                          ? "bg-[var(--foreground)] text-[var(--background)]"
                          : "bg-[var(--background)] border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                      )}
                    >
                      Gradient
                    </button>
                  </div>
                </div>

                {/* Solid Color Picker */}
                {canvasBgType === "solid" && (
                  <div>
                    <label htmlFor="canvas-bg-color" className="block text-xs text-[var(--foreground-muted)] mb-1.5">
                      Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="canvas-bg-color"
                        type="color"
                        value={canvasBgColor}
                        onChange={(e) => setCanvasBgColor(e.target.value)}
                        className="h-8 w-8 cursor-pointer rounded border border-[var(--border)] bg-transparent"
                        aria-label="Canvas background color"
                      />
                      <input
                        type="text"
                        value={canvasBgColor}
                        onChange={(e) => setCanvasBgColor(e.target.value)}
                        className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
                        placeholder="#000000"
                        aria-label="Canvas background color hex value"
                      />
                    </div>
                  </div>
                )}

                {/* Gradient Controls */}
                {canvasBgType === "gradient" && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {/* From Color */}
                      <div>
                        <label htmlFor="gradient-from" className="block text-xs text-[var(--foreground-muted)] mb-1.5">
                          From
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            id="gradient-from"
                            type="color"
                            value={canvasGradientFrom}
                            onChange={(e) => setCanvasGradientFrom(e.target.value)}
                            className="h-7 w-7 cursor-pointer rounded border border-[var(--border)] bg-transparent flex-shrink-0"
                            aria-label="Gradient start color"
                          />
                          <input
                            type="text"
                            value={canvasGradientFrom}
                            onChange={(e) => setCanvasGradientFrom(e.target.value)}
                            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
                            placeholder="#3b82f6"
                            aria-label="Gradient start color hex"
                          />
                        </div>
                      </div>
                      {/* To Color */}
                      <div>
                        <label htmlFor="gradient-to" className="block text-xs text-[var(--foreground-muted)] mb-1.5">
                          To
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            id="gradient-to"
                            type="color"
                            value={canvasGradientTo}
                            onChange={(e) => setCanvasGradientTo(e.target.value)}
                            className="h-7 w-7 cursor-pointer rounded border border-[var(--border)] bg-transparent flex-shrink-0"
                            aria-label="Gradient end color"
                          />
                          <input
                            type="text"
                            value={canvasGradientTo}
                            onChange={(e) => setCanvasGradientTo(e.target.value)}
                            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
                            placeholder="#8b5cf6"
                            aria-label="Gradient end color hex"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Gradient Preview */}
                    <div
                      className="h-6 rounded-lg border border-[var(--border)]"
                      style={{
                        background: `linear-gradient(${canvasGradientAngle}deg, ${canvasGradientFrom}, ${canvasGradientTo})`,
                      }}
                      aria-hidden="true"
                    />
                    {/* Angle Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="gradient-angle" className="text-xs text-[var(--foreground-muted)]">
                          Angle
                        </label>
                        <span className="text-xs text-[var(--foreground-muted)]">{canvasGradientAngle}°</span>
                      </div>
                      <input
                        id="gradient-angle"
                        type="range"
                        min="0"
                        max="360"
                        value={canvasGradientAngle}
                        onChange={(e) => setCanvasGradientAngle(Number(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none bg-[var(--background-hover)] cursor-pointer accent-[var(--primary)]"
                        aria-label="Gradient angle in degrees"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Grid & Alignment Settings (only when layers exist) */}
          {layers.length > 0 && (
            <div className="flex-shrink-0 p-3 border-b border-[var(--card-border)]">
              <div className="flex items-center gap-2 mb-3">
                <Grid3X3 className="h-3.5 w-3.5 text-[var(--foreground-muted)]" aria-hidden="true" />
                <span className="text-xs font-medium text-[var(--foreground)]">Grid & Alignment</span>
              </div>

              <div className="space-y-2.5">
                {/* Grid and Snap Toggles */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    aria-pressed={showGrid}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                      showGrid
                        ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30"
                        : "bg-[var(--background)] border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                    )}
                  >
                    <Grid3X3 className="h-3 w-3" aria-hidden="true" />
                    Show Grid
                  </button>
                  <button
                    onClick={() => setSnapToGrid(!snapToGrid)}
                    aria-pressed={snapToGrid}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                      snapToGrid
                        ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30"
                        : "bg-[var(--background)] border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                    )}
                  >
                    <Magnet className="h-3 w-3" aria-hidden="true" />
                    Snap
                  </button>
                </div>

                {/* Grid Size Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="grid-size" className="text-xs text-[var(--foreground-muted)]">
                      Grid Size
                    </label>
                    <span className="text-xs text-[var(--foreground-muted)]">{gridSize}px</span>
                  </div>
                  <input
                    id="grid-size"
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none bg-[var(--background-hover)] cursor-pointer accent-[var(--primary)]"
                    aria-label="Grid size in pixels"
                  />
                </div>

                {/* Keyboard Shortcuts Hint */}
                <div className="text-[10px] text-[var(--foreground-muted)] leading-relaxed">
                  <span className="font-medium">Tip:</span> Hold Shift while resizing to maintain aspect ratio
                </div>
              </div>
            </div>
          )}

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

      {/* Save as Template Modal */}
      <SaveTemplateModal
        isOpen={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        onSave={handleSaveAsTemplate}
        currentPlatform={selectedPlatform}
        currentFormat={selectedFormat}
        currentCaption={caption}
        currentLayout={getCurrentTemplateLayout()}
      />

      {/* Batch Export Modal */}
      <BatchExportModal
        isOpen={showBatchExportModal}
        onClose={() => setShowBatchExportModal(false)}
        canvasRef={previewRef}
        compositionName="social-post"
      />

      {/* Screenshot Picker Modal */}
      {showScreenshotPicker && (
        <ScreenshotPicker
          onSelect={handleScreenshotSelect}
          onClose={() => {
            setShowScreenshotPicker(false);
            setTargetScreenshotZoneId(null);
          }}
          selectedSrc={
            targetScreenshotZoneId
              ? (layers.find((l) => l.id === targetScreenshotZoneId) as ScreenshotZoneLayer | undefined)?.src
              : undefined
          }
        />
      )}
    </div>
  );
}
