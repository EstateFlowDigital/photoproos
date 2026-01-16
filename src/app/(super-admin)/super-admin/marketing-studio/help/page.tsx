"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Layers,
  Type,
  ImageIcon,
  Square,
  Palette,
  Download,
  Copy,
  FileArchive,
  Save,
  Layout,
  Calendar,
  Sparkles,
  MousePointer,
  Move,
  ZoomIn,
  Grid3X3,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  RotateCcw,
  FlipHorizontal,
  ChevronRight,
  ChevronLeft,
  Plus,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Upload,
  Columns,
  Settings2,
  Play,
  CheckCircle,
  Circle,
  ArrowRight,
  Smartphone,
  Monitor,
  ExternalLink,
} from "lucide-react";

// Visual diagram components
function KeyboardShortcut({ keys }: { keys: string[] }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {keys.map((key, i) => (
        <React.Fragment key={i}>
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--background-tertiary)] border border-[var(--border)] text-[10px] font-mono text-[var(--foreground-muted)]">
            {key}
          </kbd>
          {i < keys.length - 1 && <span className="text-[var(--foreground-muted)]">+</span>}
        </React.Fragment>
      ))}
    </span>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
      <div className="p-4 border-b border-[var(--card-border)]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--foreground)]">{title}</h3>
            <p className="text-sm text-[var(--foreground-muted)]">{description}</p>
          </div>
        </div>
      </div>
      {children && <div className="p-4">{children}</div>}
    </div>
  );
}

function StepItem({
  number,
  title,
  description,
  visual,
}: {
  number: number;
  title: string;
  description: string;
  visual?: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-bold">
          {number}
        </div>
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-[var(--foreground)] mb-1">{title}</h4>
        <p className="text-sm text-[var(--foreground-muted)] mb-3">{description}</p>
        {visual && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 overflow-hidden">
            {visual}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolbarVisual() {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)]">
      <div className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--background)] border border-[var(--border)]">
        <Type className="h-3.5 w-3.5 text-[var(--foreground-muted)]" />
        <span className="text-xs text-[var(--foreground-muted)]">Text</span>
      </div>
      <div className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--background)] border border-[var(--border)]">
        <ImageIcon className="h-3.5 w-3.5 text-[var(--foreground-muted)]" />
        <span className="text-xs text-[var(--foreground-muted)]">Image</span>
      </div>
      <div className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--background)] border border-[var(--border)]">
        <Square className="h-3.5 w-3.5 text-[var(--foreground-muted)]" />
        <span className="text-xs text-[var(--foreground-muted)]">Shape</span>
      </div>
      <div className="w-px h-4 bg-[var(--border)]" />
      <div className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--background)] border border-[var(--border)]">
        <Grid3X3 className="h-3.5 w-3.5 text-[var(--foreground-muted)]" />
      </div>
      <div className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--background)] border border-[var(--border)]">
        <ZoomIn className="h-3.5 w-3.5 text-[var(--foreground-muted)]" />
      </div>
    </div>
  );
}

function LayersPanelVisual() {
  return (
    <div className="space-y-1">
      {[
        { name: "Headline Text", type: "text", icon: Type, selected: true },
        { name: "Background Image", type: "image", icon: ImageIcon, selected: false },
        { name: "Overlay Shape", type: "shape", icon: Square, selected: false },
      ].map((layer, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg text-xs",
            layer.selected
              ? "bg-[var(--primary)]/10 border border-[var(--primary)]/30"
              : "bg-[var(--background)] border border-[var(--border)]"
          )}
        >
          <layer.icon className="h-3.5 w-3.5 text-[var(--foreground-muted)]" />
          <span className={layer.selected ? "text-[var(--primary)]" : "text-[var(--foreground)]"}>
            {layer.name}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <Eye className="h-3 w-3 text-[var(--foreground-muted)]" />
            <Unlock className="h-3 w-3 text-[var(--foreground-muted)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CarouselVisual() {
  return (
    <div className="flex items-center justify-center gap-2">
      <button className="p-1 rounded bg-[var(--background)] border border-[var(--border)]">
        <ChevronLeft className="h-4 w-4 text-[var(--foreground-muted)]" />
      </button>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-medium",
              n === 1
                ? "bg-[var(--primary)] text-white ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--background)]"
                : "bg-[var(--background-tertiary)] text-[var(--foreground-muted)] border border-[var(--border)]"
            )}
          >
            {n}
          </div>
        ))}
        <div className="w-10 h-10 rounded-lg border-2 border-dashed border-[var(--border)] flex items-center justify-center">
          <Plus className="h-4 w-4 text-[var(--foreground-muted)]" />
        </div>
      </div>
      <button className="p-1 rounded bg-[var(--background)] border border-[var(--border)]">
        <ChevronRight className="h-4 w-4 text-[var(--foreground-muted)]" />
      </button>
    </div>
  );
}

function PlatformPreviewVisual() {
  return (
    <div className="flex items-center gap-2 justify-center">
      {[
        { icon: Instagram, color: "#E4405F", name: "Instagram" },
        { icon: Linkedin, color: "#0A66C2", name: "LinkedIn" },
        { icon: Twitter, color: "#000000", name: "Twitter" },
        { icon: Facebook, color: "#1877F2", name: "Facebook" },
      ].map((platform, i) => (
        <div
          key={i}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg",
            i === 0 ? "bg-[var(--primary)]/10" : "hover:bg-[var(--background-hover)]"
          )}
        >
          <platform.icon
            className="h-5 w-5"
            style={{ color: i === 0 ? platform.color : "var(--foreground-muted)" }}
          />
          <span className="text-[10px] text-[var(--foreground-muted)]">{platform.name}</span>
        </div>
      ))}
    </div>
  );
}

function ExportOptionsVisual() {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
        <Download className="h-5 w-5 text-[var(--primary)]" />
        <span className="text-xs text-[var(--foreground)]">PNG</span>
      </div>
      <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
        <Copy className="h-5 w-5 text-[var(--primary)]" />
        <span className="text-xs text-[var(--foreground)]">Clipboard</span>
      </div>
      <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
        <FileArchive className="h-5 w-5 text-[var(--primary)]" />
        <span className="text-xs text-[var(--foreground)]">Batch ZIP</span>
      </div>
    </div>
  );
}

function WorkflowVisual() {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex flex-col items-center gap-1">
        <div className="h-10 w-10 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center">
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
        <span className="text-[var(--foreground-muted)]">Create</span>
      </div>
      <ArrowRight className="h-4 w-4 text-[var(--foreground-muted)]" />
      <div className="flex flex-col items-center gap-1">
        <div className="h-10 w-10 rounded-full bg-blue-500/10 border-2 border-blue-500 flex items-center justify-center">
          <Eye className="h-5 w-5 text-blue-500" />
        </div>
        <span className="text-[var(--foreground-muted)]">Preview</span>
      </div>
      <ArrowRight className="h-4 w-4 text-[var(--foreground-muted)]" />
      <div className="flex flex-col items-center gap-1">
        <div className="h-10 w-10 rounded-full bg-purple-500/10 border-2 border-purple-500 flex items-center justify-center">
          <Download className="h-5 w-5 text-purple-500" />
        </div>
        <span className="text-[var(--foreground-muted)]">Export</span>
      </div>
      <ArrowRight className="h-4 w-4 text-[var(--foreground-muted)]" />
      <div className="flex flex-col items-center gap-1">
        <div className="h-10 w-10 rounded-full bg-pink-500/10 border-2 border-pink-500 flex items-center justify-center">
          <Instagram className="h-5 w-5 text-pink-500" />
        </div>
        <span className="text-[var(--foreground-muted)]">Publish</span>
      </div>
    </div>
  );
}

export default function MarketingStudioHelpPage() {
  const [activeSection, setActiveSection] = React.useState("overview");

  const sections = [
    { id: "overview", label: "Overview", icon: Layout },
    { id: "composer", label: "Post Composer", icon: Layers },
    { id: "layers", label: "Working with Layers", icon: Layers },
    { id: "text", label: "Text Editing", icon: Type },
    { id: "images", label: "Images & Media", icon: ImageIcon },
    { id: "carousel", label: "Carousel Posts", icon: Columns },
    { id: "export", label: "Exporting", icon: Download },
    { id: "templates", label: "Templates", icon: Layout },
    { id: "calendar", label: "Content Calendar", icon: Calendar },
    { id: "shortcuts", label: "Keyboard Shortcuts", icon: Settings2 },
  ];

  return (
    <div className="marketing-studio-help min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--background-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/super-admin/marketing-studio"
                className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Marketing Studio
              </Link>
            </div>
            <h1 className="text-lg font-semibold text-[var(--foreground)]">
              Marketing Studio Guide
            </h1>
            <div className="w-40" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="sticky top-24 space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                    activeSection === section.id
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]"
                  )}
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-12">
            {/* Overview Section */}
            <section id="overview" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
                Welcome to Marketing Studio
              </h2>
              <p className="text-[var(--foreground-muted)] mb-6 max-w-3xl">
                Marketing Studio is your all-in-one tool for creating professional social media
                content. Design beautiful posts with layers, preview how they&apos;ll look on each
                platform, and export in the perfect dimensions.
              </p>

              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 mb-8">
                <h3 className="font-semibold text-[var(--foreground)] mb-4">Workflow Overview</h3>
                <WorkflowVisual />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FeatureCard
                  icon={Layers}
                  title="Layer-Based Editing"
                  description="Add text, images, shapes, and mockups as independent layers"
                />
                <FeatureCard
                  icon={Eye}
                  title="Live Platform Previews"
                  description="See exactly how your post will look on Instagram, LinkedIn, and more"
                />
                <FeatureCard
                  icon={Columns}
                  title="Carousel Support"
                  description="Create multi-slide carousels with up to 10 slides"
                />
                <FeatureCard
                  icon={FileArchive}
                  title="Batch Export"
                  description="Export to all platforms at once as a ZIP file"
                />
              </div>
            </section>

            {/* Composer Section */}
            <section id="composer" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Post Composer</h2>
              <p className="text-[var(--foreground-muted)] mb-6">
                The Post Composer is where you create your social media graphics. It&apos;s divided
                into three main areas:
              </p>

              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 mb-6">
                <div className="grid grid-cols-12 gap-4 h-64">
                  {/* Left Panel */}
                  <div className="col-span-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2">
                    <div className="text-[10px] font-medium text-[var(--foreground-muted)] mb-2 uppercase">
                      Layers
                    </div>
                    <div className="space-y-1">
                      {[1, 2, 3].map((n) => (
                        <div
                          key={n}
                          className="h-6 rounded bg-[var(--background-tertiary)] border border-[var(--border)]"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Canvas */}
                  <div className="col-span-7 rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--background)] flex items-center justify-center">
                    <div className="text-center">
                      <Monitor className="h-8 w-8 text-[var(--foreground-muted)] mx-auto mb-2" />
                      <span className="text-sm text-[var(--foreground-muted)]">Canvas Area</span>
                    </div>
                  </div>

                  {/* Right Panel */}
                  <div className="col-span-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2">
                    <div className="text-[10px] font-medium text-[var(--foreground-muted)] mb-2 uppercase">
                      Settings
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 rounded bg-[var(--background-tertiary)] border border-[var(--border)]" />
                      <div className="h-8 rounded bg-[var(--background-tertiary)] border border-[var(--border)]" />
                      <div className="h-20 rounded bg-[var(--background-tertiary)] border border-[var(--border)]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                  <h4 className="font-medium text-[var(--foreground)] mb-1">Left: Layers Panel</h4>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Manage your layers - reorder, show/hide, lock, and delete
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                  <h4 className="font-medium text-[var(--foreground)] mb-1">Center: Canvas</h4>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Your design area with platform preview and layer editing
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                  <h4 className="font-medium text-[var(--foreground)] mb-1">Right: Settings</h4>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Content type, platform selection, caption editor, and layer properties
                  </p>
                </div>
              </div>
            </section>

            {/* Layers Section */}
            <section id="layers" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
                Working with Layers
              </h2>
              <p className="text-[var(--foreground-muted)] mb-6">
                Layers let you build complex designs by stacking elements on top of each other.
              </p>

              <div className="space-y-6">
                <StepItem
                  number={1}
                  title="Add a Layer"
                  description="Click the layer type button in the toolbar to add a new layer to your canvas."
                  visual={<ToolbarVisual />}
                />

                <StepItem
                  number={2}
                  title="Select and Edit"
                  description="Click on a layer in the canvas or layers panel to select it. Drag corners to resize, drag the center to move."
                  visual={
                    <div className="flex items-center justify-center p-4">
                      <div className="relative w-40 h-24 border-2 border-[var(--primary)] bg-[var(--primary)]/10 rounded">
                        {/* Corner handles */}
                        {["top-left", "top-right", "bottom-left", "bottom-right"].map((pos) => (
                          <div
                            key={pos}
                            className={cn(
                              "absolute w-3 h-3 bg-white border-2 border-[var(--primary)] rounded-sm",
                              pos === "top-left" && "-top-1.5 -left-1.5",
                              pos === "top-right" && "-top-1.5 -right-1.5",
                              pos === "bottom-left" && "-bottom-1.5 -left-1.5",
                              pos === "bottom-right" && "-bottom-1.5 -right-1.5"
                            )}
                          />
                        ))}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Move className="h-5 w-5 text-[var(--primary)]" />
                        </div>
                      </div>
                    </div>
                  }
                />

                <StepItem
                  number={3}
                  title="Manage Layer Order"
                  description="Drag layers in the panel to reorder them. Layers at the top appear in front."
                  visual={<LayersPanelVisual />}
                />

                <StepItem
                  number={4}
                  title="Layer Controls"
                  description="Use the visibility (eye) and lock icons to show/hide or lock layers."
                  visual={
                    <div className="flex items-center gap-6 justify-center">
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-[var(--foreground)]" />
                        <span className="text-sm text-[var(--foreground-muted)]">Visible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-5 w-5 text-[var(--foreground-muted)]" />
                        <span className="text-sm text-[var(--foreground-muted)]">Hidden</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-[var(--foreground)]" />
                        <span className="text-sm text-[var(--foreground-muted)]">Locked</span>
                      </div>
                    </div>
                  }
                />
              </div>
            </section>

            {/* Text Editing Section */}
            <section id="text" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Text Editing</h2>
              <p className="text-[var(--foreground-muted)] mb-6">
                Add and customize text layers with full typography controls.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <FeatureCard
                  icon={Type}
                  title="Add Text Layer"
                  description="Click the Text button in the toolbar"
                >
                  <div className="space-y-3">
                    <p className="text-sm text-[var(--foreground-muted)]">
                      A new text layer appears with default text. Select it to edit.
                    </p>
                    <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] text-center">
                      <span className="text-lg font-medium text-[var(--foreground)]">
                        Your text here
                      </span>
                    </div>
                  </div>
                </FeatureCard>

                <FeatureCard
                  icon={MousePointer}
                  title="Inline Editing"
                  description="Double-click any text layer to edit inline"
                >
                  <div className="space-y-3">
                    <p className="text-sm text-[var(--foreground-muted)]">
                      Press <KeyboardShortcut keys={["Enter"]} /> to save,{" "}
                      <KeyboardShortcut keys={["Esc"]} /> to cancel.
                    </p>
                    <div className="p-3 rounded-lg bg-[var(--primary)]/5 border-2 border-[var(--primary)] text-center">
                      <span className="text-lg font-medium text-[var(--foreground)]">
                        Editing mode|
                      </span>
                    </div>
                  </div>
                </FeatureCard>
              </div>

              <div className="mt-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h3 className="font-semibold text-[var(--foreground)] mb-4">Text Properties</h3>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Font Family", value: "Inter, Georgia, Menlo..." },
                    { label: "Font Size", value: "8px - 200px" },
                    { label: "Font Weight", value: "Regular to Extra Bold" },
                    { label: "Color", value: "Any color picker" },
                    { label: "Alignment", value: "Left, Center, Right" },
                    { label: "Line Height", value: "0.5x - 3x" },
                    { label: "Rotation", value: "-360° to 360°" },
                    { label: "Opacity", value: "0% - 100%" },
                  ].map((prop, i) => (
                    <div key={i} className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                      <div className="text-xs text-[var(--foreground-muted)] mb-1">{prop.label}</div>
                      <div className="text-sm font-medium text-[var(--foreground)]">{prop.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Images Section */}
            <section id="images" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Images & Media</h2>
              <p className="text-[var(--foreground-muted)] mb-6">
                Upload your own images or use mockups from the library.
              </p>

              <div className="space-y-6">
                <FeatureCard
                  icon={Upload}
                  title="Upload Your Own Images"
                  description="Two ways to add your photos"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                      <h4 className="font-medium text-[var(--foreground)] mb-2">
                        Option 1: As Content
                      </h4>
                      <ol className="space-y-2 text-sm text-[var(--foreground-muted)]">
                        <li className="flex gap-2">
                          <span className="font-medium text-[var(--primary)]">1.</span>
                          Go to Settings panel (right side)
                        </li>
                        <li className="flex gap-2">
                          <span className="font-medium text-[var(--primary)]">2.</span>
                          Select &quot;Image&quot; content type
                        </li>
                        <li className="flex gap-2">
                          <span className="font-medium text-[var(--primary)]">3.</span>
                          Click Upload and choose your file
                        </li>
                      </ol>
                    </div>
                    <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                      <h4 className="font-medium text-[var(--foreground)] mb-2">
                        Option 2: As Layer
                      </h4>
                      <ol className="space-y-2 text-sm text-[var(--foreground-muted)]">
                        <li className="flex gap-2">
                          <span className="font-medium text-[var(--primary)]">1.</span>
                          Click Image button in toolbar
                        </li>
                        <li className="flex gap-2">
                          <span className="font-medium text-[var(--primary)]">2.</span>
                          Select the new layer
                        </li>
                        <li className="flex gap-2">
                          <span className="font-medium text-[var(--primary)]">3.</span>
                          Click &quot;Upload Image&quot; in Properties panel
                        </li>
                      </ol>
                    </div>
                  </div>
                </FeatureCard>

                <FeatureCard
                  icon={Layout}
                  title="Mockup Library"
                  description="Use pre-built PhotoProOS mockups"
                >
                  <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                    <p className="text-sm text-[var(--foreground-muted)] mb-3">
                      Access 90+ professional mockups showing dashboards, galleries, invoices, and
                      more. Select &quot;Mockup&quot; content type and browse the library.
                    </p>
                    <Link
                      href="/super-admin/mockups"
                      className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
                    >
                      Browse Mockup Library
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </FeatureCard>
              </div>
            </section>

            {/* Carousel Section */}
            <section id="carousel" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Carousel Posts</h2>
              <p className="text-[var(--foreground-muted)] mb-6">
                Create multi-slide Instagram carousels with up to 10 slides.
              </p>

              <div className="space-y-6">
                <StepItem
                  number={1}
                  title="Enable Carousel Mode"
                  description="Select 'Instagram' as your platform and choose 'Carousel' as the format."
                  visual={
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium">
                        Instagram
                      </div>
                      <ChevronRight className="h-4 w-4 text-[var(--foreground-muted)]" />
                      <div className="px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium">
                        Carousel
                      </div>
                    </div>
                  }
                />

                <StepItem
                  number={2}
                  title="Navigate Slides"
                  description="Use the slide navigation bar below the canvas to switch between slides."
                  visual={<CarouselVisual />}
                />

                <StepItem
                  number={3}
                  title="Add & Manage Slides"
                  description="Click + to add a new slide. Each slide has its own layers and background. Hover over a slide to delete it."
                />

                <StepItem
                  number={4}
                  title="Duplicate Slides"
                  description="Click 'Duplicate slide' to copy the current slide with all its layers."
                />
              </div>

              <div className="mt-6 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5">
                <div className="flex gap-3">
                  <Sparkles className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-[var(--foreground)] mb-1">Pro Tip</h4>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      The Instagram preview shows carousel dots and navigation arrows when you have
                      multiple slides, so you can see exactly how it will look.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Export Section */}
            <section id="export" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Exporting</h2>
              <p className="text-[var(--foreground-muted)] mb-6">
                Download your designs in the perfect size for each platform.
              </p>

              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 mb-6">
                <h3 className="font-semibold text-[var(--foreground)] mb-4">Export Options</h3>
                <ExportOptionsVisual />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FeatureCard icon={Download} title="Export PNG" description="Download as high-res image">
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Click the Export button or press <KeyboardShortcut keys={["E"]} />. Downloads a
                    2x resolution PNG.
                  </p>
                </FeatureCard>

                <FeatureCard icon={Copy} title="Copy to Clipboard" description="Paste directly into apps">
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Click Copy or press <KeyboardShortcut keys={["C"]} />. Paste into Figma, Slack,
                    or any app.
                  </p>
                </FeatureCard>

                <FeatureCard icon={FileArchive} title="Batch Export" description="All platforms as ZIP">
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Click Batch to export optimized versions for Instagram, LinkedIn, Twitter, and
                    more in one download.
                  </p>
                </FeatureCard>
              </div>

              <div className="mt-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h3 className="font-semibold text-[var(--foreground)] mb-4">Platform Dimensions</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {[
                    { platform: "Instagram Feed", size: "1080 x 1080" },
                    { platform: "Instagram Story", size: "1080 x 1920" },
                    { platform: "LinkedIn Post", size: "1200 x 627" },
                    { platform: "Twitter Tweet", size: "1200 x 675" },
                    { platform: "Facebook Post", size: "1200 x 630" },
                    { platform: "Pinterest Pin", size: "1000 x 1500" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                      <span className="text-[var(--foreground)]">{item.platform}</span>
                      <span className="font-mono text-[var(--foreground-muted)]">{item.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Templates Section */}
            <section id="templates" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Templates</h2>
              <p className="text-[var(--foreground-muted)] mb-6">
                Start with pre-designed templates or save your own.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <FeatureCard icon={Layout} title="Use a Template" description="Browse the template library">
                  <ol className="space-y-2 text-sm text-[var(--foreground-muted)]">
                    <li className="flex gap-2">
                      <span className="font-medium text-[var(--primary)]">1.</span>
                      Go to Templates tab in Marketing Studio
                    </li>
                    <li className="flex gap-2">
                      <span className="font-medium text-[var(--primary)]">2.</span>
                      Browse by category or search
                    </li>
                    <li className="flex gap-2">
                      <span className="font-medium text-[var(--primary)]">3.</span>
                      Click a template to open in composer
                    </li>
                    <li className="flex gap-2">
                      <span className="font-medium text-[var(--primary)]">4.</span>
                      Edit the layers to customize
                    </li>
                  </ol>
                </FeatureCard>

                <FeatureCard icon={Save} title="Save as Template" description="Create reusable templates">
                  <ol className="space-y-2 text-sm text-[var(--foreground-muted)]">
                    <li className="flex gap-2">
                      <span className="font-medium text-[var(--primary)]">1.</span>
                      Design your post in the composer
                    </li>
                    <li className="flex gap-2">
                      <span className="font-medium text-[var(--primary)]">2.</span>
                      Click &quot;Save as Template&quot; button
                    </li>
                    <li className="flex gap-2">
                      <span className="font-medium text-[var(--primary)]">3.</span>
                      Add name, description, and category
                    </li>
                    <li className="flex gap-2">
                      <span className="font-medium text-[var(--primary)]">4.</span>
                      Find it in &quot;My Templates&quot; section
                    </li>
                  </ol>
                </FeatureCard>
              </div>
            </section>

            {/* Calendar Section */}
            <section id="calendar" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Content Calendar</h2>
              <p className="text-[var(--foreground-muted)] mb-6">
                Plan and organize your social media content.
              </p>

              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <p className="text-sm text-[var(--foreground-muted)] mb-4">
                  The Content Calendar helps you visualize and plan your social media schedule.
                  View posts by month, drag to reschedule, and ensure consistent posting.
                </p>
                <Link
                  href="/super-admin/marketing-studio/calendar"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Calendar className="h-4 w-4" />
                  Open Content Calendar
                </Link>
              </div>
            </section>

            {/* Keyboard Shortcuts Section */}
            <section id="shortcuts" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Keyboard Shortcuts</h2>
              <p className="text-[var(--foreground-muted)] mb-6">
                Speed up your workflow with these shortcuts.
              </p>

              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-[var(--card-border)]">
                  <div className="p-6">
                    <h3 className="font-semibold text-[var(--foreground)] mb-4">General</h3>
                    <div className="space-y-3">
                      {[
                        { keys: ["Cmd", "S"], action: "Save composition" },
                        { keys: ["Cmd", "Z"], action: "Undo" },
                        { keys: ["Cmd", "Shift", "Z"], action: "Redo" },
                        { keys: ["Delete"], action: "Delete selected layer" },
                        { keys: ["Cmd", "D"], action: "Duplicate layer" },
                        { keys: ["Cmd", "G"], action: "Group layers" },
                        { keys: ["Cmd", "Shift", "G"], action: "Ungroup" },
                      ].map((shortcut, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-sm text-[var(--foreground-muted)]">{shortcut.action}</span>
                          <KeyboardShortcut keys={shortcut.keys} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-[var(--foreground)] mb-4">Export & View</h3>
                    <div className="space-y-3">
                      {[
                        { keys: ["E"], action: "Export PNG" },
                        { keys: ["C"], action: "Copy to clipboard" },
                        { keys: ["T"], action: "Toggle theme" },
                        { keys: ["+"], action: "Zoom in" },
                        { keys: ["-"], action: "Zoom out" },
                        { keys: ["0"], action: "Reset zoom" },
                        { keys: ["G"], action: "Toggle grid" },
                      ].map((shortcut, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-sm text-[var(--foreground-muted)]">{shortcut.action}</span>
                          <KeyboardShortcut keys={shortcut.keys} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Getting Started CTA */}
            <section className="scroll-mt-24">
              <div className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-8 text-center">
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
                  Ready to Create?
                </h2>
                <p className="text-[var(--foreground-muted)] mb-6">
                  Start designing your first social media post
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Link
                    href="/super-admin/marketing-studio/composer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    <Play className="h-4 w-4" />
                    Open Composer
                  </Link>
                  <Link
                    href="/super-admin/marketing-studio/templates"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-medium hover:bg-[var(--background-hover)] transition-colors"
                  >
                    <Layout className="h-4 w-4" />
                    Browse Templates
                  </Link>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
