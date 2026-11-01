import { Breadcrumbs } from "./Breadcrumbs";
import type { Crumb } from "./Breadcrumbs";
import styles from "./PageHero.module.css";

interface PageHeroProps {
  crumbs: Crumb[];
  /** Plain part of the title. */
  title: string;
  /** Italic lime tail of the title, if any. */
  accent?: string;
  lede?: string;
  children?: React.ReactNode;
}

/** Dark evergreen band that opens every inner page and carries its h1. */
export function PageHero({ crumbs, title, accent, lede, children }: PageHeroProps) {
  return (
    <section id="top" className={styles.hero}>
      <div aria-hidden="true" className={styles.dots} />
      <div className={`wrap ${styles.inner}`}>
        <Breadcrumbs items={crumbs} tone="dark" />
        <h1 className={styles.title}>
          {title}
          {accent && (
            <>
              {" "}
              <span className="it" style={{ color: "var(--accent-500)" }}>
                {accent}
              </span>
            </>
          )}
        </h1>
        {lede && <p className={styles.lede}>{lede}</p>}
        {children && <div className={styles.extra}>{children}</div>}
      </div>
    </section>
  );
}
