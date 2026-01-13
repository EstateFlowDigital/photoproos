"use client";

import * as React from "react";
import {
  Search,
  ShoppingCart,
  DollarSign,
  Mail,
  Clock,
  Eye,
  Send,
  Trash2,
  MoreHorizontal,
  RefreshCw,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AbandonedCart {
  id: string;
  client: string;
  email: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  cartTotal: number;
  status: "abandoned" | "email_sent" | "recovered" | "lost";
  abandonedAt: string;
  lastEmailSent: string | null;
  recoveredAt: string | null;
}

const mockCarts: AbandonedCart[] = [
  {
    id: "1",
    client: "Sarah Anderson",
    email: "sarah@email.com",
    items: [
      { name: "Digital Download Package", quantity: 1, price: 299 },
      { name: "Print Credits", quantity: 2, price: 50 },
    ],
    cartTotal: 399,
    status: "abandoned",
    abandonedAt: "2024-01-22T14:30:00Z",
    lastEmailSent: null,
    recoveredAt: null,
  },
  {
    id: "2",
    client: "Mike Thompson",
    email: "mike@company.com",
    items: [
      { name: "Premium Album", quantity: 1, price: 850 },
    ],
    cartTotal: 850,
    status: "email_sent",
    abandonedAt: "2024-01-21T10:00:00Z",
    lastEmailSent: "2024-01-21T12:00:00Z",
    recoveredAt: null,
  },
  {
    id: "3",
    client: "Emily Davis",
    email: "emily@example.com",
    items: [
      { name: "Wall Art Canvas", quantity: 1, price: 450 },
      { name: "Mini Session Booking", quantity: 1, price: 250 },
    ],
    cartTotal: 700,
    status: "recovered",
    abandonedAt: "2024-01-20T16:00:00Z",
    lastEmailSent: "2024-01-20T18:00:00Z",
    recoveredAt: "2024-01-21T09:30:00Z",
  },
  {
    id: "4",
    client: "James Wilson",
    email: "james@business.com",
    items: [
      { name: "Photo Book", quantity: 2, price: 125 },
    ],
    cartTotal: 250,
    status: "lost",
    abandonedAt: "2024-01-15T11:00:00Z",
    lastEmailSent: "2024-01-18T11:00:00Z",
    recoveredAt: null,
  },
  {
    id: "5",
    client: "Lisa Brown",
    email: "lisa@email.com",
    items: [
      { name: "Lightroom Preset Pack", quantity: 1, price: 79 },
      { name: "Education Course", quantity: 1, price: 199 },
    ],
    cartTotal: 278,
    status: "email_sent",
    abandonedAt: "2024-01-22T09:00:00Z",
    lastEmailSent: "2024-01-22T11:00:00Z",
    recoveredAt: null,
  },
];

const statusConfig = {
  abandoned: { label: "Abandoned", icon: ShoppingCart, color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  email_sent: { label: "Email Sent", icon: Mail, color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  recovered: { label: "Recovered", icon: CheckCircle, color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  lost: { label: "Lost", icon: XCircle, color: "text-[var(--error)]", bg: "bg-[var(--error)]/10" },
};

export function AbandonedCartsClient() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const filteredCarts = mockCarts.filter((cart) => {
    const matchesSearch =
      cart.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cart.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || cart.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalValue: mockCarts.filter(c => c.status !== "recovered").reduce((acc, c) => acc + c.cartTotal, 0),
    recovered: mockCarts.filter((c) => c.status === "recovered").reduce((acc, c) => acc + c.cartTotal, 0),
    pending: mockCarts.filter((c) => c.status === "abandoned" || c.status === "email_sent").length,
    recoveryRate: Math.round(
      (mockCarts.filter((c) => c.status === "recovered").length / mockCarts.length) * 100
    ),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getTimeSince = (date: string) => {
    const now = new Date();
    const abandoned = new Date(date);
    const hours = Math.floor((now.getTime() - abandoned.getTime()) / (1000 * 60 * 60));
    if (hours < 24) return hours + " hours ago";
    const days = Math.floor(hours / 24);
    return days + " days ago";
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--warning)]/10">
              <ShoppingCart className="w-5 h-5 text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">At Risk Value</p>
              <p className="text-2xl font-semibold">{formatCurrency(stats.totalValue)}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--success)]/10">
              <DollarSign className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Recovered</p>
              <p className="text-2xl font-semibold">{formatCurrency(stats.recovered)}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--info)]/10">
              <Clock className="w-5 h-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Pending Recovery</p>
              <p className="text-2xl font-semibold">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary)]/10">
              <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Recovery Rate</p>
              <p className="text-2xl font-semibold">{stats.recoveryRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
          <input
            type="text"
            placeholder="Search by client or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="all">All Status</option>
            <option value="abandoned">Abandoned</option>
            <option value="email_sent">Email Sent</option>
            <option value="recovered">Recovered</option>
            <option value="lost">Lost</option>
          </select>
          <button
            onClick={() =>
              toast({
                title: "Send Recovery Emails",
                description: "Sending emails to all abandoned carts...",
              })
            }
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
            Recover All
          </button>
        </div>
      </div>

      {/* Abandoned Carts Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--background-tertiary)] border-b border-[var(--border)]">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Client</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Items</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Cart Value</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Abandoned</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-[var(--foreground-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredCarts.map((cart) => {
              const status = statusConfig[cart.status];
              const StatusIcon = status.icon;

              return (
                <tr key={cart.id} className="hover:bg-[var(--background-tertiary)] transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{cart.client}</p>
                      <p className="text-sm text-[var(--foreground-muted)]">{cart.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {cart.items.map((item, index) => (
                        <p key={index} className="text-sm">
                          {item.quantity}x {item.name}
                        </p>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold">{formatCurrency(cart.cartTotal)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={"inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium " + status.color + " " + status.bg}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm">{getTimeSince(cart.abandonedAt)}</p>
                      {cart.lastEmailSent && (
                        <p className="text-xs text-[var(--foreground-muted)]">
                          Email sent {formatDate(cart.lastEmailSent)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative flex justify-end">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === cart.id ? null : cart.id)}
                        className="p-1 hover:bg-[var(--background-elevated)] rounded transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenuId === cart.id && (
                        <div className="absolute right-0 top-8 w-44 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => {
                              toast({ title: "View Cart", description: "Opening cart details..." });
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background-tertiary)] transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          {cart.status !== "recovered" && cart.status !== "lost" && (
                            <button
                              onClick={() => {
                                toast({ title: "Email Sent", description: "Recovery email sent to " + cart.email });
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
                            >
                              <Send className="w-4 h-4" />
                              Send Recovery Email
                            </button>
                          )}
                          {cart.status !== "recovered" && (
                            <button
                              onClick={() => {
                                toast({ title: "Marked Recovered", description: "Cart marked as recovered" });
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--success)] hover:bg-[var(--success)]/10 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Mark Recovered
                            </button>
                          )}
                          <button
                            onClick={() => {
                              toast({
                                title: "Dismissed",
                                description: "Cart dismissed from tracking",
                              });
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredCarts.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 mx-auto text-[var(--foreground-muted)] mb-4" />
            <h3 className="text-lg font-medium mb-2">No abandoned carts found</h3>
            <p className="text-[var(--foreground-muted)]">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Abandoned carts will appear here for recovery"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
