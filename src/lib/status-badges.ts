export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

const STATUS_TONES: Record<string, StatusTone> = {
  active: "success",
  approved: "success",
  cancelled: "danger",
  completed: "success",
  confirmed: "success",
  converted: "success",
  delivered: "success",
  draft: "neutral",
  expired: "danger",
  failed: "danger",
  inactive: "neutral",
  overdue: "danger",
  paid: "success",
  pending: "warning",
  queued: "info",
  rejected: "danger",
  sent: "info",
  signed: "success",
};

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "bg-[var(--background-secondary)] text-foreground-muted border border-[var(--card-border)]",
  info: "bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/20",
  success: "bg-[var(--success)]/15 text-[var(--success)] border border-[var(--success)]/20",
  warning: "bg-[var(--warning)]/15 text-[var(--warning)] border border-[var(--warning)]/20",
  danger: "bg-[var(--error)]/15 text-[var(--error)] border border-[var(--error)]/20",
};

// Dot indicator classes for animated status badges
const DOT_CLASSES: Record<StatusTone, string> = {
  neutral: "bg-foreground-muted",
  info: "bg-[var(--primary)]",
  success: "bg-[var(--success)]",
  warning: "bg-[var(--warning)] animate-pulse",
  danger: "bg-[var(--error)]",
};

export function getStatusDotClasses(status: string, toneOverride?: StatusTone): string {
  const tone = toneOverride ?? getStatusTone(status);
  return DOT_CLASSES[tone];
}

export function getStatusTone(status: string): StatusTone {
  return STATUS_TONES[status] ?? "neutral";
}

export function getStatusBadgeClasses(status: string, toneOverride?: StatusTone): string {
  const tone = toneOverride ?? getStatusTone(status);
  return TONE_CLASSES[tone];
}

export function formatStatusLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}
