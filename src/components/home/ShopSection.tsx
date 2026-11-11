"use client";

import Link from "next/link";
import { useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { PackSelector } from "@/components/commerce/PackSelector";
import { ProductCard } from "@/components/commerce/ProductCard";
import { hasVariants, priceLabel, withTag } from "@/lib/catalog";
import styles from "./ShopSection.module.css";

type Tab = "new" | "popular";

const DELAYS = ["", "d2", "d3", "d4"];

export function ShopSection() {
  const [tab, setTab] = useState<Tab>("new");
  const [packs, setPacks] = useState<Record<string, string>>({});
  const items = withTag(tab);

  return (
    <section id="shop" className={`section ${styles.section}`}>
      <div className={`wrap ${styles.inner}`}>
        <div className={`reveal section-head ${styles.head}`}>
          <div>
            <p className="eyebrow" style={{ color: "var(--brand-700)" }}>
              06 — Shop
            </p>
            <h2 className="section-title" style={{ maxWidth: "none" }}>
              Fresh in,{" "}
              <span className="it" style={{ color: "var(--brand-700)" }}>
                and fan favourites.
              </span>
            </h2>
          </div>
          <div role="group" aria-label="Product list" className={styles.seg}>
            <button type="button" className={`${styles.segBtn} ${tab === "new" ? styles.segOn : ""}`} aria-pressed={tab === "new"} onClick={() => setTab("new")}>
              New arrivals
            </button>
            <button type="button" className={`${styles.segBtn} ${tab === "popular" ? styles.segOn : ""}`} aria-pressed={tab === "popular"} onClick={() => setTab("popular")}>
              Most popular
            </button>
          </div>
        </div>

        <div className={styles.grid}>
          {items.map((p, i) => {
            const href = `/product/${p.slug}`;
            const variants = hasVariants(p) ? p.variants : null;
            const chosen = variants?.find((v) => v.id === packs[p.slug]);
            let action: React.ReactNode;
            if (variants) {
              action = !chosen ? (
                <button type="button" className="btn btn-block" disabled>
                  Choose a pack size
                </button>
              ) : chosen.price === null ? (
                <Link className="btn btn-secondary btn-block" href={`/quote?product=${p.slug}&pack=${chosen.pieces}`}>
                  Ask for this price
                </Link>
              ) : (
                <AddToCartButton slug={p.slug} variantId={chosen.id} className="btn btn-primary btn-block">
                  Add pack of {chosen.pieces}
                </AddToCartButton>
              );
            } else if (p.price === null) {
              action = (
                <Link className="btn btn-secondary btn-block" href={href}>
                  View product
                </Link>
              );
            } else {
              action = <AddToCartButton slug={p.slug} className="btn btn-primary btn-block" />;
            }
            return (
              <div key={`${tab}-${p.slug}`} className={tab === "new" ? `reveal ${DELAYS[i % 4]}` : undefined}>
                <ProductCard
                  name={p.name}
                  kind={p.kind}
                  image={p.image}
                  href={href}
                  badge={tab === "new" ? "new" : "in-stock"}
                  price={priceLabel(p)}
                  unit={variants ? "by pack size" : undefined}
                  variants={
                    variants && (
                      <PackSelector
                        packs={variants.map((v) => v.pieces)}
                        selected={chosen?.pieces}
                        onSelect={(pieces) => setPacks((s) => ({ ...s, [p.slug]: variants.find((v) => v.pieces === pieces)!.id }))}
                      />
                    )
                  }
                  action={action}
                />
              </div>
            );
          })}
        </div>

        <div className={styles.footer}>
          <p className={styles.note}>Prices vary by pack size. Delivery charges calculated at checkout.</p>
          <Link className="btn btn-secondary" href="/shop">
            View all products
          </Link>
        </div>
      </div>
    </section>
  );
}
