import type { Metadata } from "next";
import Link from "next/link";
import { ProductShape } from "@/components/ui/ProductShape";
import { PageHero } from "@/components/ui/PageHero";
import { CATEGORIES } from "@/lib/catalog";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About — One Time Product BD",
  description: "One Time Product BD is a Bangladesh-based manufacturer and supplier of food-grade plastic packaging.",
};

const SERVES = [
  ["Sweet shops and bakeries", "Clear boxes and containers that show what’s inside."],
  ["Caterers and events", "Dessert cups in packs of 100 to 1000."],
  ["Food businesses", "Retail packs and bulk quantities, from a single box to crates by the hundred."],
  ["Households", "Containers to store, gift and share food at home."],
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        title="Food packaging,"
        accent="made in Bangladesh."
        lede="One Time Product BD is a Bangladesh-based manufacturer and supplier of food-grade plastic packaging."
      >
        <Link className="btn btn-lime" href="/shop">
          Shop the range
        </Link>
        <Link className="btn btn-ghost" href="/quote">
          Request a bulk quote
        </Link>
      </PageHero>

      <section className={`wrap ${styles.section}`} aria-labelledby="make-h">
        <div className={`reveal ${styles.head}`}>
          <h2 id="make-h" className={styles.h2}>
            What we make
          </h2>
          <p className={styles.lede}>Four families of packaging, bought as a retail pack or in bulk.</p>
        </div>
        <ul className={styles.grid}>
          {CATEGORIES.map((c, i) => (
            <li key={c.id} className={`reveal ${["", "d2", "d3", "d4"][i % 4]}`}>
              <Link href={`/shop/${c.id}`} className={styles.tile}>
                <span className={styles.tileImg}>
                  <ProductShape kind={c.kind} />
                </span>
                <span className={styles.tileName}>{c.name}</span>
                <span className={styles.tileDesc}>{c.description}</span>
                <span className={styles.tileCta}>
                  Shop {c.short.toLowerCase()} <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.band} aria-labelledby="who-h">
        <div className={`wrap ${styles.bandInner}`}>
          <div className="reveal">
            <h2 id="who-h" className={`${styles.h2} ${styles.light}`}>
              Who we <span className="it" style={{ color: "var(--accent-500)" }}>pack for.</span>
            </h2>
          </div>
          <ul className={styles.serves}>
            {SERVES.map(([title, text], i) => (
              <li key={title} className={`reveal ${["", "d2", "d3", "d4"][i]}`}>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`wrap ${styles.cta}`}>
        <div className={`reveal ${styles.ctaPanel}`}>
          <div>
            <h2 className={styles.h2}>Ready to order?</h2>
            <p>Buy a pack online, or tell us what you need and we’ll reply with bulk pricing.</p>
          </div>
          <div className={styles.ctaBtns}>
            <Link className="btn btn-primary" href="/shop">
              Shop products
            </Link>
            <Link className="btn btn-secondary" href="/contact">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
