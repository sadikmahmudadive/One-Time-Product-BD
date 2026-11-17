"use client";

import Link from "next/link";
import { buildCloudinaryUrl } from "@/lib/cloudinary/client";
import type { ShapeKind } from "@/lib/content";
import { useLanguage } from "@/lib/i18n/context";
import styles from "./ProductCard.module.css";

const FALLBACK_BY_KIND: Record<ShapeKind, string> = {
  rectBlack: "/images/hero/black-premium-box.jpg",
  square: "/images/hero/square-clear-boxes.jpg",
  rectClear: "/images/hero/square-clear-boxes.jpg",
  round: "/images/hero/black-premium-box.jpg",
  heart: "/images/hero/acrylic-dessert-cup.jpg",
  cup: "/images/hero/acrylic-dessert-cup.jpg",
  crate: "/images/hero/plastic-storage-crate.jpg",
};

interface ProductCardProps {
  name: string;
  kind: ShapeKind;
  /** Optional short category eyebrow label above the title. */
  categoryLabel?: string;
  /** Cloudinary public ID or image URL */
  image?: string;
  /** Product page the image and title lead to. */
  href: string;
  /** Corner badge over the image. */
  badge?: "new" | "in-stock" | "low-stock";
  /** Capacity or pack summary shown under the title. */
  meta?: string;
  /** Price text, already formatted — e.g. "From ৳1,500" or "Price on request". */
  price: string;
  /** Price basis shown next to the price, e.g. "by pack size". */
  unit?: string;
  /** Optional variant picker slot, rendered between the price and the action. */
  variants?: React.ReactNode;
  /** Optional Quick View callback to inspect specs & variants in a modal. */
  onQuickView?: () => void;
  /** The add-to-cart (or "Choose options") control. */
  action: React.ReactNode;
}

export function ProductCard({
  name,
  kind,
  categoryLabel,
  image,
  href,
  badge,
  meta,
  price,
  unit,
  variants,
  onQuickView,
  action,
}: ProductCardProps) {
  const { pick } = useLanguage();

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Link href={href} aria-label={name} tabIndex={-1} style={{ display: "block", width: "100%", height: "100%" }}>
          {badge === "new" && <span className={`${styles.badge} ${styles.badgeNew}`}>{pick("New", "নতুন")}</span>}
          {badge === "in-stock" && (
            <span className={`${styles.badge} ${styles.badgeStock}`}>
              <span className={styles.stockDot} />
              {pick("In stock", "স্টকে আছে")}
            </span>
          )}
          {badge === "low-stock" && (
            <span className={`${styles.badge} ${styles.badgeLow}`}>
              <span className={styles.stockDot} />
              {pick("Low stock", "স্টক কম")}
            </span>
          )}
          <div className={styles.img}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                image
                  ? buildCloudinaryUrl(image, { width: 520, height: 520, crop: "fit", quality: "auto", format: "auto" })
                  : FALLBACK_BY_KIND[kind]
              }
              alt={name}
              loading="lazy"
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src !== window.location.origin + FALLBACK_BY_KIND[kind]) {
                  img.src = FALLBACK_BY_KIND[kind];
                }
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: image ? "contain" : "cover",
                padding: image ? "12px" : 0,
                borderRadius: "inherit",
              }}
            />
          </div>
        </Link>
        {onQuickView && (
          <button type="button" className={styles.quickBtn} onClick={onQuickView}>
            {pick("Quick view", "দ্রুত দেখুন")}
          </button>
        )}
      </div>
      <div className={styles.body}>
        {categoryLabel && <span className={styles.categoryLabel}>{categoryLabel}</span>}
        <h3 className={styles.name}>
          <Link href={href} className={styles.nameLink}>
            {name}
          </Link>
        </h3>
        {meta && <p className={styles.meta}>{meta}</p>}
        <p className={styles.priceRow}>
          <span className={styles.price}>{price}</span>
          {unit && <span className={styles.unit}>{unit}</span>}
        </p>
        {variants}
        <div className={styles.action}>{action}</div>
      </div>
    </article>
  );
}
