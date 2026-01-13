"use client";

import { useState } from "react";
import {
  Printer,
  Package,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Image,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type PrintStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface PrintOrder {
  id: string;
  orderNumber: string;
  clientName: string;
  clientEmail: string;
  galleryName: string;
  items: {
    name: string;
    size: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: PrintStatus;
  shippingAddress: string;
  trackingNumber: string | null;
  orderedAt: string;
  shippedAt: string | null;
}

const MOCK_ORDERS: PrintOrder[] = [
  {
    id: "1",
    orderNumber: "PRT-001234",
    clientName: "Sarah Johnson",
    clientEmail: "sarah@example.com",
    galleryName: "Johnson Wedding",
    items: [
      { name: "Canvas Print", size: '24x36"', quantity: 1, price: 249 },
      { name: "Photo Print", size: '8x10"', quantity: 5, price: 75 },
    ],
    total: 324,
    status: "processing",
    shippingAddress: "123 Main St, Los Angeles, CA 90001",
    trackingNumber: null,
    orderedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    shippedAt: null,
  },
  {
    id: "2",
    orderNumber: "PRT-001233",
    clientName: "Michael Chen",
    clientEmail: "michael@example.com",
    galleryName: "Chen Family Portraits",
    items: [
      { name: "Metal Print", size: '16x20"', quantity: 2, price: 298 },
      { name: "Photo Print", size: '5x7"', quantity: 10, price: 100 },
    ],
    total: 398,
    status: "shipped",
    shippingAddress: "456 Oak Ave, San Francisco, CA 94102",
    trackingNumber: "1Z999AA10123456784",
    orderedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    shippedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    orderNumber: "PRT-001232",
    clientName: "Emily Davis",
    clientEmail: "emily@example.com",
    galleryName: "Davis Engagement",
    items: [
      { name: "Acrylic Print", size: '20x30"', quantity: 1, price: 349 },
    ],
    total: 349,
    status: "delivered",
    shippingAddress: "789 Pine Rd, Beverly Hills, CA 90210",
    trackingNumber: "1Z999AA10123456785",
    orderedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    shippedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    orderNumber: "PRT-001231",
    clientName: "David Thompson",
    clientEmail: "david@example.com",
    galleryName: "Thompson Corporate Event",
    items: [
      { name: "Photo Print", size: '11x14"', quantity: 25, price: 375 },
    ],
    total: 375,
    status: "pending",
    shippingAddress: "321 Business Blvd, Santa Monica, CA 90401",
    trackingNumber: null,
    orderedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    shippedAt: null,
  },
  {
    id: "5",
    orderNumber: "PRT-001230",
    clientName: "Amanda Wilson",
    clientEmail: "amanda@example.com",
    galleryName: "Wilson Maternity",
    items: [
      { name: "Canvas Print", size: '16x24"', quantity: 2, price: 318 },
      { name: "Photo Print", size: '8x10"', quantity: 8, price: 120 },
    ],
    total: 438,
    status: "cancelled",
    shippingAddress: "555 Maple Dr, Pasadena, CA 91101",
    trackingNumber: null,
    orderedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    shippedAt: null,
  },
];

const STATUS_CONFIG: Record<PrintStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
  processing: { label: "Processing", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
  shipped: { label: "Shipped", color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
  delivered: { label: "Delivered", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
  cancelled: { label: "Cancelled", color: "text-foreground-muted", bg: "bg-[var(--background-tertiary)]" },
};

export function PrintsClient() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<PrintOrder[]>(MOCK_ORDERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PrintStatus | "all">("all");
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.clientName.toLowerCase().includes(search.toLowerCase()) ||
      order.galleryName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (orderId: string, newStatus: PrintStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: newStatus,
              shippedAt: newStatus === "shipped" ? new Date().toISOString() : o.shippedAt,
              trackingNumber: newStatus === "shipped" ? "1Z999AA10123456789" : o.trackingNumber,
            }
          : o
      )
    );
    showToast(`Order marked as ${newStatus}`, "success");
    setOpenMenuId(null);
  };

  const handleDelete = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    showToast("Order deleted", "success");
    setOpenMenuId(null);
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending" || o.status === "processing").length,
    totalRevenue: orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0),
    avgOrderValue: Math.round(
      orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0) /
        orders.filter((o) => o.status !== "cancelled").length
    ),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Orders</p>
            <Package className="h-4 w-4 text-foreground-muted" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalOrders}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Pending Orders</p>
            <Printer className="h-4 w-4 text-[var(--warning)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--warning)]">{stats.pendingOrders}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Total Revenue</p>
            <DollarSign className="h-4 w-4 text-[var(--success)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--success)]">{formatCurrency(stats.totalRevenue)}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">Avg Order Value</p>
            <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--primary)]">{formatCurrency(stats.avgOrderValue)}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PrintStatus | "all")}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Create Order
        </Button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="card p-12 text-center">
          <Printer className="h-12 w-12 text-foreground-muted mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No orders found</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {search || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Print orders will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status];
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <div key={order.id} className="card p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <code className="text-sm font-mono font-semibold text-foreground">
                        {order.orderNumber}
                      </code>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{order.clientName}</span>
                      <span className="text-sm text-foreground-muted">•</span>
                      <span className="text-sm text-foreground-muted">{order.galleryName}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-foreground-muted">
                      <span className="flex items-center gap-1">
                        <Image className="h-3 w-3" />
                        {itemCount} item{itemCount !== 1 ? "s" : ""}
                      </span>
                      <span>Ordered {formatDate(order.orderedAt)}</span>
                      {order.trackingNumber && (
                        <span className="flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          {order.trackingNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{formatCurrency(order.total)}</p>
                      <p className="text-xs text-foreground-muted">{order.items.length} product types</p>
                    </div>

                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openMenuId === order.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]">
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                          {order.status === "pending" && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, "processing")}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                            >
                              <Printer className="h-4 w-4" />
                              Start Processing
                            </button>
                          )}
                          {order.status === "processing" && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, "shipped")}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                            >
                              <Truck className="h-4 w-4" />
                              Mark Shipped
                            </button>
                          )}
                          {order.status === "shipped" && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, "delivered")}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                            >
                              <Package className="h-4 w-4" />
                              Mark Delivered
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(order.id)}
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
