"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { QuantityStepper } from "@/components/commerce/QuantityStepper";
import { ProductShape } from "@/components/ui/ProductShape";
import { buildCloudinaryUrl } from "@/lib/cloudinary/client";
import { formatPrice } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/context";
import { useCart } from "./CartProvider";
import styles from "./CartDrawer.module.css";

export function CartDrawer() {
  const { ready, lines, count, subtotal, unpricedCount, drawerOpen, closeDrawer, setQty, removeItem } = useCart();
  const { t, pick } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  return (
    <>
      <div className={styles.scrim} onClick={closeDrawer} aria-hidden="true" />
      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label={t.cart.title}>
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <h2 className={styles.title}>{t.cart.title}</h2>
            <span className={styles.countPill}>{count}</span>
          </div>
          <button type="button" className={styles.closeBtn} onClick={closeDrawer} aria-label={t.nav.closeMenu}>
            ×
          </button>
        </div>

        <div className={styles.body}>
          {!ready ? (
            <p style={{ color: "var(--ink-500)", fontSize: 14 }}>{t.common.loading}</p>
          ) : lines.length === 0 ? (
            <div className={styles.empty}>
              <h3>{t.cart.emptyTitle}</h3>
              <p>{t.cart.emptyDesc}</p>
              <Link href="/shop" className="btn btn-primary" onClick={closeDrawer}>
                {t.cart.browseShop}
              </Link>
            </div>
          ) : (
            <ul className={styles.list}>
              {lines.map((line) => {
                const lineTotal = line.unitPrice === null ? null : line.unitPrice * line.qty;
                return (
                  <li key={line.key} className={styles.item}>
                    <Link href={`/product/${line.slug}`} className={styles.thumb} onClick={closeDrawer}>
                      {line.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={buildCloudinaryUrl(line.image, { width: 144, height: 144, crop: "fill" })}
                          alt={line.name}
                          loading="lazy"
                        />
                      ) : (
                        <ProductShape kind={line.kind} />
                      )}
                    </Link>

                    <div className={styles.itemInfo}>
                      <div className={styles.itemTop}>
                        <Link href={`/product/${line.slug}`} className={styles.itemName} onClick={closeDrawer}>
                          {line.name}
                        </Link>
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => removeItem(line.key)}
                          aria-label={`${t.cart.remove} ${line.name}`}
                        >
                          {t.cart.remove}
                        </button>
                      </div>
                      {line.variantLabel && <p className={styles.itemVariant}>{line.variantLabel}</p>}
                      <div className={styles.itemBottom}>
                        <QuantityStepper value={line.qty} onChange={(n) => setQty(line.key, n)} label={line.name} />
                        <span className={styles.itemPrice}>
                          {lineTotal !== null ? formatPrice(lineTotal) : pick("On request", "আলোচনা সাপেক্ষে")}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotalRow}>
              <span>{t.cart.subtotal}</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            {unpricedCount > 0 ? (
              <p className={styles.note}>
                {pick(
                  `${unpricedCount} item(s) have unlisted prices and need a quote confirmation.`,
                  `${unpricedCount}টি পণ্যের মূল্য অনির্ধারিত থাকায় কোটেশন প্রয়োজন।`
                )}
              </p>
            ) : (
              <p className={styles.note}>{t.cart.note}</p>
            )}
            <div className={styles.ctaGrid}>
              <Link href="/cart" className="btn btn-secondary" onClick={closeDrawer}>
                {pick("View cart", "কার্ট দেখুন")}
              </Link>
              <Link
                href={unpricedCount > 0 ? "/quote?from=cart" : "/checkout"}
                className="btn btn-primary"
                onClick={closeDrawer}
              >
                {unpricedCount > 0 ? pick("Request quote", "কোটেশন চান") : t.cart.proceedCheckout}
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
