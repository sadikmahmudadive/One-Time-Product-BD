"use client";

import Link from "next/link";
import { useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { getProduct, hasVariants, priceLabel } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { QuantityStepper } from "./QuantityStepper";
import styles from "./ProductPurchase.module.css";

/** Price, pack picker, quantity and the buy / quote actions for one product. */
export function ProductPurchase({ slug }: { slug: string }) {
  const product = getProduct(slug)!;
  const variants = hasVariants(product) ? product.variants : null;
  const [variantId, setVariantId] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState(1);

  const variant = variants?.find((v) => v.id === variantId);
  const needsChoice = !!variants && !variant;
  const unit = variant ? variant.price : product.price;
  const quoteHref = `/quote?product=${product.slug}${variant ? `&pack=${variant.pieces}` : ""}`;

  return (
    <div className={styles.root}>
      <div className={styles.priceBlock} aria-live="polite">
        {needsChoice ? (
          <>
            <p className={styles.price}>{priceLabel(product)}</p>
            <p className={styles.basis}>Price per pack — choose a pack size to see its price.</p>
          </>
        ) : unit === null ? (
          <>
            <p className={styles.price}>Price on request</p>
            <p className={styles.basis}>We haven’t listed a price for this option yet. Ask us and we’ll confirm it.</p>
          </>
        ) : (
          <>
            <p className={styles.price}>{formatPrice(unit)}</p>
            <p className={styles.basis}>
              {variant ? `For one pack of ${variant.pieces}` : "Price as listed"}
              {qty > 1 && ` · ${qty} × ${formatPrice(unit)} = ${formatPrice(unit * qty)}`}
            </p>
          </>
        )}
      </div>

      {variants && (
        <fieldset className={styles.packs}>
          <legend className={styles.legend}>Pack size (pieces) — required</legend>
          <div className={styles.packGrid}>
            {variants.map((v) => (
              <label key={v.id} className={styles.pack}>
                <input
                  className={styles.radio}
                  type="radio"
                  name="pack"
                  value={v.id}
                  checked={variantId === v.id}
                  onChange={() => setVariantId(v.id)}
                />
                <span className={styles.packBody}>
                  <span className={styles.packQty}>{v.pieces}</span>
                  <span className={styles.packPrice}>{v.price === null ? "On request" : formatPrice(v.price)}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className={styles.buyRow}>
        <QuantityStepper value={qty} onChange={setQty} label={product.name} />
        {needsChoice ? (
          <button type="button" className="btn" disabled>
            Choose a pack size
          </button>
        ) : unit === null ? (
          <Link className="btn btn-primary" href={quoteHref}>
            Ask for this price
          </Link>
        ) : (
          <AddToCartButton slug={slug} variantId={variant?.id} qty={qty} className={`btn btn-primary ${styles.add}`}>
            Add to cart
          </AddToCartButton>
        )}
      </div>

      <Link className={styles.quoteLink} href={quoteHref}>
        Need a larger quantity? Request a bulk quote <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
