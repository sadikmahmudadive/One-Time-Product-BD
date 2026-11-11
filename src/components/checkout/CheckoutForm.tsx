"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useAuth } from "@/lib/firebase/auth-context";
import { formatPrice } from "@/lib/format";
import { submitOrder } from "@/lib/orders";
import styles from "./CheckoutForm.module.css";

type Status = "idle" | "sending" | "error";

export function CheckoutForm() {
  const router = useRouter();
  const { ready, lines, subtotal, unpricedCount, clear } = useCart();
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>("idle");

  if (!ready) return <div className={`wrap ${styles.page}`} aria-busy="true" />;
  if (!lines.length) {
    return <div className={`wrap ${styles.page}`}><div className={styles.empty}><h2>Your cart is empty</h2><p>Add products before checking out.</p><Link className="btn btn-primary" href="/shop">Shop products</Link></div></div>;
  }
  if (unpricedCount) {
    return <div className={`wrap ${styles.page}`}><div className={styles.empty}><h2>Let’s confirm your price</h2><p>Your cart has {unpricedCount} item{unpricedCount === 1 ? "" : "s"} without a listed price, so it needs a quote before checkout.</p><Link className="btn btn-primary" href="/quote?from=cart">Request a quote</Link></div></div>;
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
      clear();
      router.push(`/order-confirmation?order=${encodeURIComponent(orderId)}`);
    } catch {
      setStatus("error");
    }
  }

  return <div className={`wrap ${styles.page}`}><form className={styles.layout} onSubmit={onSubmit}>
    <section className={styles.formCard} aria-labelledby="customer-h">
      <p className="eyebrow">Secure order request</p><h2 id="customer-h">Delivery details</h2>
      <p className={styles.lede}>We will confirm delivery charge and payment instructions before processing your order.</p>
      <div className={styles.fields}>
        <label><span className="lbl">Full name</span><input className="field" name="name" autoComplete="name" required defaultValue={user?.displayName ?? ""} key={`name-${user?.uid ?? "guest"}`} /></label>
        <label><span className="lbl">Phone number</span><input className="field" name="phone" type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" required /></label>
        <label><span className="lbl">Email <small>(optional)</small></span><input className="field" name="email" type="email" autoComplete="email" defaultValue={user?.email ?? ""} key={`email-${user?.uid ?? "guest"}`} /></label>
        <label><span className="lbl">District / city</span><input className="field" name="district" autoComplete="address-level1" placeholder="e.g. Dhaka" required /></label>
        <label className={styles.full}><span className="lbl">Delivery address <small>(optional)</small></span><textarea className="field" name="address" rows={3} autoComplete="street-address" /></label>
        <label className={styles.full}><span className="lbl">Order notes <small>(optional)</small></span><textarea className="field" name="notes" rows={3} /></label>
      </div>
      {status === "error" && <p className={styles.error} role="alert">We couldn’t place the order. Please check your connection and try again.</p>}
      <button className="btn btn-primary" disabled={status === "sending"}>{status === "sending" ? "Placing order…" : "Place order request"}</button>
    </section>
    <aside className={styles.summary}><h2>Your order</h2><ul>{lines.map((line) => <li key={line.key}><span><b>{line.qty} ×</b> {line.name}{line.variantLabel && <small>{line.variantLabel}</small>}</span><strong>{formatPrice((line.unitPrice ?? 0) * line.qty)}</strong></li>)}</ul><div className={styles.total}><span>Product subtotal</span><strong>{formatPrice(subtotal)}</strong></div><p>Delivery is confirmed after we review your address and order.</p></aside>
  </form></div>;
}
