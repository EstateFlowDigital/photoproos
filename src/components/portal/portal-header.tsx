import { getClientPortalHeaderData } from "@/lib/actions/client-portal";
import { PortalPageWrapper } from "@/app/(client-portal)/portal/components/portal-page-wrapper";

interface PortalHeaderProps {
  children: React.ReactNode;
}

/**
 * Server component that conditionally wraps portal content with header/footer.
 * Only renders the wrapper if the user is authenticated.
 * Unauthenticated users (login page) see content without wrapper.
 */
export async function PortalHeader({ children }: PortalHeaderProps) {
  const headerData = await getClientPortalHeaderData();

  // If not authenticated, just render children (login page)
  if (!headerData) {
    return <>{children}</>;
  }

  // Wrap authenticated pages with the portal navigation
  return (
    <PortalPageWrapper
      clientName={headerData.clientName ?? undefined}
      clientEmail={headerData.clientEmail}
      organizationName={headerData.organizationName ?? undefined}
      organizationLogo={headerData.organizationLogo}
    >
      {children}
    </PortalPageWrapper>
  );
}
