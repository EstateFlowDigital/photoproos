import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { ToastProvider } from "@/components/ui/toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </ToastProvider>
  );
}
