"use client";

import * as React from "react";
import { WidgetDashboard, type DashboardData } from "@/components/dashboard/widget-dashboard";
import { AddWidgetModal } from "@/components/dashboard/add-widget-modal";
import { PageHeader } from "@/components/dashboard";
import { type DashboardWidgetConfig } from "@/lib/dashboard-types";
import { Settings2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardClientProps {
  config: DashboardWidgetConfig;
  dashboardData: DashboardData;
  /** Page title */
  title: string;
  /** Page subtitle */
  subtitle: string;
}

export function DashboardClient({ config, dashboardData, title, subtitle }: DashboardClientProps) {
  const [showAddWidget, setShowAddWidget] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);

  return (
    <>
      {/* Page Header with Edit Controls */}
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                isEditing
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background)] text-foreground-secondary hover:text-foreground border border-[var(--card-border)]"
              )}
            >
              <Settings2 className="h-4 w-4" />
              {isEditing ? "Done" : "Edit"}
            </button>
            {isEditing && (
              <button
                onClick={() => setShowAddWidget(true)}
                className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--primary)]/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Widget
              </button>
            )}
          </div>
        }
      />

      {/* Widget Dashboard */}
      <WidgetDashboard
        config={config}
        dashboardData={dashboardData}
        onAddWidget={() => setShowAddWidget(true)}
        isEditing={isEditing}
        onEditingChange={setIsEditing}
        hideControls
      />

      <AddWidgetModal
        isOpen={showAddWidget}
        onClose={() => setShowAddWidget(false)}
        config={config}
      />
    </>
  );
}

export default DashboardClient;
