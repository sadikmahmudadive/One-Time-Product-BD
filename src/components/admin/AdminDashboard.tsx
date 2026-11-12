"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { PRODUCTS } from "@/lib/catalog";
import { ENQUIRY_STATUSES, exportCsv, formatDate } from "@/lib/admin-utils";
import type { EnquiryStatus, OrderStatus } from "@/lib/admin-utils";
import { useAuth } from "@/lib/firebase/auth-context";
import { DEMO_ORDERS, DEMO_QUOTES, DEMO_SUBSCRIBERS } from "@/lib/mock-admin-data";
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
import { Avatar, Icon } from "./ui";
import type { IconName } from "./ui";
import { CustomersView } from "./views/CustomersView";
import { InventoryView, stockHealth } from "./views/InventoryView";
import { MediaView } from "./views/MediaView";
import { OrdersView } from "./views/OrdersView";
import type { OrderFilter } from "./views/OrdersView";
import { OverviewView } from "./views/OverviewView";
import { QuotesView } from "./views/QuotesView";
import { TABS } from "./views/types";
import type { StockSummary, Tab } from "./views/types";
import styles from "./admin.module.css";

interface Toast {
  id: number;
  tone: "success" | "error";
  text: string;
}

const NAV: { heading: string; items: { tab: Tab; label: string; icon: IconName }[] }[] = [
  {
    heading: "Operations",
    items: [
      { tab: "overview", label: "Overview", icon: "overview" },
      { tab: "orders", label: "Orders", icon: "orders" },
      { tab: "quotes", label: "Quotes & messages", icon: "quotes" },
    ],
  },
  {
    heading: "Catalogue",
    items: [
      { tab: "inventory", label: "Inventory", icon: "inventory" },
      { tab: "media", label: "Media", icon: "media" },
    ],
  },
  { heading: "People", items: [{ tab: "customers", label: "Customers", icon: "customers" }] },
];

const TITLES: Record<Tab, string> = {
  overview: "Overview",
  orders: "Orders",
  quotes: "Quotes & messages",
  inventory: "Inventory",
  media: "Media",
  customers: "Customers",
};

const FIRESTORE_RULES_SNIPPET = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && 
        ('email' in request.auth.token) &&
        (
          request.auth.token.email.lower() in [
            'onetimeproductbd@gmail.com',
            'siradive137@gmail.com',
            'vertexhand@gmail.com'
          ] ||
          request.auth.token.email in [
            'onetimeproductbd@gmail.com',
            'siradive137@gmail.com',
            'vertexhand@gmail.com'
          ]
        );
    }
    match /orders/{orderId} {
      allow create: if true;
      allow read, update, delete: if isAdmin() || (request.auth != null && resource.data.userId == request.auth.uid);
    }
    match /enquiries/{enquiryId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }
    match /subscribers/{subscriberId} {
      allow create: if true;
      allow read, write: if isAdmin();
    }
    match /inventory/{slug} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}`;

function tabFromHash(): Tab {
  const hash = window.location.hash.replace("#", "") as Tab;
  return TABS.includes(hash) ? hash : "overview";
}

export function AdminDashboard() {
  const { user, logOut } = useAuth();
  const [tab, setTabState] = useState<Tab>("overview");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscription[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);
  const [syncedAt, setSyncedAt] = useState<Date | null>(null);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [slipOrder, setSlipOrder] = useState<OrderRecord | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const mainRef = useRef<HTMLElement>(null);
  const toastId = useRef(0);

  /* ---------- Navigation (kept in the URL hash so refresh and links land on the same section) ---------- */
  const setTab = useCallback((next: Tab) => {
    setTabState(next);
    setNavOpen(false);
    window.history.replaceState(null, "", `#${next}`);
    mainRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    setTabState(tabFromHash());
    const onHash = () => setTabState(tabFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNavOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  /* ---------- Toasts ---------- */
  const notify = useCallback((tone: Toast["tone"], text: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-3), { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 7000 : 3800);
  }, []);

  /* ---------- Data ---------- */
  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const results = await Promise.allSettled([getOrdersFromFirestore(), getEnquiriesFromFirestore(), getNewsletterSubscriptions(), getInventoryFromFirestore()]);
    const [ordersRes, enquiriesRes, subscribersRes, inventoryRes] = results;
    const failed: string[] = [];
    const reason = (r: PromiseRejectedResult) => (r.reason as { code?: string; message?: string })?.code || (r.reason as Error)?.message || "error";

    if (ordersRes.status === "fulfilled") setOrders(ordersRes.value);
    else failed.push(`orders (${reason(ordersRes)})`);
    if (enquiriesRes.status === "fulfilled") setEnquiries(enquiriesRes.value);
    else failed.push(`quotes (${reason(enquiriesRes)})`);
    if (subscribersRes.status === "fulfilled") setSubscribers(subscribersRes.value);
    else failed.push(`subscribers (${reason(subscribersRes)})`);
    if (inventoryRes.status === "fulfilled") setInventory(inventoryRes.value);
    else failed.push(`inventory (${reason(inventoryRes)})`);

    if (failed.length) {
      setLoadError(`Couldn’t load ${failed.join(", ")}. Check that your Firestore security rules are published and this account is an approved admin.`);
    } else {
      setIsDemoMode(false);
    }
    setSyncedAt(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ---------- Derived ---------- */
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const newQuotes = enquiries.filter((e) => e.status === "new").length;

  const stock = useMemo<StockSummary>(() => {
    const bySlug = new Map(inventory.map((i) => [i.slug, i]));
    const s: StockSummary = { tracked: 0, total: PRODUCTS.length, out: 0, low: 0, healthy: 0 };
    for (const p of PRODUCTS) {
      const h = stockHealth(bySlug.get(p.slug));
      if (h !== "untracked") s.tracked += 1;
      if (h === "out") s.out += 1;
      else if (h === "low") s.low += 1;
      else if (h === "healthy") s.healthy += 1;
    }
    return s;
  }, [inventory]);
  const stockAlerts = stock.out + stock.low;

  /* ---------- Mutations ---------- */
  async function changeOrderStatus(id: string, status: OrderStatus) {
    const previous = orders;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    if (isDemoMode) {
      notify("success", `[Demo] Order #${id.slice(-7).toUpperCase()} marked ${status}.`);
      return;
    }
    try {
      await updateOrderStatus(id, status);
      notify("success", `Order #${id.slice(-7).toUpperCase()} marked ${status}.`);
    } catch {
      setOrders(previous);
      notify("error", "Couldn’t update the order. Check your connection and permissions.");
    }
  }

  async function changeEnquiryStatus(id: string, status: EnquiryStatus) {
    const previous = enquiries;
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    if (isDemoMode) {
      notify("success", `[Demo] Marked ${ENQUIRY_STATUSES.find((s) => s.value === status)?.label.toLowerCase() ?? status}.`);
      return;
    }
    try {
      await updateEnquiryStatus(id, status);
      notify("success", `Marked ${ENQUIRY_STATUSES.find((s) => s.value === status)?.label.toLowerCase() ?? status}.`);
    } catch {
      setEnquiries(previous);
      notify("error", "Couldn’t update the request. It has been put back to its previous status.");
    }
  }

  async function saveStock(slug: string, available: number, lowStockAt: number, imageUrl?: string) {
    try {
      await saveInventoryToFirestore(slug, available, lowStockAt, imageUrl);
      setInventory((prev) => [...prev.filter((i) => i.slug !== slug), { slug, available, lowStockAt, imageUrl }]);
      notify("success", "Inventory saved.");
    } catch (err) {
      notify("error", "Couldn’t save inventory. Check your connection and permissions.");
      throw err;
    }
  }

  /* ---------- Exports ---------- */
  const exportOrders = () =>
    exportCsv(
      "otpb-orders",
      orders.map((o) => ({
        order_id: o.id,
        date: formatDate(o.createdAt),
        customer_name: o.customer.name,
        phone: o.customer.phone,
        district: o.customer.district,
        address: o.customer.address || "",
        total_bdt: o.totalPrice,
        status: o.status,
        pieces: o.items.reduce((acc, i) => acc + i.qty, 0),
      }))
    );

  const exportInventory = () =>
    exportCsv(
      "otpb-inventory",
      PRODUCTS.map((p) => {
        const inv = inventory.find((i) => i.slug === p.slug);
        return {
          slug: p.slug,
          product: p.name,
          category: p.category,
          available_units: inv?.available ?? "",
          alert_at: inv?.lowStockAt ?? "",
          status: stockHealth(inv),
        };
      })
    );

  const exportQuotes = () =>
    exportCsv(
      "otpb-quotes",
      enquiries.map((e) => ({
        id: e.id,
        date: formatDate(e.createdAt),
        kind: e.kind,
        name: e.data.name || "",
        phone: e.data.phone || "",
        email: e.data.email || "",
        business: e.data.business || "",
        district: e.data.district || "",
        request: e.data.products || e.data.message || "",
        quantity: e.data.quantity || "",
        status: e.status,
      }))
    );

  /* ---------- Cross-view shortcuts ---------- */
  const goTo = useCallback(
    (next: Tab, filter?: OrderStatus) => {
      if (next === "orders") setOrderFilter(filter ?? "all");
      setTab(next);
    },
    [setTab]
  );
  const openOrder = useCallback(
    (id: string) => {
      setTab("orders");
      setOrderFilter("all");
      setOpenOrderId(id);
    },
    [setTab]
  );

  const badge = (t: Tab): { count: number; alert?: boolean } | null => {
    if (t === "orders" && pendingOrders) return { count: pendingOrders };
    if (t === "quotes" && newQuotes) return { count: newQuotes };
    if (t === "inventory" && stockAlerts) return { count: stockAlerts, alert: true };
    return null;
  };

  const name = user?.displayName || user?.email || "Admin";

  return (
    <div className={styles.shell}>
      {navOpen && <button type="button" className={styles.navScrim} aria-label="Close menu" onClick={() => setNavOpen(false)} tabIndex={-1} />}

      <aside className={`${styles.sidebar} ${navOpen ? styles.sidebarOpen : ""}`} aria-label="Admin navigation">
        <div className={styles.sidebarTop}>
          <Link href="/" className={styles.brand} aria-label="One Time Product BD storefront">
            <Logo tone="dark" knockout="var(--brand-950)" size={21} />
          </Link>
          <span className={styles.envTag}>Operations</span>
        </div>

        <nav className={styles.nav}>
          {NAV.map((group) => (
            <div key={group.heading} className={styles.navGroup}>
              <p className={styles.navHeading}>{group.heading}</p>
              {group.items.map((item) => {
                const b = badge(item.tab);
                return (
                  <button
                    key={item.tab}
                    type="button"
                    className={`${styles.navItem} ${tab === item.tab ? styles.navItemOn : ""}`}
                    aria-current={tab === item.tab ? "page" : undefined}
                    onClick={() => setTab(item.tab)}
                  >
                    <Icon name={item.icon} size={18} />
                    <span className={styles.navLabel}>{item.label}</span>
                    {b && <span className={`${styles.navBadge} ${b.alert ? styles.navBadgeAlert : ""}`}>{b.count}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFoot}>
          <div className={styles.account}>
            <Avatar name={name} />
            <div className={styles.accountText}>
              <strong>{user?.displayName || "Admin"}</strong>
              <span>{user?.email}</span>
            </div>
            <button type="button" className={styles.signOut} onClick={() => logOut()} aria-label="Sign out">
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <button type="button" className={styles.menuBtn} aria-label="Open menu" aria-expanded={navOpen} onClick={() => setNavOpen(true)}>
            <Icon name="menu" size={20} />
          </button>
          <div className={styles.crumb}>
            <span>Operations</span>
            <Icon name="chevron" size={13} />
            <strong>{TITLES[tab]}</strong>
          </div>
          <div className={styles.topActions}>
            {isDemoMode && <span className={styles.demoBadge}>Demo Preview Mode</span>}
            {syncedAt && !isDemoMode && <span className={styles.synced}>Updated {syncedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>}
            <button type="button" className={styles.btn} onClick={loadData} disabled={loading}>
              <span className={loading ? styles.spin : undefined}>
                <Icon name="refresh" size={16} />
              </span>
              {loading ? "Syncing" : "Refresh"}
            </button>
            <Link href="/shop" target="_blank" className={`${styles.btn} ${styles.hideSm}`}>
              View store <Icon name="external" size={15} />
            </Link>
          </div>
        </header>

        <main ref={mainRef} className={styles.main} id="admin-main">
          {loadError && (
            <div className={styles.permissionNotice} role="alert">
              <div className={styles.permissionNoticeHead}>
                <div className={styles.permissionNoticeTitle}>
                  <Icon name="alert" size={19} />
                  <span>Firestore Permission Configuration</span>
                </div>
                <button
                  type="button"
                  className={styles.bannerClose}
                  onClick={() => setLoadError("")}
                  aria-label="Dismiss banner"
                >
                  <Icon name="close" size={14} />
                </button>
              </div>

              <div className={styles.permissionNoticeBody}>
                <p>
                  <strong>{loadError}</strong>
                </p>
                <p style={{ marginTop: 6 }}>
                  Active account: <strong>{user?.email || "anonymous"}</strong>. To grant access, publish your rules in Firebase Console.
                </p>
              </div>

              <div className={styles.permissionNoticeActions}>
                <a
                  href="https://console.firebase.google.com/project/onetime-product/firestore/rules"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.btnSm} ${styles.btnPrimary}`}
                >
                  Open Firebase Rules <Icon name="external" size={14} />
                </a>

                <button
                  type="button"
                  className={styles.btnSm}
                  onClick={() => {
                    navigator.clipboard.writeText(FIRESTORE_RULES_SNIPPET);
                    setCopiedRules(true);
                    notify("success", "Firestore security rules copied to clipboard!");
                    setTimeout(() => setCopiedRules(false), 2500);
                  }}
                >
                  <Icon name="check" size={14} />
                  {copiedRules ? "Copied!" : "Copy firestore.rules"}
                </button>

                {!isDemoMode && (
                  <button
                    type="button"
                    className={styles.btnSm}
                    onClick={() => {
                      setIsDemoMode(true);
                      setOrders(DEMO_ORDERS);
                      setEnquiries(DEMO_QUOTES);
                      setSubscribers(DEMO_SUBSCRIBERS);
                      notify("success", "Sample demo orders, quotes, and metrics loaded.");
                    }}
                  >
                    Load Sample Demo Data
                  </button>
                )}

                <button type="button" className={styles.btnSm} onClick={loadData}>
                  <Icon name="refresh" size={14} /> Retry live connection
                </button>
              </div>
            </div>
          )}

          {tab === "overview" && <OverviewView orders={orders} newQuotes={newQuotes} stock={stock} loading={loading} go={goTo} onOpenOrder={openOrder} />}
          {tab === "orders" && (
            <OrdersView
              orders={orders}
              loading={loading}
              filter={orderFilter}
              setFilter={setOrderFilter}
              onStatusChange={changeOrderStatus}
              onSlip={setSlipOrder}
              onExport={exportOrders}
              openId={openOrderId}
              setOpenId={setOpenOrderId}
            />
          )}
          {tab === "quotes" && <QuotesView enquiries={enquiries} loading={loading} onStatusChange={changeEnquiryStatus} onExport={exportQuotes} />}
          {tab === "inventory" && <InventoryView inventory={inventory} onSave={saveStock} onExport={exportInventory} notify={notify} />}
          {tab === "customers" && (
            <CustomersView
              orders={orders}
              subscribers={subscribers}
              onExport={(list) =>
                exportCsv(
                  "otpb-customers",
                  list.map((c) => ({ name: c.name, contact: c.contact, district: c.district, orders: c.orders, lifetime_spend_bdt: c.spend }))
                )
              }
            />
          )}
          {tab === "media" && <MediaView notify={notify} />}
        </main>
      </div>

      <div className={styles.toasts} aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${t.tone === "error" ? styles.toastError : ""}`} role={t.tone === "error" ? "alert" : "status"}>
            <Icon name={t.tone === "error" ? "alert" : "check"} size={17} />
            <span>{t.text}</span>
            <button type="button" aria-label="Dismiss" onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}>
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>

      <InvoiceModal order={slipOrder} onClose={() => setSlipOrder(null)} />
    </div>
  );
}

