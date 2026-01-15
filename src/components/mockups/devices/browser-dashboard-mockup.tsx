"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { MockupProps } from "../types";
import { FullDashboardMockup } from "../dashboard/full-dashboard-mockup";

export function BrowserDashboardMockup({
  data,
  theme,
  primaryColor,
  industry,
  className,
}: MockupProps) {
  return (
    <div className={cn("browser-dashboard-mockup", className)}>
      <FullDashboardMockup
        data={data}
        theme={theme}
        primaryColor={primaryColor}
        industry={industry}
      />
    </div>
  );
}
