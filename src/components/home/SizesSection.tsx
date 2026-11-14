"use client";

import Link from "next/link";
import { useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ProductShape } from "@/components/ui/ProductShape";
import { SQUARE_SIZES } from "@/lib/content";
import { useLanguage } from "@/lib/i18n/context";
import styles from "./SizesSection.module.css";

export function SizesSection() {
  const { pick } = useLanguage();
  const [size, setSize] = useState("1000");
  const current = SQUARE_SIZES.find((z) => z.v === size) ?? SQUARE_SIZES[SQUARE_SIZES.length - 1];
  const name = pick(`${current.v} ml Square Box`, `${current.v} মিলি স্কয়ার বক্স`);
  const priceText = current.priced ? current.price : pick("Price on product page", "মূল্য দেখতে পণ্যে যান");

  return (
    <section id="sizes" className={`section ${styles.section}`}>
      <div className={`wrap ${styles.inner}`}>
        <div className="reveal">
          <p className="eyebrow" style={{ color: "var(--brand-700)" }}>
            {pick("04 — Sizes", "০৪ — সাইজসমূহ")}
          </p>
          <h2 className={styles.title}>
            {pick("One square box.", "একই স্কয়ার বক্স।")}{" "}
            <span className="it" style={{ color: "var(--brand-700)" }}>
              {pick("Four sizes.", "চারটি মাপ।")}
            </span>
          </h2>
          <p className={styles.lede}>
            {pick(
              "Sleek, minimalist square boxes with a crystal-clear finish. Pick a capacity — the preview resizes to match.",
              "স্বচ্ছ ফিনিশের আকর্ষণীয় স্কয়ার বক্স। একটি মাপ বেছে নিন — প্রিভিউ সেই অনুযায়ী পরিবর্তিত হবে।"
            )}
          </p>
          <div role="group" aria-label={pick("Choose a capacity", "মাপ নির্বাচন করুন")} className={styles.tabs}>
            {SQUARE_SIZES.map((z) => (
              <button
                key={z.v}
                type="button"
                className={`${styles.tab} ${z.v === size ? styles.tabOn : ""}`}
                aria-pressed={z.v === size}
                onClick={() => setSize(z.v)}
              >
                {z.v}
                <small>{pick("ml", "মিলি")}</small>
              </button>
            ))}
          </div>
          <div className={styles.summary}>
            <div>
              <p className={styles.name}>{name}</p>
              <p className={styles.price}>{priceText}</p>
            </div>
            {current.priced ? (
              <AddToCartButton slug={current.slug} />
            ) : (
              <Link className="btn btn-secondary" href={`/product/${current.slug}`}>
                {pick("View product", "পণ্য দেখুন")}
              </Link>
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
          <p className={styles.caption}>
            {pick("Illustrative scale", "আনুমানিক অনুপাত")} · {current.v} {pick("ml", "মিলি")}
          </p>
        </div>
      </div>
    </section>
  );
}
