import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { ToastProvider } from "@/components/ui/toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex h-screen bg-[var(--background)]">
        {/* Sidebar - hidden on mobile, visible on lg+ */}
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardTopbar />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-[var(--background)] p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
