/**
 * Export utilities for mockups
 *
 * Functions for exporting mockups as PNG, SVG, or copying to clipboard.
 */

import html2canvas from "html2canvas";

export interface ExportOptions {
  scale?: number;
  backgroundColor?: string;
  useCORS?: boolean;
}

/**
 * Export a DOM element as a PNG image
 */
export async function exportToPng(
  element: HTMLElement,
  filename: string = "mockup",
  options: ExportOptions = {}
): Promise<void> {
  const { scale = 2, backgroundColor = "#0a0a0a", useCORS = true } = options;

  try {
    const canvas = await html2canvas(element, {
      scale,
      backgroundColor,
      useCORS,
      logging: false,
      allowTaint: true,
    });

    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (error) {
    console.error("Failed to export PNG:", error);
    throw new Error("Failed to export image");
  }
}

/**
 * Copy a DOM element as an image to the clipboard
 */
export async function copyToClipboard(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  const { scale = 2, backgroundColor = "#0a0a0a", useCORS = true } = options;

  try {
    const canvas = await html2canvas(element, {
      scale,
      backgroundColor,
      useCORS,
      logging: false,
      allowTaint: true,
    });

    canvas.toBlob(async (blob) => {
      if (!blob) {
        throw new Error("Failed to create blob");
      }

      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
      } catch (err) {
        // Fallback: open in new tab
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
    }, "image/png");
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    throw new Error("Failed to copy image");
  }
}

/**
 * Export a DOM element as SVG (uses foreignObject)
 */
export async function exportToSvg(
  element: HTMLElement,
  filename: string = "mockup"
): Promise<void> {
  try {
    const { width, height } = element.getBoundingClientRect();
    const serializer = new XMLSerializer();
    const clonedElement = element.cloneNode(true) as HTMLElement;

    // Create SVG wrapper
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    // Create foreignObject to contain HTML
    const foreignObject = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "foreignObject"
    );
    foreignObject.setAttribute("width", "100%");
    foreignObject.setAttribute("height", "100%");
    foreignObject.appendChild(clonedElement);
    svg.appendChild(foreignObject);

    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.download = `${filename}.svg`;
    link.href = url;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error("Failed to export SVG:", error);
    throw new Error("Failed to export SVG");
  }
}

/**
 * Get the appropriate filename for a mockup export
 */
export function getExportFilename(
  mockupId: string,
  industry: string,
  aspectRatio: string
): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  return `photoproos-${mockupId}-${industry}-${aspectRatio.replace(":", "x")}-${timestamp}`;
}
