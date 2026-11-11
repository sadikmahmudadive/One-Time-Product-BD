"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { PRODUCTS, priceLabel } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { useAuth } from "@/lib/firebase/auth-context";
import { uploadClientImage } from "@/lib/cloudinary/client";
import {
  getEnquiriesFromFirestore,
  getInventoryFromFirestore,
  getNewsletterSubscriptions,
  getOrdersFromFirestore,
  saveInventoryToFirestore,
  updateEnquiryStatus,
  updateOrderStatus,
  type EnquiryRecord,
  type InventoryRecord,
  type NewsletterSubscription,
  type OrderRecord,
} from "@/lib/firebase/firestore";
import { InvoiceModal } from "./InvoiceModal";
import styles from "./admin.module.css";

type Tab = "overview" | "orders" | "inventory" | "quotes" | "customers" | "media";
type OrderFilter = "all" | OrderRecord["status"];

function formatDate(value: unknown) {
  if (!value || typeof value !== "object" || !("toDate" in value)) return "Just now";
  return (value as { toDate: () => Date }).toDate().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function exportCsv(name: string, rows: Record<string, string | number | null | undefined>[]) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const quote = (val: unknown) => `"${String(val ?? "").replaceAll('"', '""')}"`;
  const csv = [keys.join(","), ...rows.map((row) => keys.map((key) => quote(row[key])).join(","))].join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function AdminDashboard() {
  const { user, logOut } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscription[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<OrderRecord | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextOrders, nextEnquiries, nextSubscribers, nextInventory] = await Promise.all([
        getOrdersFromFirestore(),
        getEnquiriesFromFirestore(),
        getNewsletterSubscriptions(),
        getInventoryFromFirestore(),
      ]);
      setOrders(nextOrders);
      setEnquiries(nextEnquiries);
      setSubscribers(nextSubscribers);
      setInventory(nextInventory);
    } catch {
      setError("Failed to load live data. Please check Firebase permissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived stats
  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const confirmedOrders = orders.filter((o) => o.status === "confirmed");
  const shippedOrders = orders.filter((o) => o.status === "shipped");
  const newQuotes = enquiries.filter((e) => e.status === "new");

  const totalStockUnits = PRODUCTS.reduce((sum, p) => {
    const inv = inventory.find((i) => i.slug === p.slug);
    return sum + (inv?.available ?? 0);
  }, 0);

  const lowStockCount = PRODUCTS.filter((p) => {
    const inv = inventory.find((i) => i.slug === p.slug);
    const available = inv?.available ?? 0;
    const threshold = inv?.lowStockAt ?? 10;
    return available <= threshold;
  }).length;

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = orderFilter === "all" || order.status === orderFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        order.id?.toLowerCase().includes(q) ||
        order.customer.name.toLowerCase().includes(q) ||
        order.customer.phone.includes(q) ||
        order.customer.district.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [orders, orderFilter, search]);

  const customerList = useMemo(() => {
    const map = new Map<
      string,
      { name: string; contact: string; district: string; orders: number; spend: number; lastOrder: unknown }
    >();

    orders.forEach((o) => {
      const key = o.customer.phone || o.customer.email || o.customer.name;
      const curr = map.get(key) ?? {
        name: o.customer.name,
        contact: o.customer.phone || o.customer.email || "—",
        district: o.customer.district,
        orders: 0,
        spend: 0,
        lastOrder: o.createdAt,
      };
      curr.orders += 1;
      curr.spend += o.totalPrice ?? 0;
      map.set(key, curr);
    });

    return Array.from(map.values()).sort((a, b) => b.spend - a.spend);
  }, [orders]);

  async function handleOrderStatusChange(id: string, status: OrderRecord["status"]) {
    try {
      await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      setNotice(`Order #${id.slice(-7).toUpperCase()} marked as ${status}.`);
    } catch {
      setError("Failed to update order status.");
    }
  }

  async function handleEnquiryStatusChange(id: string, status: EnquiryRecord["status"]) {
    try {
      await updateEnquiryStatus(id, status);
      setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
      setNotice("Inquiry status updated.");
    } catch {
      setError("Failed to update inquiry status.");
    }
  }

  async function handleSaveStock(slug: string, available: number, lowStockAt: number, imageUrl?: string) {
    try {
      await saveInventoryToFirestore(slug, available, lowStockAt, imageUrl);
      setInventory((prev) => {
        const filtered = prev.filter((i) => i.slug !== slug);
        return [...filtered, { slug, available, lowStockAt, imageUrl }];
      });
      setNotice("Inventory record saved.");
    } catch {
      setError("Failed to save inventory.");
    }
  }

  return (
    <div className={styles.layout}>
      {/* ---------------- Sidebar Navigation ---------------- */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <Link href="/admin" className={styles.brandLink}>
            <span>ONETIME</span> ERP
          </Link>
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} /> Live
          </span>
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.navGroup}>
            <span className={styles.navHeading}>Core Commerce</span>
            <button
              type="button"
              className={`${styles.navItem} ${tab === "overview" ? styles.activeNavItem : ""}`}
              onClick={() => setTab("overview")}
            >
              <span className={styles.navItemLeft}>📊 Overview & KPIs</span>
            </button>
            <button
              type="button"
              className={`${styles.navItem} ${tab === "orders" ? styles.activeNavItem : ""}`}
              onClick={() => setTab("orders")}
            >
              <span className={styles.navItemLeft}>📦 Fulfilment & Orders</span>
              {pendingOrders.length > 0 && (
                <span className={styles.navBadge}>{pendingOrders.length}</span>
              )}
            </button>
            <button
              type="button"
              className={`${styles.navItem} ${tab === "quotes" ? styles.activeNavItem : ""}`}
              onClick={() => setTab("quotes")}
            >
              <span className={styles.navItemLeft}>💼 B2B Wholesale Leads</span>
              {newQuotes.length > 0 && (
                <span className={styles.navBadge}>{newQuotes.length}</span>
              )}
            </button>
          </div>

          <div className={styles.navGroup}>
            <span className={styles.navHeading}>Supply & Warehouse</span>
            <button
              type="button"
              className={`${styles.navItem} ${tab === "inventory" ? styles.activeNavItem : ""}`}
              onClick={() => setTab("inventory")}
            >
              <span className={styles.navItemLeft}>🏭 Stock & Packaging ERP</span>
              {lowStockCount > 0 && (
                <span className={`${styles.navBadge} ${styles.navBadgeAlert}`}>{lowStockCount}</span>
              )}
            </button>
            <button
              type="button"
              className={`${styles.navItem} ${tab === "media" ? styles.activeNavItem : ""}`}
              onClick={() => setTab("media")}
            >
              <span className={styles.navItemLeft}>☁️ Cloudinary Media Hub</span>
            </button>
          </div>

          <div className={styles.navGroup}>
            <span className={styles.navHeading}>Relationships & CRM</span>
            <button
              type="button"
              className={`${styles.navItem} ${tab === "customers" ? styles.activeNavItem : ""}`}
              onClick={() => setTab("customers")}
            >
              <span className={styles.navItemLeft}>👥 Customers & LTV</span>
            </button>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminUser}>
            <div className={styles.adminAvatar}>
              {(user?.displayName || user?.email || "A")[0].toUpperCase()}
            </div>
            <div className={styles.adminDetails}>
              <p className={styles.adminRole}>Admin Operations</p>
              <p className={styles.adminEmail}>{user?.email}</p>
            </div>
          </div>
          <button type="button" className={styles.logoutBtn} onClick={() => logOut()} title="Sign out">
            ⎋
          </button>
        </div>
      </aside>

      {/* ---------------- Main Content Workspace ---------------- */}
      <div className={styles.mainContainer}>
        {/* Top Header Bar */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <h1 className={styles.pageTitle}>
              {tab === "overview" && "Executive Dashboard"}
              {tab === "orders" && "Order Fulfilment Pipeline"}
              {tab === "inventory" && "Warehouse Inventory & Packaging ERP"}
              {tab === "quotes" && "Wholesale & Custom Quotations"}
              {tab === "customers" && "Customer CRM & Lifetime Value"}
              {tab === "media" && "Cloudinary Media Asset Storage"}
            </h1>
          </div>

          <div className={styles.topBarRight}>
            <button type="button" className={styles.pillBtn} onClick={loadData} disabled={loading}>
              {loading ? "Syncing…" : "🔄 Refresh"}
            </button>
            <Link href="/shop" className={`${styles.pillBtn} ${styles.primaryPill}`} target="_blank">
              ↗ Live Storefront
            </Link>
          </div>
        </header>

        {/* Workspace Body */}
        <main className={styles.content}>
          {error && (
            <div className={`${styles.alertBar} ${styles.alertError}`} role="alert">
              <span>{error}</span>
              <button type="button" onClick={() => setError("")} style={{ border: "none", background: "none", cursor: "pointer" }}>✕</button>
            </div>
          )}

          {notice && (
            <div className={`${styles.alertBar} ${styles.alertSuccess}`} role="status">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice("")} style={{ border: "none", background: "none", cursor: "pointer" }}>✕</button>
            </div>
          )}

          {/* TAB 1: OVERVIEW & KPIS */}
          {tab === "overview" && (
            <OverviewView
              orders={orders}
              revenue={revenue}
              pendingOrders={pendingOrders}
              confirmedOrders={confirmedOrders}
              shippedOrders={shippedOrders}
              totalStockUnits={totalStockUnits}
              lowStockCount={lowStockCount}
              newQuotes={newQuotes}
              setTab={setTab}
              onSelectInvoice={setSelectedInvoice}
            />
          )}

          {/* TAB 2: ORDERS & FULFILMENT */}
          {tab === "orders" && (
            <OrdersView
              orders={filteredOrders}
              allOrders={orders}
              filter={orderFilter}
              setFilter={setOrderFilter}
              search={search}
              setSearch={setSearch}
              onStatusChange={handleOrderStatusChange}
              onSelectInvoice={setSelectedInvoice}
              onExport={() =>
                exportCsv(
                  "otpb-orders",
                  orders.map((o) => ({
                    order_id: o.id,
                    date: formatDate(o.createdAt),
                    customer_name: o.customer.name,
                    phone: o.customer.phone,
                    district: o.customer.district,
                    address: o.customer.address || "",
                    total_amount_bdt: o.totalPrice,
                    status: o.status,
                    items_count: o.items.reduce((acc, i) => acc + i.qty, 0),
                  }))
                )
              }
            />
          )}

          {/* TAB 3: INVENTORY & STOCK ERP */}
          {tab === "inventory" && (
            <InventoryView
              inventory={inventory}
              onSaveStock={handleSaveStock}
              onExport={() =>
                exportCsv(
                  "otpb-inventory",
                  PRODUCTS.map((p) => {
                    const inv = inventory.find((i) => i.slug === p.slug);
                    return {
                      slug: p.slug,
                      product_name: p.name,
                      category: p.category,
                      price: p.price ?? "Pack variant",
                      available_units: inv?.available ?? 0,
                      low_stock_threshold: inv?.lowStockAt ?? 10,
                      status: (inv?.available ?? 0) <= (inv?.lowStockAt ?? 10) ? "LOW" : "OK",
                    };
                  })
                )
              }
            />
          )}

          {/* TAB 4: WHOLESALE B2B QUOTES */}
          {tab === "quotes" && (
            <QuotesView
              enquiries={enquiries}
              onStatusChange={handleEnquiryStatusChange}
              onExport={() =>
                exportCsv(
                  "otpb-quotes",
                  enquiries.map((e) => ({
                    id: e.id,
                    date: formatDate(e.createdAt),
                    kind: e.kind,
                    customer_name: e.data.name || "",
                    phone: e.data.phone || "",
                    email: e.data.email || "",
                    business: e.data.business || "",
                    district: e.data.district || "",
                    products: e.data.products || e.data.message || "",
                    quantity: e.data.quantity || "",
                    status: e.status,
                  }))
                )
              }
            />
          )}

          {/* TAB 5: CUSTOMER CRM */}
          {tab === "customers" && (
            <CustomersView
              customers={customerList}
              subscribers={subscribers}
              onExport={() =>
                exportCsv(
                  "otpb-customers",
                  customerList.map((c) => ({
                    customer_name: c.name,
                    contact: c.contact,
                    district: c.district,
                    total_orders: c.orders,
                    total_spend_bdt: c.spend,
                  }))
                )
              }
            />
          )}

          {/* TAB 6: CLOUDINARY MEDIA HUB */}
          {tab === "media" && <MediaView />}
        </main>
      </div>

      {/* Invoice / Courier Delivery Slip Modal */}
      <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
    </div>
  );
}

/* ==============================================================================
   1. OVERVIEW VIEW
   ============================================================================== */
function OverviewView({
  orders,
  revenue,
  pendingOrders,
  confirmedOrders,
  shippedOrders,
  totalStockUnits,
  lowStockCount,
  newQuotes,
  setTab,
  onSelectInvoice,
}: {
  orders: OrderRecord[];
  revenue: number;
  pendingOrders: OrderRecord[];
  confirmedOrders: OrderRecord[];
  shippedOrders: OrderRecord[];
  totalStockUnits: number;
  lowStockCount: number;
  newQuotes: EnquiryRecord[];
  setTab: (t: Tab) => void;
  onSelectInvoice: (o: OrderRecord) => void;
}) {
  const avgOrder = orders.length > 0 ? revenue / Math.max(orders.length, 1) : 0;

  return (
    <>
      <div className={styles.metricGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Total Realised Revenue</span>
            <div className={styles.metricIcon}>৳</div>
          </div>
          <p className={styles.metricVal}>{formatPrice(revenue)}</p>
          <p className={styles.metricSub}>From confirmed & shipped orders</p>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Average Order Value</span>
            <div className={styles.metricIcon}>📈</div>
          </div>
          <p className={styles.metricVal}>{formatPrice(avgOrder)}</p>
          <p className={styles.metricSub}>Across {orders.length} customer orders</p>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Warehouse Units</span>
            <div className={styles.metricIcon}>📦</div>
          </div>
          <p className={styles.metricVal}>{totalStockUnits.toLocaleString()} pcs</p>
          <p className={styles.metricSub}>
            {lowStockCount > 0 ? (
              <span style={{ color: "#dc2626", fontWeight: 700 }}>
                ⚠️ {lowStockCount} items need restocking
              </span>
            ) : (
              "All inventory above thresholds"
            )}
          </p>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Wholesale Leads</span>
            <div className={styles.metricIcon}>💼</div>
          </div>
          <p className={styles.metricVal}>{newQuotes.length}</p>
          <p className={styles.metricSub}>New quotes awaiting pricing response</p>
        </div>
      </div>

      {/* Operational Action Queues */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20, marginBottom: 26 }}>
        <div className={styles.card} style={{ margin: 0 }}>
          <div className={styles.cardHead}>
            <div>
              <h3 className={styles.cardTitle}>Live Fulfilment Pipeline</h3>
              <p className={styles.cardSub}>Orders awaiting customer confirmation and delivery</p>
            </div>
            <button type="button" className={styles.pillBtn} onClick={() => setTab("orders")}>
              View All Orders →
            </button>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>District</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id}>
                    <td>
                      <strong>#{o.id?.slice(-7).toUpperCase()}</strong>
                      <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{formatDate(o.createdAt)}</div>
                    </td>
                    <td>
                      <div>{o.customer.name}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{o.customer.phone}</div>
                    </td>
                    <td>{o.customer.district}</td>
                    <td>
                      <strong>{o.totalPrice ? formatPrice(o.totalPrice) : "On request"}</strong>
                    </td>
                    <td>
                      <span className={`${styles.statusPill} ${styles["status" + (o.status[0].toUpperCase() + o.status.slice(1))]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.pillBtn}
                        style={{ padding: "4px 8px", fontSize: 12 }}
                        onClick={() => onSelectInvoice(o)}
                      >
                        Slip
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: 36, color: "var(--ink-500)" }}>
                      No orders placed yet. Check out from the storefront to see live orders here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warehouse Low Stock Alerts */}
        <div className={styles.card} style={{ margin: 0 }}>
          <div className={styles.cardHead}>
            <div>
              <h3 className={styles.cardTitle}>Immediate Attention</h3>
              <p className={styles.cardSub}>Pending orders & wholesale quote requests</p>
            </div>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  padding: 16,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 2px", fontSize: 14, color: "#92400e" }}>
                    {pendingOrders.length} Orders Pending Confirmation
                  </h4>
                  <p style={{ margin: 0, fontSize: 12, color: "#78350f" }}>
                    Call customers to confirm delivery district and charges.
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.pillBtn}
                  style={{ background: "#ffffff", borderColor: "#fde68a" }}
                  onClick={() => setTab("orders")}
                >
                  Review
                </button>
              </div>

              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  padding: 16,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 2px", fontSize: 14, color: "#1e40af" }}>
                    {newQuotes.length} Wholesale Quotes
                  </h4>
                  <p style={{ margin: 0, fontSize: 12, color: "#1e3a8a" }}>
                    Caterers and sweet shops awaiting custom B2B pricing.
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.pillBtn}
                  style={{ background: "#ffffff", borderColor: "#bfdbfe" }}
                  onClick={() => setTab("quotes")}
                >
                  Respond
                </button>
              </div>

              {lowStockCount > 0 && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    padding: 16,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <h4 style={{ margin: "0 0 2px", fontSize: 14, color: "#991b1b" }}>
                      {lowStockCount} Products Low on Stock
                    </h4>
                    <p style={{ margin: 0, fontSize: 12, color: "#7f1d1d" }}>
                      Stock on hand is at or below minimum threshold.
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.pillBtn}
                    style={{ background: "#ffffff", borderColor: "#fecaca" }}
                    onClick={() => setTab("inventory")}
                  >
                    Manage
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ==============================================================================
   2. ORDERS & FULFILMENT VIEW
   ============================================================================== */
function OrdersView({
  orders,
  allOrders,
  filter,
  setFilter,
  search,
  setSearch,
  onStatusChange,
  onSelectInvoice,
  onExport,
}: {
  orders: OrderRecord[];
  allOrders: OrderRecord[];
  filter: OrderFilter;
  setFilter: (f: OrderFilter) => void;
  search: string;
  setSearch: (s: string) => void;
  onStatusChange: (id: string, s: OrderRecord["status"]) => void;
  onSelectInvoice: (o: OrderRecord) => void;
  onExport: () => void;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardTitle}>Commercial Orders</h3>
          <p className={styles.cardSub}>
            Manage courier tracking, invoices, and payment confirmation.
          </p>
        </div>
        <div className={styles.cardActions}>
          <button type="button" className={styles.pillBtn} onClick={onExport} disabled={!allOrders.length}>
            📥 Export CSV
          </button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            placeholder="Search order ID, phone, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          {(["all", "pending", "confirmed", "shipped", "cancelled"] as OrderFilter[]).map((st) => (
            <button
              key={st}
              type="button"
              className={`${styles.filterBtn} ${filter === st ? styles.activeFilterBtn : ""}`}
              onClick={() => setFilter(st)}
            >
              {st === "all" ? `All (${allOrders.length})` : st[0].toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID & Date</th>
              <th>Customer Information</th>
              <th>Destination</th>
              <th>Items & Pack Quantities</th>
              <th>Total Amount</th>
              <th>Fulfilment Status</th>
              <th>Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const digitsOnly = o.customer.phone.replace(/\D/g, "");
              const waLink = `https://wa.me/88${digitsOnly.startsWith("0") ? digitsOnly.slice(1) : digitsOnly}?text=${encodeURIComponent(
                `Hello ${o.customer.name}, regarding your One Time Product BD order #${o.id?.slice(-7).toUpperCase()}...`
              )}`;

              return (
                <tr key={o.id}>
                  <td>
                    <strong>#{o.id?.slice(-7).toUpperCase()}</strong>
                    <div style={{ fontSize: 11, color: "var(--ink-500)", marginTop: 2 }}>
                      {formatDate(o.createdAt)}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{o.customer.name}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-700)" }}>{o.customer.phone}</div>
                    {o.customer.email && (
                      <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{o.customer.email}</div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{o.customer.district}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-500)", maxWidth: 160 }}>
                      {o.customer.address || "Standard delivery"}
                    </div>
                  </td>
                  <td>
                    <details>
                      <summary style={{ cursor: "pointer", color: "var(--brand-700)", fontWeight: 600 }}>
                        {o.items.reduce((sum, i) => sum + i.qty, 0)} pcs in {o.items.length} items
                      </summary>
                      <ul style={{ margin: "6px 0 0", paddingLeft: 16, fontSize: 12, color: "var(--ink-700)" }}>
                        {o.items.map((item, idx) => (
                          <li key={`${item.slug}-${idx}`}>
                            {item.qty} × {item.name} {item.variantLabel ? `(${item.variantLabel})` : ""}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </td>
                  <td>
                    <strong style={{ fontSize: 15 }}>
                      {o.totalPrice ? formatPrice(o.totalPrice) : "On request"}
                    </strong>
                  </td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => o.id && onStatusChange(o.id, e.target.value as OrderRecord["status"])}
                      style={{
                        padding: "5px 8px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        border: "1px solid var(--line-300)",
                        background: "#fff",
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        className={styles.pillBtn}
                        style={{ padding: "4px 8px", fontSize: 12 }}
                        onClick={() => onSelectInvoice(o)}
                        title="Print courier slip"
                      >
                        🖨️ Slip
                      </button>
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.pillBtn}
                        style={{ padding: "4px 8px", fontSize: 12, color: "#166534" }}
                        title="Chat on WhatsApp"
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 48, color: "var(--ink-500)" }}>
                  No matching orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ==============================================================================
   3. INVENTORY & WAREHOUSE ERP
   ============================================================================== */
function InventoryView({
  inventory,
  onSaveStock,
  onExport,
}: {
  inventory: InventoryRecord[];
  onSaveStock: (slug: string, available: number, lowStockAt: number, imageUrl?: string) => Promise<void>;
  onExport: () => void;
}) {
  const [search, setSearch] = useState("");
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploadingSlug, setUploadingSlug] = useState<string | null>(null);

  const filtered = PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  async function handleFileUpload(slug: string, file: File) {
    setUploadingSlug(slug);
    try {
      const result = await uploadClientImage(file);
      const inv = inventory.find((i) => i.slug === slug);
      const available = inv?.available ?? 0;
      const lowStockAt = inv?.lowStockAt ?? 10;
      await onSaveStock(slug, available, lowStockAt, result.secureUrl);
    } catch (err) {
      alert("Failed to upload image to Cloudinary: " + (err as Error).message);
    } finally {
      setUploadingSlug(null);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardTitle}>Warehouse Stock & Packaging Control</h3>
          <p className={styles.cardSub}>
            Live inventory counts in Firestore, stock threshold alerts, and Cloudinary product photos.
          </p>
        </div>
        <div className={styles.cardActions}>
          <button type="button" className={styles.pillBtn} onClick={onExport}>
            📥 Export Stock CSV
          </button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            placeholder="Search by product name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span style={{ fontSize: 13, color: "var(--ink-500)" }}>
          Showing {filtered.length} products
        </span>
      </div>

      <div className={styles.productGrid}>
        {filtered.map((p) => {
          const inv = inventory.find((i) => i.slug === p.slug);
          const currentImg = inv?.imageUrl || p.image;
          const available = inv?.available ?? 0;
          const lowStockAt = inv?.lowStockAt ?? 10;
          const isLow = available <= lowStockAt;

          return (
            <ProductInventoryCard
              key={p.slug}
              product={p}
              inventoryRecord={inv}
              currentImg={currentImg}
              isLow={isLow}
              isUploading={uploadingSlug === p.slug}
              onSave={(avail, low) => onSaveStock(p.slug, avail, low, currentImg)}
              onPickPhoto={() => fileInputs.current[p.slug]?.click()}
              fileInputRef={(el) => {
                fileInputs.current[p.slug] = el;
              }}
              onFileChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(p.slug, file);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function ProductInventoryCard({
  product,
  inventoryRecord,
  currentImg,
  isLow,
  isUploading,
  onSave,
  onPickPhoto,
  fileInputRef,
  onFileChange,
}: {
  product: (typeof PRODUCTS)[0];
  inventoryRecord?: InventoryRecord;
  currentImg?: string;
  isLow: boolean;
  isUploading: boolean;
  onSave: (avail: number, low: number) => void;
  onPickPhoto: () => void;
  fileInputRef: (el: HTMLInputElement | null) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [available, setAvailable] = useState(inventoryRecord?.available ?? 0);
  const [threshold, setThreshold] = useState(inventoryRecord?.lowStockAt ?? 10);

  useEffect(() => {
    setAvailable(inventoryRecord?.available ?? 0);
    setThreshold(inventoryRecord?.lowStockAt ?? 10);
  }, [inventoryRecord]);

  return (
    <article className={styles.productCard}>
      <div className={styles.productMediaRow}>
        <div className={styles.productThumb}>
          {currentImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentImg} alt={product.name} />
          ) : (
            <span style={{ fontSize: 24 }}>📦</span>
          )}
          <div className={styles.uploadPhotoTrigger} onClick={onPickPhoto}>
            {isUploading ? "Uploading…" : "📸 Change"}
          </div>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={onFileChange}
          />
        </div>

        <div className={styles.productMeta}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-700)", textTransform: "uppercase" }}>
            {product.category.replace("-", " ")}
          </span>
          <h4 className={styles.productTitle} title={product.name}>
            {product.name}
          </h4>
          <p className={styles.productPrice}>{priceLabel(product)}</p>
        </div>
      </div>

      <div className={styles.stockControlBox}>
        <div className={styles.stockNumbers}>
          <div className={styles.stockFieldGroup}>
            <span className={styles.stockFieldLabel}>In Stock</span>
            <input
              type="number"
              min="0"
              className={styles.stockInput}
              value={available}
              onChange={(e) => setAvailable(Math.max(0, Number(e.target.value)))}
            />
          </div>

          <div className={styles.stockFieldGroup}>
            <span className={styles.stockFieldLabel}>Alert At</span>
            <input
              type="number"
              min="0"
              className={styles.stockInput}
              value={threshold}
              onChange={(e) => setThreshold(Math.max(0, Number(e.target.value)))}
            />
          </div>

          <div className={styles.quickAdjust}>
            <button
              type="button"
              className={styles.adjustBtn}
              onClick={() => setAvailable((v) => v + 10)}
            >
              +10
            </button>
            <button
              type="button"
              className={styles.adjustBtn}
              onClick={() => setAvailable((v) => Math.max(0, v - 10))}
            >
              -10
            </button>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <span className={`${styles.statusPill} ${isLow ? styles.statusCancelled : styles.statusShipped}`}>
            {isLow ? "⚠️ Low Stock" : "✓ Ample Stock"}
          </span>
          <button
            type="button"
            className={`${styles.pillBtn} ${styles.primaryPill}`}
            style={{ padding: "4px 10px", fontSize: 12 }}
            onClick={() => onSave(available, threshold)}
          >
            Save
          </button>
        </div>
      </div>
    </article>
  );
}

/* ==============================================================================
   4. B2B WHOLESALE QUOTES VIEW
   ============================================================================== */
function QuotesView({
  enquiries,
  onStatusChange,
  onExport,
}: {
  enquiries: EnquiryRecord[];
  onStatusChange: (id: string, s: EnquiryRecord["status"]) => void;
  onExport: () => void;
}) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = enquiries.filter((e) => (filter === "all" ? true : e.status === filter));

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardTitle}>B2B Wholesale & Custom Quote Requests</h3>
          <p className={styles.cardSub}>
            Direct inquiries from sweet shops, bakeries, and catering businesses across Bangladesh.
          </p>
        </div>
        <div className={styles.cardActions}>
          <button type="button" className={styles.pillBtn} onClick={onExport} disabled={!enquiries.length}>
            📥 Export CSV
          </button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          {["all", "new", "in_progress", "completed", "archived"].map((st) => (
            <button
              key={st}
              type="button"
              className={`${styles.filterBtn} ${filter === st ? styles.activeFilterBtn : ""}`}
              onClick={() => setFilter(st)}
            >
              {st === "all" ? `All (${enquiries.length})` : st.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date & Type</th>
              <th>Customer & Company</th>
              <th>Contact Details</th>
              <th>Requested Products & Quantity</th>
              <th>District</th>
              <th>Status</th>
              <th>Direct Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => {
              const phone = e.data.phone || "";
              const digits = phone.replace(/\D/g, "");
              const wa = `https://wa.me/88${digits.startsWith("0") ? digits.slice(1) : digits}?text=${encodeURIComponent(
                `Hello ${e.data.name || ""}, regarding your One Time Product BD quote request for ${e.data.products || "packaging"}...`
              )}`;

              return (
                <tr key={e.id}>
                  <td>
                    <span className={`${styles.statusPill} ${e.kind === "quote" ? styles.statusNew : styles.statusConfirmed}`}>
                      {e.kind === "quote" ? "Wholesale Quote" : "Contact Msg"}
                    </span>
                    <div style={{ fontSize: 11, color: "var(--ink-500)", marginTop: 4 }}>
                      {formatDate(e.createdAt)}
                    </div>
                  </td>
                  <td>
                    <strong>{e.data.name || "Unnamed"}</strong>
                    {e.data.business && (
                      <div style={{ fontSize: 12, color: "var(--brand-700)" }}>🏢 {e.data.business}</div>
                    )}
                  </td>
                  <td>
                    <div>{phone || "—"}</div>
                    {e.data.email && <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{e.data.email}</div>}
                  </td>
                  <td style={{ maxWidth: 280 }}>
                    <div style={{ fontWeight: 600 }}>{e.data.products || e.data.message || "—"}</div>
                    {e.data.quantity && (
                      <div style={{ fontSize: 12, color: "var(--ink-700)" }}>
                        Quantity: <strong>{e.data.quantity}</strong>
                      </div>
                    )}
                    {e.data.notes && (
                      <div style={{ fontSize: 11, color: "var(--ink-500)", fontStyle: "italic", marginTop: 2 }}>
                        &quot;{e.data.notes}&quot;
                      </div>
                    )}
                  </td>
                  <td>{e.data.district || "—"}</td>
                  <td>
                    <select
                      value={e.status}
                      onChange={(evt) => e.id && onStatusChange(e.id, evt.target.value as EnquiryRecord["status"])}
                      style={{
                        padding: "5px 8px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        border: "1px solid var(--line-300)",
                        background: "#fff",
                      }}
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td>
                    {phone && (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.pillBtn}
                        style={{ color: "#166534", padding: "4px 8px", fontSize: 12 }}
                      >
                        💬 Reply on WhatsApp
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 48, color: "var(--ink-500)" }}>
                  No quote inquiries in this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ==============================================================================
   5. CUSTOMERS & CRM VIEW
   ============================================================================== */
function CustomersView({
  customers,
  subscribers,
  onExport,
}: {
  customers: { name: string; contact: string; district: string; orders: number; spend: number }[];
  subscribers: NewsletterSubscription[];
  onExport: () => void;
}) {
  return (
    <>
      <div className={styles.metricGrid} style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Total Commercial Clients</span>
            <div className={styles.metricIcon}>👥</div>
          </div>
          <p className={styles.metricVal}>{customers.length}</p>
          <p className={styles.metricSub}>Active accounts who ordered packaging</p>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Repeat Order Customers</span>
            <div className={styles.metricIcon}>🔁</div>
          </div>
          <p className={styles.metricVal}>{customers.filter((c) => c.orders > 1).length}</p>
          <p className={styles.metricSub}>Placed multiple recurring orders</p>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Newsletter Subscribers</span>
            <div className={styles.metricIcon}>📬</div>
          </div>
          <p className={styles.metricVal}>{subscribers.length}</p>
          <p className={styles.metricSub}>Subscribed via footer</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h3 className={styles.cardTitle}>Customer Accounts & Spend LTV</h3>
            <p className={styles.cardSub}>Track top buyers, geographic reach, and recurring volume.</p>
          </div>
          <div className={styles.cardActions}>
            <button type="button" className={styles.pillBtn} onClick={onExport} disabled={!customers.length}>
              📥 Export Customer Directory
            </button>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone / Email</th>
                <th>Primary Location</th>
                <th>Orders Count</th>
                <th>Lifetime Spend (BDT)</th>
                <th>Client Tier</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.contact}>
                  <td>
                    <strong>{c.name}</strong>
                  </td>
                  <td>{c.contact}</td>
                  <td>{c.district}</td>
                  <td>
                    <span className={styles.navBadge} style={{ background: "#e2e8f0", color: "#1e293b" }}>
                      {c.orders} orders
                    </span>
                  </td>
                  <td>
                    <strong>{formatPrice(c.spend)}</strong>
                  </td>
                  <td>
                    {c.spend > 5000 ? (
                      <span className={`${styles.statusPill} ${styles.statusShipped}`}>VIP Client</span>
                    ) : c.orders > 1 ? (
                      <span className={`${styles.statusPill} ${styles.statusConfirmed}`}>Repeat Buyer</span>
                    ) : (
                      <span className={`${styles.statusPill} ${styles.statusNew}`}>New Buyer</span>
                    )}
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 48, color: "var(--ink-500)" }}>
                    No customer accounts yet. Orders placed will automatically generate customer CRM records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ==============================================================================
   6. CLOUDINARY MEDIA HUB VIEW
   ============================================================================== */
function MediaView() {
  const [uploads, setUploads] = useState<{ url: string; publicId: string; name: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  async function handleDirectUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadClientImage(file);
      setUploads((prev) => [{ url: res.secureUrl, publicId: res.publicId, name: file.name }, ...prev]);
    } catch (err) {
      alert("Failed to upload: " + (err as Error).message);
    } finally {
      setIsUploading(false);
    }
  }

  function copyToClipboard(url: string) {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardTitle}>Cloudinary Direct Media Asset Storage</h3>
          <p className={styles.cardSub}>
            Upload packaging photography, warehouse banners, and product shots directly to your Cloudinary cloud.
          </p>
        </div>
        <div>
          <label className={`${styles.pillBtn} ${styles.primaryPill}`} style={{ cursor: "pointer" }}>
            {isUploading ? "Uploading to Cloudinary…" : "☁️ Upload New Asset"}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleDirectUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      <div style={{ padding: 28 }}>
        {uploads.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", border: "2px dashed var(--line-300)", borderRadius: 16 }}>
            <span style={{ fontSize: 42 }}>☁️</span>
            <h4 style={{ margin: "14px 0 6px", fontSize: 16 }}>No recent session uploads</h4>
            <p style={{ margin: 0, fontSize: 13, color: "var(--ink-500)", maxWidth: 440, marginInline: "auto" }}>
              Click &quot;Upload New Asset&quot; to push packaging photographs or banners directly to Cloudinary folder <code style={{ background: "#eee", padding: "2px 6px", borderRadius: 4 }}>one-time-product-bd</code>.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
            {uploads.map((u) => (
              <div
                key={u.publicId}
                style={{
                  border: "1px solid var(--line-200)",
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#ffffff",
                }}
              >
                <div style={{ height: 160, background: "#f8faf8", overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u.url} alt={u.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: 12 }}>
                  <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {u.name}
                  </p>
                  <p style={{ margin: "0 0 10px", fontSize: 11, color: "var(--ink-500)", wordBreak: "break-all" }}>
                    {u.publicId}
                  </p>
                  <button
                    type="button"
                    className={styles.pillBtn}
                    style={{ width: "100%", justifyContent: "center", fontSize: 12 }}
                    onClick={() => copyToClipboard(u.url)}
                  >
                    {copiedUrl === u.url ? "✓ Copied URL!" : "Copy URL"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
