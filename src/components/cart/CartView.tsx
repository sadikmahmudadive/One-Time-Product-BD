"use client";

import Link from "next/link";
import { QuantityStepper } from "@/components/commerce/QuantityStepper";
import { ProductShape } from "@/components/ui/ProductShape";
import { CATEGORIES, getProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/context";
import { useCart } from "./CartProvider";
import styles from "./CartView.module.css";

export function CartView() {
  const { ready, lines, subtotal, unpricedCount, setQty, removeItem, clear } = useCart();
  const { t, pick } = useLanguage();

  if (!ready) return <div className={`wrap ${styles.wrap}`} aria-busy="true" style={{ minHeight: 320 }} />;

  if (lines.length === 0) {
    return (
      <div className={`wrap ${styles.wrap}`}>
        <div className={styles.empty} role="status">
          <h2>{t.cart.emptyTitle}</h2>
          <p>{t.cart.emptyDesc}</p>
          <div className={styles.cats}>
            {CATEGORIES.map((c) => (
              <Link key={c.id} className="btn btn-secondary" href={`/shop/${c.id}`}>
                {c.short}
              </Link>
            ))}
          </div>
          <Link className={styles.link} href="/quote">
            {t.nav.requestBulkQuote} →
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
              {pick("Items", "পণ্যসমূহ")}
            </h2>
            <button type="button" className={styles.textBtn} onClick={clear}>
              {pick("Remove all", "সব মুছুন")}
            </button>
          </div>
          <ul className={styles.list}>
            {lines.map((l) => {
              const product = getProduct(l.slug);
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
                      {l.unitPrice === null ? t.common.priceOnRequest : `${formatPrice(l.unitPrice)}${l.variantLabel ? ` ${t.common.perPack}` : ""}`}
                    </p>
                  </div>
                  <div className={styles.qty}>
                    <QuantityStepper value={l.qty} onChange={(n) => setQty(l.key, n)} label={product?.name ?? l.name} />
                    <button type="button" className={styles.textBtn} onClick={() => removeItem(l.key)} aria-label={`Remove ${l.name}${l.variantLabel ? `, ${l.variantLabel}` : ""}`}>
                      {t.cart.remove}
                    </button>
                  </div>
                  <p className={styles.total}>{total === null ? "—" : formatPrice(total)}</p>
                </li>
              );
            })}
          </ul>
          <Link className={styles.link} href="/shop">
            ← {t.cart.continueShopping}
          </Link>
        </section>

        <aside className={styles.summary} aria-labelledby="summary-h">
          <h2 id="summary-h" className={styles.h2}>
            {t.checkout.orderSummary}
          </h2>
          <dl className={styles.sums}>
            <div>
              <dt>{t.cart.subtotal}{unpricedCount > 0 && pick(" (priced items)", " (নির্ধারিত মূল্যের)")}</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div>
              <dt>{pick("Delivery", "ডেলিভারি")}</dt>
              <dd className={styles.muted}>{pick("Confirmed with your order", "অর্ডার নিশ্চিত হলে জানানো হবে")}</dd>
            </div>
          </dl>
          {unpricedCount > 0 && (
            <p className={styles.notice} role="note">
              {pick(
                `${unpricedCount} ${unpricedCount === 1 ? "item has" : "items have"} no listed price. We’ll confirm ${unpricedCount === 1 ? "it" : "them"} when you send the enquiry.`,
                `${unpricedCount} টি পণ্যের মূল্য তালিকাভুক্ত নয়। আপনার অনুরোধ পাওয়ার পর মূল্য জানিয়ে দেওয়া হবে।`
              )}
            </p>
          )}
          {unpricedCount > 0 ? (
            <>
              <Link href="/quote?from=cart" className="btn btn-primary btn-block">{pick("Request a price confirmation", "মূল্য নিশ্চিতকরণের অনুরোধ")}</Link>
              <p className={styles.hint}>{pick("We need to confirm the unlisted prices before this order can be checked out.", "চেকআউটের আগে অনির্ধারিত মূল্য নিশ্চিত করা প্রয়োজন।")}</p>
            </>
          ) : (
            <>
              <Link href="/checkout" className="btn btn-primary btn-block">{t.cart.proceedCheckout}</Link>
              <p className={styles.hint}>{t.cart.note}</p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
