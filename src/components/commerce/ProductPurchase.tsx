"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { useCart } from "@/components/cart/CartProvider";
import { getProduct, hasVariants, priceLabel, type Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/context";
import { useProducts } from "@/lib/products-context";
import { QuantityStepper } from "./QuantityStepper";
import styles from "./ProductPurchase.module.css";

/** Height of the mobile buy bar; the toast lifts by this much while the bar is showing. */
const BAR_HEIGHT = 76;

function perPieceLabel(pieces: string, price: number | null, suffix: string): string | null {
  if (price === null) return null;
  const m = pieces.match(/\d+/);
  if (!m) return null;
  const count = Number(m[0]);
  if (!Number.isFinite(count) || count <= 1) return null;
  return `${formatPrice(price / count)} ${suffix}`;
}

/** Price, pack picker, quantity and the buy / quote actions for one product. */
export function ProductPurchase({ slug, initialProduct }: { slug: string; initialProduct?: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { getProduct: getLiveProduct } = useProducts();
  const { t, pick } = useLanguage();
  const product = getLiveProduct(slug) ?? initialProduct ?? getProduct(slug);
  const variants = product && hasVariants(product) ? product.variants : null;
  const [variantId, setVariantId] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState(1);
  const [barVisible, setBarVisible] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);

  const variant = variants?.find((v) => v.id === variantId);
  const needsChoice = !!variants && !variant;
  const unit = variant ? variant.price : product?.price ?? null;
  const quoteHref = `/quote?product=${product?.slug ?? slug}${variant ? `&pack=${variant.pieces}` : ""}`;

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
        {t.product.choosePackSize}
      </a>
    ) : unit === null ? (
      <Link className={`btn btn-primary ${className}`} href={quoteHref}>
        {t.product.askForPrice}
      </Link>
    ) : (
      <AddToCartButton slug={slug} variantId={variant?.id} qty={qty} className={`btn btn-primary ${className}`}>
        {t.common.addToCart}
      </AddToCartButton>
    );

  if (!product) return null;

  return (
    <div className={styles.root}>
      <div className={styles.priceBlock} aria-live="polite">
        {needsChoice ? (
          <>
            <p className={styles.price}>{priceLabel(product)}</p>
            <p className={styles.basis}>{t.product.pricePerPackPrompt}</p>
          </>
        ) : unit === null ? (
          <>
            <p className={styles.price}>{t.common.priceOnRequest}</p>
            <p className={styles.basis}>{t.product.priceOnRequestDesc}</p>
          </>
        ) : (
          <>
            <p className={styles.price}>{formatPrice(unit)}</p>
            <p className={styles.basis}>
              {variant ? `${t.product.forOnePackOf} ${variant.pieces}` : t.product.priceAsListed}
              {qty > 1 && ` · ${qty} × ${formatPrice(unit)} = ${formatPrice(unit * qty)}`}
            </p>
          </>
        )}
      </div>

      {variants && (
        <fieldset className={styles.packs} id="pack">
          <legend className={styles.legend}>
            {t.product.packSizeLegend} <span>{t.product.packRequired}</span>
          </legend>
          <div className={styles.packGrid}>
            {variants.map((v) => {
              const perPc = perPieceLabel(v.pieces, v.price, pick("/ pc", "/ পিস"));
              return (
                <label key={v.id} className={styles.pack}>
                  <input className={styles.radio} type="radio" name="pack" value={v.id} checked={variantId === v.id} onChange={() => setVariantId(v.id)} />
                  <span className={styles.packBody}>
                    <span className={styles.packQty}>{v.pieces}</span>
                    <span className={styles.packPrice}>{v.price === null ? pick("On request", "আলোচনা সাপেক্ষে") : formatPrice(v.price)}</span>
                    {perPc && <span className={styles.packPerUnit}>{perPc}</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div ref={buyRef} className={styles.buyRow}>
        <QuantityStepper value={qty} onChange={setQty} label={product.name} />
        <div className={styles.buyButtons}>
          {action(styles.add)}
          {!needsChoice && unit !== null && (
            <button
              type="button"
              className={`btn btn-secondary ${styles.buyNowBtn}`}
              onClick={() => {
                addItem(slug, variant?.id, qty);
                router.push("/checkout");
              }}
            >
              {pick("Buy now", "এখনই কিনুন")}
            </button>
          )}
        </div>
      </div>

      <div className={styles.dispatchBox}>
        <span className={styles.dispatchDot} aria-hidden="true" />
        <span>
          {pick(
            "Dhaka dispatch within 24–48h · Nationwide delivery across all 64 districts",
            "ঢাকায় ২৪–৪৮ ঘণ্টায় ডেলিভারি · সারা দেশের ৬৪ জেলায় কুরিয়ার সুবিধা"
          )}
        </span>
      </div>

      <Link className={styles.quoteLink} href={quoteHref}>
        {t.product.buyingLarge} {t.product.requestBulkQuote} <span aria-hidden="true">→</span>
      </Link>

      {/* Mobile buy bar: price and the primary action stay reachable while reading the details. */}
      <div className={`${styles.bar} ${barVisible ? styles.barOn : ""}`} aria-hidden={!barVisible}>
        <div className={styles.barInfo}>
          <span className={styles.barName}>{product.name}</span>
          <span className={styles.barPrice}>
            {needsChoice ? priceLabel(product) : unit === null ? t.common.priceOnRequest : formatPrice(unit * qty)}
          </span>
        </div>
        <div className={styles.barAction} {...(barVisible ? {} : { inert: true })}>
          {action(styles.barBtn)}
        </div>
      </div>
    </div>
  );
}
