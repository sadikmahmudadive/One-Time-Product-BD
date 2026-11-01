import { ProductShape } from "@/components/ui/ProductShape";
import { RANGE_ROWS } from "@/lib/content";
import styles from "./RangeSection.module.css";

export function RangeSection() {
  return (
    <section id="range" className={`section ${styles.section}`}>
      <div className={`wrap ${styles.inner}`}>
        <div className={`reveal section-head ${styles.head}`}>
          <div>
            <p className="eyebrow" style={{ color: "var(--brand-700)" }}>
              02 — The range
            </p>
            <h2 className="section-title">
              Four families of packaging,{" "}
              <span className="it" style={{ color: "var(--brand-700)" }}>
                one supplier.
              </span>
            </h2>
          </div>
          <p className="section-lede" style={{ color: "var(--ink-700)" }}>
            From a single 250 ml box to crates by the hundred — buy a retail pack or a full bulk order.
          </p>
        </div>

        <div className={styles.rows}>
          {RANGE_ROWS.map((r, i) => (
            <div key={r.n} className={styles.row} style={{ flexDirection: i % 2 ? "row-reverse" : "row" }}>
              <div className={`clip-in ${styles.media}`} style={{ background: r.bg }}>
                <p aria-hidden="true" className={`big-num ${styles.bigNum}`}>
                  {r.n}
                </p>
                <div className={styles.shapeBox}>
                  <div className="parallax" style={{ width: "100%" }}>
                    <div className={styles.img}>
                      <ProductShape kind={r.kind} />
                    </div>
                  </div>
                </div>
                <span className={styles.tag}>{r.tag}</span>
              </div>
              <div className={`reveal ${styles.copy}`}>
                <p className={styles.count}>{r.n} / 04</p>
                <h3 className={styles.rowTitle}>
                  {r.title}{" "}
                  <span className="it" style={{ color: "var(--brand-700)" }}>
                    {r.titleIt}
                  </span>
                </h3>
                <p className={styles.desc}>{r.desc}</p>
                <a className={styles.rowLink} href={r.href}>
                  {r.cta}{" "}
                  <span className={styles.arrow} aria-hidden="true">
                    →
                  </span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div aria-hidden="true" className={styles.outlineBand}>
        <p className={`scroll-x ${styles.outline}`}>
          Packaging, <span>presented beautifully</span> — Packaging, <span>presented beautifully</span> —
        </p>
      </div>
    </section>
  );
}
