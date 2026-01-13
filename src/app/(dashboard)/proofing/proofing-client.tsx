"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Image,
  Users,
  Clock,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Share2,
  Download,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type ProofingStatus = "pending" | "in_review" | "approved" | "revision_requested";

interface ProofingSession {
  id: string;
  name: string;
  clientName: string;
  projectName: string;
  totalPhotos: number;
  approvedPhotos: number;
  rejectedPhotos: number;
  status: ProofingStatus;
  deadline: string | null;
  lastActivity: string;
  createdAt: string;
}

const MOCK_SESSIONS: ProofingSession[] = [
  {
    id: "1",
    name: "Wedding Photos - Final Selection",
    clientName: "Sarah Johnson",
    projectName: "Johnson Wedding",
    totalPhotos: 450,
    approvedPhotos: 280,
    rejectedPhotos: 45,
    status: "in_review",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Headshots Round 1",
    clientName: "Michael Chen",
    projectName: "Corporate Headshots",
    totalPhotos: 35,
    approvedPhotos: 35,
    rejectedPhotos: 0,
    status: "approved",
    deadline: null,
    lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Family Session Proofs",
    clientName: "Emily Davis",
    projectName: "Davis Family Portraits",
    totalPhotos: 120,
    approvedPhotos: 0,
    rejectedPhotos: 0,
    status: "pending",
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    name: "Engagement Photos - Round 2",
    clientName: "Lauren Martinez",
    projectName: "Martinez Engagement",
    totalPhotos: 85,
    approvedPhotos: 40,
    rejectedPhotos: 20,
    status: "revision_requested",
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    name: "Product Photos - Initial Review",
    clientName: "Thompson Real Estate",
    projectName: "Thompson Marketing",
    totalPhotos: 60,
    approvedPhotos: 55,
    rejectedPhotos: 5,
    status: "approved",
    deadline: null,
    lastActivity: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const STATUS_CONFIG: Record<ProofingStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending Review", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  in_review: { label: "In Review", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  approved: { label: "Approved", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  revision_requested: { label: "Revision Requested", color: "text-[var(--error)]", bg: "bg-[var(--error)]/10" },
};

export function ProofingClient() {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<ProofingSession[]>(MOCK_SESSIONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProofingStatus | "all">("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.name.toLowerCase().includes(search.toLowerCase()) ||
      session.clientName.toLowerCase().includes(search.toLowerCase()) ||
      session.projectName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyLink = (sessionId: string) => {
    navigator.clipboard.writeText(`https://proof.example.com/${sessionId}`);
    showToast("Proofing link copied", "success");
    setOpenMenuId(null);
  };

  const handleDelete = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showToast("Proofing session deleted", "success");
    setOpenMenuId(null);
  };

  const stats = {
    totalSessions: sessions.length,
    pendingReview: sessions.filter((s) => s.status === "pending" || s.status === "in_review").length,
    totalPhotos: sessions.reduce((sum, s) => sum + s.totalPhotos, 0),
    approvedPhotos: sessions.reduce((sum, s) => sum + s.approvedPhotos, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Sessions</p>
            <CheckSquare className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalSessions}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Awaiting Review</p>
            <Clock className="h-4 w-4 text-[var(--warning)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--warning)]">{stats.pendingReview}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Photos</p>
            <Image className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--primary)]">{stats.totalPhotos}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Approved Photos</p>
            <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{stats.approvedPhotos}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProofingStatus | "all")}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="in_review">In Review</option>
            <option value="approved">Approved</option>
            <option value="revision_requested">Revision Requested</option>
          </select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Create Proofing Session
        </Button>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckSquare className="h-12 w-12 text-foreground-muted mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No proofing sessions found</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {search || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first proofing session to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => {
            const statusConfig = STATUS_CONFIG[session.status];
            const progressPercent = session.totalPhotos > 0
              ? Math.round(((session.approvedPhotos + session.rejectedPhotos) / session.totalPhotos) * 100)
              : 0;
            const daysUntilDeadline = session.deadline
              ? Math.ceil((new Date(session.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div key={session.id} className="card p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-medium text-foreground">{session.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-foreground-muted">
                      <span>{session.clientName}</span>
                      <span>•</span>
                      <span>{session.projectName}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Image className="h-3.5 w-3.5 text-foreground-muted" />
                        {session.totalPhotos} photos
                      </span>
                      <span className="flex items-center gap-1 text-[var(--success)]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {session.approvedPhotos} approved
                      </span>
                      <span className="text-foreground-muted">
                        Last activity {formatRelativeTime(session.lastActivity)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-foreground-muted">Progress</span>
                          <span className="font-medium text-foreground">{progressPercent}%</span>
                        </div>
                        <div className="h-1.5 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--primary)] rounded-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                      {daysUntilDeadline !== null && (
                        <p className={`mt-1 text-xs ${daysUntilDeadline <= 3 ? "text-[var(--error)]" : "text-foreground-muted"}`}>
                          {daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : "Due today"}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenMenuId(openMenuId === session.id ? null : session.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openMenuId === session.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]">
                            <Eye className="h-4 w-4" />
                            View Session
                          </button>
                          <button
                            onClick={() => handleCopyLink(session.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                          >
                            <Share2 className="h-4 w-4" />
                            Copy Link
                          </button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]">
                            <Download className="h-4 w-4" />
                            Export Selections
                          </button>
                          <button
                            onClick={() => handleDelete(session.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-hover)]"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
