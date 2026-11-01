import { ProductShape } from "@/components/ui/ProductShape";
import type { ShapeKind } from "@/lib/content";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  name: string;
  kind: ShapeKind;
  /** Corner badge over the image — "New" or an "In stock" state. */
  badge: "new" | "in-stock";
  price: string;
  /** Price basis shown next to the price, e.g. "by pack size". */
  unit?: string;
  /** Optional variant picker slot, rendered between the price and the action. */
  variants?: React.ReactNode;
  /** The add-to-cart control. */
  action: React.ReactNode;
}

export function ProductCard({ name, kind, badge, price, unit, variants, action }: ProductCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {badge === "new" ? (
          <span className={`${styles.badge} ${styles.badgeNew}`}>New</span>
        ) : (
          <span className={`${styles.badge} ${styles.badgeStock}`}>
            <span className={styles.stockDot} />
            In stock
          </span>
        )}
        <div className={styles.img}>
          <ProductShape kind={kind} />
        </div>
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>
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
