import type { PortalTab } from "./types";

interface PortalTabsProps {
  activeTab: PortalTab;
  onTabChange: (tab: PortalTab) => void;
  pendingQuestionnaires: number;
}

const TABS: { id: PortalTab; label: string }[] = [
  { id: "properties", label: "Properties" },
  { id: "galleries", label: "Galleries" },
  { id: "downloads", label: "Downloads" },
  { id: "invoices", label: "Invoices" },
  { id: "questionnaires", label: "Questionnaires" },
];

export function PortalTabs({ activeTab, onTabChange, pendingQuestionnaires }: PortalTabsProps) {
  return (
    <div
      className="mb-6 flex items-center gap-2 border-b border-[var(--card-border)]"
      role="tablist"
      aria-label="Portal navigation"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const hasBadge = tab.id === "questionnaires" && pendingQuestionnaires > 0;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${tab.id}-panel`}
            id={`${tab.id}-tab`}
            tabIndex={isActive ? 0 : -1}
            className={`relative border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? "border-[var(--primary)] text-[var(--foreground)]"
                : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab.label}
            {hasBadge && (
              <span
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--warning)] text-[10px] font-bold text-white"
                aria-label={`${pendingQuestionnaires} pending questionnaires`}
              >
                {pendingQuestionnaires}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
