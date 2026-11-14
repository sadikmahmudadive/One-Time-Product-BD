"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatDateTime, shortId, whatsappLink } from "@/lib/admin-utils";
import { useContact } from "@/lib/contact-context";
import { useAuth } from "@/lib/firebase/auth-context";
import {
  getOrderFromFirestore,
  getUserOrdersFromFirestore,
  type OrderRecord,
} from "@/lib/firebase/firestore";
import { formatPrice } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/context";
import styles from "./OrderTracker.module.css";

interface RecentDeviceOrder {
  id: string;
  date: string;
  total: number;
}

const STATUS_LABELS: Record<OrderRecord["status"], string> = {
  pending: "Pending Review",
  confirmed: "Confirmed & Packing",
  shipped: "Shipped",
  cancelled: "Cancelled",
};

const STEPS: {
  key: Exclude<OrderRecord["status"], "cancelled">;
  title: string;
  desc: string;
}[] = [
  {
    key: "pending",
    title: "Order Received",
    desc: "We received your order request and are reviewing stock & delivery charges.",
  },
  {
    key: "confirmed",
    title: "Confirmed & Packing",
    desc: "Order confirmed! Our warehouse team is packing your items.",
  },
  {
    key: "shipped",
    title: "Shipped",
    desc: "Dispatched from our Dhaka warehouse and on the way to your address.",
  },
];

function normalizePhone(val: string) {
  return val.replace(/\D/g, "").slice(-10);
}

export function OrderTracker() {
  const searchParams = useSearchParams();
  const initialOrderParam = searchParams.get("order") || "";
  const { user, loading: authLoading } = useAuth();
  const { contact } = useContact();

  const [orderIdInput, setOrderIdInput] = useState(initialOrderParam);
  const [phoneInput, setPhoneInput] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<OrderRecord | null>(null);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedId, setCopiedId] = useState(false);

  const [myOrders, setMyOrders] = useState<OrderRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [deviceOrders, setDeviceOrders] = useState<RecentDeviceOrder[]>([]);

  // Load recent device orders from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("otpb_recent_orders") || "[]");
      if (Array.isArray(saved)) {
        setDeviceOrders(saved);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const performLookup = useCallback(
    async (targetId: string, verifyPhone?: string) => {
      const cleanId = targetId.trim();
      if (!cleanId) {
        setErrorMsg("Please enter your Order Reference ID.");
        return;
      }

      setLoadingLookup(true);
      setErrorMsg("");

      try {
        const order = await getOrderFromFirestore(cleanId);
        if (!order) {
          setTrackedOrder(null);
          setErrorMsg(
            `No order found with reference "${cleanId}". Please double-check your Order ID from your confirmation page.`
          );
          return;
        }

        // Optional phone verification if entered by customer
        if (verifyPhone && verifyPhone.trim()) {
          const entered = normalizePhone(verifyPhone);
          const actual = normalizePhone(order.customer.phone || "");
          if (entered.length < 6 || !actual.endsWith(entered.slice(-8))) {
            setTrackedOrder(null);
            setErrorMsg("The phone number does not match the number used on this order.");
            return;
          }
        }

        setTrackedOrder(order);
      } catch (err) {
        console.error("Order tracking lookup error:", err);
        const code = (err as { code?: string })?.code;
        if (code === "permission-denied") {
          setErrorMsg(
            "Unable to look up this order due to database permissions. Please sign in with the account used at checkout or contact support."
          );
        } else {
          setErrorMsg("Could not fetch order details right now. Please try again.");
        }
      } finally {
        setLoadingLookup(false);
      }
    },
    []
  );

  // Auto-lookup if ?order= is in URL
  useEffect(() => {
    if (initialOrderParam) {
      setOrderIdInput(initialOrderParam);
      performLookup(initialOrderParam);
    }
  }, [initialOrderParam, performLookup]);

  // Load signed-in customer's orders
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setMyOrders([]);
      return;
    }

    let cancelled = false;
    setLoadingHistory(true);
    getUserOrdersFromFirestore(user.uid)
      .then((list) => {
        if (!cancelled) {
          setMyOrders(list);
          if (!initialOrderParam && !trackedOrder && list.length > 0) {
            setTrackedOrder(list[0]);
            if (list[0].id) setOrderIdInput(list[0].id);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load customer order history:", err);
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, initialOrderParam, trackedOrder]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    performLookup(orderIdInput, phoneInput);
  }

  function handleCopyRef(id: string) {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

  const { lang, t, pick } = useLanguage();

  const statusLabels: Record<OrderRecord["status"], string> = {
    pending: t.track.statusPending,
    confirmed: t.track.statusConfirmed,
    shipped: t.track.statusShipped,
    cancelled: t.track.statusCancelled,
  };

  const steps = lang === "bn"
    ? [
        {
          key: "pending" as const,
          title: t.track.statusPending,
          desc: "আপনার অর্ডার পাওয়া গেছে এবং স্টক ও ডেলিভারি চার্জ যাচাই করা হচ্ছে।",
        },
        {
          key: "confirmed" as const,
          title: t.track.statusConfirmed,
          desc: "অর্ডার নিশ্চিত হয়েছে! আমাদের টিম আপনার পণ্য প্যাক করছে।",
        },
        {
          key: "shipped" as const,
          title: t.track.statusShipped,
          desc: "আপনার অর্ডার ডেলিভারির জন্য পাঠানো হয়েছে।",
        },
      ]
    : STEPS;

  const currentStepIndex = trackedOrder
    ? steps.findIndex((s) => s.key === trackedOrder.status)
    : -1;

  const waHref =
    contact.whatsapp && trackedOrder?.id
      ? whatsappLink(
          contact.whatsapp,
          `Hi One Time Product BD, I am checking the status of my order #${trackedOrder.id}.`
        )
      : null;

  return (
    <div className={`wrap ${styles.page}`}>
      <header className={styles.header}>
        <p className="eyebrow">{t.track.eyebrow}</p>
        <h1>{t.track.title}</h1>
        <p className={styles.lede}>{t.track.subtitle}</p>
      </header>

      {/* Lookup Card */}
      <section className={styles.lookupCard} aria-label="Order lookup">
        <form className={styles.lookupForm} onSubmit={handleSubmit}>
          <div>
            <label className="lbl" htmlFor="track-order-id">
              {t.track.orderIdLabel}
            </label>
            <input
              id="track-order-id"
              className="field"
              type="text"
              placeholder={t.track.orderIdPlaceholder}
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="lbl" htmlFor="track-phone">
              {t.track.phoneLabel}
            </label>
            <input
              id="track-phone"
              className="field"
              type="tel"
              placeholder={t.track.phonePlaceholder}
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loadingLookup}>
            {loadingLookup ? t.track.searching : t.track.trackBtn}
          </button>
        </form>

        {deviceOrders.length > 0 && (
          <div className={styles.recentChips}>
            <span>{t.track.recentOrders}</span>
            {deviceOrders.map((d) => (
              <button
                key={d.id}
                type="button"
                className={styles.chipBtn}
                onClick={() => {
                  setOrderIdInput(d.id);
                  setPhoneInput("");
                  performLookup(d.id);
                }}
              >
                #{shortId(d.id)} · {formatPrice(d.total)}
              </button>
            ))}
          </div>
        )}

        {errorMsg && (
          <p className={styles.errorBox} role="alert">
            {errorMsg}
          </p>
        )}
      </section>

      {/* Active Tracked Order Details & Stepper */}
      {trackedOrder && (
        <section className={styles.resultCard} aria-label="Order tracking status">
          <div className={styles.resultHead}>
            <div className={styles.refWrap}>
              <div className={styles.refRow}>
                <span className={styles.refCode}>{pick("Order", "অর্ডার")} #{trackedOrder.id}</span>
                {trackedOrder.id && (
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={() => handleCopyRef(trackedOrder.id!)}
                  >
                    {copiedId ? pick("Copied!", "কপি হয়েছে!") : pick("Copy ID", "আইডি কপি")}
                  </button>
                )}
              </div>
              <span className={styles.orderDate}>
                {t.track.placedOn} {formatDateTime(trackedOrder.createdAt)}
              </span>
            </div>

            <span className={`${styles.statusBadge} ${styles[`status_${trackedOrder.status}`]}`}>
              {statusLabels[trackedOrder.status]}
            </span>
          </div>

          {/* Stepper Timeline */}
          <div className={styles.stepperSection}>
            {trackedOrder.status === "cancelled" ? (
              <div className={styles.cancelledBanner} role="status">
                <span style={{ fontSize: 22 }}>✕</span>
                <div>
                  <h3>{t.track.statusCancelled}</h3>
                  <p>{t.track.cancelledNote}</p>
                </div>
              </div>
            ) : (
              <div className={styles.stepper}>
                {steps.map((step, idx) => {
                  const isDone = idx < currentStepIndex || trackedOrder.status === "shipped";
                  const isActive = idx === currentStepIndex && trackedOrder.status !== "shipped";
                  return (
                    <div
                      key={step.key}
                      className={`${styles.step} ${isDone ? styles.stepDone : ""} ${isActive ? styles.stepActive : ""}`}
                    >
                      <div className={styles.stepCircle} aria-hidden="true">
                        {isDone ? "✓" : idx + 1}
                      </div>
                      <div className={styles.stepText}>
                        <span className={styles.stepTitle}>{step.title}</span>
                        <span className={styles.stepDesc}>{step.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Info & Items */}
          <div className={styles.detailsGrid}>
            <div className={styles.infoBox}>
              <h3>{t.track.deliveryTitle}</h3>
              <dl className={styles.infoList}>
                <div>
                  <dt>{pick("Customer", "গ্রাহক")}</dt>
                  <dd>{trackedOrder.customer.name}</dd>
                </div>
                <div>
                  <dt>{pick("Phone", "ফোন")}</dt>
                  <dd>{trackedOrder.customer.phone}</dd>
                </div>
                <div>
                  <dt>{pick("District / City", "জেলা / শহর")}</dt>
                  <dd>{trackedOrder.customer.district}</dd>
                </div>
                {trackedOrder.customer.address && (
                  <div>
                    <dt>{pick("Delivery Address", "ডেলিভারি ঠিকানা")}</dt>
                    <dd>{trackedOrder.customer.address}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className={styles.itemsBox}>
              <h3>{t.track.itemsTitle}</h3>
              <ul className={styles.itemsList}>
                {trackedOrder.items.map((item, idx) => (
                  <li key={`${item.slug}-${idx}`}>
                    <div className={styles.itemMeta}>
                      <span className={styles.itemName}>
                        {item.qty} × {item.name}
                      </span>
                      {item.variantLabel && (
                        <span className={styles.itemSub}>{item.variantLabel}</span>
                      )}
                    </div>
                    <span className={styles.itemPrice}>
                      {item.subtotal !== null ? formatPrice(item.subtotal) : pick("On request", "আলোচনা সাপেক্ষে")}
                    </span>
                  </li>
                ))}
              </ul>
              <div className={styles.totalRow}>
                <span>{t.track.totalLabel}</span>
                <span>
                  {trackedOrder.totalPrice !== null
                    ? formatPrice(trackedOrder.totalPrice)
                    : t.common.priceOnRequest}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.resultFoot}>
            <span style={{ fontSize: 13, color: "var(--ink-600)" }}>
              {pick(
                "Delivery charge is confirmed separately based on your district and carton size.",
                "আপনার জেলা ও কার্টনের আকার অনুযায়ী ডেলিভারি চার্জ আলাদাভাবে নিশ্চিত করা হয়।"
              )}
            </span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {waHref ? (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  {pick("Message on WhatsApp", "হোয়াটসঅ্যাপে মেসেজ দিন")}
                </a>
              ) : (
                <Link href="/contact" className="btn btn-secondary">
                  {t.track.needHelp}
                </Link>
              )}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => window.print()}
              >
                {t.track.printSummary}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Signed-in Customer Order History */}
      {user && (
        <section className={styles.historySection} aria-label="Your order history">
          <h2>{t.track.yourHistory}</h2>
          <p className={styles.historySub}>
            {pick("Signed in as", "সাইন ইন করা অ্যাকাউন্ট:")} <strong>{user.email}</strong>.{" "}
            {pick("Click any order below to view its live tracking status.", "লাইভ ট্র্যাকিং দেখতে নিচের যেকোনো অর্ডারে ক্লিক করুন।")}
          </p>

          {loadingHistory ? (
            <p style={{ color: "var(--ink-500)", fontSize: 14 }}>{t.common.loading}</p>
          ) : myOrders.length === 0 ? (
            <div className={styles.lookupCard} style={{ textAlign: "center", padding: "32px 20px" }}>
              <p style={{ margin: "0 0 12px", color: "var(--ink-600)" }}>
                {t.track.noHistory}
              </p>
              <Link href="/shop" className="btn btn-primary">
                {t.cart.browseShop}
              </Link>
            </div>
          ) : (
            <div className={styles.historyGrid}>
              {myOrders.map((ord) => {
                const isSelected = trackedOrder?.id === ord.id;
                return (
                  <button
                    key={ord.id}
                    type="button"
                    className={`${styles.historyCard} ${isSelected ? styles.historyCardActive : ""}`}
                    onClick={() => {
                      setTrackedOrder(ord);
                      if (ord.id) setOrderIdInput(ord.id);
                      setErrorMsg("");
                      window.scrollTo({ top: 180, behavior: "smooth" });
                    }}
                  >
                    <div className={styles.historyTop}>
                      <span className={styles.historyId}>#{shortId(ord.id)}</span>
                      <span className={`${styles.statusBadge} ${styles[`status_${ord.status}`]}`} style={{ padding: "3px 10px", fontSize: 11.5 }}>
                        {statusLabels[ord.status]}
                      </span>
                    </div>
                    <div className={styles.historyMeta}>
                      <div>{formatDateTime(ord.createdAt)}</div>
                      <div>
                        {ord.items.length} {pick(ord.items.length === 1 ? "item" : "items", "টি আইটেম")} · {ord.customer.district}
                      </div>
                    </div>
                    <div className={styles.historyBottom}>
                      <span>{t.checkout.total}</span>
                      <span>
                        {ord.totalPrice !== null ? formatPrice(ord.totalPrice) : pick("On request", "আলোচনা সাপেক্ষে")}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

