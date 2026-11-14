"use client";

import Link from "next/link";
import { ProductShape } from "@/components/ui/ProductShape";
import { buildCloudinaryUrl } from "@/lib/cloudinary/client";
import type { ShapeKind } from "@/lib/content";
import { useLanguage } from "@/lib/i18n/context";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  name: string;
  kind: ShapeKind;
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
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={buildCloudinaryUrl(image, { width: 440, height: 440, crop: "fill" })}
                alt={name}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "inherit" }}
              />
            ) : (
              <ProductShape kind={kind} />
            )}
          </div>
        </Link>
        {onQuickView && (
          <button type="button" className={styles.quickBtn} onClick={onQuickView}>
            {pick("Quick view", "দ্রুত দেখুন")}
          </button>
        )}
      </div>
      <div className={styles.body}>
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
