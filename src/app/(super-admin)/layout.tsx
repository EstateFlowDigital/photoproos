import { requireSuperAdmin, getSuperAdminUser } from "@/lib/auth/super-admin";
import { SuperAdminLayoutClient } from "./super-admin-layout-client";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "sonner";

// Super-admin pages always need per-request data and headers (auth/impersonation)
// so we disable static optimization for the entire group.
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
