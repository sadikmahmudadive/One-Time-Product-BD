"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { CATEGORIES, hasVariants, isDirectBuy, lowestPrice, packSummary, priceLabel } from "@/lib/catalog";
import type { CategoryId, Product } from "@/lib/catalog";
import { useLanguage } from "@/lib/i18n/context";
import { useProducts } from "@/lib/products-context";
import { ProductCard } from "./ProductCard";
import styles from "./Catalog.module.css";

type Sort = "featured" | "price-asc" | "price-desc";

const CAT_BN: Record<string, string> = {
  square: "স্কয়ার বক্স",
  round: "রাউন্ড বক্স",
  "dessert-cups": "ডেজার্ট কাপ",
  crates: "ক্রেট",
};

function cardAction(p: Product, chooseLabel: string, viewLabel: string) {
  if (isDirectBuy(p)) return <AddToCartButton slug={p.slug} className="btn btn-primary btn-block" />;
  return (
    <Link className="btn btn-secondary btn-block" href={`/product/${p.slug}`}>
      {hasVariants(p) ? chooseLabel : viewLabel}
    </Link>
  );
}

export function Catalog({ category }: { category?: CategoryId }) {
  const { products } = useProducts();
  const { lang, t, pick } = useLanguage();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("featured");
  const searchRef = useRef<HTMLInputElement>(null);

  // The header's search icon links to /shop#search.
  useEffect(() => {
    if (window.location.hash === "#search") searchRef.current?.focus();
  }, []);

  const inCategory = useMemo(() => (category ? products.filter((p) => p.category === category) : products), [category, products]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? inCategory.filter((p) => p.name.toLowerCase().includes(q)) : [...inCategory];
    if (sort === "featured") return list;
    const dir = sort === "price-asc" ? 1 : -1;
    // Products without a confirmed price always sort last.
    return list.sort((a, b) => {
      const pa = lowestPrice(a);
      const pb = lowestPrice(b);
      if (pa === null && pb === null) return 0;
      if (pa === null) return 1;
      if (pb === null) return -1;
      return (pa - pb) * dir;
    });
  }, [inCategory, query, sort]);

  const filtered = query.trim() !== "" || sort !== "featured";
  const clear = () => {
    setQuery("");
    setSort("featured");
  };

  return (
    <div className={`wrap ${styles.wrap}`}>
      <nav aria-label="Product categories" className={styles.tabs}>
        <Link href="/shop" className={styles.tab} aria-current={!category ? "page" : undefined}>
          {t.footer.allProducts} <span>{products.length}</span>
        </Link>
        {CATEGORIES.map((c) => (
          <Link key={c.id} href={`/shop/${c.id}`} className={styles.tab} aria-current={category === c.id ? "page" : undefined}>
            {lang === "bn" ? CAT_BN[c.id] ?? c.short : c.short} <span>{products.filter((p) => p.category === c.id).length}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.toolbar} role="search">
        <div className={styles.searchBox}>
          <label className="lbl" htmlFor="search">
            {t.nav.searchProducts}
          </label>
          <input
            ref={searchRef}
            id="search"
            className="field"
            type="search"
            placeholder={t.catalog.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className={styles.sortBox}>
          <label className="lbl" htmlFor="sort">
            {pick("Sort by", "সাজান")}
          </label>
          <select id="sort" className="field" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="featured">{pick("Featured", "নির্বাচিত")}</option>
            <option value="price-asc">{pick("Price: low to high", "মূল্য: কম থেকে বেশি")}</option>
            <option value="price-desc">{pick("Price: high to low", "মূল্য: বেশি থেকে কম")}</option>
          </select>
        </div>
        <p className={styles.count} aria-live="polite">
          {results.length} {pick(results.length === 1 ? "product" : "products", "টি পণ্য")}
        </p>
      </div>

      {results.length > 0 ? (
        <ul className={styles.grid}>
          {results.map((p) => (
            <li key={p.slug}>
              <ProductCard
                name={p.name}
                kind={p.kind}
                image={p.image}
                href={`/product/${p.slug}`}
                badge={p.tags.includes("new") ? "new" : undefined}
                meta={packSummary(p)}
                price={priceLabel(p)}
                action={cardAction(p, t.common.chooseOptions, t.common.viewProduct)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty} role="status">
          <h2>{pick(`No products match “${query.trim()}”`, `“${query.trim()}” এর সাথে কোনো পণ্য মেলেনি`)}</h2>
          <p>{pick("Try a different name or capacity, or clear the search to see everything.", "অন্য নাম বা সাইজ দিয়ে খুঁজুন, অথবা ফিল্টার মুছে সব পণ্য দেখুন।")}</p>
          <button type="button" className="btn btn-secondary" onClick={clear}>
            {t.catalog.clearFilters}
          </button>
        </div>
      )}

      {filtered && results.length > 0 && (
        <p className={styles.reset}>
          <button type="button" className={styles.resetBtn} onClick={clear}>
            {pick("Clear search and sorting", "সার্চ ও ফিল্টার মুছুন")}
          </button>
        </p>
      )}

      <aside className={styles.help}>
        <div>
          <h2>{pick("Can’t find the size or quantity you need?", "আপনার প্রয়োজনীয় সাইজ বা পরিমাণ খুঁজে পাচ্ছেন না?")}</h2>
          <p>{pick("Tell us the product and how many you need and we’ll reply with bulk pricing.", "প্রয়োজনীয় পণ্য ও পরিমাণ জানান, আমরা পাইকারি দাম জানিয়ে দেবো।")}</p>
        </div>
        <Link href="/quote" className="btn btn-primary">
          {t.nav.requestBulkQuote}
        </Link>
      </aside>
    </div>
  );
}
