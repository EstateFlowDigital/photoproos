"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Copy, Check, MousePointer2, Plus, Trash2 } from "lucide-react";
import { getDevSettings } from "@/lib/utils/dev-settings";

interface ElementInfo {
  element: HTMLElement;
  selector: string;
  path: string;
  classes: string[];
  dataElement: string | null;
  suggestedComponent: string | null;
  screenshot: string | null;
}

// Key CSS properties for editing
const EDITABLE_STYLES = [
  "padding",
  "margin",
  "width",
  "height",
  "min-width",
  "max-width",
  "min-height",
  "max-height",
  "gap",
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
  "color",
  "background",
  "background-color",
  "border",
  "border-radius",
  "box-shadow",
  "opacity",
  "display",
  "flex-direction",
  "justify-content",
  "align-items",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "z-index",
];

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

// Try to guess component name from class names (common patterns)
function guessComponentName(classes: string[]): string | null {
  const patterns = [
    /^([A-Z][a-zA-Z]+)(?:_|-)/, // PascalCase prefix
    /^(?:component|ui|layout)-([a-zA-Z-]+)/, // component-* patterns
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

  // Look for semantic class names
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

// Capture element as image
async function captureElementScreenshot(el: HTMLElement): Promise<string | null> {
  try {
    // Use html2canvas if available, otherwise create a simple representation
    const rect = el.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    const scale = 2; // Higher quality
    canvas.width = Math.min(rect.width * scale, 800);
    canvas.height = Math.min(rect.height * scale, 600);

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Simple colored rectangle representation with element info
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    ctx.fillStyle = "#ffffff";
    ctx.font = "14px system-ui";
    ctx.fillText(`${Math.round(rect.width)} × ${Math.round(rect.height)}px`, 10, 24);

    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : "";
    const cls = el.className && typeof el.className === "string" ? `.${el.className.split(" ")[0]}` : "";
    ctx.fillStyle = "#9ca3af";
    ctx.font = "12px monospace";
    ctx.fillText(`<${tag}${id}${cls}>`, 10, 44);

    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
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

  // Capture element styles
  const captureStyles = useCallback((el: HTMLElement) => {
    const computed = window.getComputedStyle(el);
    const captured: Record<string, string> = {};
    originalStylesRef.current.clear();

    for (const prop of EDITABLE_STYLES) {
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
    async (e: MouseEvent) => {
      if (!isActive) return;

      const target = e.target as HTMLElement;
      if (target.closest("[data-inspector]")) return;

      e.preventDefault();
      e.stopPropagation();

      const classes = Array.from(target.classList);
      const screenshot = await captureElementScreenshot(target);

      const info: ElementInfo = {
        element: target,
        selector: generateSelector(target),
        path: getParentPath(target),
        classes,
        dataElement: target.getAttribute("data-element"),
        suggestedComponent: guessComponentName(classes),
        screenshot,
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

  // Handle escape
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
    },
    [isActive, selected, customProps]
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

  // Update style live
  const updateStyle = (prop: string, value: string) => {
    if (!selected) return;
    setStyles((prev) => ({ ...prev, [prop]: value }));
    selected.element.style.setProperty(prop, value);
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

  // Add custom property
  const addCustomProp = () => {
    setCustomProps((prev) => [...prev, { prop: "", value: "" }]);
  };

  // Remove custom property
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
        title={isActive ? "Exit Inspector (Esc)" : "Element Inspector"}
      >
        <MousePointer2 className="w-4 h-4" />
        <span className="hidden sm:inline">{isActive ? "Inspecting..." : "Inspect"}</span>
      </button>

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
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] bg-[var(--primary)] text-white px-4 py-2 rounded-lg shadow-lg text-sm"
        >
          Click an element to inspect • <kbd className="px-1.5 py-0.5 bg-white/20 rounded">Esc</kbd> to exit
        </div>
      )}

      {/* Style Editor Panel */}
      {selected && (
        <div
          data-inspector="panel"
          className="fixed top-4 right-4 z-[10001] w-96 max-h-[90vh] overflow-auto bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between p-3 bg-[var(--card)] border-b border-[var(--border)] z-10">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-[var(--foreground)] truncate text-sm">
                {selected.dataElement || selected.suggestedComponent || selected.selector}
              </h3>
              <p className="text-xs text-[var(--foreground-muted)] truncate">{selected.path}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
              {changedCount > 0 && (
                <span className="text-xs bg-[var(--primary)]/20 text-[var(--primary)] px-1.5 py-0.5 rounded">
                  {changedCount} change{changedCount !== 1 ? "s" : ""}
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

          {/* Notes Section */}
          <div className="p-3 border-b border-[var(--border)]">
            <label className="text-xs font-medium text-[var(--foreground-muted)] block mb-1.5">
              Notes (what do you want to change?)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Make this card taller, change background to blue, increase padding..."
              className="w-full h-20 text-sm px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
            />
          </div>

          {/* Style Editor */}
          <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
            <p className="text-xs text-[var(--foreground-muted)] mb-2">
              Edit styles live. Changed values highlighted.
            </p>
            {Object.entries(styles).map(([prop, value]) => {
              const isChanged = originalStylesRef.current.get(prop) !== value;
              return (
                <div key={prop} className="flex items-center gap-2">
                  <label
                    className={`text-xs w-28 truncate flex-shrink-0 ${isChanged ? "text-[var(--primary)] font-medium" : "text-[var(--foreground-muted)]"}`}
                    title={prop}
                  >
                    {prop}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateStyle(prop, e.target.value)}
                    className={`flex-1 text-xs px-2 py-1.5 rounded border bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] ${
                      isChanged ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)]"
                    }`}
                  />
                </div>
              );
            })}

            {/* Custom Properties */}
            {customProps.map((cp, i) => (
              <div key={`custom-${i}`} className="flex items-center gap-2">
                <input
                  type="text"
                  value={cp.prop}
                  onChange={(e) => updateCustomProp(i, "prop", e.target.value)}
                  placeholder="property"
                  className="w-28 text-xs px-2 py-1.5 rounded border border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <input
                  type="text"
                  value={cp.value}
                  onChange={(e) => updateCustomProp(i, "value", e.target.value)}
                  placeholder="value"
                  className="flex-1 text-xs px-2 py-1.5 rounded border border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
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
              className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline mt-2"
            >
              <Plus className="w-3 h-3" /> Add custom property
            </button>
          </div>

          {/* Element Info */}
          <div className="p-3 border-t border-[var(--border)] bg-[var(--background-tertiary)] space-y-2">
            {selected.suggestedComponent && (
              <p className="text-xs">
                <span className="text-[var(--foreground-muted)]">Component: </span>
                <code className="text-[var(--primary)]">{selected.suggestedComponent}</code>
              </p>
            )}
            <p className="text-xs text-[var(--foreground-muted)]">
              <kbd className="px-1 py-0.5 bg-[var(--background)] rounded text-[10px]">Esc</kbd> to close and revert •{" "}
              <kbd className="px-1 py-0.5 bg-[var(--background)] rounded text-[10px]">Copy</kbd> to get Claude-ready output
            </p>
          </div>
        </div>
      )}
    </>
  );
}
