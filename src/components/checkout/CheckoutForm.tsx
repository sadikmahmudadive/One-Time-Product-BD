"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useAuth } from "@/lib/firebase/auth-context";
import { formatPrice } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/context";
import { submitOrder } from "@/lib/orders";
import styles from "./CheckoutForm.module.css";

type Status = "idle" | "sending" | "error";

export function CheckoutForm() {
  const router = useRouter();
  const { ready, lines, subtotal, unpricedCount, clear } = useCart();
  const { user } = useAuth();
  const { t, pick } = useLanguage();
  const [status, setStatus] = useState<Status>("idle");

  if (!ready) return <div className={`wrap ${styles.page}`} aria-busy="true" />;
  if (!lines.length) {
    return (
      <div className={`wrap ${styles.page}`}>
        <div className={styles.empty}>
          <h2>{t.cart.emptyTitle}</h2>
          <p>{pick("Add products before checking out.", "চেকআউটের আগে কার্টে পণ্য যোগ করুন।")}</p>
          <Link className="btn btn-primary" href="/shop">
            {t.cart.browseShop}
          </Link>
        </div>
      </div>
    );
  }
  if (unpricedCount) {
    return (
      <div className={`wrap ${styles.page}`}>
        <div className={styles.empty}>
          <h2>{pick("Let’s confirm your price", "মূল্য নিশ্চিত করুন")}</h2>
          <p>
            {pick(
              `Your cart has ${unpricedCount} item${unpricedCount === 1 ? "" : "s"} without a listed price, so it needs a quote before checkout.`,
              `আপনার কার্টে ${unpricedCount}টি পণ্যের মূল্য তালিকাভুক্ত নয়, তাই চেকআউটের আগে কোটেশন প্রয়োজন।`
            )}
          </p>
          <Link className="btn btn-primary" href="/quote?from=cart">
            {t.nav.requestBulkQuote}
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    setStatus("sending");
    try {
      const orderId = await submitOrder({
        userId: user?.uid,
        customer: { name: fields.name, phone: fields.phone, email: fields.email || user?.email || undefined, district: fields.district, address: fields.address || undefined },
        items: lines.map((line) => ({ slug: line.slug, name: line.name, variantId: line.variantId, variantLabel: line.variantLabel, unitPrice: line.unitPrice, qty: line.qty, subtotal: line.unitPrice === null ? null : line.unitPrice * line.qty })),
        totalPrice: subtotal,
        status: "pending",
      });
      try {
        const key = "otpb_recent_orders";
        const prev = JSON.parse(localStorage.getItem(key) || "[]") as { id: string; date: string; total: number }[];
        const next = [{ id: orderId, date: new Date().toISOString(), total: subtotal }, ...prev.filter((o) => o.id !== orderId)].slice(0, 5);
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Ignore storage restrictions
      }
      clear();
      router.push(`/order-confirmation?order=${encodeURIComponent(orderId)}`);
    } catch {
      setStatus("error");
    }
  }

  return <div className={`wrap ${styles.page}`}><form className={styles.layout} onSubmit={onSubmit}>
    <section className={styles.formCard} aria-labelledby="customer-h">
      <p className="eyebrow">{pick("Secure order request", "নিরাপদ অর্ডার অনুরোধ")}</p><h2 id="customer-h">{t.checkout.customerDetails}</h2>
      <p className={styles.lede}>{pick("We will confirm delivery charge and payment instructions before processing your order.", "অর্ডার প্রক্রিয়াকরণের আগে আমরা ডেলিভারি চার্জ ও পেমেন্ট নির্দেশনা জানিয়ে দেবো।")}</p>
      <div className={styles.fields}>
        <label><span className="lbl">{t.checkout.fullName}</span><input className="field" name="name" autoComplete="name" required defaultValue={user?.displayName ?? ""} key={`name-${user?.uid ?? "guest"}`} /></label>
        <label><span className="lbl">{t.checkout.phone}</span><input className="field" name="phone" type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" required /></label>
        <label><span className="lbl">{t.checkout.email}</span><input className="field" name="email" type="email" autoComplete="email" defaultValue={user?.email ?? ""} key={`email-${user?.uid ?? "guest"}`} /></label>
        <label><span className="lbl">{t.checkout.district}</span><input className="field" name="district" autoComplete="address-level1" placeholder={pick("e.g. Dhaka", "যেমন: ঢাকা")} required /></label>
        <label className={styles.full}><span className="lbl">{t.checkout.address}</span><textarea className="field" name="address" rows={3} autoComplete="street-address" /></label>
        <label className={styles.full}><span className="lbl">{t.checkout.notes}</span><textarea className="field" name="notes" rows={3} /></label>
      </div>
      {status === "error" && <p className={styles.error} role="alert">{pick("We couldn’t place the order. Please check your connection and try again.", "অর্ডার সম্পন্ন করা যায়নি। অনুগ্রহ করে ইন্টারনেট সংযোগ যাচাই করে আবার চেষ্টা করুন।")}</p>}
      <button className="btn btn-primary" disabled={status === "sending"}>{status === "sending" ? t.checkout.placingOrder : t.checkout.placeOrder}</button>
    </section>
    <aside className={styles.summary}><h2>{t.checkout.orderSummary}</h2><ul>{lines.map((line) => <li key={line.key}><span><b>{line.qty} ×</b> {line.name}{line.variantLabel && <small>{line.variantLabel}</small>}</span><strong>{formatPrice((line.unitPrice ?? 0) * line.qty)}</strong></li>)}</ul><div className={styles.total}><span>{t.cart.subtotal}</span><strong>{formatPrice(subtotal)}</strong></div><p>{t.cart.note}</p></aside>
  </form></div>;
}
