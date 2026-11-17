"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { PRODUCTS, type Product } from "@/lib/catalog";
import { ENQUIRY_STATUSES, exportCsv, formatDate } from "@/lib/admin-utils";
import type { EnquiryStatus, OrderStatus } from "@/lib/admin-utils";
import { DEFAULT_CONTACT, type StoreContact } from "@/lib/contact";
import { useContact } from "@/lib/contact-context";
import type { Coupon } from "@/lib/coupons";
import type { PromoBannerItem } from "@/lib/promos";
import type { TeamMember } from "@/lib/roles";
import { useAuth } from "@/lib/firebase/auth-context";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { DEMO_ORDERS, DEMO_QUOTES, DEMO_SUBSCRIBERS } from "@/lib/mock-admin-data";
import {
  deleteCouponFromFirestore,
  deleteProductFromFirestore,
  deleteTeamRoleFromFirestore,
  getCouponsFromFirestore,
  getEnquiriesFromFirestore,
  getInventoryFromFirestore,
  getNewsletterSubscriptions,
  getOrdersFromFirestore,
  getProductsFromFirestore,
  getPromosFromFirestore,
  getStoreContactFromFirestore,
  getTeamRolesFromFirestore,
  saveCouponToFirestore,
  saveInventoryToFirestore,
  saveProductToFirestore,
  savePromosToFirestore,
  saveStoreContactToFirestore,
  saveTeamRoleToFirestore,
  seedCatalogToFirestore,
  updateEnquiryStatus,
  updateOrderStatus,
  type EnquiryRecord,
  type InventoryRecord,
  type NewsletterSubscription,
  type OrderRecord,
} from "@/lib/firebase/firestore";
import { InvoiceModal } from "./InvoiceModal";
import { Avatar, EmptyState, Icon } from "./ui";
import type { IconName } from "./ui";
import { CouponsView } from "./views/CouponsView";
import { CustomersView } from "./views/CustomersView";
import { InventoryView, stockHealth } from "./views/InventoryView";
import { MediaView } from "./views/MediaView";
import { OrdersView } from "./views/OrdersView";
import type { OrderFilter } from "./views/OrdersView";
import { OverviewView } from "./views/OverviewView";
import { ProductsView } from "./views/ProductsView";
import { QuotesView } from "./views/QuotesView";
import { SettingsView } from "./views/SettingsView";
import { TeamView } from "./views/TeamView";
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
      { tab: "coupons", label: "Coupons", icon: "coupon" },
    ],
  },
  {
    heading: "Catalogue",
    items: [
      { tab: "products", label: "Products", icon: "inventory" },
      { tab: "inventory", label: "Inventory", icon: "table" },
      { tab: "media", label: "Media", icon: "media" },
    ],
  },
  {
    heading: "People",
    items: [
      { tab: "customers", label: "Customers", icon: "customers" },
      { tab: "team", label: "Team & roles", icon: "shield" },
    ],
  },
  { heading: "Store", items: [{ tab: "settings", label: "Store & contact", icon: "settings" }] },
];

const TITLES: Record<Tab, string> = {
  overview: "Overview",
  orders: "Orders",
  quotes: "Quotes & messages",
  coupons: "Promo coupons",
  products: "Products & catalogue",
  inventory: "Inventory",
  media: "Media",
  customers: "Customers",
  team: "Team & roles",
  settings: "Store & contact",
};

const FIRESTORE_RULES_SNIPPET = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function userEmailLower() {
      return request.auth != null && ('email' in request.auth.token)
        ? request.auth.token.email.lower()
        : '';
    }
    function isSuperAdmin() {
      return userEmailLower() in [
        'onetimeproductbd@gmail.com',
        'siradive137@gmail.com',
        'vertexhand@gmail.com'
      ];
    }
    function teamDoc() {
      return get(/databases/$(database)/documents/team_roles/$(userEmailLower()));
    }
    function hasActiveTeamRole() {
      return userEmailLower() != '' &&
        exists(/databases/$(database)/documents/team_roles/$(userEmailLower())) &&
        teamDoc().data.active == true;
    }
    function isAdmin() {
      return isSuperAdmin() || (hasActiveTeamRole() && teamDoc().data.role == 'admin');
    }
    function hasPermission(perm) {
      return isAdmin() || (
        hasActiveTeamRole() &&
        teamDoc().data.role == 'store_manager' &&
        (perm in teamDoc().data.permissions)
      );
    }
    match /team_roles/{email} {
      allow get: if isAdmin() || (request.auth != null && userEmailLower() == email.lower());
      allow list, create, update: if isAdmin();
      allow delete: if isSuperAdmin() && userEmailLower() != email.lower();
    }
    match /products/{slug} {
      allow read: if true;
      allow write: if hasPermission('manage_products');
    }
    match /orders/{orderId} {
      allow create: if true;
      allow get: if true;
      allow list: if hasPermission('manage_orders') || hasPermission('view_overview') || hasPermission('view_customers') || hasPermission('manage_coupons') || (request.auth != null && ('userId' in resource.data) && resource.data.userId == request.auth.uid);
      allow update, delete: if hasPermission('manage_orders') || (request.auth != null && ('userId' in resource.data) && resource.data.userId == request.auth.uid);
    }
    match /enquiries/{enquiryId} {
      allow create: if true;
      allow read, update, delete: if hasPermission('manage_quotes');
    }
    match /subscribers/{subscriberId} {
      allow create: if true;
      allow read, write: if hasPermission('view_customers');
    }
    match /inventory/{slug} {
      allow read: if true;
      allow write: if hasPermission('manage_inventory') || hasPermission('manage_products');
    }
    match /settings/{settingId} {
      allow read: if true;
      allow write: if (settingId == 'promotions' && hasPermission('manage_coupons')) || hasPermission('manage_settings');
    }
    match /coupons/{code} {
      allow get: if true;
      allow list, write: if hasPermission('manage_coupons');
    }
  }
}`;

function tabFromHash(): Tab {
  const hash = window.location.hash.replace("#", "") as Tab;
  return TABS.includes(hash) ? hash : "overview";
}

export function AdminDashboard() {
  const { user, access, accessLoading, logOut } = useAuth();
  const { refresh: refreshGlobalContact } = useContact();
  const [tab, setTabState] = useState<Tab>("overview");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscription[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [products, setProducts] = useState<Product[]>(() => (isFirebaseConfigured ? [] : PRODUCTS));
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [promos, setPromos] = useState<PromoBannerItem[]>([]);
  const [couponsNeedsRules, setCouponsNeedsRules] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamNeedsRules, setTeamNeedsRules] = useState(false);
  const [storeContact, setStoreContact] = useState<StoreContact>(DEFAULT_CONTACT);
  const [settingsNeedsRules, setSettingsNeedsRules] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);
  const [syncedAt, setSyncedAt] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [slipOrder, setSlipOrder] = useState<OrderRecord | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const mainRef = useRef<HTMLElement>(null);
  const toastId = useRef(0);
  const isFetchingRef = useRef(false);
  const lastSyncMsRef = useRef(0);

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

  // Ensure current tab stays within the user's granted role permissions.
  useEffect(() => {
    if (accessLoading || !access.isTeamMember || access.allowedTabs.length === 0) return;
    if (!access.canAccessTab(tab)) {
      setTab(access.allowedTabs[0]);
    }
  }, [accessLoading, access, tab, setTab]);

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
  const canReadOrders =
    access.hasPermission("manage_orders") ||
    access.hasPermission("view_overview") ||
    access.hasPermission("view_customers") ||
    access.hasPermission("manage_coupons");
  const canReadQuotes = access.hasPermission("manage_quotes");
  const canReadCustomers = access.hasPermission("view_customers");
  const canReadCatalog =
    access.hasPermission("manage_inventory") ||
    access.hasPermission("manage_products") ||
    access.hasPermission("view_overview");
  const canReadSettings = access.hasPermission("manage_settings");
  const canReadCoupons = access.hasPermission("manage_coupons");

  const loadData = useCallback(async (silent = false) => {
    if (isFetchingRef.current || accessLoading || !access.isTeamMember) return;
    isFetchingRef.current = true;
    if (!silent) {
      setLoading(true);
      setLoadError("");
    }
    try {
      const results = await Promise.allSettled([
        canReadOrders ? getOrdersFromFirestore() : Promise.resolve<OrderRecord[]>([]),
        canReadQuotes ? getEnquiriesFromFirestore() : Promise.resolve<EnquiryRecord[]>([]),
        canReadCustomers ? getNewsletterSubscriptions() : Promise.resolve<NewsletterSubscription[]>([]),
        canReadCatalog ? getInventoryFromFirestore() : Promise.resolve<InventoryRecord[]>([]),
        canReadCatalog ? getProductsFromFirestore() : Promise.resolve<Product[]>([]),
        canReadSettings ? getStoreContactFromFirestore() : Promise.resolve<StoreContact | null>(null),
        canReadCoupons ? getCouponsFromFirestore() : Promise.resolve<Coupon[]>([]),
        canReadCoupons ? getPromosFromFirestore() : Promise.resolve<PromoBannerItem[]>([]),
        access.isAdmin ? getTeamRolesFromFirestore() : Promise.resolve<TeamMember[]>([]),
      ]);
      const [
        ordersRes,
        enquiriesRes,
        subscribersRes,
        inventoryRes,
        productsRes,
        contactRes,
        couponsRes,
        promosRes,
        teamRes,
      ] = results;
      const failed: string[] = [];
      const reason = (r: PromiseRejectedResult) =>
        (r.reason as { code?: string; message?: string })?.code || (r.reason as Error)?.message || "error";

      if (ordersRes.status === "fulfilled") setOrders(ordersRes.value);
      else failed.push(`orders (${reason(ordersRes)})`);
      if (enquiriesRes.status === "fulfilled") setEnquiries(enquiriesRes.value);
      else failed.push(`quotes (${reason(enquiriesRes)})`);
      if (subscribersRes.status === "fulfilled") setSubscribers(subscribersRes.value);
      else failed.push(`subscribers (${reason(subscribersRes)})`);
      if (inventoryRes.status === "fulfilled") setInventory(inventoryRes.value);
      else failed.push(`inventory (${reason(inventoryRes)})`);
      if (productsRes.status === "fulfilled") {
        setProducts(productsRes.value.length > 0 ? productsRes.value : PRODUCTS);
      } else if (products.length === 0) {
        setProducts(PRODUCTS);
      }
      if (contactRes.status === "fulfilled") {
        setSettingsNeedsRules(false);
        if (contactRes.value) setStoreContact(contactRes.value);
      } else {
        setSettingsNeedsRules(true);
      }
      if (couponsRes.status === "fulfilled") {
        setCouponsNeedsRules(false);
        setCoupons(couponsRes.value);
      } else {
        setCouponsNeedsRules(true);
      }
      if (promosRes.status === "fulfilled") {
        setPromos(promosRes.value);
      }
      if (teamRes.status === "fulfilled") {
        setTeamNeedsRules(false);
        setTeamMembers(teamRes.value);
      } else {
        setTeamNeedsRules(true);
      }

      if (failed.length) {
        if (!silent) {
          setLoadError(
            `Couldn’t load ${failed.join(", ")}. Check that your Firestore security rules are published and this account has permission.`
          );
        }
      } else {
        setLoadError("");
        setIsDemoMode(false);
      }
      const now = new Date();
      lastSyncMsRef.current = now.getTime();
      setSyncedAt(now);
    } finally {
      isFetchingRef.current = false;
      if (!silent) setLoading(false);
    }
  }, [
    accessLoading,
    access.isTeamMember,
    access.isAdmin,
    canReadOrders,
    canReadQuotes,
    canReadCustomers,
    canReadCatalog,
    canReadSettings,
    canReadCoupons,
    products.length,
  ]);

  useEffect(() => {
    void loadData(false);
  }, [loadData]);

  useEffect(() => {
    if (!autoRefresh || isDemoMode) return;
    const AUTO_REFRESH_MS = 30_000;
    const REFRESH_ON_FOCUS_MIN_AGE_MS = 10_000;

    const refreshIfVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastSyncMsRef.current >= REFRESH_ON_FOCUS_MIN_AGE_MS) {
        void loadData(true);
      }
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadData(true);
      }
    }, AUTO_REFRESH_MS);

    window.addEventListener("focus", refreshIfVisible);
    document.addEventListener("visibilitychange", refreshIfVisible);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshIfVisible);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [autoRefresh, isDemoMode, loadData]);

  /* ---------- Derived ---------- */
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const newQuotes = enquiries.filter((e) => e.status === "new").length;

  const stock = useMemo<StockSummary>(() => {
    const bySlug = new Map(inventory.map((i) => [i.slug, i]));
    const s: StockSummary = { tracked: 0, total: products.length, out: 0, low: 0, healthy: 0 };
    for (const p of products) {
      const h = stockHealth(bySlug.get(p.slug));
      if (h !== "untracked") s.tracked += 1;
      if (h === "out") s.out += 1;
      else if (h === "low") s.low += 1;
      else if (h === "healthy") s.healthy += 1;
    }
    return s;
  }, [inventory, products]);
  const stockAlerts = stock.out + stock.low;

  /* ---------- Product Mutations ---------- */
  async function handleSaveProduct(p: Product) {
    try {
      await saveProductToFirestore(p);
      setProducts((prev) => [...prev.filter((x) => x.slug !== p.slug), p]);
      if (p.available !== undefined || p.lowStockAt !== undefined || p.image) {
        setInventory((prev) => [
          ...prev.filter((i) => i.slug !== p.slug),
          {
            slug: p.slug,
            available: p.available ?? 0,
            lowStockAt: p.lowStockAt ?? 10,
            imageUrl: p.image,
          },
        ]);
      }
      notify("success", `Product "${p.name}" saved to Firestore.`);
    } catch (err) {
      notify("error", "Couldn’t save product. Check permissions.");
      throw err;
    }
  }

  async function handleDeleteProduct(slug: string) {
    try {
      await deleteProductFromFirestore(slug);
      setProducts((prev) => prev.filter((p) => p.slug !== slug));
      setInventory((prev) => prev.filter((i) => i.slug !== slug));
      notify("success", "Product deleted.");
    } catch (err) {
      notify("error", "Couldn’t delete product. Check permissions.");
      throw err;
    }
  }

  async function handleSeedCatalog() {
    try {
      const count = await seedCatalogToFirestore();
      await loadData();
      notify("success", `Successfully synchronized ${count} products to Firestore.`);
    } catch (err) {
      const msg = (err as Error)?.message || "Check permissions and connection.";
      notify("error", `Failed to sync catalogue: ${msg}`);
      throw err;
    }
  }

  const exportProducts = () =>
    exportCsv(
      "otpb-products",
      products.map((p) => ({
        slug: p.slug,
        name: p.name,
        category: p.category,
        price_bdt: p.price ?? "On request",
        variants_count: p.variants?.length ?? 0,
        available_stock: p.available ?? "untracked",
        low_stock_threshold: p.lowStockAt ?? 10,
        has_photo: p.image ? "Yes" : "No",
        tags: p.tags.join("; "),
      }))
    );

  /* ---------- Order & Enquiry Mutations ---------- */
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

  async function handleSaveContact(next: StoreContact) {
    try {
      const saved = await saveStoreContactToFirestore(next);
      setStoreContact(saved);
      setSettingsNeedsRules(false);
      await refreshGlobalContact();
      notify("success", "Store contact details saved and updated live.");
    } catch (err) {
      if ((err as { code?: string })?.code === "permission-denied") {
        setSettingsNeedsRules(true);
      }
      throw err;
    }
  }

  async function handleSaveCoupon(coupon: Coupon) {
    try {
      const saved = await saveCouponToFirestore(coupon);
      setCouponsNeedsRules(false);
      setCoupons((prev) =>
        [...prev.filter((c) => c.code !== saved.code), saved].sort((a, b) => a.code.localeCompare(b.code))
      );
      notify("success", `Promo code "${saved.code}" saved.`);
    } catch (err) {
      if ((err as { code?: string })?.code === "permission-denied") {
        setCouponsNeedsRules(true);
      }
      throw err;
    }
  }

  async function handleDeleteCoupon(code: string) {
    try {
      await deleteCouponFromFirestore(code);
      setCoupons((prev) => prev.filter((c) => c.code !== code));
      notify("success", `Deleted promo code "${code}".`);
    } catch (err) {
      if ((err as { code?: string })?.code === "permission-denied") {
        setCouponsNeedsRules(true);
      }
      throw err;
    }
  }

  async function handleSavePromos(next: PromoBannerItem[]) {
    try {
      const saved = await savePromosToFirestore(next);
      setPromos(saved);
      setSettingsNeedsRules(false);
      await refreshGlobalContact();
      notify("success", "Top header promo bar updated live.");
    } catch (err) {
      if ((err as { code?: string })?.code === "permission-denied") {
        setSettingsNeedsRules(true);
      }
      throw err;
    }
  }

  async function handleSaveTeamRole(member: TeamMember) {
    if (!access.isAdmin) return;
    try {
      const saved = await saveTeamRoleToFirestore(member);
      setTeamNeedsRules(false);
      setTeamMembers((prev) =>
        [...prev.filter((m) => m.email !== saved.email), saved].sort((a, b) => a.email.localeCompare(b.email))
      );
      notify(
        "success",
        `${saved.email} assigned ${saved.role === "admin" ? "Admin" : "Store Manager"} access.`
      );
    } catch (err) {
      if ((err as { code?: string })?.code === "permission-denied") {
        setTeamNeedsRules(true);
      }
      throw err;
    }
  }

  async function handleDeleteTeamRole(email: string) {
    if (!access.isSuperAdmin) {
      notify("error", "Only Super Admin accounts (Vercel env allowlist) can delete team accounts.");
      return;
    }
    if (email.trim().toLowerCase() === (user?.email ?? "").trim().toLowerCase()) {
      notify("error", "You cannot delete your own signed-in Super Admin account.");
      return;
    }
    try {
      await deleteTeamRoleFromFirestore(email);
      setTeamMembers((prev) => prev.filter((m) => m.email !== email));
      notify("success", `Deleted dashboard account access for ${email}.`);
    } catch (err) {
      if ((err as { code?: string })?.code === "permission-denied") {
        setTeamNeedsRules(true);
      }
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
      products.map((p) => {
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
          <span className={styles.envTag}>
            {access.isSuperAdmin ? "Super Admin" : access.isAdmin ? "Admin" : "Store Manager"}
          </span>
        </div>

        <nav className={styles.nav}>
          {NAV.map((group) => {
            const items = group.items.filter((item) => access.canAccessTab(item.tab));
            if (items.length === 0) return null;
            return (
              <div key={group.heading} className={styles.navGroup}>
                <p className={styles.navHeading}>{group.heading}</p>
                {items.map((item) => {
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
            );
          })}
        </nav>

        <div className={styles.sidebarFoot}>
          <div className={styles.account}>
            <Avatar name={name} />
            <div className={styles.accountText}>
              <strong>{user?.displayName || (access.isSuperAdmin ? "Super Admin" : access.isAdmin ? "Admin" : "Store Manager")}</strong>
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
            {!isDemoMode && (
              <button
                type="button"
                className={`${styles.liveToggle} ${autoRefresh ? styles.liveToggleOn : ""}`}
                onClick={() => setAutoRefresh((v) => !v)}
                aria-pressed={autoRefresh}
                title={autoRefresh ? "Auto-refreshing every 30s (click to pause)" : "Auto-refresh paused (click to resume)"}
              >
                <span className={styles.liveDot} aria-hidden="true" />
                {autoRefresh ? "Live · 30s" : "Auto paused"}
              </button>
            )}
            {syncedAt && !isDemoMode && (
              <span className={styles.synced}>
                Updated {syncedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
            <button type="button" className={styles.btn} onClick={() => void loadData(false)} disabled={loading}>
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

                <button type="button" className={styles.btnSm} onClick={() => void loadData(false)}>
                  <Icon name="refresh" size={14} /> Retry live connection
                </button>
              </div>
            </div>
          )}

          {access.allowedTabs.length === 0 ? (
            <EmptyState
              icon="shield"
              title="No permissions assigned yet"
              text="Ask a Store Admin to grant view permissions to your Store Manager account under Team & roles."
            />
          ) : (
            <>
              {tab === "overview" && access.canAccessTab("overview") && (
                <OverviewView
                  orders={orders}
                  newQuotes={newQuotes}
                  stock={stock}
                  loading={loading}
                  go={goTo}
                  onOpenOrder={openOrder}
                  canAccess={access.canAccessTab}
                />
              )}
              {tab === "orders" && access.canAccessTab("orders") && (
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
              {tab === "quotes" && access.canAccessTab("quotes") && (
                <QuotesView enquiries={enquiries} loading={loading} onStatusChange={changeEnquiryStatus} onExport={exportQuotes} />
              )}
              {tab === "coupons" && access.canAccessTab("coupons") && (
                <CouponsView
                  coupons={coupons}
                  promos={promos}
                  orders={orders}
                  loading={loading}
                  needsRules={couponsNeedsRules}
                  onSave={handleSaveCoupon}
                  onDelete={handleDeleteCoupon}
                  onSavePromos={handleSavePromos}
                  notify={notify}
                />
              )}
              {tab === "products" && access.canAccessTab("products") && (
                <ProductsView
                  products={products}
                  loading={loading}
                  onSave={handleSaveProduct}
                  onDelete={handleDeleteProduct}
                  onSeed={handleSeedCatalog}
                  onExport={exportProducts}
                  notify={notify}
                />
              )}
              {tab === "inventory" && access.canAccessTab("inventory") && (
                <InventoryView
                  products={products}
                  inventory={inventory}
                  loading={loading}
                  onSave={saveStock}
                  onExport={exportInventory}
                  notify={notify}
                />
              )}
              {tab === "customers" && access.canAccessTab("customers") && (
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
              {tab === "team" && access.isAdmin && (
                <TeamView
                  currentUserEmail={user?.email}
                  isSuperAdmin={access.isSuperAdmin}
                  members={teamMembers}
                  loading={loading}
                  needsRules={teamNeedsRules}
                  onSave={handleSaveTeamRole}
                  onDelete={handleDeleteTeamRole}
                  notify={notify}
                />
              )}
              {tab === "media" && access.canAccessTab("media") && <MediaView notify={notify} />}
              {tab === "settings" && access.canAccessTab("settings") && (
                <SettingsView
                  contact={storeContact}
                  loading={loading}
                  needsRules={settingsNeedsRules}
                  onSave={handleSaveContact}
                  notify={notify}
                />
              )}
            </>
          )}
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

