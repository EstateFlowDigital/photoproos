"use client";

import { useState, useCallback, useRef, useId, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Types
interface DesignElement {
  id: string;
  type: "text" | "image" | "shape" | "placeholder" | "logo";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content: string;
  styles: ElementStyles;
  locked?: boolean;
  visible?: boolean;
  layerOrder: number;
}

interface ElementStyles {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  opacity?: number;
  textAlign?: "left" | "center" | "right";
  padding?: number;
  shadow?: string;
}

interface DesignTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  elements: DesignElement[];
  backgroundColor: string;
  category: string;
}

interface DesignEditorProps {
  initialTemplate?: DesignTemplate;
  propertyData?: {
    address?: string;
    price?: string;
    bedrooms?: number;
    bathrooms?: number;
    sqft?: number;
    description?: string;
    agentName?: string;
    agentPhone?: string;
    agentEmail?: string;
    companyName?: string;
    logoUrl?: string;
    photos?: string[];
  };
  onSave?: (design: DesignTemplate) => void;
  onExport?: (format: "png" | "jpg" | "pdf") => void;
}

// Element palettes
const ELEMENT_PALETTE = [
  {
    category: "Text",
    items: [
      { type: "text" as const, label: "Heading", icon: "H", preset: { fontSize: 32, fontWeight: "bold" } },
      { type: "text" as const, label: "Subheading", icon: "h", preset: { fontSize: 24, fontWeight: "600" } },
      { type: "text" as const, label: "Body Text", icon: "T", preset: { fontSize: 16, fontWeight: "normal" } },
      { type: "text" as const, label: "Caption", icon: "c", preset: { fontSize: 12, fontWeight: "normal" } },
    ],
  },
  {
    category: "Property Info",
    items: [
      { type: "placeholder" as const, label: "Address", icon: "📍", placeholderKey: "address" },
      { type: "placeholder" as const, label: "Price", icon: "💰", placeholderKey: "price" },
      { type: "placeholder" as const, label: "Bed/Bath", icon: "🛏️", placeholderKey: "bedrooms" },
      { type: "placeholder" as const, label: "Sq Ft", icon: "📐", placeholderKey: "sqft" },
      { type: "placeholder" as const, label: "Description", icon: "📝", placeholderKey: "description" },
    ],
  },
  {
    category: "Agent Info",
    items: [
      { type: "placeholder" as const, label: "Agent Name", icon: "👤", placeholderKey: "agentName" },
      { type: "placeholder" as const, label: "Phone", icon: "📱", placeholderKey: "agentPhone" },
      { type: "placeholder" as const, label: "Email", icon: "✉️", placeholderKey: "agentEmail" },
      { type: "logo" as const, label: "Logo", icon: "🏢", placeholderKey: "logoUrl" },
    ],
  },
  {
    category: "Shapes",
    items: [
      { type: "shape" as const, label: "Rectangle", icon: "▢", shapeType: "rectangle" },
      { type: "shape" as const, label: "Circle", icon: "○", shapeType: "circle" },
      { type: "shape" as const, label: "Line", icon: "—", shapeType: "line" },
      { type: "shape" as const, label: "Divider", icon: "━", shapeType: "divider" },
    ],
  },
  {
    category: "Media",
    items: [
      { type: "image" as const, label: "Property Photo", icon: "🖼️", imageType: "property" },
      { type: "image" as const, label: "Upload Image", icon: "📤", imageType: "upload" },
    ],
  },
];

const FONTS = [
  { value: "Inter", label: "Inter" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Lato", label: "Lato" },
  { value: "Poppins", label: "Poppins" },
  { value: "Georgia", label: "Georgia" },
];

// Pre-designed templates for photographers
const DESIGN_TEMPLATES: DesignTemplate[] = [
  // Instagram Post Templates
  {
    id: "ig-just-listed-modern",
    name: "Just Listed - Modern",
    width: 1080,
    height: 1080,
    category: "Instagram Post",
    backgroundColor: "#0a0a0a",
    elements: [
      {
        id: "jl-badge",
        type: "shape",
        x: 40,
        y: 40,
        width: 200,
        height: 48,
        rotation: 0,
        content: "rectangle",
        styles: { backgroundColor: "#3b82f6", borderRadius: 8 },
        visible: true,
        locked: false,
        layerOrder: 0,
      },
      {
        id: "jl-badge-text",
        type: "text",
        x: 40,
        y: 40,
        width: 200,
        height: 48,
        rotation: 0,
        content: "JUST LISTED",
        styles: { fontFamily: "Montserrat", fontSize: 18, fontWeight: "bold", color: "#ffffff", textAlign: "center", padding: 12 },
        visible: true,
        locked: false,
        layerOrder: 1,
      },
      {
        id: "jl-photo-placeholder",
        type: "image",
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
        rotation: 0,
        content: "",
        styles: { opacity: 0.4 },
        visible: true,
        locked: false,
        layerOrder: -1,
      },
      {
        id: "jl-address",
        type: "placeholder",
        x: 40,
        y: 800,
        width: 1000,
        height: 80,
        rotation: 0,
        content: "{{address}}",
        styles: { fontFamily: "Playfair Display", fontSize: 42, fontWeight: "bold", color: "#ffffff", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 2,
      },
      {
        id: "jl-price",
        type: "placeholder",
        x: 40,
        y: 890,
        width: 400,
        height: 60,
        rotation: 0,
        content: "{{price}}",
        styles: { fontFamily: "Montserrat", fontSize: 36, fontWeight: "600", color: "#3b82f6", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 3,
      },
      {
        id: "jl-details",
        type: "text",
        x: 40,
        y: 960,
        width: 600,
        height: 40,
        rotation: 0,
        content: "4 Beds • 3 Baths • 2,500 Sq Ft",
        styles: { fontFamily: "Inter", fontSize: 20, fontWeight: "normal", color: "#a7a7a7", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 4,
      },
      {
        id: "jl-agent",
        type: "placeholder",
        x: 40,
        y: 1010,
        width: 500,
        height: 40,
        rotation: 0,
        content: "{{agentName}} • {{agentPhone}}",
        styles: { fontFamily: "Inter", fontSize: 16, fontWeight: "normal", color: "#7c7c7c", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 5,
      },
    ],
  },
  {
    id: "ig-just-sold-celebration",
    name: "Just Sold - Celebration",
    width: 1080,
    height: 1080,
    category: "Instagram Post",
    backgroundColor: "#1a1a2e",
    elements: [
      {
        id: "js-badge",
        type: "shape",
        x: 340,
        y: 60,
        width: 400,
        height: 60,
        rotation: 0,
        content: "rectangle",
        styles: { backgroundColor: "#22c55e", borderRadius: 30 },
        visible: true,
        locked: false,
        layerOrder: 0,
      },
      {
        id: "js-badge-text",
        type: "text",
        x: 340,
        y: 60,
        width: 400,
        height: 60,
        rotation: 0,
        content: "SOLD",
        styles: { fontFamily: "Montserrat", fontSize: 32, fontWeight: "bold", color: "#ffffff", textAlign: "center", padding: 12 },
        visible: true,
        locked: false,
        layerOrder: 1,
      },
      {
        id: "js-congrats",
        type: "text",
        x: 140,
        y: 200,
        width: 800,
        height: 100,
        rotation: 0,
        content: "Congratulations to our clients!",
        styles: { fontFamily: "Playfair Display", fontSize: 36, fontWeight: "normal", color: "#ffffff", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 2,
      },
      {
        id: "js-photo-frame",
        type: "shape",
        x: 140,
        y: 320,
        width: 800,
        height: 500,
        rotation: 0,
        content: "rectangle",
        styles: { backgroundColor: "#313131", borderRadius: 16 },
        visible: true,
        locked: false,
        layerOrder: 3,
      },
      {
        id: "js-photo",
        type: "image",
        x: 148,
        y: 328,
        width: 784,
        height: 484,
        rotation: 0,
        content: "",
        styles: { borderRadius: 12 },
        visible: true,
        locked: false,
        layerOrder: 4,
      },
      {
        id: "js-address",
        type: "placeholder",
        x: 140,
        y: 850,
        width: 800,
        height: 60,
        rotation: 0,
        content: "{{address}}",
        styles: { fontFamily: "Montserrat", fontSize: 28, fontWeight: "600", color: "#ffffff", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 5,
      },
      {
        id: "js-agent",
        type: "placeholder",
        x: 140,
        y: 940,
        width: 800,
        height: 40,
        rotation: 0,
        content: "Listed by {{agentName}}",
        styles: { fontFamily: "Inter", fontSize: 18, fontWeight: "normal", color: "#a7a7a7", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 6,
      },
    ],
  },
  {
    id: "ig-open-house-minimal",
    name: "Open House - Minimal",
    width: 1080,
    height: 1080,
    category: "Instagram Post",
    backgroundColor: "#ffffff",
    elements: [
      {
        id: "oh-title",
        type: "text",
        x: 40,
        y: 60,
        width: 400,
        height: 80,
        rotation: 0,
        content: "OPEN HOUSE",
        styles: { fontFamily: "Montserrat", fontSize: 48, fontWeight: "bold", color: "#0a0a0a", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 0,
      },
      {
        id: "oh-date",
        type: "text",
        x: 40,
        y: 140,
        width: 500,
        height: 50,
        rotation: 0,
        content: "Saturday, January 15 • 1-4 PM",
        styles: { fontFamily: "Inter", fontSize: 22, fontWeight: "500", color: "#3b82f6", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 1,
      },
      {
        id: "oh-photo",
        type: "image",
        x: 40,
        y: 220,
        width: 1000,
        height: 600,
        rotation: 0,
        content: "",
        styles: { borderRadius: 16 },
        visible: true,
        locked: false,
        layerOrder: 2,
      },
      {
        id: "oh-address",
        type: "placeholder",
        x: 40,
        y: 850,
        width: 1000,
        height: 70,
        rotation: 0,
        content: "{{address}}",
        styles: { fontFamily: "Playfair Display", fontSize: 32, fontWeight: "600", color: "#0a0a0a", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 3,
      },
      {
        id: "oh-price",
        type: "placeholder",
        x: 40,
        y: 930,
        width: 300,
        height: 50,
        rotation: 0,
        content: "{{price}}",
        styles: { fontFamily: "Montserrat", fontSize: 28, fontWeight: "bold", color: "#0a0a0a", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 4,
      },
      {
        id: "oh-details",
        type: "text",
        x: 40,
        y: 990,
        width: 600,
        height: 40,
        rotation: 0,
        content: "4 Beds • 3 Baths • 2,500 Sq Ft",
        styles: { fontFamily: "Inter", fontSize: 18, fontWeight: "normal", color: "#7c7c7c", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 5,
      },
    ],
  },
  {
    id: "ig-price-reduction",
    name: "Price Reduction",
    width: 1080,
    height: 1080,
    category: "Instagram Post",
    backgroundColor: "#0a0a0a",
    elements: [
      {
        id: "pr-banner",
        type: "shape",
        x: 0,
        y: 0,
        width: 1080,
        height: 100,
        rotation: 0,
        content: "rectangle",
        styles: { backgroundColor: "#ef4444" },
        visible: true,
        locked: false,
        layerOrder: 0,
      },
      {
        id: "pr-banner-text",
        type: "text",
        x: 0,
        y: 0,
        width: 1080,
        height: 100,
        rotation: 0,
        content: "PRICE REDUCED",
        styles: { fontFamily: "Montserrat", fontSize: 36, fontWeight: "bold", color: "#ffffff", textAlign: "center", padding: 28 },
        visible: true,
        locked: false,
        layerOrder: 1,
      },
      {
        id: "pr-photo",
        type: "image",
        x: 40,
        y: 140,
        width: 1000,
        height: 600,
        rotation: 0,
        content: "",
        styles: { borderRadius: 12 },
        visible: true,
        locked: false,
        layerOrder: 2,
      },
      {
        id: "pr-old-price",
        type: "text",
        x: 40,
        y: 780,
        width: 300,
        height: 50,
        rotation: 0,
        content: "$599,000",
        styles: { fontFamily: "Inter", fontSize: 24, fontWeight: "normal", color: "#7c7c7c", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 3,
      },
      {
        id: "pr-strikethrough",
        type: "shape",
        x: 40,
        y: 805,
        width: 160,
        height: 3,
        rotation: 0,
        content: "line",
        styles: { backgroundColor: "#ef4444" },
        visible: true,
        locked: false,
        layerOrder: 4,
      },
      {
        id: "pr-new-price",
        type: "placeholder",
        x: 40,
        y: 840,
        width: 400,
        height: 70,
        rotation: 0,
        content: "{{price}}",
        styles: { fontFamily: "Montserrat", fontSize: 48, fontWeight: "bold", color: "#22c55e", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 5,
      },
      {
        id: "pr-address",
        type: "placeholder",
        x: 40,
        y: 920,
        width: 1000,
        height: 60,
        rotation: 0,
        content: "{{address}}",
        styles: { fontFamily: "Inter", fontSize: 24, fontWeight: "500", color: "#ffffff", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 6,
      },
      {
        id: "pr-agent",
        type: "placeholder",
        x: 40,
        y: 1000,
        width: 600,
        height: 40,
        rotation: 0,
        content: "{{agentName}} • {{agentPhone}}",
        styles: { fontFamily: "Inter", fontSize: 16, fontWeight: "normal", color: "#a7a7a7", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 7,
      },
    ],
  },
  {
    id: "ig-coming-soon",
    name: "Coming Soon",
    width: 1080,
    height: 1080,
    category: "Instagram Post",
    backgroundColor: "#1a1a2e",
    elements: [
      {
        id: "cs-bg-gradient",
        type: "shape",
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
        rotation: 0,
        content: "rectangle",
        styles: { backgroundColor: "#8b5cf6", opacity: 0.15 },
        visible: true,
        locked: false,
        layerOrder: 0,
      },
      {
        id: "cs-title",
        type: "text",
        x: 140,
        y: 300,
        width: 800,
        height: 120,
        rotation: 0,
        content: "COMING SOON",
        styles: { fontFamily: "Montserrat", fontSize: 72, fontWeight: "bold", color: "#ffffff", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 1,
      },
      {
        id: "cs-subtitle",
        type: "text",
        x: 140,
        y: 440,
        width: 800,
        height: 60,
        rotation: 0,
        content: "A new listing is on the way",
        styles: { fontFamily: "Inter", fontSize: 24, fontWeight: "normal", color: "#a7a7a7", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 2,
      },
      {
        id: "cs-divider",
        type: "shape",
        x: 440,
        y: 540,
        width: 200,
        height: 4,
        rotation: 0,
        content: "divider",
        styles: { backgroundColor: "#8b5cf6", borderRadius: 2 },
        visible: true,
        locked: false,
        layerOrder: 3,
      },
      {
        id: "cs-address",
        type: "placeholder",
        x: 140,
        y: 600,
        width: 800,
        height: 80,
        rotation: 0,
        content: "{{address}}",
        styles: { fontFamily: "Playfair Display", fontSize: 36, fontWeight: "600", color: "#ffffff", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 4,
      },
      {
        id: "cs-details",
        type: "text",
        x: 140,
        y: 700,
        width: 800,
        height: 50,
        rotation: 0,
        content: "4 Beds • 3 Baths • 2,500 Sq Ft",
        styles: { fontFamily: "Inter", fontSize: 22, fontWeight: "normal", color: "#a7a7a7", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 5,
      },
      {
        id: "cs-agent",
        type: "placeholder",
        x: 140,
        y: 800,
        width: 800,
        height: 40,
        rotation: 0,
        content: "Contact {{agentName}} for early access",
        styles: { fontFamily: "Inter", fontSize: 18, fontWeight: "500", color: "#8b5cf6", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 6,
      },
    ],
  },
  // Instagram Story Templates
  {
    id: "story-just-listed",
    name: "Just Listed Story",
    width: 1080,
    height: 1920,
    category: "Instagram Story",
    backgroundColor: "#0a0a0a",
    elements: [
      {
        id: "sl-photo",
        type: "image",
        x: 0,
        y: 0,
        width: 1080,
        height: 1920,
        rotation: 0,
        content: "",
        styles: { opacity: 0.7 },
        visible: true,
        locked: false,
        layerOrder: 0,
      },
      {
        id: "sl-badge",
        type: "shape",
        x: 340,
        y: 200,
        width: 400,
        height: 80,
        rotation: 0,
        content: "rectangle",
        styles: { backgroundColor: "#3b82f6", borderRadius: 40 },
        visible: true,
        locked: false,
        layerOrder: 1,
      },
      {
        id: "sl-badge-text",
        type: "text",
        x: 340,
        y: 200,
        width: 400,
        height: 80,
        rotation: 0,
        content: "JUST LISTED",
        styles: { fontFamily: "Montserrat", fontSize: 28, fontWeight: "bold", color: "#ffffff", textAlign: "center", padding: 24 },
        visible: true,
        locked: false,
        layerOrder: 2,
      },
      {
        id: "sl-address",
        type: "placeholder",
        x: 60,
        y: 1400,
        width: 960,
        height: 100,
        rotation: 0,
        content: "{{address}}",
        styles: { fontFamily: "Playfair Display", fontSize: 48, fontWeight: "bold", color: "#ffffff", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 3,
      },
      {
        id: "sl-price",
        type: "placeholder",
        x: 60,
        y: 1520,
        width: 960,
        height: 80,
        rotation: 0,
        content: "{{price}}",
        styles: { fontFamily: "Montserrat", fontSize: 42, fontWeight: "600", color: "#3b82f6", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 4,
      },
      {
        id: "sl-details",
        type: "text",
        x: 60,
        y: 1620,
        width: 960,
        height: 50,
        rotation: 0,
        content: "4 Beds • 3 Baths • 2,500 Sq Ft",
        styles: { fontFamily: "Inter", fontSize: 24, fontWeight: "normal", color: "#ffffff", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 5,
      },
      {
        id: "sl-swipe",
        type: "text",
        x: 60,
        y: 1780,
        width: 960,
        height: 40,
        rotation: 0,
        content: "Swipe up for details",
        styles: { fontFamily: "Inter", fontSize: 18, fontWeight: "500", color: "#a7a7a7", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 6,
      },
    ],
  },
  {
    id: "story-open-house",
    name: "Open House Story",
    width: 1080,
    height: 1920,
    category: "Instagram Story",
    backgroundColor: "#ffffff",
    elements: [
      {
        id: "so-title",
        type: "text",
        x: 60,
        y: 150,
        width: 960,
        height: 120,
        rotation: 0,
        content: "OPEN HOUSE",
        styles: { fontFamily: "Montserrat", fontSize: 64, fontWeight: "bold", color: "#0a0a0a", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 0,
      },
      {
        id: "so-date",
        type: "text",
        x: 60,
        y: 280,
        width: 960,
        height: 60,
        rotation: 0,
        content: "Saturday, January 15",
        styles: { fontFamily: "Inter", fontSize: 32, fontWeight: "600", color: "#3b82f6", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 1,
      },
      {
        id: "so-time",
        type: "text",
        x: 60,
        y: 350,
        width: 960,
        height: 50,
        rotation: 0,
        content: "1:00 PM - 4:00 PM",
        styles: { fontFamily: "Inter", fontSize: 24, fontWeight: "normal", color: "#7c7c7c", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 2,
      },
      {
        id: "so-photo",
        type: "image",
        x: 60,
        y: 450,
        width: 960,
        height: 800,
        rotation: 0,
        content: "",
        styles: { borderRadius: 24 },
        visible: true,
        locked: false,
        layerOrder: 3,
      },
      {
        id: "so-address",
        type: "placeholder",
        x: 60,
        y: 1300,
        width: 960,
        height: 100,
        rotation: 0,
        content: "{{address}}",
        styles: { fontFamily: "Playfair Display", fontSize: 36, fontWeight: "600", color: "#0a0a0a", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 4,
      },
      {
        id: "so-price",
        type: "placeholder",
        x: 60,
        y: 1420,
        width: 960,
        height: 70,
        rotation: 0,
        content: "{{price}}",
        styles: { fontFamily: "Montserrat", fontSize: 36, fontWeight: "bold", color: "#0a0a0a", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 5,
      },
      {
        id: "so-details",
        type: "text",
        x: 60,
        y: 1510,
        width: 960,
        height: 50,
        rotation: 0,
        content: "4 Beds • 3 Baths • 2,500 Sq Ft",
        styles: { fontFamily: "Inter", fontSize: 22, fontWeight: "normal", color: "#7c7c7c", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 6,
      },
      {
        id: "so-agent",
        type: "placeholder",
        x: 60,
        y: 1700,
        width: 960,
        height: 50,
        rotation: 0,
        content: "{{agentName}} • {{agentPhone}}",
        styles: { fontFamily: "Inter", fontSize: 20, fontWeight: "500", color: "#3b82f6", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 7,
      },
    ],
  },
  // Facebook Post Templates
  {
    id: "fb-featured-listing",
    name: "Featured Listing",
    width: 1200,
    height: 628,
    category: "Facebook Post",
    backgroundColor: "#0a0a0a",
    elements: [
      {
        id: "fb-photo",
        type: "image",
        x: 0,
        y: 0,
        width: 700,
        height: 628,
        rotation: 0,
        content: "",
        styles: {},
        visible: true,
        locked: false,
        layerOrder: 0,
      },
      {
        id: "fb-info-bg",
        type: "shape",
        x: 700,
        y: 0,
        width: 500,
        height: 628,
        rotation: 0,
        content: "rectangle",
        styles: { backgroundColor: "#141414" },
        visible: true,
        locked: false,
        layerOrder: 1,
      },
      {
        id: "fb-badge",
        type: "shape",
        x: 740,
        y: 40,
        width: 160,
        height: 36,
        rotation: 0,
        content: "rectangle",
        styles: { backgroundColor: "#3b82f6", borderRadius: 6 },
        visible: true,
        locked: false,
        layerOrder: 2,
      },
      {
        id: "fb-badge-text",
        type: "text",
        x: 740,
        y: 40,
        width: 160,
        height: 36,
        rotation: 0,
        content: "FOR SALE",
        styles: { fontFamily: "Montserrat", fontSize: 14, fontWeight: "bold", color: "#ffffff", textAlign: "center", padding: 8 },
        visible: true,
        locked: false,
        layerOrder: 3,
      },
      {
        id: "fb-price",
        type: "placeholder",
        x: 740,
        y: 100,
        width: 420,
        height: 60,
        rotation: 0,
        content: "{{price}}",
        styles: { fontFamily: "Montserrat", fontSize: 40, fontWeight: "bold", color: "#ffffff", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 4,
      },
      {
        id: "fb-address",
        type: "placeholder",
        x: 740,
        y: 170,
        width: 420,
        height: 80,
        rotation: 0,
        content: "{{address}}",
        styles: { fontFamily: "Inter", fontSize: 20, fontWeight: "500", color: "#a7a7a7", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 5,
      },
      {
        id: "fb-divider",
        type: "shape",
        x: 740,
        y: 280,
        width: 420,
        height: 1,
        rotation: 0,
        content: "divider",
        styles: { backgroundColor: "#313131" },
        visible: true,
        locked: false,
        layerOrder: 6,
      },
      {
        id: "fb-beds",
        type: "text",
        x: 740,
        y: 310,
        width: 130,
        height: 80,
        rotation: 0,
        content: "4\nBeds",
        styles: { fontFamily: "Montserrat", fontSize: 24, fontWeight: "600", color: "#ffffff", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 7,
      },
      {
        id: "fb-baths",
        type: "text",
        x: 880,
        y: 310,
        width: 130,
        height: 80,
        rotation: 0,
        content: "3\nBaths",
        styles: { fontFamily: "Montserrat", fontSize: 24, fontWeight: "600", color: "#ffffff", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 8,
      },
      {
        id: "fb-sqft",
        type: "text",
        x: 1020,
        y: 310,
        width: 130,
        height: 80,
        rotation: 0,
        content: "2,500\nSq Ft",
        styles: { fontFamily: "Montserrat", fontSize: 24, fontWeight: "600", color: "#ffffff", textAlign: "center" },
        visible: true,
        locked: false,
        layerOrder: 9,
      },
      {
        id: "fb-agent",
        type: "placeholder",
        x: 740,
        y: 520,
        width: 420,
        height: 40,
        rotation: 0,
        content: "{{agentName}}",
        styles: { fontFamily: "Inter", fontSize: 16, fontWeight: "500", color: "#ffffff", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 10,
      },
      {
        id: "fb-contact",
        type: "placeholder",
        x: 740,
        y: 560,
        width: 420,
        height: 30,
        rotation: 0,
        content: "{{agentPhone}} • {{agentEmail}}",
        styles: { fontFamily: "Inter", fontSize: 14, fontWeight: "normal", color: "#7c7c7c", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 11,
      },
    ],
  },
  // Flyer Templates
  {
    id: "flyer-luxury-portrait",
    name: "Luxury Property Flyer",
    width: 2550,
    height: 3300,
    category: "Flyer",
    backgroundColor: "#0a0a0a",
    elements: [
      {
        id: "lf-header-bg",
        type: "shape",
        x: 0,
        y: 0,
        width: 2550,
        height: 200,
        rotation: 0,
        content: "rectangle",
        styles: { backgroundColor: "#141414" },
        visible: true,
        locked: false,
        layerOrder: 0,
      },
      {
        id: "lf-logo",
        type: "logo",
        x: 100,
        y: 50,
        width: 200,
        height: 100,
        rotation: 0,
        content: "",
        styles: {},
        visible: true,
        locked: false,
        layerOrder: 1,
      },
      {
        id: "lf-agent-name",
        type: "placeholder",
        x: 1800,
        y: 60,
        width: 650,
        height: 50,
        rotation: 0,
        content: "{{agentName}}",
        styles: { fontFamily: "Montserrat", fontSize: 28, fontWeight: "600", color: "#ffffff", textAlign: "right" },
        visible: true,
        locked: false,
        layerOrder: 2,
      },
      {
        id: "lf-agent-contact",
        type: "placeholder",
        x: 1800,
        y: 120,
        width: 650,
        height: 40,
        rotation: 0,
        content: "{{agentPhone}} • {{agentEmail}}",
        styles: { fontFamily: "Inter", fontSize: 20, fontWeight: "normal", color: "#a7a7a7", textAlign: "right" },
        visible: true,
        locked: false,
        layerOrder: 3,
      },
      {
        id: "lf-main-photo",
        type: "image",
        x: 100,
        y: 300,
        width: 2350,
        height: 1400,
        rotation: 0,
        content: "",
        styles: { borderRadius: 24 },
        visible: true,
        locked: false,
        layerOrder: 4,
      },
      {
        id: "lf-badge",
        type: "shape",
        x: 150,
        y: 350,
        width: 280,
        height: 70,
        rotation: 0,
        content: "rectangle",
        styles: { backgroundColor: "#3b82f6", borderRadius: 12 },
        visible: true,
        locked: false,
        layerOrder: 5,
      },
      {
        id: "lf-badge-text",
        type: "text",
        x: 150,
        y: 350,
        width: 280,
        height: 70,
        rotation: 0,
        content: "FOR SALE",
        styles: { fontFamily: "Montserrat", fontSize: 28, fontWeight: "bold", color: "#ffffff", textAlign: "center", padding: 18 },
        visible: true,
        locked: false,
        layerOrder: 6,
      },
      {
        id: "lf-price",
        type: "placeholder",
        x: 100,
        y: 1780,
        width: 800,
        height: 100,
        rotation: 0,
        content: "{{price}}",
        styles: { fontFamily: "Montserrat", fontSize: 72, fontWeight: "bold", color: "#3b82f6", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 7,
      },
      {
        id: "lf-address",
        type: "placeholder",
        x: 100,
        y: 1900,
        width: 2350,
        height: 100,
        rotation: 0,
        content: "{{address}}",
        styles: { fontFamily: "Playfair Display", fontSize: 56, fontWeight: "600", color: "#ffffff", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 8,
      },
      {
        id: "lf-divider",
        type: "shape",
        x: 100,
        y: 2050,
        width: 2350,
        height: 2,
        rotation: 0,
        content: "divider",
        styles: { backgroundColor: "#313131" },
        visible: true,
        locked: false,
        layerOrder: 9,
      },
      {
        id: "lf-stats-bg",
        type: "shape",
        x: 100,
        y: 2100,
        width: 2350,
        height: 200,
        rotation: 0,
        content: "rectangle",
        styles: { backgroundColor: "#141414", borderRadius: 16 },
        visible: true,
        locked: false,
        layerOrder: 10,
      },
      {
        id: "lf-beds",
        type: "text",
        x: 200,
        y: 2140,
        width: 400,
        height: 120,
        rotation: 0,
        content: "4 Bedrooms",
        styles: { fontFamily: "Montserrat", fontSize: 36, fontWeight: "600", color: "#ffffff", textAlign: "center", padding: 40 },
        visible: true,
        locked: false,
        layerOrder: 11,
      },
      {
        id: "lf-baths",
        type: "text",
        x: 700,
        y: 2140,
        width: 400,
        height: 120,
        rotation: 0,
        content: "3 Bathrooms",
        styles: { fontFamily: "Montserrat", fontSize: 36, fontWeight: "600", color: "#ffffff", textAlign: "center", padding: 40 },
        visible: true,
        locked: false,
        layerOrder: 12,
      },
      {
        id: "lf-sqft",
        type: "text",
        x: 1200,
        y: 2140,
        width: 400,
        height: 120,
        rotation: 0,
        content: "2,500 Sq Ft",
        styles: { fontFamily: "Montserrat", fontSize: 36, fontWeight: "600", color: "#ffffff", textAlign: "center", padding: 40 },
        visible: true,
        locked: false,
        layerOrder: 13,
      },
      {
        id: "lf-garage",
        type: "text",
        x: 1700,
        y: 2140,
        width: 400,
        height: 120,
        rotation: 0,
        content: "2 Car Garage",
        styles: { fontFamily: "Montserrat", fontSize: 36, fontWeight: "600", color: "#ffffff", textAlign: "center", padding: 40 },
        visible: true,
        locked: false,
        layerOrder: 14,
      },
      {
        id: "lf-description",
        type: "placeholder",
        x: 100,
        y: 2380,
        width: 2350,
        height: 300,
        rotation: 0,
        content: "{{description}}",
        styles: { fontFamily: "Inter", fontSize: 28, fontWeight: "normal", color: "#a7a7a7", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 15,
      },
      {
        id: "lf-gallery",
        type: "image",
        x: 100,
        y: 2750,
        width: 750,
        height: 450,
        rotation: 0,
        content: "",
        styles: { borderRadius: 16 },
        visible: true,
        locked: false,
        layerOrder: 16,
      },
      {
        id: "lf-gallery2",
        type: "image",
        x: 900,
        y: 2750,
        width: 750,
        height: 450,
        rotation: 0,
        content: "",
        styles: { borderRadius: 16 },
        visible: true,
        locked: false,
        layerOrder: 17,
      },
      {
        id: "lf-gallery3",
        type: "image",
        x: 1700,
        y: 2750,
        width: 750,
        height: 450,
        rotation: 0,
        content: "",
        styles: { borderRadius: 16 },
        visible: true,
        locked: false,
        layerOrder: 18,
      },
    ],
  },
  // Postcard Templates
  {
    id: "postcard-just-sold",
    name: "Just Sold Postcard",
    width: 1800,
    height: 1200,
    category: "Postcard",
    backgroundColor: "#ffffff",
    elements: [
      {
        id: "pc-photo",
        type: "image",
        x: 0,
        y: 0,
        width: 900,
        height: 1200,
        rotation: 0,
        content: "",
        styles: {},
        visible: true,
        locked: false,
        layerOrder: 0,
      },
      {
        id: "pc-sold-badge",
        type: "shape",
        x: 50,
        y: 50,
        width: 200,
        height: 60,
        rotation: -15,
        content: "rectangle",
        styles: { backgroundColor: "#22c55e", borderRadius: 8 },
        visible: true,
        locked: false,
        layerOrder: 1,
      },
      {
        id: "pc-sold-text",
        type: "text",
        x: 50,
        y: 50,
        width: 200,
        height: 60,
        rotation: -15,
        content: "SOLD",
        styles: { fontFamily: "Montserrat", fontSize: 28, fontWeight: "bold", color: "#ffffff", textAlign: "center", padding: 14 },
        visible: true,
        locked: false,
        layerOrder: 2,
      },
      {
        id: "pc-info-bg",
        type: "shape",
        x: 900,
        y: 0,
        width: 900,
        height: 1200,
        rotation: 0,
        content: "rectangle",
        styles: { backgroundColor: "#0a0a0a" },
        visible: true,
        locked: false,
        layerOrder: 3,
      },
      {
        id: "pc-headline",
        type: "text",
        x: 960,
        y: 100,
        width: 780,
        height: 120,
        rotation: 0,
        content: "Another One\nSOLD!",
        styles: { fontFamily: "Playfair Display", fontSize: 56, fontWeight: "bold", color: "#ffffff", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 4,
      },
      {
        id: "pc-address",
        type: "placeholder",
        x: 960,
        y: 280,
        width: 780,
        height: 80,
        rotation: 0,
        content: "{{address}}",
        styles: { fontFamily: "Inter", fontSize: 24, fontWeight: "500", color: "#a7a7a7", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 5,
      },
      {
        id: "pc-divider",
        type: "shape",
        x: 960,
        y: 400,
        width: 780,
        height: 2,
        rotation: 0,
        content: "divider",
        styles: { backgroundColor: "#313131" },
        visible: true,
        locked: false,
        layerOrder: 6,
      },
      {
        id: "pc-message",
        type: "text",
        x: 960,
        y: 450,
        width: 780,
        height: 200,
        rotation: 0,
        content: "Thinking about selling?\nI can help you get top dollar\nfor your home.",
        styles: { fontFamily: "Inter", fontSize: 28, fontWeight: "normal", color: "#ffffff", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 7,
      },
      {
        id: "pc-cta",
        type: "shape",
        x: 960,
        y: 700,
        width: 300,
        height: 60,
        rotation: 0,
        content: "rectangle",
        styles: { backgroundColor: "#3b82f6", borderRadius: 8 },
        visible: true,
        locked: false,
        layerOrder: 8,
      },
      {
        id: "pc-cta-text",
        type: "text",
        x: 960,
        y: 700,
        width: 300,
        height: 60,
        rotation: 0,
        content: "Get Your Value",
        styles: { fontFamily: "Montserrat", fontSize: 18, fontWeight: "600", color: "#ffffff", textAlign: "center", padding: 18 },
        visible: true,
        locked: false,
        layerOrder: 9,
      },
      {
        id: "pc-agent-photo",
        type: "shape",
        x: 960,
        y: 900,
        width: 100,
        height: 100,
        rotation: 0,
        content: "circle",
        styles: { backgroundColor: "#313131" },
        visible: true,
        locked: false,
        layerOrder: 10,
      },
      {
        id: "pc-agent-name",
        type: "placeholder",
        x: 1080,
        y: 920,
        width: 400,
        height: 40,
        rotation: 0,
        content: "{{agentName}}",
        styles: { fontFamily: "Montserrat", fontSize: 22, fontWeight: "600", color: "#ffffff", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 11,
      },
      {
        id: "pc-agent-contact",
        type: "placeholder",
        x: 1080,
        y: 970,
        width: 400,
        height: 30,
        rotation: 0,
        content: "{{agentPhone}}",
        styles: { fontFamily: "Inter", fontSize: 18, fontWeight: "normal", color: "#a7a7a7", textAlign: "left" },
        visible: true,
        locked: false,
        layerOrder: 12,
      },
      {
        id: "pc-logo",
        type: "logo",
        x: 1580,
        y: 1080,
        width: 150,
        height: 80,
        rotation: 0,
        content: "",
        styles: {},
        visible: true,
        locked: false,
        layerOrder: 13,
      },
    ],
  },
];

// Group templates by category for display
const TEMPLATE_CATEGORIES = [
  { id: "Instagram Post", label: "Instagram Posts", icon: "📱" },
  { id: "Instagram Story", label: "Instagram Stories", icon: "📖" },
  { id: "Facebook Post", label: "Facebook Posts", icon: "👍" },
  { id: "Flyer", label: "Flyers", icon: "📄" },
  { id: "Postcard", label: "Postcards", icon: "✉️" },
];

// Draggable element component
function DraggableElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  scale,
}: {
  element: DesignElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<DesignElement>) => void;
  scale: number;
}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: 0, elementY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (element.locked) return;
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elementX: element.x,
      elementY: element.y,
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;
      onUpdate({
        x: dragStart.elementX + dx,
        y: dragStart.elementY + dy,
      });
    },
    [isDragging, dragStart, scale, onUpdate]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Add global event listeners for dragging
  useState(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  });

  const renderContent = () => {
    switch (element.type) {
      case "text":
      case "placeholder":
        return (
          <div
            style={{
              fontFamily: element.styles.fontFamily || "Inter",
              fontSize: element.styles.fontSize || 16,
              fontWeight: element.styles.fontWeight || "normal",
              color: element.styles.color || "#ffffff",
              textAlign: element.styles.textAlign || "left",
              padding: element.styles.padding || 8,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent:
                element.styles.textAlign === "center"
                  ? "center"
                  : element.styles.textAlign === "right"
                  ? "flex-end"
                  : "flex-start",
            }}
          >
            {element.content || "Double-click to edit"}
          </div>
        );
      case "image":
        return element.content ? (
          <img
            src={element.content}
            alt="Design element"
            className="h-full w-full object-cover"
            style={{ borderRadius: element.styles.borderRadius || 0 }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--background-tertiary)] text-foreground-muted">
            <span className="text-2xl">🖼️</span>
          </div>
        );
      case "logo":
        return element.content ? (
          <img
            src={element.content}
            alt="Logo"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--background-tertiary)] text-foreground-muted">
            <span className="text-2xl">🏢</span>
          </div>
        );
      case "shape":
        return (
          <div
            className="h-full w-full"
            style={{
              backgroundColor: element.styles.backgroundColor || "#3b82f6",
              borderRadius:
                element.content === "circle" ? "50%" : element.styles.borderRadius || 0,
              border: element.styles.borderWidth
                ? `${element.styles.borderWidth}px solid ${element.styles.borderColor || "#000"}`
                : "none",
            }}
          />
        );
      default:
        return null;
    }
  };

  if (!element.visible) return null;

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move ${isSelected ? "ring-2 ring-[var(--primary)]" : ""}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        opacity: element.styles.opacity ?? 1,
        backgroundColor:
          element.type !== "shape" ? element.styles.backgroundColor : "transparent",
        borderRadius: element.styles.borderRadius || 0,
        boxShadow: element.styles.shadow || "none",
        zIndex: element.layerOrder,
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {renderContent()}

      {/* Resize handles */}
      {isSelected && !element.locked && (
        <>
          <div className="absolute -right-1 -top-1 h-3 w-3 cursor-nwse-resize rounded-full bg-[var(--primary)]" />
          <div className="absolute -bottom-1 -right-1 h-3 w-3 cursor-nwse-resize rounded-full bg-[var(--primary)]" />
          <div className="absolute -bottom-1 -left-1 h-3 w-3 cursor-nesw-resize rounded-full bg-[var(--primary)]" />
          <div className="absolute -left-1 -top-1 h-3 w-3 cursor-nesw-resize rounded-full bg-[var(--primary)]" />
        </>
      )}
    </div>
  );
}

// Layer panel item
function LayerItem({
  element,
  isSelected,
  onSelect,
  onToggleVisibility,
  onToggleLock,
}: {
  element: DesignElement;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: element.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${
        isSelected
          ? "border-[var(--primary)] bg-[var(--primary)]/10"
          : "border-[var(--card-border)] bg-[var(--card)]"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-foreground-muted hover:text-foreground"
        aria-label="Drag to reorder"
      >
        ⋮⋮
      </button>
      <button
        onClick={onSelect}
        className="flex-1 truncate text-left text-xs text-foreground"
      >
        {element.type === "text" || element.type === "placeholder"
          ? element.content?.slice(0, 20) || element.type
          : element.type}
      </button>
      <button
        onClick={onToggleVisibility}
        className="text-foreground-muted hover:text-foreground"
        aria-label={element.visible ? "Hide element" : "Show element"}
      >
        {element.visible !== false ? "👁️" : "👁️‍🗨️"}
      </button>
      <button
        onClick={onToggleLock}
        className="text-foreground-muted hover:text-foreground"
        aria-label={element.locked ? "Unlock element" : "Lock element"}
      >
        {element.locked ? "🔒" : "🔓"}
      </button>
    </div>
  );
}

export function DesignEditor({
  initialTemplate,
  propertyData,
  onSave,
  onExport,
}: DesignEditorProps) {
  const id = useId();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<DesignElement[]>(
    initialTemplate?.elements || []
  );
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({
    width: initialTemplate?.width || 1080,
    height: initialTemplate?.height || 1080,
  });
  const [backgroundColor, setBackgroundColor] = useState(
    initialTemplate?.backgroundColor || "#1a1a2e"
  );
  const [scale, setScale] = useState(0.5);
  const [activeTab, setActiveTab] = useState<"elements" | "layers" | "templates">(
    "elements"
  );
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string>(
    TEMPLATE_CATEGORIES[0].id
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const selectedElement = useMemo(
    () => elements.find((el) => el.id === selectedElementId),
    [elements, selectedElementId]
  );

  // Generate unique ID
  const generateId = () => `el_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  // Add element to canvas
  const addElement = (
    type: DesignElement["type"],
    preset?: Partial<ElementStyles>,
    placeholderKey?: string
  ) => {
    const newElement: DesignElement = {
      id: generateId(),
      type,
      x: canvasSize.width / 2 - 100,
      y: canvasSize.height / 2 - 50,
      width: type === "text" || type === "placeholder" ? 200 : 150,
      height: type === "text" || type === "placeholder" ? 50 : 150,
      rotation: 0,
      content:
        type === "placeholder" && placeholderKey && propertyData
          ? String(propertyData[placeholderKey as keyof typeof propertyData] || `{{${placeholderKey}}}`)
          : type === "text"
          ? "New Text"
          : "",
      styles: {
        fontFamily: "Inter",
        fontSize: preset?.fontSize || 16,
        fontWeight: preset?.fontWeight || "normal",
        color: "#ffffff",
        backgroundColor: type === "shape" ? "#3b82f6" : "transparent",
        borderRadius: 0,
        opacity: 1,
        textAlign: "left",
        ...preset,
      },
      visible: true,
      locked: false,
      layerOrder: elements.length,
    };

    setElements((prev) => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  };

  // Update element
  const updateElement = (elementId: string, updates: Partial<DesignElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === elementId ? { ...el, ...updates } : el))
    );
  };

  // Update element styles
  const updateElementStyles = (elementId: string, styleUpdates: Partial<ElementStyles>) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === elementId
          ? { ...el, styles: { ...el.styles, ...styleUpdates } }
          : el
      )
    );
  };

  // Delete element
  const deleteElement = (elementId: string) => {
    setElements((prev) => prev.filter((el) => el.id !== elementId));
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
  };

  // Duplicate element
  const duplicateElement = (elementId: string) => {
    const element = elements.find((el) => el.id === elementId);
    if (!element) return;

    const newElement: DesignElement = {
      ...element,
      id: generateId(),
      x: element.x + 20,
      y: element.y + 20,
      layerOrder: elements.length,
    };

    setElements((prev) => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  };

  // Load a template
  const loadTemplate = (template: DesignTemplate) => {
    // Process elements to replace placeholders with property data
    const processedElements = template.elements.map((el) => {
      const newElement = {
        ...el,
        id: generateId(), // Generate new IDs to avoid conflicts
      };

      // Replace placeholder content with actual property data
      if (el.type === "placeholder" && propertyData) {
        let content = el.content;
        // Replace all {{key}} patterns with actual data
        content = content.replace(/\{\{(\w+)\}\}/g, (_, key) => {
          const value = propertyData[key as keyof typeof propertyData];
          return value !== undefined ? String(value) : `{{${key}}}`;
        });
        newElement.content = content;
      }

      return newElement;
    });

    setElements(processedElements);
    setCanvasSize({ width: template.width, height: template.height });
    setBackgroundColor(template.backgroundColor);
    setSelectedElementId(null);
    setActiveTab("elements"); // Switch to elements tab after loading
  };

  // Handle layer reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setElements((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);
      return reordered.map((item, index) => ({ ...item, layerOrder: index }));
    });
  };

  // Export canvas
  const handleExport = async (format: "png" | "jpg" | "pdf") => {
    onExport?.(format);
  };

  // Save design
  const handleSave = () => {
    onSave?.({
      id: initialTemplate?.id || generateId(),
      name: initialTemplate?.name || "Untitled Design",
      width: canvasSize.width,
      height: canvasSize.height,
      elements,
      backgroundColor,
      category: initialTemplate?.category || "custom",
    });
  };

  return (
    <div className="flex h-full min-h-[600px] gap-0 rounded-xl border border-[var(--card-border)] bg-[var(--background)]">
      {/* Left Sidebar - Elements/Layers */}
      <div className="w-64 shrink-0 border-r border-[var(--card-border)] bg-[var(--card)]">
        {/* Tabs */}
        <div className="flex border-b border-[var(--card-border)]">
          {(["elements", "layers", "templates"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 text-xs font-medium capitalize ${
                activeTab === tab
                  ? "border-b-2 border-[var(--primary)] text-[var(--primary)]"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="h-[calc(100%-41px)] overflow-y-auto p-3">
          {activeTab === "elements" && (
            <div className="space-y-4">
              {ELEMENT_PALETTE.map((category) => (
                <div key={category.category}>
                  <h4 className="mb-2 text-xs font-semibold text-foreground-muted">
                    {category.category}
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {category.items.map((item) => (
                      <button
                        key={item.label}
                        onClick={() =>
                          addElement(
                            item.type,
                            "preset" in item ? item.preset : undefined,
                            "placeholderKey" in item ? item.placeholderKey : undefined
                          )
                        }
                        className="flex flex-col items-center gap-1 rounded-lg border border-[var(--card-border)] p-2 text-foreground transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/10"
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-[10px] text-foreground-muted">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "layers" && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={elements.map((el) => el.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1.5">
                  {[...elements].reverse().map((element) => (
                    <LayerItem
                      key={element.id}
                      element={element}
                      isSelected={element.id === selectedElementId}
                      onSelect={() => setSelectedElementId(element.id)}
                      onToggleVisibility={() =>
                        updateElement(element.id, { visible: !element.visible })
                      }
                      onToggleLock={() =>
                        updateElement(element.id, { locked: !element.locked })
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {activeTab === "templates" && (
            <div className="space-y-4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-1">
                {TEMPLATE_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedTemplateCategory(category.id)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                      selectedTemplateCategory === category.id
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--background-tertiary)] text-foreground-muted hover:text-foreground"
                    }`}
                  >
                    {category.icon} {category.label}
                  </button>
                ))}
              </div>

              {/* Template Grid */}
              <div className="space-y-2">
                {DESIGN_TEMPLATES.filter(
                  (t) => t.category === selectedTemplateCategory
                ).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => loadTemplate(template)}
                    className="group w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] p-2 text-left transition-all hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
                  >
                    {/* Template Preview */}
                    <div
                      className="mb-2 flex items-center justify-center overflow-hidden rounded border border-[var(--card-border)]"
                      style={{
                        backgroundColor: template.backgroundColor,
                        aspectRatio: `${template.width}/${template.height}`,
                        maxHeight: "100px",
                      }}
                    >
                      <div
                        className="relative"
                        style={{
                          width: template.width,
                          height: template.height,
                          transform: `scale(${Math.min(
                            90 / template.width,
                            90 / template.height
                          )})`,
                          transformOrigin: "center center",
                        }}
                      >
                        {/* Simplified preview of elements */}
                        {template.elements.slice(0, 6).map((el) => (
                          <div
                            key={el.id}
                            className="absolute"
                            style={{
                              left: el.x,
                              top: el.y,
                              width: el.width,
                              height: el.height,
                              backgroundColor:
                                el.type === "shape"
                                  ? el.styles.backgroundColor
                                  : el.type === "image"
                                  ? "#313131"
                                  : "transparent",
                              borderRadius: el.styles.borderRadius || 0,
                              opacity: el.styles.opacity ?? 1,
                            }}
                          >
                            {(el.type === "text" || el.type === "placeholder") && (
                              <div
                                className="truncate"
                                style={{
                                  fontSize: Math.max(el.styles.fontSize || 16, 8),
                                  fontWeight: el.styles.fontWeight || "normal",
                                  color: el.styles.color || "#ffffff",
                                  textAlign: el.styles.textAlign || "left",
                                  padding: el.styles.padding || 0,
                                }}
                              >
                                {el.content?.slice(0, 20)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <span className="text-xs font-medium text-foreground group-hover:text-[var(--primary)]">
                        {template.name}
                      </span>
                      <span className="text-[10px] text-foreground-muted">
                        {template.width}×{template.height}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Template Count */}
              <p className="text-center text-[10px] text-foreground-muted">
                {DESIGN_TEMPLATES.filter(
                  (t) => t.category === selectedTemplateCategory
                ).length}{" "}
                templates in this category
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex flex-1 flex-col">
        {/* Toolbar */}
        <div className="flex items-start justify-between gap-4 flex-wrap border-b border-[var(--card-border)] bg-[var(--card)] px-4 py-2">
          <div className="flex items-center gap-2">
            <label htmlFor={`${id}-zoom`} className="text-xs text-foreground-muted">
              Zoom:
            </label>
            <select
              id={`${id}-zoom`}
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="h-8 rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
            >
              <option value={0.25}>25%</option>
              <option value={0.5}>50%</option>
              <option value={0.75}>75%</option>
              <option value={1}>100%</option>
              <option value={1.5}>150%</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              id={`${id}-canvas-size`}
              value={`${canvasSize.width}x${canvasSize.height}`}
              onChange={(e) => {
                const [w, h] = e.target.value.split("x").map(Number);
                setCanvasSize({ width: w, height: h });
              }}
              className="h-8 rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
              aria-label="Canvas size"
            >
              <option value="1080x1080">Instagram Post (1080x1080)</option>
              <option value="1080x1920">Instagram Story (1080x1920)</option>
              <option value="1200x628">Facebook Post (1200x628)</option>
              <option value="1920x1080">YouTube Thumbnail (1920x1080)</option>
              <option value="2550x3300">Flyer 8.5x11 (2550x3300)</option>
              <option value="1800x1200">Postcard (1800x1200)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="h-8 rounded-lg bg-[var(--primary)] px-4 text-xs font-medium text-white hover:bg-[var(--primary)]/90"
            >
              Save
            </button>
            <button
              onClick={() => handleExport("png")}
              className="h-8 rounded-lg border border-[var(--card-border)] px-4 text-xs font-medium text-foreground hover:bg-[var(--background-hover)]"
            >
              Export PNG
            </button>
          </div>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 overflow-auto bg-[var(--background-tertiary)] p-8">
          <div
            className="mx-auto"
            style={{
              width: canvasSize.width * scale,
              height: canvasSize.height * scale,
            }}
          >
            <div
              ref={canvasRef}
              className="relative origin-top-left shadow-xl"
              style={{
                width: canvasSize.width,
                height: canvasSize.height,
                backgroundColor,
                transform: `scale(${scale})`,
              }}
              onClick={() => setSelectedElementId(null)}
            >
              {elements.map((element) => (
                <DraggableElement
                  key={element.id}
                  element={element}
                  isSelected={element.id === selectedElementId}
                  onSelect={() => setSelectedElementId(element.id)}
                  onUpdate={(updates) => updateElement(element.id, updates)}
                  scale={scale}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Properties */}
      <div className="w-72 shrink-0 border-l border-[var(--card-border)] bg-[var(--card)]">
        <div className="border-b border-[var(--card-border)] px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Properties</h3>
        </div>

        <div className="h-[calc(100%-49px)] overflow-y-auto p-4">
          {selectedElement ? (
            <div className="space-y-4">
              {/* Position & Size */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-foreground-muted">
                  Position & Size
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label
                      htmlFor={`${id}-x`}
                      className="text-[10px] text-foreground-muted"
                    >
                      X
                    </label>
                    <input
                      id={`${id}-x`}
                      type="number"
                      value={Math.round(selectedElement.x)}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          x: parseInt(e.target.value) || 0,
                        })
                      }
                      className="h-8 w-full rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`${id}-y`}
                      className="text-[10px] text-foreground-muted"
                    >
                      Y
                    </label>
                    <input
                      id={`${id}-y`}
                      type="number"
                      value={Math.round(selectedElement.y)}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          y: parseInt(e.target.value) || 0,
                        })
                      }
                      className="h-8 w-full rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`${id}-width`}
                      className="text-[10px] text-foreground-muted"
                    >
                      Width
                    </label>
                    <input
                      id={`${id}-width`}
                      type="number"
                      value={Math.round(selectedElement.width)}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          width: parseInt(e.target.value) || 100,
                        })
                      }
                      className="h-8 w-full rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`${id}-height`}
                      className="text-[10px] text-foreground-muted"
                    >
                      Height
                    </label>
                    <input
                      id={`${id}-height`}
                      type="number"
                      value={Math.round(selectedElement.height)}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          height: parseInt(e.target.value) || 100,
                        })
                      }
                      className="h-8 w-full rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor={`${id}-rotation`}
                    className="text-[10px] text-foreground-muted"
                  >
                    Rotation
                  </label>
                  <input
                    id={`${id}-rotation`}
                    type="range"
                    min="-180"
                    max="180"
                    value={selectedElement.rotation}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        rotation: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                    aria-valuetext={`${selectedElement.rotation} degrees`}
                  />
                  <p className="text-[10px] text-foreground-muted">
                    {selectedElement.rotation}°
                  </p>
                </div>
              </div>

              {/* Text Properties */}
              {(selectedElement.type === "text" ||
                selectedElement.type === "placeholder") && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-foreground-muted">
                    Text
                  </h4>
                  <div>
                    <label
                      htmlFor={`${id}-content`}
                      className="text-[10px] text-foreground-muted"
                    >
                      Content
                    </label>
                    <textarea
                      id={`${id}-content`}
                      value={selectedElement.content}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          content: e.target.value,
                        })
                      }
                      className="h-20 w-full resize-none rounded border border-[var(--card-border)] bg-background p-2 text-xs text-foreground"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`${id}-font`}
                      className="text-[10px] text-foreground-muted"
                    >
                      Font
                    </label>
                    <select
                      id={`${id}-font`}
                      value={selectedElement.styles.fontFamily}
                      onChange={(e) =>
                        updateElementStyles(selectedElement.id, {
                          fontFamily: e.target.value,
                        })
                      }
                      className="h-8 w-full rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                    >
                      {FONTS.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor={`${id}-fontSize`}
                        className="text-[10px] text-foreground-muted"
                      >
                        Size
                      </label>
                      <input
                        id={`${id}-fontSize`}
                        type="number"
                        value={selectedElement.styles.fontSize}
                        onChange={(e) =>
                          updateElementStyles(selectedElement.id, {
                            fontSize: parseInt(e.target.value) || 16,
                          })
                        }
                        className="h-8 w-full rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`${id}-fontWeight`}
                        className="text-[10px] text-foreground-muted"
                      >
                        Weight
                      </label>
                      <select
                        id={`${id}-fontWeight`}
                        value={selectedElement.styles.fontWeight}
                        onChange={(e) =>
                          updateElementStyles(selectedElement.id, {
                            fontWeight: e.target.value,
                          })
                        }
                        className="h-8 w-full rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                      >
                        <option value="normal">Normal</option>
                        <option value="500">Medium</option>
                        <option value="600">Semibold</option>
                        <option value="bold">Bold</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-foreground-muted">
                      Alignment
                    </label>
                    <div className="mt-1 flex gap-1">
                      {(["left", "center", "right"] as const).map((align) => (
                        <button
                          key={align}
                          onClick={() =>
                            updateElementStyles(selectedElement.id, {
                              textAlign: align,
                            })
                          }
                          className={`flex-1 rounded border px-2 py-1 text-xs ${
                            selectedElement.styles.textAlign === align
                              ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                              : "border-[var(--card-border)] text-foreground-muted hover:text-foreground"
                          }`}
                          aria-label={`Align ${align}`}
                        >
                          {align === "left" ? "⬅" : align === "center" ? "↔" : "➡"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Colors */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-foreground-muted">
                  Colors
                </h4>
                {(selectedElement.type === "text" ||
                  selectedElement.type === "placeholder") && (
                  <div>
                    <label
                      htmlFor={`${id}-textColor`}
                      className="text-[10px] text-foreground-muted"
                    >
                      Text Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        id={`${id}-textColor`}
                        type="text"
                        value={selectedElement.styles.color}
                        onChange={(e) =>
                          updateElementStyles(selectedElement.id, {
                            color: e.target.value,
                          })
                        }
                        className="h-8 flex-1 rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                      />
                      <input
                        type="color"
                        value={selectedElement.styles.color || "#ffffff"}
                        onChange={(e) =>
                          updateElementStyles(selectedElement.id, {
                            color: e.target.value,
                          })
                        }
                        className="h-8 w-8 cursor-pointer rounded border border-[var(--card-border)]"
                        aria-label="Select text color"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label
                    htmlFor={`${id}-bgColor`}
                    className="text-[10px] text-foreground-muted"
                  >
                    Background
                  </label>
                  <div className="flex gap-2">
                    <input
                      id={`${id}-bgColor`}
                      type="text"
                      value={selectedElement.styles.backgroundColor || "transparent"}
                      onChange={(e) =>
                        updateElementStyles(selectedElement.id, {
                          backgroundColor: e.target.value,
                        })
                      }
                      className="h-8 flex-1 rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                    />
                    <input
                      type="color"
                      value={selectedElement.styles.backgroundColor || "#000000"}
                      onChange={(e) =>
                        updateElementStyles(selectedElement.id, {
                          backgroundColor: e.target.value,
                        })
                      }
                      className="h-8 w-8 cursor-pointer rounded border border-[var(--card-border)]"
                      aria-label="Select background color"
                    />
                  </div>
                </div>
              </div>

              {/* Effects */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-foreground-muted">
                  Effects
                </h4>
                <div>
                  <label
                    htmlFor={`${id}-opacity`}
                    className="text-[10px] text-foreground-muted"
                  >
                    Opacity
                  </label>
                  <input
                    id={`${id}-opacity`}
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedElement.styles.opacity ?? 1}
                    onChange={(e) =>
                      updateElementStyles(selectedElement.id, {
                        opacity: parseFloat(e.target.value),
                      })
                    }
                    className="w-full"
                    aria-valuetext={`${Math.round((selectedElement.styles.opacity ?? 1) * 100)}%`}
                  />
                  <p className="text-[10px] text-foreground-muted">
                    {Math.round((selectedElement.styles.opacity ?? 1) * 100)}%
                  </p>
                </div>
                <div>
                  <label
                    htmlFor={`${id}-borderRadius`}
                    className="text-[10px] text-foreground-muted"
                  >
                    Border Radius
                  </label>
                  <input
                    id={`${id}-borderRadius`}
                    type="number"
                    min="0"
                    value={selectedElement.styles.borderRadius || 0}
                    onChange={(e) =>
                      updateElementStyles(selectedElement.id, {
                        borderRadius: parseInt(e.target.value) || 0,
                      })
                    }
                    className="h-8 w-full rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 border-t border-[var(--card-border)] pt-4">
                <button
                  onClick={() => duplicateElement(selectedElement.id)}
                  className="w-full rounded-lg border border-[var(--card-border)] px-4 py-2 text-xs font-medium text-foreground hover:bg-[var(--background-hover)]"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => deleteElement(selectedElement.id)}
                  className="w-full rounded-lg border border-[var(--error)] px-4 py-2 text-xs font-medium text-[var(--error)] hover:bg-[var(--error)]/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Canvas Settings */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-foreground-muted">
                  Canvas Settings
                </h4>
                <div>
                  <label
                    htmlFor={`${id}-canvasBg`}
                    className="text-[10px] text-foreground-muted"
                  >
                    Background Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      id={`${id}-canvasBg`}
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="h-8 flex-1 rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                    />
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border border-[var(--card-border)]"
                      aria-label="Select canvas background color"
                    />
                  </div>
                </div>
              </div>

              <p className="text-center text-xs text-foreground-muted">
                Select an element to edit its properties
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export type { DesignElement, DesignTemplate, ElementStyles, DesignEditorProps };
