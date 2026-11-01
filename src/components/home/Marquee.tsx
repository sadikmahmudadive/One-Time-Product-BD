import { MARQUEE_ITEMS } from "@/lib/content";
import styles from "./Marquee.module.css";

export function Marquee() {
  // Duplicated once so the -50% translate loops seamlessly.
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className={styles.band}>
      <div className={styles.track} aria-hidden="true">
        {items.map((label, i) => (
          <span key={i} className={styles.item}>
            <span>{label}</span>
            <span className="it">✕</span>
          </span>
        ))}
      </div>
    </div>
  );
}
