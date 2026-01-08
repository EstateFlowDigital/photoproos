import { requireSuperAdmin, getSuperAdminUser } from "@/lib/auth/super-admin";
import { SuperAdminLayoutClient } from "./super-admin-layout-client";

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
    <SuperAdminLayoutClient adminUser={adminUser}>
      {children}
    </SuperAdminLayoutClient>
  );
}
