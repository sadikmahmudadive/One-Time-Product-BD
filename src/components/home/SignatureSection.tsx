import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { SIGNATURE_CALLOUTS, SIGNATURE_SPECS } from "@/lib/content";
import styles from "./SignatureSection.module.css";

const DELAYS = ["", "d2", "d3", "d4"];

export function SignatureSection() {
  return (
    <section id="signature" className={`section ${styles.section}`}>
      <div className={`wrap ${styles.inner}`}>
        <div className={`reveal ${styles.head}`}>
          <p className="eyebrow eyebrow-center" style={{ color: "var(--accent-500)" }}>
            05 — High-end quality
          </p>
          <h2 className="section-title" style={{ maxWidth: "none" }}>
            The Signature 1000 ml{" "}
            <span className="it" style={{ color: "var(--accent-500)" }}>
              Black Edition.
            </span>
          </h2>
          <p className={styles.lede}>A rectangular box with a glossy black base and a clear lid. Scroll to take it apart.</p>
        </div>

        <div className={styles.pin} data-sig-pin>
        <div className={styles.stage}>
          <div aria-hidden="true" className={`orbit ${styles.ring}`} />
          <div className={styles.disc} data-sig-disc>
            <span className={styles.sheen} aria-hidden="true" />
          </div>
          <div className={styles.box} data-sig-box>
            <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ position: "absolute", inset: 0 }} aria-hidden="true">
              <ellipse cx="100" cy="178" rx="84" ry="9" fill="#102D25" opacity="0.14" />
              <polygon points="20,80 122,125 122,166 20,121" fill="#1B201E" stroke="#102D25" strokeWidth="1.5" strokeLinejoin="round" />
              <polygon points="122,125 180,96 180,137 122,166" fill="#2B322F" stroke="#102D25" strokeWidth="1.5" strokeLinejoin="round" />
              <polygon points="20,80 78,52 180,96 122,125" fill="#2E3532" stroke="#102D25" strokeWidth="1.5" strokeLinejoin="round" />
              <polygon points="34,80 78,59 166,96 122,117" fill="#171D1A" />
              <line x1="30" y1="96" x2="112" y2="133" stroke="#4D5952" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className="lid" data-sig-lid style={{ position: "absolute", inset: 0 }}>
              <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
                <polygon points="16,72 122,118 122,126 16,80" fill="#E5EAE6" stroke="#77827B" strokeWidth="1.2" strokeLinejoin="round" fillOpacity="0.85" />
                <polygon points="122,118 184,88 184,96 122,126" fill="#FFFFFF" stroke="#77827B" strokeWidth="1.2" strokeLinejoin="round" fillOpacity="0.85" />
                <polygon points="78,42 184,88 122,118 16,72" fill="#FFFFFF" stroke="#77827B" strokeWidth="1.2" strokeLinejoin="round" fillOpacity="0.6" />
                <line x1="96" y1="56" x2="150" y2="80" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          {SIGNATURE_CALLOUTS.map((c) => (
            <div
              key={c.label}
              className={`late hide-sm ${styles.callout}`}
              style={c.style}
              data-sig-callout
              {...(c.side === "right" ? { "data-sig-right": "" } : {})}
            >
              {c.side === "left" ? (
                <>
                  <span>{c.label}</span>
                  <span className={styles.line} data-sig-line />
                  <span className={styles.dot} />
                </>
              ) : (
                <>
                  <span className={styles.dot} />
                  <span className={styles.line} data-sig-line />
                  <span>{c.label}</span>
                </>
              )}
            </div>
          ))}
        </div>
        </div>

        <div className={styles.specs}>
          {SIGNATURE_SPECS.map((s, i) => (
            <div key={s.n} className={`reveal ${DELAYS[i % 4]} ${styles.spec}`}>
              <div className={styles.specTop}>
                <span className={styles.sym}>{s.sym}</span>
                <span className={styles.specN}>{s.n}</span>
              </div>
              <p className={styles.val}>{s.val}</p>
              <p className={styles.l1}>{s.l1}</p>
              <p className={styles.l2}>{s.l2}</p>
            </div>
          ))}
        </div>

        <div className={`reveal ${styles.actions}`}>
          <AddToCartButton label="1000 ml Black Premium Box" className="btn btn-lime">
            Add to cart · ৳18.00
          </AddToCartButton>
          <a className="btn btn-ghost" href="#shop">
            See all boxes
          </a>
        </div>
      </div>
    </section>
  );
}
