"use client";

interface SpacerSectionProps {
  config: Record<string, unknown>;
}

export function SpacerSection({ config }: SpacerSectionProps) {
  const height = (config.height as number) || 80;

  return <div style={{ height: `${height}px` }} />;
}
