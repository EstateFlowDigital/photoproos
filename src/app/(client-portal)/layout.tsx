import "../globals.css";
import { ToastProvider } from "@/components/ui/toast";

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#0a0a0a]">
        {children}
      </div>
    </ToastProvider>
  );
}
