"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon } from "@/components/ui/Icons";
import { ProductShape } from "@/components/ui/ProductShape";
import { CATEGORIES, packSummary, priceLabel } from "@/lib/catalog";
import { buildCloudinaryUrl } from "@/lib/cloudinary/client";
import { useLanguage } from "@/lib/i18n/context";
import { useProducts } from "@/lib/products-context";
import styles from "./SearchModal.module.css";

const CAT_BN: Record<string, string> = {
  square: "স্কয়ার বক্স",
  round: "রাউন্ড বক্স",
  "dessert-cups": "ডেজার্ট কাপ",
  crates: "ক্রেট",
};

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { products } = useProducts();
  const { lang, pick } = useLanguage();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const tId = setTimeout(() => inputRef.current?.focus(), 40);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(tId);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.summary.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.specs.some(([, v]) => v.toLowerCase().includes(q))
        )
      : products.filter((p) => p.tags.includes("popular") || p.tags.includes("new"));
    return list.slice(0, 7);
  }, [products, query]);

  if (!open) return null;

  return (
    <div
      className={styles.scrim}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-label={pick("Search products", "পণ্য খুঁজুন")}>
        <div className={styles.inputRow}>
          <SearchIcon size={18} />
          <input
            ref={inputRef}
            type="search"
            className={styles.input}
            placeholder={pick("Search boxes, cups, crates, 500 ml, acrylic…", "বক্স, কাপ, ক্রেট বা সাইজ লিখুন…")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={pick("Close search", "বন্ধ করুন")}>
            ×
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.sectionLabel}>{pick("Quick Categories", "ক্যাটাগরি")}</p>
          <div className={styles.chipGrid}>
            {CATEGORIES.map((c) => (
              <Link key={c.id} href={`/shop/${c.id}`} className={styles.chip} onClick={onClose}>
                {lang === "bn" ? CAT_BN[c.id] ?? c.short : c.short}
              </Link>
            ))}
          </div>

          <p className={styles.sectionLabel}>
            {query.trim()
              ? pick(`Results (${matches.length})`, `ফলাফল (${matches.length})`)
              : pick("Popular Products", "জনপ্রিয় পণ্যসমূহ")}
          </p>

          {matches.length === 0 ? (
            <div className={styles.empty}>
              {pick(`No products found for “${query.trim()}”. Try searching for 1000 ml, dessert cup, or crate.`, `“${query.trim()}” এর জন্য কোনো পণ্য পাওয়া যায়নি।`)}
            </div>
          ) : (
            <ul className={styles.results}>
              {matches.map((p) => {
                const img = p.image || p.images?.[0];
                return (
                  <li key={p.slug}>
                    <Link href={`/product/${p.slug}`} className={styles.resultLink} onClick={onClose}>
                      <span className={styles.thumb}>
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={buildCloudinaryUrl(img, { width: 120, height: 120, crop: "fill" })} alt={p.name} loading="lazy" />
                        ) : (
                          <ProductShape kind={p.kind} />
                        )}
                      </span>
                      <span className={styles.meta}>
                        <p className={styles.name}>{p.name}</p>
                        <p className={styles.sub}>{packSummary(p) || p.category}</p>
                      </span>
                      <span className={styles.price}>{priceLabel(p)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className={styles.footer}>
          <span style={{ color: "var(--ink-600)" }}>{pick("Press Esc to close", "বন্ধ করতে Esc চাপুন")}</span>
          <Link href="/shop" className={styles.viewAll} onClick={onClose}>
            {pick("View all products →", "সব পণ্য দেখুন →")}
          </Link>
        </div>
      </div>
    </div>
  );
}
