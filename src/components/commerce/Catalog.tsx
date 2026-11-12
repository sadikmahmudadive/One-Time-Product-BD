"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { CATEGORIES, hasVariants, isDirectBuy, lowestPrice, packSummary, priceLabel } from "@/lib/catalog";
import type { CategoryId, Product } from "@/lib/catalog";
import { useProducts } from "@/lib/products-context";
import { ProductCard } from "./ProductCard";
import styles from "./Catalog.module.css";

type Sort = "featured" | "price-asc" | "price-desc";

function cardAction(p: Product) {
  if (isDirectBuy(p)) return <AddToCartButton slug={p.slug} className="btn btn-primary btn-block" />;
  return (
    <Link className="btn btn-secondary btn-block" href={`/product/${p.slug}`}>
      {hasVariants(p) ? "Choose options" : "View product"}
    </Link>
  );
}

export function Catalog({ category }: { category?: CategoryId }) {
  const { products, loading } = useProducts();
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
          All products <span>{products.length}</span>
        </Link>
        {CATEGORIES.map((c) => (
          <Link key={c.id} href={`/shop/${c.id}`} className={styles.tab} aria-current={category === c.id ? "page" : undefined}>
            {c.short} <span>{products.filter((p) => p.category === c.id).length}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.toolbar} role="search">
        <div className={styles.searchBox}>
          <label className="lbl" htmlFor="search">
            Search products
          </label>
          <input
            ref={searchRef}
            id="search"
            className="field"
            type="search"
            placeholder="Name or capacity, e.g. 1000 ml"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className={styles.sortBox}>
          <label className="lbl" htmlFor="sort">
            Sort by
          </label>
          <select id="sort" className="field" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
        <p className={styles.count} aria-live="polite">
          {results.length} {results.length === 1 ? "product" : "products"}
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
                action={cardAction(p)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty} role="status">
          <h2>No products match “{query.trim()}”</h2>
          <p>Try a different name or capacity, or clear the search to see everything.</p>
          <button type="button" className="btn btn-secondary" onClick={clear}>
            Clear search
          </button>
        </div>
      )}

      {filtered && results.length > 0 && (
        <p className={styles.reset}>
          <button type="button" className={styles.resetBtn} onClick={clear}>
            Clear search and sorting
          </button>
        </p>
      )}

      <aside className={styles.help}>
        <div>
          <h2>Can’t find the size or quantity you need?</h2>
          <p>Tell us the product and how many you need and we’ll reply with bulk pricing.</p>
        </div>
        <Link href="/quote" className="btn btn-primary">
          Request a bulk quote
        </Link>
      </aside>
    </div>
  );
}
