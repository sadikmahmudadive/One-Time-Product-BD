"use client";

import { useMemo, useState } from "react";
import {
  formatCouponOffer,
  isCouponExpired,
  normalizeCoupon,
  normalizeCouponCode,
  type Coupon,
  type CouponType,
} from "@/lib/coupons";
import type { OrderRecord } from "@/lib/firebase/firestore";
import { formatPrice } from "@/lib/format";
import { couponToPromoBanner, normalizePromoItem, type PromoBannerItem } from "@/lib/promos";
import { EmptyState, Icon, PageHeader, Panel, SearchField, Segmented, SkeletonRows, StatCard, Tone } from "../ui";
import styles from "../admin.module.css";

type CouponFilter = "all" | "active" | "paused" | "expired";

interface CouponsViewProps {
  coupons: Coupon[];
  promos: PromoBannerItem[];
  orders: OrderRecord[];
  loading: boolean;
  needsRules?: boolean;
  onSave: (coupon: Coupon) => Promise<void>;
  onDelete: (code: string) => Promise<void>;
  onSavePromos: (next: PromoBannerItem[]) => Promise<void>;
  notify: (tone: "success" | "error", text: string) => void;
}

export function CouponsView({
  coupons,
  promos,
  orders,
  loading,
  needsRules,
  onSave,
  onDelete,
  onSavePromos,
  notify,
}: CouponsViewProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CouponFilter>("all");
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Coupon form state
  const [code, setCode] = useState("");
  const [type, setType] = useState<CouponType>("percent");
  const [value, setValue] = useState("10");
  const [minOrder, setMinOrder] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Top Header Promo Bar editor state
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [promoBadge, setPromoBadge] = useState("OFFER");
  const [promoText, setPromoText] = useState("");
  const [promoTextBn, setPromoTextBn] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoHref, setPromoHref] = useState("/shop");
  const [promoActive, setPromoActive] = useState(true);
  const [savingPromos, setSavingPromos] = useState(false);

  const usageByCode = useMemo(() => {
    const map = new Map<string, { count: number; saved: number }>();
    for (const o of orders) {
      if (o.status === "cancelled" || !o.couponCode) continue;
      const key = normalizeCouponCode(o.couponCode);
      const prev = map.get(key) ?? { count: 0, saved: 0 };
      map.set(key, {
        count: prev.count + 1,
        saved: prev.saved + (typeof o.discountAmount === "number" ? o.discountAmount : 0),
      });
    }
    return map;
  }, [orders]);

  const metrics = useMemo(() => {
    let activeCount = 0;
    let inactiveOrExpired = 0;
    for (const c of coupons) {
      if (c.active && !isCouponExpired(c)) activeCount += 1;
      else inactiveOrExpired += 1;
    }
    let totalOrders = 0;
    let totalSaved = 0;
    usageByCode.forEach((v) => {
      totalOrders += v.count;
      totalSaved += v.saved;
    });
    return { activeCount, inactiveOrExpired, totalOrders, totalSaved };
  }, [coupons, usageByCode]);

  const counts = useMemo(() => {
    const c = { all: coupons.length, active: 0, paused: 0, expired: 0 };
    for (const item of coupons) {
      if (isCouponExpired(item)) c.expired += 1;
      else if (item.active) c.active += 1;
      else c.paused += 1;
    }
    return c;
  }, [coupons]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return coupons.filter((item) => {
      const exp = isCouponExpired(item);
      if (filter === "active" && (!item.active || exp)) return false;
      if (filter === "paused" && (item.active || exp)) return false;
      if (filter === "expired" && !exp) return false;
      if (q) {
        const hay = `${item.code} ${item.description ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [coupons, filter, search]);

  const activeBannerPromos = promos.filter((p) => p.active);
  const pinnedCouponCodes = useMemo(
    () => new Set(promos.filter((p) => p.active && p.code).map((p) => normalizeCouponCode(p.code!))),
    [promos]
  );

  function resetForm() {
    setEditingCode(null);
    setCode("");
    setType("percent");
    setValue("10");
    setMinOrder("");
    setMaxDiscount("");
    setExpiresAt("");
    setDescription("");
    setActive(true);
  }

  function startEdit(c: Coupon) {
    setEditingCode(c.code);
    setCode(c.code);
    setType(c.type);
    setValue(String(c.value));
    setMinOrder(c.minOrder ? String(c.minOrder) : "");
    setMaxDiscount(c.maxDiscount ? String(c.maxDiscount) : "");
    setExpiresAt(c.expiresAt ?? "");
    setDescription(c.description ?? "");
    setActive(c.active);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = normalizeCouponCode(code);
    if (!clean || clean.length < 3) {
      notify("error", "Enter a coupon code (at least 3 characters, e.g. SAVE10).");
      return;
    }
    const parsedVal = Number(value);
    if (!Number.isFinite(parsedVal) || parsedVal <= 0) {
      notify("error", "Enter a discount value greater than 0.");
      return;
    }
    if (type === "percent" && parsedVal > 100) {
      notify("error", "Percentage discount cannot exceed 100%.");
      return;
    }

    const coupon = normalizeCoupon({
      code: clean,
      type,
      value: parsedVal,
      minOrder: minOrder.trim() ? Number(minOrder) : null,
      maxDiscount: type === "percent" && maxDiscount.trim() ? Number(maxDiscount) : null,
      expiresAt: expiresAt.trim() || null,
      active,
      description,
      createdAt: coupons.find((x) => x.code === clean)?.createdAt,
    });

    try {
      setSaving(true);
      await onSave(coupon);
      resetForm();
    } catch (err) {
      notify("error", `Couldn’t save coupon: ${(err as Error)?.message || "Check permissions."}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(c: Coupon) {
    try {
      await onSave({ ...c, active: !c.active });
    } catch {
      notify("error", `Couldn’t update coupon ${c.code}.`);
    }
  }

  async function handleDelete(c: Coupon) {
    if (!confirm(`Delete promo code "${c.code}"? Customers will no longer be able to apply it.`)) return;
    try {
      await onDelete(c.code);
      if (editingCode === c.code) resetForm();
    } catch {
      notify("error", `Failed to delete coupon ${c.code}.`);
    }
  }

  async function copyCode(val: string) {
    try {
      await navigator.clipboard.writeText(val);
      setCopiedCode(val);
      setTimeout(() => setCopiedCode(null), 1600);
    } catch {
      notify("error", "Could not copy code.");
    }
  }

  /* ---------- Top Header Promo Bar Handlers ---------- */
  function resetPromoForm() {
    setEditingPromoId(null);
    setPromoBadge("OFFER");
    setPromoText("");
    setPromoTextBn("");
    setPromoCode("");
    setPromoHref("/shop");
    setPromoActive(true);
  }

  function startEditPromo(p: PromoBannerItem) {
    setEditingPromoId(p.id);
    setPromoBadge(p.badge ?? "");
    setPromoText(p.text);
    setPromoTextBn(p.textBn ?? "");
    setPromoCode(p.code ?? "");
    setPromoHref(p.href ?? "");
    setPromoActive(p.active);
  }

  async function handleTogglePinCoupon(c: Coupon) {
    const existing = promos.find((p) => p.code && normalizeCouponCode(p.code) === c.code);
    try {
      setSavingPromos(true);
      if (existing && existing.active) {
        await onSavePromos(promos.filter((p) => p.id !== existing.id));
      } else if (existing) {
        await onSavePromos(promos.map((p) => (p.id === existing.id ? { ...p, active: true } : p)));
      } else {
        await onSavePromos([couponToPromoBanner(c), ...promos]);
      }
    } catch (err) {
      notify("error", `Couldn’t update top promo bar: ${(err as Error)?.message || "Check permissions."}`);
    } finally {
      setSavingPromos(false);
    }
  }

  async function handlePromoSubmit(e: React.FormEvent) {
    e.preventDefault();
    const item = normalizePromoItem({
      id: editingPromoId ?? `promo-${Date.now()}`,
      badge: promoBadge,
      text: promoText,
      textBn: promoTextBn,
      code: promoCode,
      href: promoHref,
      active: promoActive,
    });
    if (!item) {
      notify("error", "Enter offer text to display in the top promo bar.");
      return;
    }

    const next = editingPromoId
      ? promos.map((p) => (p.id === editingPromoId ? item : p))
      : [item, ...promos];

    try {
      setSavingPromos(true);
      await onSavePromos(next);
      resetPromoForm();
    } catch (err) {
      notify("error", `Couldn’t save top promo bar: ${(err as Error)?.message || "Check permissions."}`);
    } finally {
      setSavingPromos(false);
    }
  }

  async function handleTogglePromoItem(id: string) {
    try {
      setSavingPromos(true);
      await onSavePromos(promos.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
    } catch {
      notify("error", "Couldn’t update promo visibility.");
    } finally {
      setSavingPromos(false);
    }
  }

  async function handleDeletePromoItem(id: string) {
    try {
      setSavingPromos(true);
      await onSavePromos(promos.filter((p) => p.id !== id));
      if (editingPromoId === id) resetPromoForm();
    } catch {
      notify("error", "Couldn’t remove promo item.");
    } finally {
      setSavingPromos(false);
    }
  }

  return (
    <div className={styles.stack}>
      <PageHeader
        title="Promo Coupons & Top Offer Bar"
        description="Manage checkout discount codes and feature live promotions in the top storefront bar."
      />

      {needsRules && (
        <div className={styles.permissionNotice} role="status">
          <div className={styles.permissionNoticeHead}>
            <div className={styles.permissionNoticeTitle}>
              <Icon name="alert" size={18} />
              <span>Publish Updated Firestore Rules for Coupons</span>
            </div>
          </div>
          <div className={styles.permissionNoticeBody}>
            <p>
              Add <code>match /coupons/{"{code}"}</code> to your Firestore rules in Firebase Console to enable live
              coupon creation and checkout validation.
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
          </div>
        </div>
      )}

      <div className={styles.statGrid}>
        <StatCard
          label="Active coupons"
          value={String(metrics.activeCount)}
          icon="coupon"
          hint={<span className={styles.deltaNone}>Live on checkout</span>}
        />
        <StatCard
          label="Orders with promo"
          value={String(metrics.totalOrders)}
          icon="orders"
          hint={<span className={styles.deltaNone}>Non-cancelled orders</span>}
        />
        <StatCard
          label="Discounts given"
          value={formatPrice(metrics.totalSaved)}
          icon="check"
          hint={<span className={styles.deltaNone}>Cumulative savings</span>}
        />
        <StatCard
          label="Top bar offers"
          value={String(activeBannerPromos.length)}
          icon="external"
          hint={<span className={styles.deltaNone}>{activeBannerPromos.length > 1 ? "Auto-rotating every 5s" : activeBannerPromos.length === 1 ? "Pinned at top of site" : "Showing default tagline"}</span>}
        />
      </div>

      {/* ---------- Top Header Promo & Offer Bar Manager ---------- */}
      <Panel
        title="Top Header Promos & Offers Bar"
        description="Announcements and promo offers displayed in the top dark strip above the storefront navigation bar."
        actions={
          editingPromoId ? (
            <button type="button" className={styles.btnSm} onClick={resetPromoForm}>
              Cancel edit
            </button>
          ) : undefined
        }
      >
        <div style={{ display: "grid", gap: 18 }}>
          {/* Live bar preview */}
          <div
            style={{
              background: "#0a201a",
              color: "#f3f7f4",
              borderRadius: 12,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              fontSize: 12.5,
              border: "1px solid rgba(183, 217, 87, 0.18)",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flexWrap: "wrap" }}>
              {promoText.trim() ? (
                <>
                  {promoBadge.trim() && (
                    <span
                      style={{
                        background: "var(--accent-500)",
                        color: "#0a201a",
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontSize: 10.5,
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {promoBadge.trim()}
                    </span>
                  )}
                  <span style={{ fontWeight: 500 }}>{promoText}</span>
                  {promoCode.trim() && (
                    <span
                      style={{
                        border: "1px dashed rgba(183, 217, 87, 0.6)",
                        background: "rgba(183, 217, 87, 0.12)",
                        color: "var(--accent-500)",
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                      }}
                    >
                      Code: {promoCode.trim().toUpperCase()}
                    </span>
                  )}
                </>
              ) : activeBannerPromos.length > 0 ? (
                <>
                  {activeBannerPromos[0].badge && (
                    <span
                      style={{
                        background: "var(--accent-500)",
                        color: "#0a201a",
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontSize: 10.5,
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {activeBannerPromos[0].badge}
                    </span>
                  )}
                  <span style={{ fontWeight: 500 }}>{activeBannerPromos[0].text}</span>
                  {activeBannerPromos[0].code && (
                    <span
                      style={{
                        border: "1px dashed rgba(183, 217, 87, 0.6)",
                        background: "rgba(183, 217, 87, 0.12)",
                        color: "var(--accent-500)",
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                      }}
                    >
                      Code: {activeBannerPromos[0].code}
                    </span>
                  )}
                </>
              ) : (
                <span style={{ opacity: 0.78 }}>
                  Food-grade plastic packaging · Retail packs &amp; bulk cartons · Delivery across Bangladesh
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 12, color: "var(--accent-500)", fontWeight: 600, fontSize: 12 }}>
              <span>Track order</span>
              <span>Bulk quote</span>
            </div>
          </div>

          <form onSubmit={handlePromoSubmit} style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 12 }}>
              <div>
                <label className="lbl" htmlFor="pr-text">
                  Offer Headline (English) *
                </label>
                <input
                  id="pr-text"
                  className="field"
                  type="text"
                  required
                  placeholder="e.g. Flat 10% OFF orders above ৳1,500"
                  value={promoText}
                  onChange={(e) => setPromoText(e.target.value)}
                />
              </div>

              <div>
                <label className="lbl" htmlFor="pr-text-bn">
                  Offer Headline (Bangla — optional)
                </label>
                <input
                  id="pr-text-bn"
                  className="field"
                  type="text"
                  placeholder="যেমন: ১,৫০০+ টাকার অর্ডারে ১০% ছাড়"
                  value={promoTextBn}
                  onChange={(e) => setPromoTextBn(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 175px), 1fr))", gap: 12 }}>
              <div>
                <label className="lbl" htmlFor="pr-badge">
                  Badge Tag (optional)
                </label>
                <input
                  id="pr-badge"
                  className="field"
                  type="text"
                  placeholder="e.g. OFFER"
                  value={promoBadge}
                  onChange={(e) => setPromoBadge(e.target.value)}
                />
              </div>

              <div>
                <label className="lbl" htmlFor="pr-code">
                  Clickable Promo Code (optional)
                </label>
                <input
                  id="pr-code"
                  className="field"
                  type="text"
                  placeholder="e.g. SAVE10"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                />
              </div>

              <div>
                <label className="lbl" htmlFor="pr-href">
                  Link Path (optional)
                </label>
                <input
                  id="pr-href"
                  className="field"
                  type="text"
                  placeholder="/shop or /quote"
                  value={promoHref}
                  onChange={(e) => setPromoHref(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={promoActive}
                  onChange={(e) => setPromoActive(e.target.checked)}
                  style={{ width: 17, height: 17, accentColor: "var(--brand-900)" }}
                />
                Show immediately in top bar
              </label>

              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={savingPromos}>
                <Icon name="check" size={16} />
                {savingPromos ? "Publishing…" : editingPromoId ? "Update Banner Offer" : "Add to Top Bar"}
              </button>
            </div>
          </form>

          {promos.length > 0 && (
            <div style={{ display: "grid", gap: 8, paddingTop: 12, borderTop: "1px solid var(--a-line)" }}>
              {promos.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--a-line)",
                    background: p.active ? "#f9fbf9" : "#fafafa",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flexWrap: "wrap" }}>
                    <Tone tone={p.active ? "success" : "neutral"}>{p.active ? "Live" : "Hidden"}</Tone>
                    {p.badge && (
                      <span
                        style={{
                          background: "var(--brand-100)",
                          color: "var(--brand-950)",
                          padding: "2px 8px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {p.badge}
                      </span>
                    )}
                    <span className={styles.cellStrong}>{p.text}</span>
                    {p.code && (
                      <code
                        style={{
                          padding: "2px 7px",
                          borderRadius: 6,
                          background: "#eef3ef",
                          color: "var(--brand-900)",
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {p.code}
                      </code>
                    )}
                    {p.href && <span className={styles.sub}>→ {p.href}</span>}
                  </div>
                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      className={styles.btnSm}
                      onClick={() => void handleTogglePromoItem(p.id)}
                      disabled={savingPromos}
                    >
                      {p.active ? "Hide" : "Show"}
                    </button>
                    <button type="button" className={styles.btnSm} onClick={() => startEditPromo(p)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className={`${styles.btnSm} ${styles.btnDanger}`}
                      onClick={() => void handleDeletePromoItem(p.id)}
                      disabled={savingPromos}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>

      {/* ---------- Coupon Code Builder ---------- */}
      <form onSubmit={handleSubmit}>
        <Panel
          title={editingCode ? `Edit Coupon · ${editingCode}` : "Create Promo Coupon"}
          description={
            editingCode
              ? "Update offer rules, caps, expiry, or active status."
              : "Codes are automatically formatted to uppercase."
          }
          actions={
            editingCode ? (
              <button type="button" className={styles.btnSm} onClick={resetForm}>
                Cancel edit
              </button>
            ) : undefined
          }
        >
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
              <div>
                <label className="lbl" htmlFor="cp-code">
                  Promo Code *
                </label>
                <input
                  id="cp-code"
                  className="field"
                  type="text"
                  required
                  disabled={Boolean(editingCode)}
                  placeholder="e.g. WELCOME10"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                  style={{ fontWeight: 700, letterSpacing: "0.04em" }}
                />
              </div>

              <div>
                <label className="lbl" htmlFor="cp-type">
                  Discount Type
                </label>
                <select
                  id="cp-type"
                  className="field"
                  value={type}
                  onChange={(e) => setType(e.target.value as CouponType)}
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (৳ BDT)</option>
                </select>
              </div>

              <div>
                <label className="lbl" htmlFor="cp-value">
                  {type === "percent" ? "Percentage (%) *" : "Discount (৳ BDT) *"}
                </label>
                <input
                  id="cp-value"
                  className="field"
                  type="number"
                  min={1}
                  max={type === "percent" ? 100 : undefined}
                  required
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>

              <div>
                <label className="lbl" htmlFor="cp-min">
                  Min Order (৳ optional)
                </label>
                <input
                  id="cp-min"
                  className="field"
                  type="number"
                  min={0}
                  placeholder="e.g. 1500"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                />
              </div>

              {type === "percent" && (
                <div>
                  <label className="lbl" htmlFor="cp-cap">
                    Max Discount Cap (৳ optional)
                  </label>
                  <input
                    id="cp-cap"
                    className="field"
                    type="number"
                    min={0}
                    placeholder="e.g. 500"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="lbl" htmlFor="cp-expiry">
                  Expiry Date (optional)
                </label>
                <input
                  id="cp-expiry"
                  className="field"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 14, alignItems: "end" }}>
              <div>
                <label className="lbl" htmlFor="cp-desc">
                  Internal Note / Campaign Label (optional)
                </label>
                <input
                  id="cp-desc"
                  className="field"
                  type="text"
                  placeholder="e.g. First wholesale order discount"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 6 }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    style={{ width: 17, height: 17, accentColor: "var(--brand-900)" }}
                  />
                  Active
                </label>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
                  <Icon name="check" size={16} />
                  {saving ? "Saving…" : editingCode ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </div>
          </div>
        </Panel>
      </form>

      {/* ---------- Coupons Table ---------- */}
      <Panel flush>
        <div className={styles.toolbar}>
          <SearchField
            label="Search coupons"
            placeholder="Search by promo code or campaign note"
            value={search}
            onChange={setSearch}
          />
          <Segmented<CouponFilter>
            label="Filter coupons"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All", count: counts.all },
              { value: "active", label: "Active", count: counts.active },
              { value: "paused", label: "Paused", count: counts.paused },
              { value: "expired", label: "Expired", count: counts.expired },
            ]}
          />
        </div>

        {loading && !coupons.length ? (
          <SkeletonRows />
        ) : visible.length === 0 ? (
          <EmptyState
            icon="coupon"
            title={coupons.length ? "No coupons match" : "No promo coupons yet"}
            text={
              coupons.length
                ? "Try a different search or status filter."
                : "Create your first promo code above — customers can enter it in their cart or checkout."
            }
          />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Offer</th>
                  <th scope="col">Conditions</th>
                  <th scope="col" className={styles.num}>
                    Usage
                  </th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className={styles.visuallyHidden}>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => {
                  const expired = isCouponExpired(c);
                  const stats = usageByCode.get(c.code) ?? { count: 0, saved: 0 };
                  const isPinned = pinnedCouponCodes.has(c.code);
                  return (
                    <tr key={c.code}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className={styles.cellStrong} style={{ letterSpacing: "0.04em" }}>
                            {c.code}
                          </span>
                          <button
                            type="button"
                            className={styles.btnGhost}
                            onClick={() => void copyCode(c.code)}
                            title="Copy code"
                            aria-label={`Copy ${c.code}`}
                            style={{ padding: "2px 6px", minHeight: 24, fontSize: 11.5 }}
                          >
                            <Icon name={copiedCode === c.code ? "check" : "copy"} size={13} />
                          </button>
                        </div>
                        {c.description && <div className={styles.sub}>{c.description}</div>}
                      </td>
                      <td>
                        <span className={styles.cellStrong}>{formatCouponOffer(c)}</span>
                      </td>
                      <td>
                        <div className={styles.sub}>
                          {c.minOrder ? `Min ${formatPrice(c.minOrder)}` : "No min order"}
                          {c.expiresAt ? ` · Expires ${c.expiresAt}` : " · No expiry"}
                        </div>
                      </td>
                      <td className={styles.num}>
                        <span className={styles.cellStrong}>{stats.count}</span>{" "}
                        <span className={styles.sub}>
                          {stats.count === 1 ? "order" : "orders"}
                          {stats.saved > 0 ? ` · ${formatPrice(stats.saved)}` : ""}
                        </span>
                      </td>
                      <td>
                        {expired ? (
                          <Tone tone="warning">Expired</Tone>
                        ) : c.active ? (
                          <Tone tone="success">Active</Tone>
                        ) : (
                          <Tone tone="neutral">Paused</Tone>
                        )}
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            className={`${styles.btnSm} ${isPinned ? styles.btnPrimary : ""}`}
                            onClick={() => void handleTogglePinCoupon(c)}
                            disabled={savingPromos}
                            title={isPinned ? "Remove from top header promo bar" : "Show in top header promo bar"}
                          >
                            {isPinned ? "In top bar" : "Show in bar"}
                          </button>
                          <button type="button" className={styles.btnSm} onClick={() => void handleToggleActive(c)}>
                            {c.active ? "Pause" : "Enable"}
                          </button>
                          <button type="button" className={styles.btnSm} onClick={() => startEdit(c)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className={`${styles.btnSm} ${styles.btnDanger}`}
                            onClick={() => void handleDelete(c)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
