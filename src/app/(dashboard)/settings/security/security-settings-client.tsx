"use client";

import { useState } from "react";
import {
  Shield,
  Smartphone,
  Monitor,
  Globe,
  Key,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface SecuritySettingsClientProps {
  user: {
    email: string;
    createdAt: string;
    lastSignInAt: string | null;
    twoFactorEnabled: boolean;
  };
}

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface LoginEvent {
  id: string;
  timestamp: string;
  device: string;
  location: string;
  success: boolean;
}

// Mock sessions data
const MOCK_SESSIONS: Session[] = [
  {
    id: "1",
    device: "MacBook Pro",
    browser: "Chrome 120",
    location: "San Francisco, CA",
    lastActive: new Date().toISOString(),
    isCurrent: true,
  },
  {
    id: "2",
    device: "iPhone 15 Pro",
    browser: "Safari Mobile",
    location: "San Francisco, CA",
    lastActive: new Date(Date.now() - 3600000).toISOString(),
    isCurrent: false,
  },
];

// Mock login events
const MOCK_LOGIN_EVENTS: LoginEvent[] = [
  {
    id: "1",
    timestamp: new Date().toISOString(),
    device: "MacBook Pro - Chrome",
    location: "San Francisco, CA",
    success: true,
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    device: "iPhone 15 Pro - Safari",
    location: "San Francisco, CA",
    success: true,
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    device: "Unknown Device",
    location: "New York, NY",
    success: false,
  },
];

export function SecuritySettingsClient({ user }: SecuritySettingsClientProps) {
  const { showToast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user.twoFactorEnabled);
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [loginEvents] = useState<LoginEvent[]>(MOCK_LOGIN_EVENTS);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [showSetup2FA, setShowSetup2FA] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleToggle2FA = async () => {
    if (twoFactorEnabled) {
      // Disable 2FA
      setTwoFactorEnabled(false);
      showToast("Two-factor authentication disabled", "success");
    } else {
      // Show 2FA setup
      setShowSetup2FA(true);
    }
  };

  const handleEnable2FA = async () => {
    setIsEnabling2FA(true);
    // Simulate enabling 2FA
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setTwoFactorEnabled(true);
    setShowSetup2FA(false);
    setIsEnabling2FA(false);
    showToast("Two-factor authentication enabled", "success");
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showToast("Session revoked", "success");
  };

  const handleRevokeAllSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    showToast("All other sessions revoked", "success");
  };

  return (
    <div className="space-y-6">
      {/* Security Score */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
              twoFactorEnabled ? "bg-[var(--success)]/10" : "bg-[var(--warning)]/10"
            }`}>
              <Shield className={`h-6 w-6 ${twoFactorEnabled ? "text-[var(--success)]" : "text-[var(--warning)]"}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Account Security</h3>
              <p className="text-sm text-foreground-muted">
                {twoFactorEnabled ? "Your account is well protected" : "Enable 2FA for better security"}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
            twoFactorEnabled
              ? "bg-[var(--success)]/10 text-[var(--success)]"
              : "bg-[var(--warning)]/10 text-[var(--warning)]"
          }`}>
            {twoFactorEnabled ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Strong
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                Needs attention
              </>
            )}
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="card">
        <div className="p-6 border-b border-[var(--card-border)]">
          <h3 className="text-base font-semibold text-foreground">Two-Factor Authentication</h3>
          <p className="text-sm text-foreground-muted mt-1">
            Add an extra layer of security to your account
          </p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--background-tertiary)]">
                <Smartphone className="h-5 w-5 text-foreground-muted" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Authenticator App</p>
                <p className="text-xs text-foreground-muted">
                  Use Google Authenticator or similar app
                </p>
              </div>
            </div>
            <button
              onClick={handleToggle2FA}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                twoFactorEnabled ? "bg-[var(--success)]" : "bg-[var(--background-tertiary)]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition ${
                  twoFactorEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {!twoFactorEnabled && (
            <div className="mt-4 rounded-lg bg-[var(--warning)]/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[var(--warning)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[var(--warning)]">
                    2FA is not enabled
                  </p>
                  <p className="text-xs text-foreground-muted mt-1">
                    Your account is more vulnerable to unauthorized access. Enable 2FA to protect your account.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {showSetup2FA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-[var(--card)] p-6 m-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Enable 2FA</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowSetup2FA(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-48 h-48 bg-[var(--background-tertiary)] rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Key className="h-12 w-12 text-foreground-muted mx-auto" />
                    <p className="text-xs text-foreground-muted mt-2">QR Code Placeholder</p>
                  </div>
                </div>
                <p className="text-sm text-foreground-muted">
                  Scan this QR code with your authenticator app
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Or enter this code manually:
                </label>
                <div className="flex items-center gap-2 rounded-lg bg-[var(--background-tertiary)] p-3">
                  <code className="flex-1 text-sm font-mono text-foreground">
                    ABCD-EFGH-IJKL-MNOP
                  </code>
                  <Button variant="ghost" size="sm">
                    Copy
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Enter verification code:
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-3 py-2 text-center text-lg font-mono tracking-widest text-foreground"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowSetup2FA(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleEnable2FA} disabled={isEnabling2FA}>
                  {isEnabling2FA ? "Verifying..." : "Enable 2FA"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Sessions */}
      <div className="card">
        <div className="p-6 border-b border-[var(--card-border)] flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Active Sessions</h3>
            <p className="text-sm text-foreground-muted mt-1">
              Manage devices that are signed into your account
            </p>
          </div>
          {sessions.length > 1 && (
            <Button variant="outline" size="sm" onClick={handleRevokeAllSessions}>
              <LogOut className="h-4 w-4 mr-1" />
              Sign out all
            </Button>
          )}
        </div>
        <div className="divide-y divide-[var(--card-border)]">
          {sessions.map((session) => (
            <div key={session.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--background-tertiary)]">
                  {session.device.toLowerCase().includes("iphone") ? (
                    <Smartphone className="h-5 w-5 text-foreground-muted" />
                  ) : (
                    <Monitor className="h-5 w-5 text-foreground-muted" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{session.device}</p>
                    {session.isCurrent && (
                      <span className="rounded-full bg-[var(--success)]/10 px-2 py-0.5 text-xs text-[var(--success)]">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground-muted">
                    {session.browser} • {session.location}
                  </p>
                  <p className="text-xs text-foreground-muted">
                    Active {formatRelativeTime(session.lastActive)}
                  </p>
                </div>
              </div>
              {!session.isCurrent && (
                <Button variant="ghost" size="sm" onClick={() => handleRevokeSession(session.id)}>
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Login History */}
      <div className="card">
        <div className="p-6 border-b border-[var(--card-border)]">
          <h3 className="text-base font-semibold text-foreground">Recent Login Activity</h3>
          <p className="text-sm text-foreground-muted mt-1">
            Review recent sign-in attempts to your account
          </p>
        </div>
        <div className="divide-y divide-[var(--card-border)]">
          {loginEvents.map((event) => (
            <div key={event.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  event.success ? "bg-[var(--success)]/10" : "bg-[var(--error)]/10"
                }`}>
                  {event.success ? (
                    <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-[var(--error)]" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {event.success ? "Successful sign-in" : "Failed sign-in attempt"}
                  </p>
                  <p className="text-xs text-foreground-muted">
                    {event.device} • {event.location}
                  </p>
                </div>
              </div>
              <p className="text-xs text-foreground-muted">{formatDate(event.timestamp)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Password Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--background-tertiary)]">
              <Lock className="h-5 w-5 text-foreground-muted" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Password</p>
              <p className="text-xs text-foreground-muted">
                Last changed: Never (using OAuth)
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Change Password
          </Button>
        </div>
      </div>

      {/* Account Info */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Account Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground-muted">Email</span>
            <span className="text-foreground">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-muted">Account created</span>
            <span className="text-foreground">{formatDate(user.createdAt)}</span>
          </div>
          {user.lastSignInAt && (
            <div className="flex justify-between">
              <span className="text-foreground-muted">Last sign in</span>
              <span className="text-foreground">{formatDate(user.lastSignInAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
