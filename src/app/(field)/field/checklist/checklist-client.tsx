"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Plus,
  Camera,
  Home,
  Building2,
  User,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { FieldBooking } from "@/lib/actions/field-operations";

interface ChecklistClientProps {
  todaysBookings: FieldBooking[];
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
  expanded: boolean;
}

type ChecklistTemplate = "real_estate" | "portrait" | "commercial" | "event" | "custom";

const CHECKLIST_TEMPLATES: Record<ChecklistTemplate, { name: string; icon: typeof Camera; sections: Omit<ChecklistSection, "expanded">[] }> = {
  real_estate: {
    name: "Real Estate",
    icon: Home,
    sections: [
      {
        id: "equipment",
        title: "Equipment",
        items: [
          { id: "1", label: "Camera body charged", checked: false },
          { id: "2", label: "Wide-angle lens (16-35mm)", checked: false },
          { id: "3", label: "Tripod", checked: false },
          { id: "4", label: "Drone + batteries", checked: false },
          { id: "5", label: "Flash/speedlights", checked: false },
          { id: "6", label: "Memory cards formatted", checked: false },
          { id: "7", label: "Light stands", checked: false },
        ],
      },
      {
        id: "exterior",
        title: "Exterior Shots",
        items: [
          { id: "8", label: "Front of house (hero shot)", checked: false },
          { id: "9", label: "Backyard/patio", checked: false },
          { id: "10", label: "Side angles", checked: false },
          { id: "11", label: "Aerial/drone shots", checked: false },
          { id: "12", label: "Street view", checked: false },
        ],
      },
      {
        id: "interior",
        title: "Interior Shots",
        items: [
          { id: "13", label: "Living room", checked: false },
          { id: "14", label: "Kitchen", checked: false },
          { id: "15", label: "Master bedroom", checked: false },
          { id: "16", label: "Master bathroom", checked: false },
          { id: "17", label: "Additional bedrooms", checked: false },
          { id: "18", label: "Dining area", checked: false },
          { id: "19", label: "Office/bonus rooms", checked: false },
          { id: "20", label: "Garage", checked: false },
        ],
      },
      {
        id: "details",
        title: "Detail Shots",
        items: [
          { id: "21", label: "Kitchen appliances", checked: false },
          { id: "22", label: "Countertops/finishes", checked: false },
          { id: "23", label: "Special features", checked: false },
          { id: "24", label: "View from windows", checked: false },
        ],
      },
      {
        id: "postshoot",
        title: "Post-Shoot",
        items: [
          { id: "25", label: "Back up memory cards", checked: false },
          { id: "26", label: "Check all photos captured", checked: false },
          { id: "27", label: "Lock up property", checked: false },
          { id: "28", label: "Return lockbox key", checked: false },
        ],
      },
    ],
  },
  portrait: {
    name: "Portrait",
    icon: User,
    sections: [
      {
        id: "equipment",
        title: "Equipment",
        items: [
          { id: "1", label: "Camera body charged", checked: false },
          { id: "2", label: "Portrait lens (85mm/50mm)", checked: false },
          { id: "3", label: "Backup camera body", checked: false },
          { id: "4", label: "Reflector/diffuser", checked: false },
          { id: "5", label: "Portable lighting", checked: false },
          { id: "6", label: "Backdrop (if studio)", checked: false },
          { id: "7", label: "Memory cards formatted", checked: false },
        ],
      },
      {
        id: "session",
        title: "Session Checklist",
        items: [
          { id: "8", label: "Review client inspiration", checked: false },
          { id: "9", label: "Headshots - standard", checked: false },
          { id: "10", label: "Headshots - creative", checked: false },
          { id: "11", label: "Three-quarter shots", checked: false },
          { id: "12", label: "Full body shots", checked: false },
          { id: "13", label: "Outfit changes covered", checked: false },
          { id: "14", label: "Environmental portraits", checked: false },
        ],
      },
      {
        id: "postshoot",
        title: "Post-Shoot",
        items: [
          { id: "15", label: "Show client preview", checked: false },
          { id: "16", label: "Confirm favorites", checked: false },
          { id: "17", label: "Back up photos", checked: false },
          { id: "18", label: "Schedule delivery date", checked: false },
        ],
      },
    ],
  },
  commercial: {
    name: "Commercial",
    icon: Building2,
    sections: [
      {
        id: "equipment",
        title: "Equipment",
        items: [
          { id: "1", label: "Primary camera body", checked: false },
          { id: "2", label: "Backup camera", checked: false },
          { id: "3", label: "Tilt-shift lens", checked: false },
          { id: "4", label: "Wide-angle lens", checked: false },
          { id: "5", label: "Studio lighting kit", checked: false },
          { id: "6", label: "Light meter", checked: false },
          { id: "7", label: "Tethering cable/laptop", checked: false },
        ],
      },
      {
        id: "session",
        title: "Shot List",
        items: [
          { id: "8", label: "Hero product shots", checked: false },
          { id: "9", label: "Detail shots", checked: false },
          { id: "10", label: "Lifestyle/in-use shots", checked: false },
          { id: "11", label: "White background shots", checked: false },
          { id: "12", label: "Scale/comparison shots", checked: false },
          { id: "13", label: "Packaging shots", checked: false },
        ],
      },
      {
        id: "postshoot",
        title: "Post-Shoot",
        items: [
          { id: "14", label: "Review with client", checked: false },
          { id: "15", label: "Back up all files", checked: false },
          { id: "16", label: "Return product/props", checked: false },
        ],
      },
    ],
  },
  event: {
    name: "Event",
    icon: Briefcase,
    sections: [
      {
        id: "equipment",
        title: "Equipment",
        items: [
          { id: "1", label: "Two camera bodies", checked: false },
          { id: "2", label: "24-70mm lens", checked: false },
          { id: "3", label: "70-200mm lens", checked: false },
          { id: "4", label: "Flash units (2+)", checked: false },
          { id: "5", label: "Extra batteries", checked: false },
          { id: "6", label: "Multiple memory cards", checked: false },
          { id: "7", label: "Monopod/tripod", checked: false },
        ],
      },
      {
        id: "coverage",
        title: "Event Coverage",
        items: [
          { id: "8", label: "Venue establishing shots", checked: false },
          { id: "9", label: "Guest arrivals", checked: false },
          { id: "10", label: "Key moments/ceremony", checked: false },
          { id: "11", label: "Group photos", checked: false },
          { id: "12", label: "Candid moments", checked: false },
          { id: "13", label: "Speaker/presentation", checked: false },
          { id: "14", label: "Food/decor details", checked: false },
          { id: "15", label: "Event wrap-up", checked: false },
        ],
      },
      {
        id: "postshoot",
        title: "Post-Event",
        items: [
          { id: "16", label: "Back up all cards", checked: false },
          { id: "17", label: "Quick client preview", checked: false },
          { id: "18", label: "Confirm delivery timeline", checked: false },
        ],
      },
    ],
  },
  custom: {
    name: "Custom",
    icon: Camera,
    sections: [
      {
        id: "items",
        title: "My Checklist",
        items: [],
      },
    ],
  },
};

export function ChecklistClient({ todaysBookings }: ChecklistClientProps) {
  const { showToast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate>("real_estate");
  const [sections, setSections] = useState<ChecklistSection[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    todaysBookings[0]?.id || null
  );

  // Load checklist from localStorage on mount
  useEffect(() => {
    const storageKey = selectedBookingId
      ? `checklist-${selectedBookingId}`
      : `checklist-${selectedTemplate}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        setSections(JSON.parse(saved));
      } catch {
        initializeTemplate();
      }
    } else {
      initializeTemplate();
    }
  }, [selectedTemplate, selectedBookingId]);

  const initializeTemplate = () => {
    const template = CHECKLIST_TEMPLATES[selectedTemplate];
    setSections(
      template.sections.map((section) => ({
        ...section,
        expanded: true,
      }))
    );
  };

  // Save checklist to localStorage whenever it changes
  useEffect(() => {
    if (sections.length > 0) {
      const storageKey = selectedBookingId
        ? `checklist-${selectedBookingId}`
        : `checklist-${selectedTemplate}`;
      localStorage.setItem(storageKey, JSON.stringify(sections));
    }
  }, [sections, selectedTemplate, selectedBookingId]);

  const toggleItem = (sectionId: string, itemId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            }
          : section
      )
    );
  };

  const toggleSection = (sectionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, expanded: !section.expanded } : section
      )
    );
  };

  const addCustomItem = () => {
    if (!newItemText.trim()) return;

    setSections((prev) => {
      const lastSection = prev[prev.length - 1];
      if (!lastSection) return prev;

      return prev.map((section) =>
        section.id === lastSection.id
          ? {
              ...section,
              items: [
                ...section.items,
                {
                  id: `custom-${Date.now()}`,
                  label: newItemText.trim(),
                  checked: false,
                },
              ],
            }
          : section
      );
    });

    setNewItemText("");
    showToast("Item added", "success");
  };

  const resetChecklist = () => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        items: section.items.map((item) => ({ ...item, checked: false })),
      }))
    );
    showToast("Checklist reset", "success");
  };

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
  const checkedItems = sections.reduce(
    (sum, s) => sum + s.items.filter((i) => i.checked).length,
    0
  );
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--card-border)] bg-background/95 backdrop-blur px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/field">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-foreground">Checklist</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={resetChecklist}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4">
        {/* Progress */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progress</span>
            <span className="text-sm text-foreground-muted">
              {checkedItems} / {totalItems}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--background-tertiary)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--success)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress === 100 && (
            <p className="text-xs text-[var(--success)] mt-2 font-medium">
              All items complete!
            </p>
          )}
        </div>

        {/* Template Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(Object.keys(CHECKLIST_TEMPLATES) as ChecklistTemplate[]).map((key) => {
            const template = CHECKLIST_TEMPLATES[key];
            const Icon = template.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedTemplate(key)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedTemplate === key
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--card)] text-foreground-muted border border-[var(--card-border)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {template.name}
              </button>
            );
          })}
        </div>

        {/* Booking Selector */}
        {todaysBookings.length > 0 && (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3">
            <label className="text-xs font-medium text-foreground-muted mb-2 block">
              Linked Booking
            </label>
            <select
              value={selectedBookingId || ""}
              onChange={(e) => setSelectedBookingId(e.target.value || null)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-3 py-2 text-sm text-foreground"
            >
              <option value="">No booking</option>
              {todaysBookings.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  {booking.clientName} - {booking.address}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Checklist Sections */}
        <div className="space-y-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-2">
                  {section.expanded ? (
                    <ChevronDown className="h-4 w-4 text-foreground-muted" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-foreground-muted" />
                  )}
                  <span className="text-sm font-medium text-foreground">{section.title}</span>
                </div>
                <span className="text-xs text-foreground-muted">
                  {section.items.filter((i) => i.checked).length}/{section.items.length}
                </span>
              </button>

              {section.expanded && (
                <div className="px-4 pb-4 space-y-2">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(section.id, item.id)}
                      className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                        item.checked
                          ? "bg-[var(--success)]/10"
                          : "bg-[var(--background-tertiary)] hover:bg-[var(--card-border)]"
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                          item.checked
                            ? "border-[var(--success)] bg-[var(--success)]"
                            : "border-[var(--card-border)]"
                        }`}
                      >
                        {item.checked && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span
                        className={`text-sm ${
                          item.checked
                            ? "text-foreground-muted line-through"
                            : "text-foreground"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Custom Item */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <label className="text-sm font-medium text-foreground mb-2 block">Add Item</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomItem()}
              placeholder="Enter checklist item..."
              className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted"
            />
            <Button onClick={addCustomItem} size="sm" disabled={!newItemText.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
