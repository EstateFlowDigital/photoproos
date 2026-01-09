"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Copy,
  Check,
  MousePointer2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripHorizontal,
  Keyboard,
} from "lucide-react";
import { getDevSettings } from "@/lib/utils/dev-settings";

interface ElementInfo {
  element: HTMLElement;
  selector: string;
  path: string;
  classes: string[];
  dataElement: string | null;
  suggestedComponent: string | null;
}

// Style categories for grouping
const STYLE_GROUPS = {
  layout: {
    label: "Layout",
    props: ["display", "position", "top", "right", "bottom", "left", "z-index"],
  },
  sizing: {
    label: "Sizing",
    props: ["width", "height", "min-width", "max-width", "min-height", "max-height"],
  },
  spacing: {
    label: "Spacing",
    props: ["padding", "margin", "gap"],
  },
  flexbox: {
    label: "Flexbox",
    props: ["flex-direction", "justify-content", "align-items", "flex-wrap", "flex"],
  },
  typography: {
    label: "Typography",
    props: ["font-size", "font-weight", "line-height", "letter-spacing", "text-align"],
  },
  colors: {
    label: "Colors",
    props: ["color", "background", "background-color"],
  },
  borders: {
    label: "Borders",
    props: ["border", "border-radius", "border-color", "border-width"],
  },
  effects: {
    label: "Effects",
    props: ["opacity", "box-shadow", "transform", "transition"],
  },
};

// All editable props (flattened)
const ALL_STYLE_PROPS = Object.values(STYLE_GROUPS).flatMap((g) => g.props);

function generateSelector(el: HTMLElement): string {
  const dataElement = el.getAttribute("data-element");
  if (dataElement) return `[data-element="${dataElement}"]`;
  if (el.id) return `#${el.id}`;

  const classes = Array.from(el.classList)
    .filter((c) => !c.startsWith("_") && c.length < 40)
    .slice(0, 2);

  if (classes.length > 0) {
    return `${el.tagName.toLowerCase()}.${classes.join(".")}`;
  }

  return el.tagName.toLowerCase();
}

function getParentPath(el: HTMLElement): string {
  const parts: string[] = [];
  let current: HTMLElement | null = el;
  let depth = 0;

  while (current && current !== document.body && depth < 4) {
    const dataEl = current.getAttribute("data-element");
    if (dataEl) {
      parts.unshift(dataEl);
    } else if (current.id) {
      parts.unshift(`#${current.id}`);
    } else {
      const cls = Array.from(current.classList).slice(0, 1).join(".");
      parts.unshift(cls ? `.${cls}` : current.tagName.toLowerCase());
    }
    current = current.parentElement;
    depth++;
  }

  return parts.join(" > ");
}

function guessComponentName(classes: string[]): string | null {
  const patterns = [
    /^([A-Z][a-zA-Z]+)(?:_|-)/,
    /^(?:component|ui|layout)-([a-zA-Z-]+)/,
    /([a-zA-Z]+)-(?:card|button|input|section|header|footer|container|wrapper|list|item)/i,
  ];

  for (const cls of classes) {
    for (const pattern of patterns) {
      const match = cls.match(pattern);
      if (match) {
        return match[1]
          .split(/[-_]/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join("");
      }
    }
  }

  const semantic = classes.find(
    (c) =>
      c.includes("card") ||
      c.includes("button") ||
      c.includes("header") ||
      c.includes("sidebar") ||
      c.includes("modal") ||
      c.includes("form")
  );
  if (semantic) {
    return semantic
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("");
  }

  return null;
}

export function ElementInspector() {
  const [isActive, setIsActive] = useState(false);
  const [selected, setSelected] = useState<ElementInfo | null>(null);
  const [hovered, setHovered] = useState<HTMLElement | null>(null);
  const [styles, setStyles] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [customProps, setCustomProps] = useState<Array<{ prop: string; value: string }>>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["spacing", "colors"]));
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const originalStylesRef = useRef<Map<string, string>>(new Map());

  // Load visibility setting
  useEffect(() => {
    const loadSettings = () => {
      const settings = getDevSettings();
      setHidden(settings.hideElementInspector);
    };
    loadSettings();

    const handleChange = () => loadSettings();
    window.addEventListener("ppos_dev_settings_changed", handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener("ppos_dev_settings_changed", handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  // Global keyboard shortcut: Ctrl+Shift+I to toggle
  useEffect(() => {
    if (hidden) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+I or Cmd+Shift+I to toggle inspector
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "I") {
        e.preventDefault();
        if (isActive) {
          closePanel();
        } else {
          setIsActive(true);
        }
      }
      // Ctrl+Shift+? to show shortcuts
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "?") {
        e.preventDefault();
        setShowShortcuts((p) => !p);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [hidden, isActive]);

  // Capture element styles
  const captureStyles = useCallback((el: HTMLElement) => {
    const computed = window.getComputedStyle(el);
    const captured: Record<string, string> = {};
    originalStylesRef.current.clear();

    for (const prop of ALL_STYLE_PROPS) {
      const value = computed.getPropertyValue(prop);
      if (value) {
        captured[prop] = value;
        originalStylesRef.current.set(prop, value);
      }
    }
    return captured;
  }, []);

  // Handle element click
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!isActive) return;

      const target = e.target as HTMLElement;
      if (target.closest("[data-inspector]")) return;

      e.preventDefault();
      e.stopPropagation();

      const classes = Array.from(target.classList);

      const info: ElementInfo = {
        element: target,
        selector: generateSelector(target),
        path: getParentPath(target),
        classes,
        dataElement: target.getAttribute("data-element"),
        suggestedComponent: guessComponentName(classes),
      };

      setSelected(info);
      setStyles(captureStyles(target));
      setHovered(null);
      setNotes("");
      setCustomProps([]);
    },
    [isActive, captureStyles]
  );

  // Handle hover
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isActive || selected) return;
      const target = e.target as HTMLElement;
      if (target.closest("[data-inspector]")) {
        setHovered(null);
        return;
      }
      setHovered(target);
    },
    [isActive, selected]
  );

  // Handle escape and other shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selected) {
          originalStylesRef.current.forEach((_, prop) => {
            selected.element.style.setProperty(prop, "");
          });
          customProps.forEach(({ prop }) => {
            selected.element.style.setProperty(prop, "");
          });
          setSelected(null);
          setStyles({});
          setNotes("");
          setCustomProps([]);
        } else if (isActive) {
          setIsActive(false);
          setHovered(null);
        }
      }
      // Arrow up/down to navigate parent/child when selected
      if (selected && e.key === "ArrowUp" && e.altKey) {
        e.preventDefault();
        const parent = selected.element.parentElement;
        if (parent && parent !== document.body) {
          const classes = Array.from(parent.classList);
          setSelected({
            element: parent,
            selector: generateSelector(parent),
            path: getParentPath(parent),
            classes,
            dataElement: parent.getAttribute("data-element"),
            suggestedComponent: guessComponentName(classes),
          });
          setStyles(captureStyles(parent));
        }
      }
      if (selected && e.key === "ArrowDown" && e.altKey) {
        e.preventDefault();
        const firstChild = selected.element.firstElementChild as HTMLElement | null;
        if (firstChild) {
          const classes = Array.from(firstChild.classList);
          setSelected({
            element: firstChild,
            selector: generateSelector(firstChild),
            path: getParentPath(firstChild),
            classes,
            dataElement: firstChild.getAttribute("data-element"),
            suggestedComponent: guessComponentName(classes),
          });
          setStyles(captureStyles(firstChild));
        }
      }
    },
    [isActive, selected, customProps, captureStyles]
  );

  // Event listeners
  useEffect(() => {
    if (isActive) {
      document.addEventListener("click", handleClick, true);
      document.addEventListener("mousemove", handleMouseMove, true);
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.cursor = "crosshair";
    }
    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("mousemove", handleMouseMove, true);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.cursor = "";
    };
  }, [isActive, handleClick, handleMouseMove, handleKeyDown]);

  // Dragging logic
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: panelPosition.x,
      posY: panelPosition.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      const newX = Math.max(0, Math.min(window.innerWidth - 400, dragStartRef.current.posX + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - 200, dragStartRef.current.posY + deltaY));
      setPanelPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Update style live
  const updateStyle = (prop: string, value: string) => {
    if (!selected) return;
    setStyles((prev) => ({ ...prev, [prop]: value }));
    selected.element.style.setProperty(prop, value);
  };

  // Toggle group expansion
  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  // Update custom property
  const updateCustomProp = (index: number, field: "prop" | "value", val: string) => {
    if (!selected) return;
    setCustomProps((prev) => {
      const updated = [...prev];
      const old = updated[index];
      if (field === "prop" && old.prop) {
        selected.element.style.removeProperty(old.prop);
      }
      updated[index] = { ...old, [field]: val };
      if (updated[index].prop && updated[index].value) {
        selected.element.style.setProperty(updated[index].prop, updated[index].value);
      }
      return updated;
    });
  };

  const addCustomProp = () => {
    setCustomProps((prev) => [...prev, { prop: "", value: "" }]);
  };

  const removeCustomProp = (index: number) => {
    if (!selected) return;
    const prop = customProps[index].prop;
    if (prop) {
      selected.element.style.removeProperty(prop);
    }
    setCustomProps((prev) => prev.filter((_, i) => i !== index));
  };

  // Generate copy text for Claude
  const generateCopyText = () => {
    if (!selected) return "";

    const changedStyles = Object.entries(styles)
      .filter(([prop, value]) => originalStylesRef.current.get(prop) !== value)
      .map(([prop, value]) => `  ${prop}: ${value};`)
      .join("\n");

    const customStylesText = customProps
      .filter((p) => p.prop && p.value)
      .map((p) => `  ${p.prop}: ${p.value};`)
      .join("\n");

    const allChanges = [changedStyles, customStylesText].filter(Boolean).join("\n");

    return `## Style Change Request

**Page:** ${window.location.pathname}
**Element:** \`${selected.selector}\`
**Path:** ${selected.path}
${selected.dataElement ? `**data-element:** \`${selected.dataElement}\`` : ""}
${selected.suggestedComponent ? `**Likely Component:** ${selected.suggestedComponent}` : ""}
**Classes:** \`${selected.classes.join(" ") || "(none)"}\`

${notes ? `### Notes\n${notes}\n` : ""}
### Requested Changes
\`\`\`css
${selected.selector} {
${allChanges || "  /* No changes specified */"}
}
\`\`\`

### Current Computed Styles
\`\`\`css
${selected.selector} {
${Object.entries(styles)
  .map(([prop, value]) => `  ${prop}: ${value};`)
  .join("\n")}
}
\`\`\``;
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generateCopyText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closePanel = () => {
    if (selected) {
      originalStylesRef.current.forEach((_, prop) => {
        selected.element.style.setProperty(prop, "");
      });
      customProps.forEach(({ prop }) => {
        if (prop) selected.element.style.removeProperty(prop);
      });
    }
    setSelected(null);
    setStyles({});
    setIsActive(false);
    setHovered(null);
    setNotes("");
    setCustomProps([]);
  };

  if (hidden) return null;

  const hoverRect = hovered?.getBoundingClientRect();
  const changedCount =
    Object.entries(styles).filter(([prop, value]) => originalStylesRef.current.get(prop) !== value).length +
    customProps.filter((p) => p.prop && p.value).length;

  return (
    <>
      {/* Toggle Button */}
      <button
        data-inspector="toggle"
        onClick={() => {
          if (isActive) {
            closePanel();
          } else {
            setIsActive(true);
          }
        }}
        className={`fixed bottom-4 left-4 z-[10000] flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium shadow-lg transition-all ${
          isActive
            ? "bg-[var(--primary)] text-white"
            : "bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--background-elevated)]"
        }`}
        title="Element Inspector (Ctrl+Shift+I)"
      >
        <MousePointer2 className="w-4 h-4" />
        <span className="hidden sm:inline">{isActive ? "Inspecting..." : "Inspect"}</span>
      </button>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div
          data-inspector="shortcuts"
          className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/50"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 w-80 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[var(--foreground)]">Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="text-[var(--foreground-muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Toggle Inspector</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--background-tertiary)] rounded text-xs">Ctrl+Shift+I</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Close/Cancel</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--background-tertiary)] rounded text-xs">Esc</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Select Parent</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--background-tertiary)] rounded text-xs">Alt+↑</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Select Child</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--background-tertiary)] rounded text-xs">Alt+↓</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Show Shortcuts</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--background-tertiary)] rounded text-xs">Ctrl+Shift+?</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hover Highlight */}
      {isActive && hovered && hoverRect && !selected && (
        <div
          data-inspector="highlight"
          className="fixed pointer-events-none z-[9998] border-2 border-[var(--primary)] bg-[var(--primary)]/10"
          style={{
            top: hoverRect.top,
            left: hoverRect.left,
            width: hoverRect.width,
            height: hoverRect.height,
          }}
        >
          <div className="absolute -top-6 left-0 bg-[var(--primary)] text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {hovered.getAttribute("data-element") ||
              (hovered.className && typeof hovered.className === "string"
                ? `.${hovered.className.split(" ")[0]}`
                : hovered.tagName.toLowerCase())}
          </div>
        </div>
      )}

      {/* Active Instructions */}
      {isActive && !selected && (
        <div
          data-inspector="hint"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] bg-[var(--primary)] text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-3"
        >
          <span>Click element to inspect</span>
          <span className="opacity-60">|</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-white/20 rounded text-xs">Esc</kbd> exit
          </span>
          <button
            onClick={() => setShowShortcuts(true)}
            className="ml-2 opacity-60 hover:opacity-100"
            title="Show shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Style Editor Panel - Draggable */}
      {selected && (
        <div
          data-inspector="panel"
          className="fixed z-[10001] w-96 max-h-[85vh] overflow-hidden bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl flex flex-col"
          style={{ top: panelPosition.y, right: panelPosition.x }}
        >
          {/* Draggable Header */}
          <div
            className="flex items-center justify-between p-3 bg-[var(--card)] border-b border-[var(--border)] cursor-move select-none"
            onMouseDown={handleDragStart}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <GripHorizontal className="w-4 h-4 text-[var(--foreground-muted)] flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-[var(--foreground)] truncate text-sm">
                  {selected.dataElement || selected.suggestedComponent || selected.selector}
                </h3>
                <p className="text-xs text-[var(--foreground-muted)] truncate">{selected.path}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
              {changedCount > 0 && (
                <span className="text-xs bg-[var(--primary)]/20 text-[var(--primary)] px-1.5 py-0.5 rounded">
                  {changedCount}
                </span>
              )}
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg bg-[var(--primary)] text-white hover:opacity-90"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button onClick={closePanel} className="p-1.5 rounded-lg hover:bg-[var(--background-elevated)]">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Parent/Child Navigation */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] bg-[var(--background-tertiary)]">
            <button
              onClick={() => {
                const parent = selected.element.parentElement;
                if (parent && parent !== document.body) {
                  const classes = Array.from(parent.classList);
                  setSelected({
                    element: parent,
                    selector: generateSelector(parent),
                    path: getParentPath(parent),
                    classes,
                    dataElement: parent.getAttribute("data-element"),
                    suggestedComponent: guessComponentName(classes),
                  });
                  setStyles(captureStyles(parent));
                }
              }}
              disabled={!selected.element.parentElement || selected.element.parentElement === document.body}
              className="flex items-center gap-1 text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] disabled:opacity-30"
            >
              <ChevronUp className="w-3 h-3" /> Parent
            </button>
            <span className="text-xs text-[var(--foreground-muted)]">
              {selected.element.tagName.toLowerCase()}
            </span>
            <button
              onClick={() => {
                const firstChild = selected.element.firstElementChild as HTMLElement | null;
                if (firstChild) {
                  const classes = Array.from(firstChild.classList);
                  setSelected({
                    element: firstChild,
                    selector: generateSelector(firstChild),
                    path: getParentPath(firstChild),
                    classes,
                    dataElement: firstChild.getAttribute("data-element"),
                    suggestedComponent: guessComponentName(classes),
                  });
                  setStyles(captureStyles(firstChild));
                }
              }}
              disabled={!selected.element.firstElementChild}
              className="flex items-center gap-1 text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] disabled:opacity-30"
            >
              Child <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Notes Section */}
          <div className="p-3 border-b border-[var(--border)]">
            <label className="text-xs font-medium text-[var(--foreground-muted)] block mb-1.5">
              Notes (what do you want to change?)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Make padding larger, change to blue..."
              className="w-full h-16 text-sm px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
            />
          </div>

          {/* Grouped Style Editor */}
          <div className="flex-1 overflow-y-auto">
            {Object.entries(STYLE_GROUPS).map(([groupKey, group]) => {
              const groupStyles = group.props.filter((p) => styles[p] !== undefined);
              if (groupStyles.length === 0) return null;

              const isExpanded = expandedGroups.has(groupKey);
              const hasChanges = groupStyles.some(
                (p) => originalStylesRef.current.get(p) !== styles[p]
              );

              return (
                <div key={groupKey} className="border-b border-[var(--border)]">
                  <button
                    onClick={() => toggleGroup(groupKey)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--background-elevated)] transition-colors"
                  >
                    <span className={`text-xs font-medium ${hasChanges ? "text-[var(--primary)]" : "text-[var(--foreground-muted)]"}`}>
                      {group.label}
                      {hasChanges && " •"}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3 text-[var(--foreground-muted)]" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-[var(--foreground-muted)]" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-2 space-y-1.5">
                      {groupStyles.map((prop) => {
                        const value = styles[prop];
                        const isChanged = originalStylesRef.current.get(prop) !== value;
                        return (
                          <div key={prop} className="flex items-center gap-2">
                            <label
                              className={`text-xs w-24 truncate flex-shrink-0 ${isChanged ? "text-[var(--primary)] font-medium" : "text-[var(--foreground-muted)]"}`}
                              title={prop}
                            >
                              {prop}
                            </label>
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => updateStyle(prop, e.target.value)}
                              className={`flex-1 text-xs px-2 py-1 rounded border bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] ${
                                isChanged ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)]"
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Custom Properties */}
            <div className="p-3">
              <p className="text-xs font-medium text-[var(--foreground-muted)] mb-2">Custom Properties</p>
              {customProps.map((cp, i) => (
                <div key={`custom-${i}`} className="flex items-center gap-2 mb-1.5">
                  <input
                    type="text"
                    value={cp.prop}
                    onChange={(e) => updateCustomProp(i, "prop", e.target.value)}
                    placeholder="property"
                    className="w-24 text-xs px-2 py-1 rounded border border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  <input
                    type="text"
                    value={cp.value}
                    onChange={(e) => updateCustomProp(i, "value", e.target.value)}
                    placeholder="value"
                    className="flex-1 text-xs px-2 py-1 rounded border border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  <button
                    onClick={() => removeCustomProp(i)}
                    className="p-1 rounded hover:bg-[var(--background-elevated)] text-[var(--foreground-muted)]"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={addCustomProp}
                className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
              >
                <Plus className="w-3 h-3" /> Add property
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-[var(--border)] bg-[var(--background-tertiary)] text-center">
            <p className="text-xs text-[var(--foreground-muted)]">
              <kbd className="px-1 py-0.5 bg-[var(--background)] rounded text-[10px]">Esc</kbd> close •{" "}
              <kbd className="px-1 py-0.5 bg-[var(--background)] rounded text-[10px]">Alt+↑↓</kbd> navigate
            </p>
          </div>
        </div>
      )}
    </>
  );
}
