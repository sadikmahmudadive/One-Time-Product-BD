import { FOOTER_LINKS } from "@/lib/content";
import { NewsletterForm } from "./NewsletterForm";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer id="footer" className={styles.footer}>
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.top}>
          <div className="reveal">
            <p className="eyebrow" style={{ color: "var(--accent-500)" }}>
              Stay in the loop
            </p>
            <h2 className={styles.title}>
              New shapes and sizes,{" "}
              <span className="it" style={{ color: "var(--accent-500)" }}>
                first.
              </span>
            </h2>
          </div>
          <div className="reveal d2" style={{ alignSelf: "end" }}>
            <NewsletterForm />
            <p className={styles.follow}>
              Or follow{" "}
              <a className={styles.link} href="https://www.instagram.com/_otpb_/" style={{ fontWeight: 600, textDecoration: "underline" }}>
                @_otpb_
              </a>{" "}
              on Instagram.
            </p>
          </div>
        </div>

        <div className={styles.columns}>
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <nav key={heading} aria-label={heading}>
              <p className={styles.heading}>{heading}</p>
              <div className={styles.list}>
                {links.map((l) => (
                  <a key={l.label} className={styles.link} href={l.href}>
                    {l.label}
                  </a>
                ))}
              </div>
            </nav>
          ))}
          <div>
            <p className={styles.heading}>Contact</p>
            <div className={`${styles.list} ${styles.contact}`}>
              <span>[PHONE NUMBER]</span>
              <span>[EMAIL ADDRESS]</span>
              <span>[SHOWROOM / FACTORY ADDRESS]</span>
            </div>
          </div>
        </div>

        <p aria-hidden="true" className={`reveal-zoom ${styles.wordmark}`}>
          One Time <span>Product</span>
        </p>

        <div className={styles.legal}>
          <span>© 2026 One Time Product BD · Prices in BDT (৳)</span>
          <a className={`${styles.link} ${styles.top2}`} href="#top">
            Back to the beginning ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
