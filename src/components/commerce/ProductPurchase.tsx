"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { getProduct, hasVariants, priceLabel } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { QuantityStepper } from "./QuantityStepper";
import styles from "./ProductPurchase.module.css";

/** Height of the mobile buy bar; the toast lifts by this much while the bar is showing. */
const BAR_HEIGHT = 76;

/** Price, pack picker, quantity and the buy / quote actions for one product. */
export function ProductPurchase({ slug }: { slug: string }) {
  const product = getProduct(slug)!;
  const variants = hasVariants(product) ? product.variants : null;
  const [variantId, setVariantId] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState(1);
  const [barVisible, setBarVisible] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);

  const variant = variants?.find((v) => v.id === variantId);
  const needsChoice = !!variants && !variant;
  const unit = variant ? variant.price : product.price;
  const quoteHref = `/quote?product=${product.slug}${variant ? `&pack=${variant.pieces}` : ""}`;

  // Show the sticky bar (small screens only, via CSS) once the main buy row has scrolled above the viewport.
  // Reads the live position on scroll rather than using IntersectionObserver, which can skip big jumps.
  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const update = () => setBarVisible(el.getBoundingClientRect().bottom < 0);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 899px)").matches;
    document.documentElement.style.setProperty("--buybar", barVisible && narrow ? `${BAR_HEIGHT}px` : "0px");
    return () => {
      document.documentElement.style.removeProperty("--buybar");
    };
  }, [barVisible]);

  const action = (className: string) =>
    needsChoice ? (
      <a className="btn" href="#pack" aria-disabled="true" onClick={(e) => (e.preventDefault(), document.getElementById("pack")?.scrollIntoView({ behavior: "smooth", block: "center" }))}>
        Choose a pack size
      </a>
    ) : unit === null ? (
      <Link className={`btn btn-primary ${className}`} href={quoteHref}>
        Ask for this price
      </Link>
    ) : (
      <AddToCartButton slug={slug} variantId={variant?.id} qty={qty} className={`btn btn-primary ${className}`}>
        Add to cart
      </AddToCartButton>
    );

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
        <fieldset className={styles.packs} id="pack">
          <legend className={styles.legend}>
            Pack size <span>(pieces) — required</span>
          </legend>
          <div className={styles.packGrid}>
            {variants.map((v) => (
              <label key={v.id} className={styles.pack}>
                <input className={styles.radio} type="radio" name="pack" value={v.id} checked={variantId === v.id} onChange={() => setVariantId(v.id)} />
                <span className={styles.packBody}>
                  <span className={styles.packQty}>{v.pieces}</span>
                  <span className={styles.packPrice}>{v.price === null ? "On request" : formatPrice(v.price)}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div ref={buyRef} className={styles.buyRow}>
        <QuantityStepper value={qty} onChange={setQty} label={product.name} />
        {action(styles.add)}
      </div>

      <Link className={styles.quoteLink} href={quoteHref}>
        Need a larger quantity? Request a bulk quote <span aria-hidden="true">→</span>
      </Link>

      {/* Mobile buy bar: price and the primary action stay reachable while reading the details. */}
      <div className={`${styles.bar} ${barVisible ? styles.barOn : ""}`} aria-hidden={!barVisible}>
        <div className={styles.barInfo}>
          <span className={styles.barName}>{product.name}</span>
          <span className={styles.barPrice}>
            {needsChoice ? priceLabel(product) : unit === null ? "Price on request" : formatPrice(unit * qty)}
          </span>
        </div>
        <div className={styles.barAction} {...(barVisible ? {} : { inert: true })}>
          {action(styles.barBtn)}
        </div>
      </div>
    </div>
  );
}
