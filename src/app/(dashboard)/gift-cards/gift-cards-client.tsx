"use client";

import { useState } from "react";
import {
  Gift,
  DollarSign,
  CreditCard,
  Clock,
  Plus,
  Search,
  MoreHorizontal,
  Copy,
  Mail,
  Trash2,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type GiftCardStatus = "active" | "partially_used" | "fully_used" | "expired";

interface GiftCard {
  id: string;
  code: string;
  initialAmount: number;
  currentBalance: number;
  status: GiftCardStatus;
  recipientName: string;
  recipientEmail: string;
  purchaserName: string;
  purchaserEmail: string;
  message: string;
  purchasedAt: string;
  expiresAt: string;
  lastUsedAt: string | null;
}

const MOCK_GIFT_CARDS: GiftCard[] = [
  {
    id: "1",
    code: "GIFT-A1B2-C3D4",
    initialAmount: 500,
    currentBalance: 500,
    status: "active",
    recipientName: "Sarah Johnson",
    recipientEmail: "sarah@example.com",
    purchaserName: "Michael Johnson",
    purchaserEmail: "michael@example.com",
    message: "Happy Birthday! Enjoy your photo session!",
    purchasedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsedAt: null,
  },
  {
    id: "2",
    code: "GIFT-E5F6-G7H8",
    initialAmount: 300,
    currentBalance: 150,
    status: "partially_used",
    recipientName: "Emily Davis",
    recipientEmail: "emily@example.com",
    purchaserName: "Robert Davis",
    purchaserEmail: "robert@example.com",
    message: "For your wedding photos!",
    purchasedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    code: "GIFT-I9J0-K1L2",
    initialAmount: 200,
    currentBalance: 0,
    status: "fully_used",
    recipientName: "Amanda Wilson",
    recipientEmail: "amanda@example.com",
    purchaserName: "Chris Wilson",
    purchaserEmail: "chris@example.com",
    message: "Merry Christmas!",
    purchasedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    code: "GIFT-M3N4-O5P6",
    initialAmount: 100,
    currentBalance: 100,
    status: "expired",
    recipientName: "Jessica Brown",
    recipientEmail: "jessica@example.com",
    purchaserName: "David Brown",
    purchaserEmail: "david@example.com",
    message: "Happy Anniversary!",
    purchasedAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsedAt: null,
  },
  {
    id: "5",
    code: "GIFT-Q7R8-S9T0",
    initialAmount: 750,
    currentBalance: 250,
    status: "partially_used",
    recipientName: "Lauren Martinez",
    recipientEmail: "lauren@example.com",
    purchaserName: "James Martinez",
    purchaserEmail: "james@example.com",
    message: "For all your photography needs!",
    purchasedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const STATUS_CONFIG: Record<GiftCardStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  partially_used: { label: "Partially Used", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  fully_used: { label: "Fully Redeemed", color: "text-foreground-muted", bg: "bg-[var(--background-tertiary)]" },
  expired: { label: "Expired", color: "text-[var(--error)]", bg: "bg-[var(--error)]/10" },
};

export function GiftCardsClient() {
  const { showToast } = useToast();
  const [giftCards, setGiftCards] = useState<GiftCard[]>(MOCK_GIFT_CARDS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<GiftCardStatus | "all">("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredGiftCards = giftCards.filter((card) => {
    const matchesSearch =
      card.code.toLowerCase().includes(search.toLowerCase()) ||
      card.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      card.recipientEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || card.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast("Gift card code copied", "success");
    setOpenMenuId(null);
  };

  const handleResendEmail = (cardId: string) => {
    showToast("Gift card email resent", "success");
    setOpenMenuId(null);
  };

  const handleDelete = (cardId: string) => {
    setGiftCards((prev) => prev.filter((c) => c.id !== cardId));
    showToast("Gift card deleted", "success");
    setOpenMenuId(null);
  };

  const stats = {
    totalCards: giftCards.length,
    totalSold: giftCards.reduce((sum, c) => sum + c.initialAmount, 0),
    totalBalance: giftCards.filter((c) => c.status !== "expired").reduce((sum, c) => sum + c.currentBalance, 0),
    activeCards: giftCards.filter((c) => c.status === "active" || c.status === "partially_used").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Cards</p>
            <Gift className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalCards}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Sold</p>
            <DollarSign className="h-4 w-4 text-[var(--success)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{formatCurrency(stats.totalSold)}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Outstanding Balance</p>
            <CreditCard className="h-4 w-4 text-[var(--warning)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--warning)]">{formatCurrency(stats.totalBalance)}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Active Cards</p>
            <CheckCircle2 className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.activeCards}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search gift cards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as GiftCardStatus | "all")}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="partially_used">Partially Used</option>
            <option value="fully_used">Fully Redeemed</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Create Gift Card
        </Button>
      </div>

      {/* Gift Cards List */}
      {filteredGiftCards.length === 0 ? (
        <div className="card p-12 text-center">
          <Gift className="h-12 w-12 text-foreground-muted mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No gift cards found</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {search || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first gift card to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGiftCards.map((card) => {
            const statusConfig = STATUS_CONFIG[card.status];
            const usagePercent = ((card.initialAmount - card.currentBalance) / card.initialAmount) * 100;

            return (
              <div key={card.id} className="card p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <code className="text-sm font-mono font-semibold text-foreground bg-[var(--background-tertiary)] px-2 py-1 rounded">
                        {card.code}
                      </code>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-foreground-muted">
                      <span>To: {card.recipientName}</span>
                      <span>From: {card.purchaserName}</span>
                    </div>
                    {card.message && (
                      <p className="mt-1 text-sm text-foreground-muted italic truncate">&quot;{card.message}&quot;</p>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-foreground">{formatCurrency(card.currentBalance)}</span>
                        <span className="text-sm text-foreground-muted">/ {formatCurrency(card.initialAmount)}</span>
                      </div>
                      {card.status !== "active" && card.status !== "expired" && (
                        <div className="mt-1 w-32 h-1.5 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--primary)] rounded-full"
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="text-right text-xs text-foreground-muted hidden sm:block">
                      <p>Purchased: {formatDate(card.purchasedAt)}</p>
                      <p>Expires: {formatDate(card.expiresAt)}</p>
                    </div>

                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenMenuId(openMenuId === card.id ? null : card.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openMenuId === card.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                          <button
                            onClick={() => handleCopyCode(card.code)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                          >
                            <Copy className="h-4 w-4" />
                            Copy Code
                          </button>
                          <button
                            onClick={() => handleResendEmail(card.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                          >
                            <Mail className="h-4 w-4" />
                            Resend Email
                          </button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]">
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                          <button
                            onClick={() => handleDelete(card.id)}
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
