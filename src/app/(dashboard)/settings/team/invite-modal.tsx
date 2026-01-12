"use client";

import { useState, useTransition } from "react";
import { createInvitation, resendInvitation, revokeInvitation } from "@/lib/actions/invitations";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const isValidEmail = EMAIL_REGEX.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate email format
    if (!isValidEmail) {
      setError("Please enter a valid email address");
      return;
    }

    startTransition(async () => {
      const result = await createInvitation({ email, role });

      if (result.success) {
        setSuccess(true);
        setEmail("");
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Invite Team Member</h2>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {success ? (
          <div className="success-state">
            <div className="success-icon">
              <CheckIcon />
            </div>
            <p className="success-text">Invitation sent!</p>
            <p className="success-subtext">An email has been sent to {email}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="form-input"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <div className="role-options">
                <label className={`role-option ${role === "member" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="role"
                    value="member"
                    checked={role === "member"}
                    onChange={() => setRole("member")}
                  />
                  <div className="role-content">
                    <span className="role-name">Team Member</span>
                    <span className="role-desc">Can manage galleries, clients, and bookings</span>
                  </div>
                </label>
                <label className={`role-option ${role === "admin" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === "admin"}
                    onChange={() => setRole("admin")}
                  />
                  <div className="role-content">
                    <span className="role-name">Admin</span>
                    <span className="role-desc">Full access including team management</span>
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <ErrorIcon />
                {error}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isPending || !isValidEmail}>
                {isPending ? "Sending..." : "Send Invitation"}
              </button>
            </div>
          </form>
        )}

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 50;
            padding: 20px;
          }

          .modal-content {
            background: var(--card, #141414);
            border: 1px solid var(--card-border, rgba(255, 255, 255, 0.08));
            border-radius: 16px;
            width: 100%;
            max-width: 480px;
            max-height: 90vh;
            overflow-y: auto;
          }

          .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid var(--card-border, rgba(255, 255, 255, 0.08));
          }

          .modal-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--foreground, #ffffff);
            margin: 0;
          }

          .modal-close {
            background: transparent;
            border: none;
            padding: 8px;
            cursor: pointer;
            color: var(--foreground-muted, #a7a7a7);
            border-radius: 8px;
            transition: all 0.15s ease;
          }

          .modal-close:hover {
            background: var(--background-hover, #313131);
            color: var(--foreground, #ffffff);
          }

          form {
            padding: 24px;
          }

          .form-group {
            margin-bottom: 20px;
          }

          .form-label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: var(--foreground, #ffffff);
            margin-bottom: 8px;
          }

          .form-input {
            width: 100%;
            padding: 12px 14px;
            background: var(--background, #0a0a0a);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.16));
            border-radius: 8px;
            font-size: 15px;
            color: var(--foreground, #ffffff);
            outline: none;
            transition: border-color 0.15s ease;
          }

          .form-input:focus {
            border-color: var(--primary, #3b82f6);
          }

          .form-input::placeholder {
            color: var(--foreground-muted, #7c7c7c);
          }

          .role-options {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .role-option {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 14px;
            background: var(--background, #0a0a0a);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.16));
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .role-option:hover {
            border-color: var(--border-hover, rgba(255, 255, 255, 0.24));
          }

          .role-option.selected {
            border-color: var(--primary, #3b82f6);
            background: var(--primary, #3b82f6)10;
          }

          .role-option input {
            display: none;
          }

          .role-content {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .role-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--foreground, #ffffff);
          }

          .role-desc {
            font-size: 13px;
            color: var(--foreground-muted, #7c7c7c);
          }

          .error-message {
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--error, #ef4444)15;
            border: 1px solid var(--error, #ef4444);
            border-radius: 8px;
            padding: 12px 14px;
            margin-bottom: 20px;
            color: var(--error, #ef4444);
            font-size: 14px;
          }

          .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            padding-top: 8px;
          }

          .btn-secondary,
          .btn-primary {
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .btn-secondary {
            background: transparent;
            border: 1px solid var(--border, rgba(255, 255, 255, 0.16));
            color: var(--foreground, #ffffff);
          }

          .btn-secondary:hover {
            background: var(--background-hover, #313131);
          }

          .btn-primary {
            background: var(--primary, #3b82f6);
            border: none;
            color: white;
          }

          .btn-primary:hover:not(:disabled) {
            background: var(--primary-hover, #2563eb);
          }

          .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .success-state {
            padding: 48px 24px;
            text-align: center;
          }

          .success-icon {
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

          .success-text {
            font-size: 18px;
            font-weight: 600;
            color: var(--foreground, #ffffff);
            margin: 0 0 4px;
          }

          .success-subtext {
            font-size: 14px;
            color: var(--foreground-muted, #a7a7a7);
            margin: 0;
          }
        `}</style>
      </div>
    </div>
  );
}

// Pending Invitations List Component
interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  expiresAt: Date;
}

interface PendingInvitationsProps {
  invitations: PendingInvitation[];
}

export function PendingInvitations({ invitations }: PendingInvitationsProps) {
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  const handleResend = (id: string) => {
    setActionId(id);
    startTransition(async () => {
      await resendInvitation(id);
      setActionId(null);
    });
  };

  const handleRevoke = (id: string) => {
    setActionId(id);
    startTransition(async () => {
      await revokeInvitation(id);
      setActionId(null);
    });
  };

  if (invitations.length === 0) return null;

  return (
    <div className="pending-invitations">
      <h3 className="section-title">Pending Invitations</h3>
      <div className="invitations-list">
        {invitations.map((inv) => (
          <div key={inv.id} className="invitation-item">
            <div className="invitation-info">
              <span className="invitation-email">{inv.email}</span>
              <span className="invitation-role">{inv.role}</span>
            </div>
            <div className="invitation-actions">
              <button
                className="btn-action"
                onClick={() => handleResend(inv.id)}
                disabled={isPending && actionId === inv.id}
              >
                Resend
              </button>
              <button
                className="btn-action danger"
                onClick={() => handleRevoke(inv.id)}
                disabled={isPending && actionId === inv.id}
              >
                Revoke
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .pending-invitations {
          margin-top: 24px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--foreground, #ffffff);
          margin: 0 0 16px;
        }

        .invitations-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .invitation-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--background, #0a0a0a);
          border: 1px solid var(--card-border, rgba(255, 255, 255, 0.08));
          border-radius: 8px;
        }

        .invitation-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .invitation-email {
          font-size: 14px;
          color: var(--foreground, #ffffff);
        }

        .invitation-role {
          font-size: 12px;
          padding: 2px 8px;
          background: var(--background-hover, #313131);
          border-radius: 4px;
          color: var(--foreground-muted, #a7a7a7);
          text-transform: capitalize;
        }

        .invitation-actions {
          display: flex;
          gap: 8px;
        }

        .btn-action {
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          background: transparent;
          border: 1px solid var(--border, rgba(255, 255, 255, 0.16));
          color: var(--foreground, #ffffff);
        }

        .btn-action:hover:not(:disabled) {
          background: var(--background-hover, #313131);
        }

        .btn-action.danger {
          color: var(--error, #ef4444);
          border-color: var(--error, #ef4444)40;
        }

        .btn-action.danger:hover:not(:disabled) {
          background: var(--error, #ef4444)15;
        }

        .btn-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

// Icons
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
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
