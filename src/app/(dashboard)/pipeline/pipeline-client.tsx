"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type PipelineStage = "inquiry" | "quoted" | "negotiating" | "booked" | "completed";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  value: number;
  stage: PipelineStage;
  source: string;
  createdAt: string;
  lastActivity: string;
}

const MOCK_LEADS: Lead[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "(555) 123-4567",
    projectType: "Wedding Photography",
    value: 4500,
    stage: "inquiry",
    source: "Website",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael@company.com",
    phone: "(555) 234-5678",
    projectType: "Corporate Headshots",
    value: 1200,
    stage: "inquiry",
    source: "Referral",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily@email.com",
    phone: "(555) 345-6789",
    projectType: "Engagement Session",
    value: 800,
    stage: "quoted",
    source: "Instagram",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    name: "David Thompson",
    email: "david@business.com",
    phone: "(555) 456-7890",
    projectType: "Real Estate",
    value: 350,
    stage: "quoted",
    source: "Google",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    name: "Jessica Martinez",
    email: "jessica@email.com",
    phone: "(555) 567-8901",
    projectType: "Family Portraits",
    value: 650,
    stage: "negotiating",
    source: "Website",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "6",
    name: "Robert Wilson",
    email: "robert@corp.com",
    phone: "(555) 678-9012",
    projectType: "Product Photography",
    value: 2800,
    stage: "booked",
    source: "Referral",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "7",
    name: "Amanda Brown",
    email: "amanda@email.com",
    phone: "(555) 789-0123",
    projectType: "Wedding Photography",
    value: 5200,
    stage: "booked",
    source: "The Knot",
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "8",
    name: "Chris Taylor",
    email: "chris@studio.com",
    phone: "(555) 890-1234",
    projectType: "Headshots",
    value: 450,
    stage: "completed",
    source: "LinkedIn",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const STAGE_CONFIG: Record<PipelineStage, { label: string; color: string; bg: string }> = {
  inquiry: { label: "Inquiry", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  quoted: { label: "Quoted", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  negotiating: { label: "Negotiating", color: "text-[var(--secondary)]", bg: "bg-[var(--secondary)]/10" },
  booked: { label: "Booked", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  completed: { label: "Completed", color: "text-foreground-muted", bg: "bg-[var(--background-tertiary)]" },
};

export function PipelineClient() {
  const { showToast } = useToast();
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [search, setSearch] = useState("");
  const [draggedLead, setDraggedLead] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  };

  const formatRelativeTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  };

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(search.toLowerCase()) ||
    lead.email.toLowerCase().includes(search.toLowerCase()) ||
    lead.projectType.toLowerCase().includes(search.toLowerCase())
  );

  const getLeadsByStage = (stage: PipelineStage) =>
    filteredLeads.filter((lead) => lead.stage === stage);

  const getStageValue = (stage: PipelineStage) =>
    getLeadsByStage(stage).reduce((sum, lead) => sum + lead.value, 0);

  const handleDragStart = (leadId: string) => {
    setDraggedLead(leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stage: PipelineStage) => {
    if (!draggedLead) return;

    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === draggedLead ? { ...lead, stage } : lead
      )
    );
    showToast(`Lead moved to ${STAGE_CONFIG[stage].label}`, "success");
    setDraggedLead(null);
  };

  const stats = {
    totalLeads: leads.length,
    totalValue: leads.reduce((sum, lead) => sum + lead.value, 0),
    bookedValue: leads.filter((l) => l.stage === "booked").reduce((sum, l) => sum + l.value, 0),
    conversionRate: Math.round((leads.filter((l) => l.stage === "booked" || l.stage === "completed").length / leads.length) * 100),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Leads</p>
            <Users className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalLeads}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Pipeline Value</p>
            <DollarSign className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--primary)]">{formatCurrency(stats.totalValue)}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Booked Value</p>
            <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{formatCurrency(stats.bookedValue)}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Conversion Rate</p>
            <TrendingUp className="h-4 w-4 text-[var(--warning)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.conversionRate}%</p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
          />
        </div>
        <Link href="/leads/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Add Lead
          </Button>
        </Link>
      </div>

      {/* Pipeline Kanban */}
      <div className="grid gap-4 lg:grid-cols-5">
        {(Object.keys(STAGE_CONFIG) as PipelineStage[]).map((stage) => {
          const config = STAGE_CONFIG[stage];
          const stageLeads = getLeadsByStage(stage);
          const stageValue = getStageValue(stage);

          return (
            <div
              key={stage}
              className="card p-4"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${config.bg.replace("/10", "")}`} />
                  <h3 className="font-medium text-foreground text-sm">{config.label}</h3>
                  <span className="text-xs text-foreground-muted">({stageLeads.length})</span>
                </div>
                <span className="text-xs font-medium text-foreground-muted">{formatCurrency(stageValue)}</span>
              </div>

              <div className="space-y-2 min-h-[200px]">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead.id)}
                    className="p-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)] cursor-move hover:border-[var(--primary)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                      <span className="text-xs font-semibold text-[var(--primary)]">{formatCurrency(lead.value)}</span>
                    </div>
                    <p className="text-xs text-foreground-muted truncate mb-2">{lead.projectType}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground-muted">{lead.source}</span>
                      <span className="text-xs text-foreground-muted">{formatRelativeTime(lead.lastActivity)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
