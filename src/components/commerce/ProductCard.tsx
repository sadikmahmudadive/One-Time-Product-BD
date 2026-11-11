import Link from "next/link";
import { ProductShape } from "@/components/ui/ProductShape";
import { buildCloudinaryUrl } from "@/lib/cloudinary/client";
import type { ShapeKind } from "@/lib/content";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  name: string;
  kind: ShapeKind;
  /** Cloudinary public ID or image URL */
  image?: string;
  /** Product page the image and title lead to. */
  href: string;
  /** Corner badge over the image. */
  badge?: "new" | "in-stock";
  /** Capacity or pack summary shown under the title. */
  meta?: string;
  /** Price text, already formatted — e.g. "From ৳1,500" or "Price on request". */
  price: string;
  /** Price basis shown next to the price, e.g. "by pack size". */
  unit?: string;
  /** Optional variant picker slot, rendered between the price and the action. */
  variants?: React.ReactNode;
  /** The add-to-cart (or "Choose options") control. */
  action: React.ReactNode;
}

export function ProductCard({ name, kind, image, href, badge, meta, price, unit, variants, action }: ProductCardProps) {
  return (
    <article className={styles.card}>
      <Link href={href} className={styles.media} aria-label={name} tabIndex={-1}>
        {badge === "new" && <span className={`${styles.badge} ${styles.badgeNew}`}>New</span>}
        {badge === "in-stock" && (
          <span className={`${styles.badge} ${styles.badgeStock}`}>
            <span className={styles.stockDot} />
            In stock
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
