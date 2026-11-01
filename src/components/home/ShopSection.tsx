"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { PackSelector } from "@/components/commerce/PackSelector";
import { ProductCard } from "@/components/commerce/ProductCard";
import { ARRIVALS, POPULAR } from "@/lib/content";
import styles from "./ShopSection.module.css";

type Tab = "new" | "popular";

const DELAYS = ["", "d2", "d3", "d4"];

export function ShopSection() {
  const { addItem } = useCart();
  const [tab, setTab] = useState<Tab>("new");
  const [packs, setPacks] = useState<Record<string, string>>({});

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

        {tab === "new" ? (
          <div className={styles.grid}>
            {ARRIVALS.map((p, i) => {
              const chosen = packs[p.id];
              const needsPack = !!p.packs && !chosen;
              return (
                <div key={p.id} className={`reveal ${DELAYS[i % 4]}`}>
                  <ProductCard
                    name={p.name}
                    kind={p.kind}
                    badge="new"
                    price={p.price}
                    unit={p.unit}
                    variants={
                      p.packs && (
                        <PackSelector packs={p.packs} selected={chosen} onSelect={(pack) => setPacks((s) => ({ ...s, [p.id]: pack }))} />
                      )
                    }
                    action={
                      needsPack ? (
                        <button type="button" className="btn btn-block" disabled>
                          Choose a pack size
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary btn-block"
                          onClick={() => addItem(p.packs ? `${p.name} — pack of ${chosen}` : p.name)}
                        >
                          {p.packs ? `Add pack of ${chosen}` : "Add to cart"}
                        </button>
                      )
                    }
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.grid}>
            {POPULAR.map((p) => (
              <ProductCard
                key={p.name}
                name={p.name}
                kind={p.kind}
                badge="in-stock"
                price={p.price}
                action={
                  <button type="button" className="btn btn-primary btn-block" onClick={() => addItem(p.name)}>
                    Add to cart
                  </button>
                }
              />
            ))}
          </div>
        )}

        <p className={styles.note}>Prices vary by pack size. Delivery charges calculated at checkout.</p>
      </div>
    </section>
  );
}
