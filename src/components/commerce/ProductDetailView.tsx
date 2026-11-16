"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CheckIcon } from "@/components/ui/Icons";
import { hasVariants, isDirectBuy, packSummary, priceLabel, type Product } from "@/lib/catalog";
import { useLanguage } from "@/lib/i18n/context";
import { useProducts } from "@/lib/products-context";
import { ProductCard } from "./ProductCard";
import { ProductGallery } from "./ProductGallery";
import { ProductPurchase } from "./ProductPurchase";
import { QuickViewModal } from "./QuickViewModal";
import styles from "@/app/(site)/product/[slug]/page.module.css";

const RECENT_VIEWED_KEY = "otpb_recent_viewed";

interface CategoryInfo {
  id: string;
  name: string;
  short: string;
  description: string;
  kind: Product["kind"];
}

export function ProductDetailView({
  initialProduct,
  category,
  initialRelated,
}: {
  initialProduct: Product;
  category: CategoryInfo;
  initialRelated: Product[];
}) {
  const { products, loading, getProduct: getLiveProduct } = useProducts();
  const { t, pick } = useLanguage();
  const [copiedLink, setCopiedLink] = useState(false);
  const [quickProduct, setQuickProduct] = useState<Product | null>(null);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);

  const hasLiveCatalogue = !loading && products.length > 0;
  const product = (hasLiveCatalogue ? getLiveProduct(initialProduct.slug) : null) ?? initialProduct;
  const material = product.specs?.find(([label]) => label.toLowerCase() === "material")?.[1];

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  // Record recently viewed product slugs in localStorage
  useEffect(() => {
    try {
      const prev = JSON.parse(localStorage.getItem(RECENT_VIEWED_KEY) || "[]") as string[];
      const validPrev = Array.isArray(prev) ? prev.filter((s) => typeof s === "string" && s !== product.slug) : [];
      setRecentSlugs(validPrev.slice(0, 4));
      const next = [product.slug, ...validPrev].slice(0, 8);
      localStorage.setItem(RECENT_VIEWED_KEY, JSON.stringify(next));
    } catch {
      /* ignore storage restrictions */
    }
  }, [product.slug]);

  const related =
    hasLiveCatalogue
      ? [
          ...products.filter((p) => p.category === product.category && p.slug !== product.slug),
          ...products.filter((p) => p.category !== product.category && p.slug !== product.slug),
        ].slice(0, 4)
      : initialRelated;

  const recentPool = hasLiveCatalogue ? products : initialRelated;
  const recentlyViewed = recentSlugs
    .map((s) => recentPool.find((p) => p.slug === s))
    .filter((p): p is Product => Boolean(p))
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  const isLowStock = product.available !== undefined && product.available <= (product.lowStockAt ?? 10);

  function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) return;
    if (navigator.share) {
      navigator.share({ title: product.name, url }).catch(() => {});
      return;
    }
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  return (
    <div className={`wrap ${styles.page}`}>
      <Breadcrumbs
        items={[
          { label: t.common.home, href: "/" },
          { label: t.common.shop, href: "/shop" },
          { label: category.name, href: `/shop/${category.id}` },
          { label: product.name },
        ]}
      />

      <div className={styles.top}>
        <ProductGallery
          name={product.name}
          kind={product.kind}
          images={productImages}
          categoryId={category.id}
          categoryShort={category.short}
          isNew={product.tags.includes("new")}
        />

        <div className={styles.info}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{product.name}</h1>
            <button type="button" className={styles.shareBtn} onClick={handleShare}>
              {copiedLink ? pick("Copied!", "কপি হয়েছে!") : pick("Share", "শেয়ার")}
            </button>
          </div>

          <ul className={styles.facts} aria-label="Key details">
            {product.available !== undefined && (
              <li className={`${styles.stockPill} ${isLowStock ? styles.stockPillLow : ""}`}>
                <span className={styles.stockDot} aria-hidden="true" />
                {isLowStock
                  ? pick(`Low stock (${product.available} left)`, `স্টক কম (${product.available} বাকি)`)
                  : pick("In stock · Ready to dispatch", "স্টকে আছে · দ্রুত ডেলিভারি")}
              </li>
            )}
            {packSummary(product) && <li>{packSummary(product)}</li>}
            {product.specs
              .filter(([label]) => ["Shape", "Colour", "Base", "Material"].includes(label))
              .slice(0, 2)
              .map(([label, value]) => (
                <li key={label}>{value}</li>
              ))}
          </ul>
          <p className={styles.summary}>{product.summary}</p>

          <ProductPurchase slug={product.slug} initialProduct={product} />

          <ul className={styles.reassure}>
            {t.product.reassurance.map((line) => (
              <li key={line}>
                <CheckIcon size={18} />
                {line}
              </li>
            ))}
          </ul>

          <div className={styles.details}>
            <details className={styles.item} open>
              <summary className={styles.summaryRow}>
                <span>{t.product.specifications}</span>
                <span className={styles.plus} aria-hidden="true" />
              </summary>
              <dl className={styles.dl}>
                {product.specs.map(([label, value]) => (
                  <div key={label} className={styles.row}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </details>

            <details className={styles.item}>
              <summary className={styles.summaryRow}>
                <span>{t.product.materialsTitle}</span>
                <span className={styles.plus} aria-hidden="true" />
              </summary>
              <div className={styles.body}>
                {material ? (
                  <p>
                    {t.product.materialsListed} {material}.
                  </p>
                ) : (
                  <p>{t.product.materialsUnpublished}</p>
                )}
                <p>
                  {t.product.materialsNotePre}{" "}
                  <Link href="/contact">{t.product.materialsNoteLink}</Link> {t.product.materialsNotePost}
                </p>
              </div>
            </details>

            <details className={styles.item}>
              <summary className={styles.summaryRow}>
                <span>{t.product.deliveryTitle}</span>
                <span className={styles.plus} aria-hidden="true" />
              </summary>
              <div className={styles.body}>
                <p>{t.product.deliveryBody}</p>
                <p>
                  {t.product.buyingLarge}{" "}
                  <Link href={`/quote?product=${product.slug}`}>{t.product.requestBulkQuote}</Link>.
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>

      <section aria-labelledby="related-h" className={styles.relatedWrap}>
        <div className={styles.relatedHead}>
          <h2 id="related-h" className={styles.h2}>
            {t.product.relatedTitle}
          </h2>
          <Link className={styles.all} href="/shop">
            {t.product.viewAllProducts} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ul className={styles.related}>
          {related.map((p) => (
            <li key={p.slug}>
              <ProductCard
                name={p.name}
                kind={p.kind}
                image={p.image}
                href={`/product/${p.slug}`}
                meta={packSummary(p)}
                price={priceLabel(p)}
                onQuickView={() => setQuickProduct(p)}
                action={
                  isDirectBuy(p) ? (
                    <AddToCartButton slug={p.slug} className="btn btn-primary btn-block" />
                  ) : (
                    <Link className="btn btn-secondary btn-block" href={`/product/${p.slug}`}>
                      {hasVariants(p) ? t.common.chooseOptions : t.common.viewProduct}
                    </Link>
                  )
                }
              />
            </li>
          ))}
        </ul>
      </section>

      {recentlyViewed.length > 0 && (
        <section aria-labelledby="recent-h" className={styles.relatedWrap}>
          <div className={styles.relatedHead}>
            <h2 id="recent-h" className={styles.h2}>
              {pick("Recently viewed", "সম্প্রতি দেখা পণ্য")}
            </h2>
          </div>
          <ul className={styles.related}>
            {recentlyViewed.map((p) => (
              <li key={p.slug}>
                <ProductCard
                  name={p.name}
                  kind={p.kind}
                  image={p.image}
                  href={`/product/${p.slug}`}
                  meta={packSummary(p)}
                  price={priceLabel(p)}
                  onQuickView={() => setQuickProduct(p)}
                  action={
                    isDirectBuy(p) ? (
                      <AddToCartButton slug={p.slug} className="btn btn-primary btn-block" />
                    ) : (
                      <Link className="btn btn-secondary btn-block" href={`/product/${p.slug}`}>
                        {hasVariants(p) ? t.common.chooseOptions : t.common.viewProduct}
                      </Link>
                    )
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <QuickViewModal product={quickProduct} onClose={() => setQuickProduct(null)} />
    </div>
  );
}
