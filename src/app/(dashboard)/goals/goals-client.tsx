"use client";

import { useState } from "react";
import {
  Target,
  TrendingUp,
  DollarSign,
  Calendar,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type GoalType = "revenue" | "bookings" | "clients" | "sessions";
type GoalPeriod = "monthly" | "quarterly" | "yearly";

interface Goal {
  id: string;
  name: string;
  type: GoalType;
  period: GoalPeriod;
  target: number;
  current: number;
  startDate: string;
  endDate: string;
  notes: string;
}

const MOCK_GOALS: Goal[] = [
  {
    id: "1",
    name: "Q1 Revenue Target",
    type: "revenue",
    period: "quarterly",
    target: 50000,
    current: 38500,
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(),
    endDate: new Date(new Date().getFullYear(), 2, 31).toISOString(),
    notes: "Focus on wedding bookings and print sales",
  },
  {
    id: "2",
    name: "Monthly Bookings",
    type: "bookings",
    period: "monthly",
    target: 8,
    current: 5,
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
    notes: "Target mix of weddings and portrait sessions",
  },
  {
    id: "3",
    name: "New Clients This Year",
    type: "clients",
    period: "yearly",
    target: 50,
    current: 32,
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(),
    endDate: new Date(new Date().getFullYear(), 11, 31).toISOString(),
    notes: "Grow client base through referrals and marketing",
  },
  {
    id: "4",
    name: "Sessions This Month",
    type: "sessions",
    period: "monthly",
    target: 12,
    current: 9,
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
    notes: "Include all portrait and event sessions",
  },
];

const TYPE_CONFIG: Record<GoalType, { label: string; color: string; bg: string; icon: typeof Target; format: (v: number) => string }> = {
  revenue: {
    label: "Revenue",
    color: "text-[var(--success)]",
    bg: "bg-[var(--success)]/10",
    icon: DollarSign,
    format: (v) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v),
  },
  bookings: {
    label: "Bookings",
    color: "text-[var(--primary)]",
    bg: "bg-[var(--primary)]/10",
    icon: Calendar,
    format: (v) => v.toString(),
  },
  clients: {
    label: "Clients",
    color: "text-[var(--info)]",
    bg: "bg-[var(--info)]/10",
    icon: Users,
    format: (v) => v.toString(),
  },
  sessions: {
    label: "Sessions",
    color: "text-[var(--warning)]",
    bg: "bg-[var(--warning)]/10",
    icon: Target,
    format: (v) => v.toString(),
  },
};

const PERIOD_LABELS: Record<GoalPeriod, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export function GoalsClient() {
  const { showToast } = useToast();
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleDelete = (goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    showToast("Goal deleted", "success");
    setOpenMenuId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Calculate stats
  const onTrackGoals = goals.filter((g) => {
    const progress = g.current / g.target;
    const timeElapsed = (Date.now() - new Date(g.startDate).getTime()) /
      (new Date(g.endDate).getTime() - new Date(g.startDate).getTime());
    return progress >= timeElapsed;
  }).length;

  const totalRevenue = goals.filter((g) => g.type === "revenue").reduce((sum, g) => sum + g.current, 0);
  const totalRevenueTarget = goals.filter((g) => g.type === "revenue").reduce((sum, g) => sum + g.target, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Active Goals</p>
            <Target className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{goals.length}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">On Track</p>
            <TrendingUp className="h-4 w-4 text-[var(--success)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{onTrackGoals}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Revenue Progress</p>
            <DollarSign className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--primary)]">
            {totalRevenueTarget > 0 ? Math.round((totalRevenue / totalRevenueTarget) * 100) : 0}%
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Completed</p>
            <CheckCircle2 className="h-4 w-4 text-[var(--warning)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--warning)]">
            {goals.filter((g) => g.current >= g.target).length}
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-foreground">Your Goals</h2>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Add Goal
        </Button>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="card p-12 text-center">
          <Target className="h-12 w-12 text-foreground-muted mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No goals yet</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Set your first goal to start tracking progress
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => {
            const typeConfig = TYPE_CONFIG[goal.type];
            const TypeIcon = typeConfig.icon;
            const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
            const daysRemaining = getDaysRemaining(goal.endDate);
            const isComplete = goal.current >= goal.target;

            return (
              <div key={goal.id} className="card p-5">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeConfig.bg}`}>
                      <TypeIcon className={`h-5 w-5 ${typeConfig.color}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{goal.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-medium ${typeConfig.color}`}>
                          {typeConfig.label}
                        </span>
                        <span className="text-xs text-foreground-muted">•</span>
                        <span className="text-xs text-foreground-muted">
                          {PERIOD_LABELS[goal.period]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpenMenuId(openMenuId === goal.id ? null : goal.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    {openMenuId === goal.id && (
                      <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]">
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-hover)]"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{typeConfig.format(goal.current)}</p>
                      <p className="text-sm text-foreground-muted">of {typeConfig.format(goal.target)}</p>
                    </div>
                    <div className="text-right">
                      {isComplete ? (
                        <span className="flex items-center gap-1 text-[var(--success)]">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-sm font-medium">Complete!</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-foreground-muted">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{daysRemaining} days left</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isComplete ? "bg-[var(--success)]" : typeConfig.color.replace("text-", "bg-")}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-foreground-muted">
                    <span>{formatDate(goal.startDate)} - {formatDate(goal.endDate)}</span>
                    <span className="font-medium">{progress}%</span>
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
