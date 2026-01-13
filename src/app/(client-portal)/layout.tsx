import "../globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { PortalHeader } from "@/components/portal/portal-header";

export const dynamic = "force-dynamic";

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <PortalHeader>{children}</PortalHeader>
    </ToastProvider>
  );
}
