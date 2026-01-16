import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CMS Admin | PhotoProOS",
  description: "Content Management System administration for governance, collaboration, and workflows.",
};

export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Shield,
  Users,
  GitBranch,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";
import { getGovernanceStats } from "@/lib/actions/cms-governance";
import { getWorkflowStats } from "@/lib/actions/cms-workflows";

export default async function CMSAdminPage() {
  // Fetch stats for overview
  const [governanceStatsResult, workflowStatsResult] = await Promise.all([
    getGovernanceStats(),
    getWorkflowStats(),
  ]);

  const governanceStats = governanceStatsResult.success ? governanceStatsResult.data : null;
  const workflowStats = workflowStatsResult.success ? workflowStatsResult.data : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">CMS Administration</h1>
          <p className="text-foreground-secondary mt-1">
            Manage content governance, real-time collaboration, and approval workflows
          </p>
        </div>
        <Link
          href="/cms/workflows"
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
        >
          <GitBranch className="w-4 h-4" />
          Build Workflow
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Policies"
          value={governanceStats?.activePolicies || 0}
          icon={Shield}
          color="text-[var(--primary)]"
        />
        <StatCard
          label="Open Violations"
          value={governanceStats?.unresolvedViolations || 0}
          icon={AlertTriangle}
          color="text-[var(--warning)]"
        />
        <StatCard
          label="Active Workflows"
          value={workflowStats?.activeWorkflows || 0}
          icon={GitBranch}
          color="text-[var(--ai)]"
        />
        <StatCard
          label="Pending Approvals"
          value={workflowStats?.pendingInstances || 0}
          icon={Clock}
          color="text-[var(--warning)]"
        />
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Governance Card */}
        <FeatureCard
          href="/cms/governance"
          icon={Shield}
          iconColor="text-[var(--primary)]"
          title="Content Governance"
          description="Enforce brand standards, SEO requirements, accessibility rules, and content freshness policies."
          features={[
            "Brand voice guidelines",
            "SEO & accessibility checks",
            "Content freshness rules",
            "Custom policy builder",
          ]}
          stats={governanceStats ? [
            { label: "Total Policies", value: governanceStats.totalPolicies },
            { label: "Active", value: governanceStats.activePolicies },
            { label: "Violations", value: governanceStats.unresolvedViolations },
          ] : undefined}
        />

        {/* Collaboration Card */}
        <FeatureCard
          href="/cms/collaboration"
          icon={Users}
          iconColor="text-[var(--success)]"
          title="Real-time Collaboration"
          description="Enable multiple users to edit content simultaneously with live presence and cursor tracking."
          features={[
            "Live presence indicators",
            "Cursor position tracking",
            "Auto-sync every 2 seconds",
            "Conflict resolution",
          ]}
        />

        {/* Workflows Card */}
        <FeatureCard
          href="/cms/workflows"
          icon={GitBranch}
          iconColor="text-[var(--ai)]"
          title="Workflow Builder"
          description="Create visual approval workflows with conditions, actions, notifications, and delays."
          features={[
            "Drag-and-drop designer",
            "Multi-stage approvals",
            "Conditional branching",
            "Email notifications",
          ]}
          stats={workflowStats ? [
            { label: "Total", value: workflowStats.totalWorkflows },
            { label: "Completed", value: workflowStats.completedInstances },
            { label: "Rejected", value: workflowStats.rejectedInstances },
          ] : undefined}
        />
      </div>

      {/* Visual Guide */}
      <div className="p-6 bg-[var(--card)] border border-[var(--card-border)] rounded-xl">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Governance Flow */}
          <div className="space-y-4">
            <h3 className="font-medium text-[var(--primary)]">Governance Flow</h3>
            <div className="space-y-2 text-sm">
              <FlowStep number={1} text="Create governance policies" />
              <FlowArrow />
              <FlowStep number={2} text="Content auto-checked on save" />
              <FlowArrow />
              <FlowStep number={3} text="Violations shown inline" />
              <FlowArrow />
              <FlowStep number={4} text="Fix or override to publish" />
            </div>
          </div>

          {/* Collaboration Flow */}
          <div className="space-y-4">
            <h3 className="font-medium text-[var(--success)]">Collaboration Flow</h3>
            <div className="space-y-2 text-sm">
              <FlowStep number={1} text="Open content editor" />
              <FlowArrow />
              <FlowStep number={2} text="See who else is editing" />
              <FlowArrow />
              <FlowStep number={3} text="Track cursor positions" />
              <FlowArrow />
              <FlowStep number={4} text="Changes sync automatically" />
            </div>
          </div>

          {/* Workflow Flow */}
          <div className="space-y-4">
            <h3 className="font-medium text-[var(--ai)]">Workflow Flow</h3>
            <div className="space-y-2 text-sm">
              <FlowStep number={1} text="Design workflow visually" />
              <FlowArrow />
              <FlowStep number={2} text="Assign to content types" />
              <FlowArrow />
              <FlowStep number={3} text="Content enters workflow" />
              <FlowArrow />
              <FlowStep number={4} text="Approvers review & act" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div className="p-4 bg-[var(--background-tertiary)] rounded-lg">
        <h3 className="text-sm font-medium mb-3">Status Legend</h3>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[var(--success)]" />
            <span>Passed / Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />
            <span>Warning / Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-[var(--error)]" />
            <span>Blocked / Rejected</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--primary)]" />
            <span>In Progress</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTS
// ============================================================================

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="p-4 bg-[var(--card)] border border-[var(--card-border)] rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-[var(--background-tertiary)]`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-foreground-secondary">{label}</p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  href,
  icon: Icon,
  iconColor,
  title,
  description,
  features,
  stats,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  title: string;
  description: string;
  features: string[];
  stats?: { label: string; value: number }[];
}) {
  return (
    <Link
      href={href}
      className="group p-6 bg-[var(--card)] border border-[var(--card-border)] rounded-xl hover:border-[var(--border-hover)] transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-[var(--background-tertiary)]`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <ArrowRight className="w-5 h-5 text-foreground-muted group-hover:text-foreground group-hover:translate-x-1 transition-all" />
      </div>

      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-foreground-secondary mb-4">{description}</p>

      <ul className="space-y-2 mb-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-3.5 h-3.5 text-[var(--success)]" />
            {feature}
          </li>
        ))}
      </ul>

      {stats && (
        <div className="flex items-center gap-4 pt-4 border-t border-[var(--border)]">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[10px] text-foreground-muted uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}

function FlowStep({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--background-tertiary)] text-xs font-medium">
        {number}
      </span>
      <span className="text-foreground-secondary">{text}</span>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex items-center pl-3">
      <div className="w-px h-4 bg-[var(--border)]" />
    </div>
  );
}
