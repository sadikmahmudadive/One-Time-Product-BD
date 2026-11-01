import { ProductShape } from "@/components/ui/ProductShape";
import { PERSONAS } from "@/lib/content";
import styles from "./MadeForSection.module.css";

const DELAYS = ["", "d2", "d3", "d4"];

export function MadeForSection() {
  return (
    <section id="madefor" className={`section ${styles.section}`}>
      <div className={`wrap ${styles.inner}`}>
        <div className={`reveal section-head ${styles.head}`}>
          <div>
            <p className="eyebrow" style={{ color: "var(--accent-500)" }}>
              03 — Made for
            </p>
            <h2 className="section-title">
              Packaging for{" "}
              <span className="it" style={{ color: "var(--accent-500)" }}>
                your
              </span>{" "}
              kind of business.
            </h2>
          </div>
          <p className="section-lede" style={{ color: "var(--brand-100)" }}>
            Not sure where to start? Pick the one that sounds like you.
          </p>
        </div>

        <div className={styles.grid}>
          {PERSONAS.map((p, i) => (
            <div key={p.n} className={`reveal ${DELAYS[i % 4]}`} style={{ height: "100%" }}>
              <a className={styles.persona} href="#shop">
                <div className={styles.media} style={{ background: p.bg }}>
                  <span className={styles.num}>{p.n}</span>
                  <div className={styles.img}>
                    <ProductShape kind={p.kind} />
                  </div>
                </div>
                <div className={styles.body}>
                  <h3 className={styles.title}>{p.title}</h3>
                  <p className={styles.desc}>{p.desc}</p>
                  <p className={styles.picks}>
                    <span>Try · </span>
                    {p.picks}
                  </p>
                  <span className={styles.cta}>
                    View packaging{" "}
                    <span className={styles.arrow} aria-hidden="true">
                      →
                    </span>
                  </span>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
