import type { PortalStatsData, GalleryData, InvoiceData, QuestionnaireData } from "./types";

interface PortalStatsProps {
  stats: PortalStatsData;
  galleries?: GalleryData[];
  invoices?: InvoiceData[];
  questionnaires?: QuestionnaireData[];
}

export function PortalStats({ stats, galleries = [], invoices = [], questionnaires = [] }: PortalStatsProps) {
  // Calculate engagement metrics
  const activeGalleries = galleries.filter((g) => g.status === "delivered").length;
  const totalPhotos = galleries.reduce((acc, g) => acc + g.photoCount, 0);
  const unpaidInvoices = invoices.filter((i) => i.status !== "paid" && i.status !== "draft").length;
  const completedQuestionnaires = questionnaires.filter((q) => q.status === "submitted").length;
  const totalQuestionnaires = questionnaires.length;
  const questionnaireProgress = totalQuestionnaires > 0
    ? Math.round((completedQuestionnaires / totalQuestionnaires) * 100)
    : 100;

  // Calculate if any action needed
  const needsAttention = stats.pendingQuestionnaires > 0 || unpaidInvoices > 0;

  return (
    <div className="mb-8 space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={<HomeIcon className="h-5 w-5" />}
          label="Properties"
          value={stats.totalProperties}
          iconColor="text-[var(--primary)]"
          iconBg="bg-[var(--primary)]/10"
        />
        <StatCard
          icon={<EyeIcon className="h-5 w-5" />}
          label="Total Views"
          value={stats.totalViews}
          format="number"
          iconColor="text-[var(--success)]"
          iconBg="bg-[var(--success)]/10"
          badge={stats.totalViews > 1000 ? "Popular" : undefined}
          badgeColor="success"
        />
        <StatCard
          icon={<UserIcon className="h-5 w-5" />}
          label="Leads"
          value={stats.totalLeads}
          iconColor="text-[var(--warning)]"
          iconBg="bg-[var(--warning)]/10"
          badge={stats.newLeads > 0 ? `${stats.newLeads} new` : undefined}
          badgeColor="warning"
        />
        <StatCard
          icon={<ImageIcon className="h-5 w-5" />}
          label="Photos"
          value={totalPhotos || stats.totalPhotos}
          iconColor="text-purple-500"
          iconBg="bg-purple-500/10"
        />
      </div>

      {/* Engagement Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Galleries Summary */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                <GalleryIcon className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Active Galleries</p>
                <p className="text-xs text-[var(--foreground-muted)]">Ready for viewing & download</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-[var(--foreground)]">{activeGalleries}</span>
          </div>
          {galleries.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs">
              <div className="h-1.5 flex-1 rounded-full bg-[var(--card-border)] overflow-hidden">
                <div
                  className="h-full bg-[var(--primary)] transition-all"
                  style={{ width: `${(activeGalleries / galleries.length) * 100}%` }}
                />
              </div>
              <span className="text-[var(--foreground-muted)]">
                {activeGalleries}/{galleries.length} delivered
              </span>
            </div>
          )}
        </div>

        {/* Questionnaire Progress */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                stats.pendingQuestionnaires > 0 ? "bg-[var(--warning)]/10" : "bg-[var(--success)]/10"
              }`}>
                <ClipboardIcon className={`h-5 w-5 ${
                  stats.pendingQuestionnaires > 0 ? "text-[var(--warning)]" : "text-[var(--success)]"
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Questionnaires</p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {stats.pendingQuestionnaires > 0
                    ? `${stats.pendingQuestionnaires} pending completion`
                    : "All complete"
                  }
                </p>
              </div>
            </div>
            <ProgressRing
              progress={questionnaireProgress}
              size={44}
              strokeWidth={4}
              color={stats.pendingQuestionnaires > 0 ? "var(--warning)" : "var(--success)"}
            />
          </div>
        </div>

        {/* Action Summary */}
        <div className={`rounded-xl border p-4 ${
          needsAttention
            ? "border-[var(--warning)]/30 bg-[var(--warning)]/5"
            : "border-[var(--card-border)] bg-[var(--card)]"
        }`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                needsAttention ? "bg-[var(--warning)]/10" : "bg-[var(--success)]/10"
              }`}>
                {needsAttention ? (
                  <AlertIcon className="h-5 w-5 text-[var(--warning)]" />
                ) : (
                  <CheckCircleIcon className="h-5 w-5 text-[var(--success)]" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {needsAttention ? "Action Needed" : "All Caught Up"}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {needsAttention
                    ? `${stats.pendingQuestionnaires + unpaidInvoices} items require attention`
                    : "No pending items"
                  }
                </p>
              </div>
            </div>
            {needsAttention && (
              <div className="flex flex-col gap-1 text-right">
                {stats.pendingQuestionnaires > 0 && (
                  <span className="text-xs text-[var(--warning)]">
                    {stats.pendingQuestionnaires} questionnaire{stats.pendingQuestionnaires !== 1 ? "s" : ""}
                  </span>
                )}
                {unpaidInvoices > 0 && (
                  <span className="text-xs text-[var(--warning)]">
                    {unpaidInvoices} invoice{unpaidInvoices !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  format?: "number" | "default";
  iconColor: string;
  iconBg: string;
  badge?: string;
  badgeColor?: "primary" | "success" | "warning" | "error";
}

function StatCard({ icon, label, value, format = "default", iconColor, iconBg, badge, badgeColor = "primary" }: StatCardProps) {
  const badgeColors = {
    primary: "bg-[var(--primary)]/10 text-[var(--primary)]",
    success: "bg-[var(--success)]/10 text-[var(--success)]",
    warning: "bg-[var(--warning)]/10 text-[var(--warning)]",
    error: "bg-[var(--error)]/10 text-[var(--error)]",
  };

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        {badge && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeColors[badgeColor]}`}>
            {badge}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-[var(--foreground)]">
        {format === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-sm text-[var(--foreground-muted)]">{label}</p>
    </div>
  );
}

// Progress Ring Component
function ProgressRing({
  progress,
  size = 44,
  strokeWidth = 4,
  color = "var(--primary)"
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--card-border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-[var(--foreground)]">{progress}%</span>
      </div>
    </div>
  );
}

// Icons
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}

function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
