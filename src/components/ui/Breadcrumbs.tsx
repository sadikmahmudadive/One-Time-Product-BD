import Link from "next/link";
import styles from "./Breadcrumbs.module.css";

export interface Crumb {
  label: string;
  /** Omit for the current page. */
  href?: string;
}

export function Breadcrumbs({ items, tone = "light" }: { items: Crumb[]; tone?: "light" | "dark" }) {
  return (
    <nav aria-label="Breadcrumb" className={`${styles.nav} ${tone === "dark" ? styles.dark : ""}`}>
      <ol className={styles.list}>
        {items.map((c, i) => (
          <li key={c.label} className={styles.item}>
            {c.href ? (
              <Link href={c.href} className={styles.link}>
                {c.label}
              </Link>
            ) : (
              <span aria-current="page">{c.label}</span>
            )}
            {i < items.length - 1 && (
              <span aria-hidden="true" className={styles.sep}>
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
