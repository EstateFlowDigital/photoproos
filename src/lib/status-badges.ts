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
  neutral: "bg-[var(--background-secondary)] text-foreground-muted",
  info: "bg-[var(--primary)]/10 text-[var(--primary)]",
  success: "bg-[var(--success)]/10 text-[var(--success)]",
  warning: "bg-[var(--warning)]/10 text-[var(--warning)]",
  danger: "bg-[var(--error)]/10 text-[var(--error)]",
};

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
