"use client";

import Link from "next/link";
import { QuantityStepper } from "@/components/commerce/QuantityStepper";
import { ProductShape } from "@/components/ui/ProductShape";
import { CATEGORIES, getProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { useCart } from "./CartProvider";
import styles from "./CartView.module.css";

export function CartView() {
  const { ready, lines, subtotal, unpricedCount, setQty, removeItem, clear } = useCart();

  if (!ready) return <div className={`wrap ${styles.wrap}`} aria-busy="true" style={{ minHeight: 320 }} />;

  if (lines.length === 0) {
    return (
      <div className={`wrap ${styles.wrap}`}>
        <div className={styles.empty} role="status">
          <h2>Your cart is empty</h2>
          <p>Pick a category to start, or send us a bulk enquiry.</p>
          <div className={styles.cats}>
            {CATEGORIES.map((c) => (
              <Link key={c.id} className="btn btn-secondary" href={`/shop/${c.id}`}>
                {c.short}
              </Link>
            ))}
          </div>
          <Link className={styles.link} href="/quote">
            Request a bulk quote →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`wrap ${styles.wrap}`}>
      <div className={styles.layout}>
        <section aria-labelledby="items-h">
          <div className={styles.listHead}>
            <h2 id="items-h" className={styles.h2}>
              Items
            </h2>
            <button type="button" className={styles.textBtn} onClick={clear}>
              Remove all
            </button>
          </div>
          <ul className={styles.list}>
            {lines.map((l) => {
              const product = getProduct(l.slug)!;
              const total = l.unitPrice === null ? null : l.unitPrice * l.qty;
              return (
                <li key={l.key} className={styles.line}>
                  <Link href={`/product/${l.slug}`} className={styles.thumb} aria-label={l.name} tabIndex={-1}>
                    <ProductShape kind={l.kind} />
                  </Link>
                  <div className={styles.info}>
                    <Link href={`/product/${l.slug}`} className={styles.name}>
                      {l.name}
                    </Link>
                    {l.variantLabel && <p className={styles.variant}>{l.variantLabel}</p>}
                    <p className={styles.unit}>
                      {l.unitPrice === null ? "Price on request" : `${formatPrice(l.unitPrice)}${l.variantLabel ? " per pack" : ""}`}
                    </p>
                  </div>
                  <div className={styles.qty}>
                    <QuantityStepper value={l.qty} onChange={(n) => setQty(l.key, n)} label={product.name} />
                    <button type="button" className={styles.textBtn} onClick={() => removeItem(l.key)} aria-label={`Remove ${l.name}${l.variantLabel ? `, ${l.variantLabel}` : ""}`}>
                      Remove
                    </button>
                  </div>
                  <p className={styles.total}>{total === null ? "—" : formatPrice(total)}</p>
                </li>
              );
            })}
          </ul>
          <Link className={styles.link} href="/shop">
            ← Continue shopping
          </Link>
        </section>

        <aside className={styles.summary} aria-labelledby="summary-h">
          <h2 id="summary-h" className={styles.h2}>
            Order summary
          </h2>
          <dl className={styles.sums}>
            <div>
              <dt>Subtotal{unpricedCount > 0 && " (priced items)"}</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd className={styles.muted}>Confirmed with your order</dd>
            </div>
          </dl>
          {unpricedCount > 0 && (
            <p className={styles.notice} role="note">
              {unpricedCount} {unpricedCount === 1 ? "item has" : "items have"} no listed price. We’ll confirm {unpricedCount === 1 ? "it" : "them"} when you send the enquiry.
            </p>
          )}
          {unpricedCount > 0 ? (
            <>
              <Link href="/quote?from=cart" className="btn btn-primary btn-block">Request a price confirmation</Link>
              <p className={styles.hint}>We need to confirm the unlisted prices before this order can be checked out.</p>
            </>
          ) : (
            <>
              <Link href="/checkout" className="btn btn-primary btn-block">Proceed to checkout</Link>
              <p className={styles.hint}>Delivery cost and payment instructions are confirmed after you place the order request.</p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
