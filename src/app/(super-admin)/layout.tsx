import { requireSuperAdmin, getSuperAdminUser } from "@/lib/auth/super-admin";
import { SuperAdminLayoutClient } from "./super-admin-layout-client";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "sonner";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check super admin access
  await requireSuperAdmin();

  // Get admin user info
  const adminUser = await getSuperAdminUser();

  return (
    <ToastProvider>
      <SuperAdminLayoutClient adminUser={adminUser}>
        {children}
      </SuperAdminLayoutClient>
      <Toaster position="bottom-right" richColors />
    </ToastProvider>
  );
}
