import type { PortalTab } from "./types";

interface PortalTabsProps {
  activeTab: PortalTab;
  onTabChange: (tab: PortalTab) => void;
  pendingQuestionnaires: number;
  newLeads?: number;
  unreadMessages?: number;
}

const TABS: { id: PortalTab; label: string; icon?: React.ReactNode }[] = [
  { id: "properties", label: "Properties" },
  { id: "galleries", label: "Galleries" },
  { id: "downloads", label: "Downloads" },
  { id: "invoices", label: "Invoices" },
  { id: "leads", label: "Leads" },
  { id: "questionnaires", label: "Questionnaires" },
  { id: "messages", label: "Messages", icon: <MessagesIcon /> },
  { id: "settings", label: "Settings", icon: <SettingsIcon /> },
];

export function PortalTabs({ activeTab, onTabChange, pendingQuestionnaires, newLeads = 0, unreadMessages = 0 }: PortalTabsProps) {
  return (
    <div
      className="mb-6 flex items-center gap-2 border-b border-[var(--card-border)] overflow-x-auto"
      role="tablist"
      aria-label="Portal navigation"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const hasBadge =
          (tab.id === "questionnaires" && pendingQuestionnaires > 0) ||
          (tab.id === "leads" && newLeads > 0) ||
          (tab.id === "messages" && unreadMessages > 0);
        const badgeCount = tab.id === "questionnaires" ? pendingQuestionnaires : tab.id === "leads" ? newLeads : tab.id === "messages" ? unreadMessages : 0;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${tab.id}-panel`}
            id={`${tab.id}-tab`}
            tabIndex={isActive ? 0 : -1}
            className={`relative flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? "border-[var(--primary)] text-[var(--foreground)]"
                : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab.icon}
            {tab.label}
            {hasBadge && (
              <span
                className={`absolute -right-1 -top-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                  tab.id === "leads" ? "bg-[var(--primary)]" : tab.id === "messages" ? "bg-[var(--primary)]" : "bg-[var(--warning)]"
                }`}
                aria-label={`${badgeCount} ${tab.id === "leads" ? "new leads" : tab.id === "messages" ? "unread messages" : "pending questionnaires"}`}
              >
                {badgeCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function MessagesIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}
