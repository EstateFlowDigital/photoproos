"use client";

import { useId } from "react";

interface WalkScoreConfigProps {
  config: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
}

export function WalkScoreConfig({ config, updateConfig }: WalkScoreConfigProps) {
  const id = useId();

  return (
    <div className="space-y-6">
      {/* Score Display Options */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Scores to Display</h4>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showWalkScore as boolean) ?? true}
            onChange={(e) => updateConfig("showWalkScore", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <div>
            <span className="text-sm text-foreground">Walk Score</span>
            <p className="text-xs text-foreground-muted">
              Measures walkability based on distance to amenities
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showBikeScore as boolean) ?? true}
            onChange={(e) => updateConfig("showBikeScore", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <div>
            <span className="text-sm text-foreground">Bike Score</span>
            <p className="text-xs text-foreground-muted">
              Measures bikeability based on infrastructure and terrain
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showTransitScore as boolean) ?? true}
            onChange={(e) => updateConfig("showTransitScore", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <div>
            <span className="text-sm text-foreground">Transit Score</span>
            <p className="text-xs text-foreground-muted">
              Measures public transportation accessibility
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showSoundScore as boolean) ?? false}
            onChange={(e) => updateConfig("showSoundScore", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <div>
            <span className="text-sm text-foreground">Sound Score</span>
            <p className="text-xs text-foreground-muted">
              Measures noise levels in the area
            </p>
          </div>
        </label>
      </div>

      {/* Display Style */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Display Style</h4>

        <div>
          <label
            htmlFor={`${id}-layout`}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Layout
          </label>
          <select
            id={`${id}-layout`}
            value={(config.layout as string) || "cards"}
            onChange={(e) => updateConfig("layout", e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          >
            <option value="cards">Score Cards (Side by Side)</option>
            <option value="badges">Badges (Compact)</option>
            <option value="circles">Circular Progress</option>
            <option value="bars">Progress Bars</option>
          </select>
        </div>

        <div>
          <label
            htmlFor={`${id}-size`}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Size
          </label>
          <select
            id={`${id}-size`}
            value={(config.size as string) || "medium"}
            onChange={(e) => updateConfig("size", e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showDescriptions as boolean) ?? true}
            onChange={(e) => updateConfig("showDescriptions", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show score descriptions</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showLabels as boolean) ?? true}
            onChange={(e) => updateConfig("showLabels", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">
            Show category labels (Walker&apos;s Paradise, etc.)
          </span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.colorCode as boolean) ?? true}
            onChange={(e) => updateConfig("colorCode", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Color code by score</span>
        </label>
      </div>

      {/* Link to Walk Score */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Attribution</h4>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showWalkScoreLink as boolean) ?? true}
            onChange={(e) => updateConfig("showWalkScoreLink", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show &quot;Powered by Walk Score&quot; link</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.linkToFullReport as boolean) ?? true}
            onChange={(e) => updateConfig("linkToFullReport", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Link to full Walk Score report</span>
        </label>
      </div>

      {/* Help Text */}
      <div className="rounded-lg border border-[var(--ai)]/30 bg-[var(--ai)]/5 p-3">
        <p className="text-sm text-foreground-secondary">
          <span className="font-medium text-[var(--ai)]">Auto-fetched:</span> Walk
          Score data is automatically fetched based on the property address. Scores
          range from 0-100 and are updated periodically.
        </p>
      </div>
    </div>
  );
}
