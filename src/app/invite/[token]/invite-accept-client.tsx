"use client";

import { useState } from "react";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { acceptInvitation } from "@/lib/actions/invitations";
import { cn } from "@/lib/utils";

interface InvitationDetails {
  id: string;
  email: string;
  role: string;
  status: string;
  organizationName: string;
  organizationLogo: string | null;
  expiresAt: Date;
}

interface InviteAcceptClientProps {
  invitation: InvitationDetails;
  token: string;
}

export function InviteAcceptClient({ invitation, token }: InviteAcceptClientProps) {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleLabel = invitation.role === "admin" ? "Admin" : "Team Member";

  // Handle invitation status
  if (invitation.status === "accepted") {
    return (
      <InvitePageLayout>
        <div className="invite-card">
          <StatusIcon type="success" />
          <h1 className="invite-title">Invitation Already Accepted</h1>
          <p className="invite-description">
            This invitation has already been accepted. You can access the dashboard below.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="invite-button primary"
          >
            Go to Dashboard
          </button>
        </div>
      </InvitePageLayout>
    );
  }

  if (invitation.status === "expired") {
    return (
      <InvitePageLayout>
        <div className="invite-card">
          <StatusIcon type="error" />
          <h1 className="invite-title">Invitation Expired</h1>
          <p className="invite-description">
            This invitation has expired. Please ask the team administrator to send you a new invitation.
          </p>
        </div>
      </InvitePageLayout>
    );
  }

  if (invitation.status === "revoked") {
    return (
      <InvitePageLayout>
        <div className="invite-card">
          <StatusIcon type="error" />
          <h1 className="invite-title">Invitation Revoked</h1>
          <p className="invite-description">
            This invitation has been revoked. Please contact the team administrator for more information.
          </p>
        </div>
      </InvitePageLayout>
    );
  }

  // Handle accepting the invitation
  const handleAccept = async () => {
    if (!user) return;

    setIsAccepting(true);
    setError(null);

    try {
      const result = await acceptInvitation(token, {
        clerkUserId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || undefined,
      });

      if (result.success) {
        router.push("/dashboard?welcome=team");
      } else {
        setError(result.error);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  };

  // Check if signed in user email matches invitation email
  const emailMatch =
    user?.emailAddresses[0]?.emailAddress?.toLowerCase() ===
    invitation.email.toLowerCase();

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <InvitePageLayout>
        <div className="invite-card">
          <div className="loading-spinner" />
          <p className="invite-description">Loading...</p>
        </div>
      </InvitePageLayout>
    );
  }

  return (
    <InvitePageLayout>
      <div className="invite-card">
        {/* Organization Logo/Name */}
        <div className="org-header">
          {invitation.organizationLogo ? (
            <img
              src={invitation.organizationLogo}
              alt={invitation.organizationName}
              className="org-logo"
            />
          ) : (
            <div className="org-logo-placeholder">
              {invitation.organizationName.charAt(0).toUpperCase()}
            </div>
          )}
          <h2 className="org-name">{invitation.organizationName}</h2>
        </div>

        <StatusIcon type="invite" />
        <h1 className="invite-title">You&apos;re Invited!</h1>
        <p className="invite-description">
          You&apos;ve been invited to join <strong>{invitation.organizationName}</strong> as a{" "}
          <span className="role-badge">{roleLabel}</span>
        </p>

        {error && (
          <div className="error-message">
            <ErrorIcon />
            {error}
          </div>
        )}

        {isSignedIn ? (
          emailMatch ? (
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              className="invite-button primary"
            >
              {isAccepting ? (
                <>
                  <span className="loading-spinner-small" />
                  Accepting...
                </>
              ) : (
                "Accept Invitation"
              )}
            </button>
          ) : (
            <div className="email-mismatch">
              <p className="mismatch-text">
                This invitation was sent to <strong>{invitation.email}</strong>, but
                you&apos;re signed in as{" "}
                <strong>{user.emailAddresses[0]?.emailAddress}</strong>.
              </p>
              <p className="mismatch-help">
                Please sign out and sign in with the correct email address, or ask for
                a new invitation to your current email.
              </p>
            </div>
          )
        ) : (
          <div className="auth-buttons">
            <SignInButton
              mode="modal"
              fallbackRedirectUrl={`/invite/${token}`}
            >
              <button className="invite-button primary">
                Sign In to Accept
              </button>
            </SignInButton>
            <SignUpButton
              mode="modal"
              fallbackRedirectUrl={`/invite/${token}`}
            >
              <button className="invite-button secondary">
                Create Account
              </button>
            </SignUpButton>
          </div>
        )}

        <p className="invite-email-note">
          Invitation sent to <strong>{invitation.email}</strong>
        </p>
      </div>

      <style jsx>{`
        .invite-card {
          background: var(--card, #141414);
          border: 1px solid var(--card-border, rgba(255, 255, 255, 0.08));
          border-radius: 16px;
          padding: 40px 32px;
          max-width: 480px;
          width: 100%;
          text-align: center;
        }

        .org-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 24px;
        }

        .org-logo {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          object-fit: contain;
          margin-bottom: 12px;
        }

        .org-logo-placeholder {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          background: var(--primary, #3b82f6);
          color: white;
          font-size: 28px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .org-name {
          font-size: 20px;
          font-weight: 600;
          color: var(--foreground, #ffffff);
          margin: 0;
        }

        .invite-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--foreground, #ffffff);
          margin: 16px 0 12px;
        }

        .invite-description {
          color: var(--foreground-muted, #a7a7a7);
          font-size: 16px;
          line-height: 24px;
          margin: 0 0 24px;
        }

        .role-badge {
          background: var(--primary, #3b82f6);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
        }

        .invite-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          border: none;
        }

        .invite-button.primary {
          background: var(--primary, #3b82f6);
          color: white;
        }

        .invite-button.primary:hover:not(:disabled) {
          background: var(--primary-hover, #2563eb);
        }

        .invite-button.primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .invite-button.secondary {
          background: transparent;
          color: var(--foreground, #ffffff);
          border: 1px solid var(--border, rgba(255, 255, 255, 0.16));
          margin-top: 12px;
        }

        .invite-button.secondary:hover {
          background: var(--background-hover, #313131);
        }

        .auth-buttons {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .email-mismatch {
          background: var(--warning, #f97316)10;
          border: 1px solid var(--warning, #f97316);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .mismatch-text {
          color: var(--foreground, #ffffff);
          font-size: 14px;
          margin: 0 0 8px;
        }

        .mismatch-help {
          color: var(--foreground-muted, #a7a7a7);
          font-size: 13px;
          margin: 0;
        }

        .invite-email-note {
          color: var(--foreground-secondary, #7c7c7c);
          font-size: 13px;
          margin: 24px 0 0;
        }

        .error-message {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--error, #ef4444)10;
          border: 1px solid var(--error, #ef4444);
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 16px;
          color: var(--error, #ef4444);
          font-size: 14px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border, rgba(255, 255, 255, 0.08));
          border-top-color: var(--primary, #3b82f6);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        .loading-spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </InvitePageLayout>
  );
}

function InvitePageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="invite-page">
      <div className="invite-header">
        <span className="logo">PhotoProOS</span>
      </div>
      <div className="invite-content">{children}</div>

      <style jsx>{`
        .invite-page {
          min-height: 100vh;
          background: var(--background, #0a0a0a);
          display: flex;
          flex-direction: column;
        }

        .invite-header {
          padding: 24px 32px;
          border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        }

        .logo {
          font-size: 20px;
          font-weight: 700;
          color: var(--foreground, #ffffff);
        }

        .invite-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
        }
      `}</style>
    </div>
  );
}

function StatusIcon({ type }: { type: "success" | "error" | "invite" }) {
  if (type === "success") {
    return (
      <div className="status-icon success">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <style jsx>{`
          .status-icon.success {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: var(--success, #22c55e)20;
            color: var(--success, #22c55e);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
          }
        `}</style>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="status-icon error">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <style jsx>{`
          .status-icon.error {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: var(--error, #ef4444)20;
            color: var(--error, #ef4444);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="status-icon invite">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
      <style jsx>{`
        .status-icon.invite {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--primary, #3b82f6)20;
          color: var(--primary, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
      `}</style>
    </div>
  );
}

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
