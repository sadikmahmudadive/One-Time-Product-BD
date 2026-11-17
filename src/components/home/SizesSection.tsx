"use client";

import Link from "next/link";
import { useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { buildCloudinaryUrl } from "@/lib/cloudinary/client";
import { SQUARE_SIZES } from "@/lib/content";
import { useLanguage } from "@/lib/i18n/context";
import { useProducts } from "@/lib/products-context";
import styles from "./SizesSection.module.css";

export function SizesSection() {
  const { pick } = useLanguage();
  const { getProduct } = useProducts();
  const [size, setSize] = useState("1000");

  const current = SQUARE_SIZES.find((z) => z.v === size) ?? SQUARE_SIZES[SQUARE_SIZES.length - 1];
  const liveProd = getProduct(current.slug);
  const name = pick(`${current.v} ml Square Box`, `${current.v} মিলি স্কয়ার বক্স`);
  const priceText = current.priced ? current.price : pick("Price on product page", "মূল্য দেখতে পণ্যে যান");

  const rawImg = liveProd?.image || liveProd?.images?.[0];
  const stagePhoto = rawImg
    ? buildCloudinaryUrl(rawImg, { width: 820, height: 820, crop: "fill", quality: "auto", format: "auto" })
    : "/images/hero/square-clear-boxes.jpg";

  return (
    <section id="sizes" className={`section grid-backdrop ${styles.section}`}>
      <div className={`wrap ${styles.wrapInner}`}>
        <div className="editorial-rule editorial-rule-dark">
          <span>{pick("04 / CAPACITY STUDY", "০৪ / সাইজ তুলনা")}</span>
          <span>{pick("SQUARE FORMAT · 250 TO 1000 ML.", "স্কয়ার সিরিজ · ২৫০ থেকে ১০০০ মিলি।")}</span>
        </div>

        <div className={styles.inner}>
          <div className="reveal">
            <h2 className={styles.title}>
              {pick("One square format.", "একই স্কয়ার বক্স।")}{" "}
              <span className="it" style={{ color: "var(--accent-500)" }}>
                {pick("Four capacities.", "চারটি মাপ।")}
              </span>
            </h2>
            <p className={styles.lede}>
              {pick(
                "Sleek, minimalist square boxes with a crystal-clear finish. Select a volume to compare proportions.",
                "স্বচ্ছ ফিনিশের আকর্ষণীয় স্কয়ার বক্স। মাপ নির্বাচন করে অনুপাত ও মূল্য দেখুন।"
              )}
            </p>

            {/* Hairline architectural tab strip */}
            <div role="group" aria-label={pick("Choose a capacity", "মাপ নির্বাচন করুন")} className={styles.tabs}>
              {SQUARE_SIZES.map((z) => (
                <button
                  key={z.v}
                  type="button"
                  className={`${styles.tab} ${z.v === size ? styles.tabOn : ""}`}
                  aria-pressed={z.v === size}
                  onClick={() => setSize(z.v)}
                >
                  <span className={styles.tabVal}>{z.v}</span>
                  <small>{pick("ml", "মিলি")}</small>
                </button>
              ))}
            </div>

            {/* Clean architectural specification readout */}
            <div className={styles.specReadout}>
              <div className={styles.specRow}>
                <div>
                  <p className={styles.name}>{name}</p>
                  <p className={styles.price}>{priceText}</p>
                </div>
                <span className={styles.scaleIndex}>{current.fill}% SCALE</span>
              </div>

              <div className={styles.barTrack} aria-hidden="true">
                <div className={styles.barFill} style={{ width: `${current.fill}%` }} />
              </div>

              <div className={styles.specAction}>
                {current.priced ? (
                  <AddToCartButton slug={current.slug} className="btn btn-lime" />
                ) : (
                  <Link className="btn btn-ghost" href={`/product/${current.slug}`}>
                    {pick("View product", "পণ্য দেখুন")}
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className={`reveal-zoom ${styles.stage}`}>
            <p aria-hidden="true" className={styles.ghost}>
              {current.v}
            </p>
            <div aria-hidden="true" className={styles.meterTrack}>
              <div className={styles.meter} style={{ height: `${current.fill}%` }} />
            </div>
            <div className={styles.photoStage}>
              <div className={styles.scaleFrame} style={{ transform: `scale(${0.66 + current.scale * 0.34})` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={stagePhoto}
                  alt={name}
                  loading="lazy"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src !== window.location.origin + "/images/hero/square-clear-boxes.jpg") {
                      img.src = "/images/hero/square-clear-boxes.jpg";
                    }
                  }}
                  className={styles.stageImg}
                />
              </div>
            </div>
            <p className={styles.caption}>
              {pick("Volume scale", "ধারণক্ষমতার অনুপাত")} · {current.v} {pick("ml", "মিলি")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
