import type { PortalTab } from "./types";

interface PortalTabsProps {
  activeTab: PortalTab;
  onTabChange: (tab: PortalTab) => void;
  pendingQuestionnaires: number;
}

const TABS: PortalTab[] = ["properties", "galleries", "downloads", "invoices", "questionnaires"];

export function PortalTabs({ activeTab, onTabChange, pendingQuestionnaires }: PortalTabsProps) {
  return (
    <div className="mb-6 flex items-center gap-2 border-b border-[var(--card-border)]">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`relative border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === tab
              ? "border-[var(--primary)] text-white"
              : "border-transparent text-[var(--foreground-muted)] hover:text-white"
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
          {tab === "questionnaires" && pendingQuestionnaires > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--warning)] text-[10px] font-bold text-white">
              {pendingQuestionnaires}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
