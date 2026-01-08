"use client";

import * as React from "react";
import { WidgetDashboard, type DashboardData } from "@/components/dashboard/widget-dashboard";
import { AddWidgetModal } from "@/components/dashboard/add-widget-modal";
import { type DashboardWidgetConfig } from "@/lib/dashboard-types";

interface DashboardClientProps {
  config: DashboardWidgetConfig;
  dashboardData: DashboardData;
}

export function DashboardClient({ config, dashboardData }: DashboardClientProps) {
  const [showAddWidget, setShowAddWidget] = React.useState(false);

  return (
    <>
      <WidgetDashboard
        config={config}
        dashboardData={dashboardData}
        onAddWidget={() => setShowAddWidget(true)}
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
