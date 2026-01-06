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
            <div className="space-y-2">
              <p className="text-xs text-foreground-muted">
                Pre-designed templates coming soon...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex flex-1 flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-[var(--card-border)] bg-[var(--card)] px-4 py-2">
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
