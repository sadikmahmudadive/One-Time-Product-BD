"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ProductShape } from "@/components/ui/ProductShape";
import { SQUARE_SIZES } from "@/lib/content";
import styles from "./SizesSection.module.css";

export function SizesSection() {
  const [size, setSize] = useState("1000");
  const current = SQUARE_SIZES.find((z) => z.v === size) ?? SQUARE_SIZES[SQUARE_SIZES.length - 1];
  const name = `${current.v} ml Square Box`;

  return (
    <section id="sizes" className={`section ${styles.section}`}>
      <div className={`wrap ${styles.inner}`}>
        <div className="reveal">
          <p className="eyebrow" style={{ color: "var(--brand-700)" }}>
            04 — Sizes
          </p>
          <h2 className={styles.title}>
            One square box.{" "}
            <span className="it" style={{ color: "var(--brand-700)" }}>
              Four sizes.
            </span>
          </h2>
          <p className={styles.lede}>
            Sleek, minimalist square boxes with a crystal-clear finish. Pick a capacity — the preview resizes to match.
          </p>
          <div role="group" aria-label="Choose a capacity" className={styles.tabs}>
            {SQUARE_SIZES.map((z) => (
              <button
                key={z.v}
                type="button"
                className={`${styles.tab} ${z.v === size ? styles.tabOn : ""}`}
                aria-pressed={z.v === size}
                onClick={() => setSize(z.v)}
              >
                {z.v}
                <small>ml</small>
              </button>
            ))}
          </div>
          <div className={styles.summary}>
            <div>
              <p className={styles.name}>{name}</p>
              <p className={styles.price}>{current.price}</p>
            </div>
            {current.priced ? (
              <AddToCartButton label={name} />
            ) : (
              <a className="btn btn-secondary" href="#shop">
                View product
              </a>
            )}
          </div>
        </div>

        <div className={`reveal-zoom ${styles.stage}`}>
          <p aria-hidden="true" className={styles.ghost}>
            {current.v}
          </p>
          <div aria-hidden="true" className={styles.meterTrack}>
            <div className={styles.meter} style={{ height: `${current.fill}%` }} />
          </div>
          <div className={styles.shadow} />
          <div className={styles.boxWrap}>
            <div className={styles.box} style={{ transform: `scale(${current.scale})` }}>
              <ProductShape kind="square" />
            </div>
          </div>
          <p className={styles.caption}>Illustrative scale · {current.v} ml</p>
        </div>
      </div>
    </section>
  );
}
