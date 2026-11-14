"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { PackSelector } from "@/components/commerce/PackSelector";
import { ProductCard } from "@/components/commerce/ProductCard";
import { QuickViewModal } from "@/components/commerce/QuickViewModal";
import { CATEGORIES, hasVariants, priceLabel, type Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/context";
import { useProducts } from "@/lib/products-context";
import styles from "./ShopSection.module.css";

type Tab = "new" | "popular";

const DELAYS = ["", "d2", "d3", "d4"];

const CAT_BN: Record<string, string> = {
  square: "স্কয়ার বক্স",
  round: "রাউন্ড বক্স",
  "dessert-cups": "ডেজার্ট কাপ",
  crates: "ক্রেট",
};

export function ShopSection() {
  const { products } = useProducts();
  const { lang, pick } = useLanguage();
  const [tab, setTab] = useState<Tab>("new");
  const [packs, setPacks] = useState<Record<string, string>>({});
  const [quickProduct, setQuickProduct] = useState<Product | null>(null);
  const items = useMemo(() => products.filter((p) => p.tags.includes(tab)), [products, tab]);

  return (
    <section id="shop" className={`section ${styles.section}`}>
      <div className={`wrap ${styles.inner}`}>
        <div className={`reveal section-head ${styles.head}`}>
          <div>
            <p className="eyebrow" style={{ color: "var(--brand-700)" }}>
              {pick("Featured shop", "জনপ্রিয় শপ")}
            </p>
            <h2 className="section-title" style={{ maxWidth: "none" }}>
              {pick("Fresh in,", "নতুন সংযোজন,")}{" "}
              <span className="it" style={{ color: "var(--brand-700)" }}>
                {pick("and fan favourites.", "এবং সবার পছন্দ।")}
              </span>
            </h2>
          </div>
          <div role="group" aria-label={pick("Product list", "পণ্যের তালিকা")} className={styles.seg}>
            <button type="button" className={`${styles.segBtn} ${tab === "new" ? styles.segOn : ""}`} aria-pressed={tab === "new"} onClick={() => setTab("new")}>
              {pick("New arrivals", "নতুন পণ্য")}
            </button>
            <button type="button" className={`${styles.segBtn} ${tab === "popular" ? styles.segOn : ""}`} aria-pressed={tab === "popular"} onClick={() => setTab("popular")}>
              {pick("Most popular", "সবচেয়ে জনপ্রিয়")}
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
                  {pick("Choose a pack size", "প্যাক সাইজ বাছুন")}
                </button>
              ) : chosen.price === null ? (
                <Link className="btn btn-secondary btn-block" href={`/quote?product=${p.slug}&pack=${chosen.pieces}`}>
                  {pick("Ask for this price", "দাম জানুন")}
                </Link>
              ) : (
                <AddToCartButton slug={p.slug} variantId={chosen.id} className="btn btn-primary btn-block">
                  {pick(`Add pack of ${chosen.pieces}`, `${chosen.pieces} প্যাক যোগ করুন`)}
                </AddToCartButton>
              );
            } else if (p.price === null) {
              action = (
                <Link className="btn btn-secondary btn-block" href={href}>
                  {pick("View product", "পণ্য দেখুন")}
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
                  categoryLabel={
                    lang === "bn"
                      ? CAT_BN[p.category] ?? p.category
                      : CATEGORIES.find((c) => c.id === p.category)?.short ?? p.category
                  }
                  image={p.image}
                  href={href}
                  badge={tab === "new" ? "new" : "in-stock"}
                  price={
                    chosen
                      ? chosen.price !== null
                        ? formatPrice(chosen.price)
                        : pick("Price on request", "আলোচনা সাপেক্ষে")
                      : priceLabel(p)
                  }
                  unit={
                    chosen
                      ? `${pick("for pack of", "প্যাক:")} ${chosen.pieces}`
                      : variants
                      ? pick("by pack size", "প্যাক অনুযায়ী")
                      : undefined
                  }
                  onQuickView={() => setQuickProduct(p)}
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
          <p className={styles.note}>
            {pick(
              "Prices vary by pack size. Delivery charges calculated at checkout.",
              "প্যাক সাইজ অনুযায়ী মূল্য নির্ধারিত। ডেলিভারি চার্জ অর্ডারের সময় জানানো হবে।"
            )}
          </p>
          <Link className="btn btn-secondary" href="/shop">
            {pick("View all products", "সব পণ্য দেখুন")}
          </Link>
        </div>
      </div>
      <QuickViewModal product={quickProduct} onClose={() => setQuickProduct(null)} />
    </section>
  );
}
