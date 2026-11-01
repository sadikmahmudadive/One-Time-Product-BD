import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/commerce/ProductCard";
import { ProductPurchase } from "@/components/commerce/ProductPurchase";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductShape } from "@/components/ui/ProductShape";
import { PRODUCTS, getCategory, getProduct, hasVariants, isDirectBuy, packSummary, priceLabel } from "@/lib/catalog";
import styles from "./page.module.css";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  return { title: `${product.name} — One Time Product BD`, description: product.summary };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const category = getCategory(product.category)!;

  // Same category first, topped up from the rest so the row is never thin.
  const related = [
    ...PRODUCTS.filter((p) => p.category === product.category && p.slug !== product.slug),
    ...PRODUCTS.filter((p) => p.category !== product.category),
  ].slice(0, 4);

  return (
    <div className={`wrap ${styles.page}`}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: category.name, href: `/shop/${category.id}` },
          { label: product.name },
        ]}
      />

      <div className={styles.top}>
        <div className={styles.gallery}>
          {product.tags.includes("new") && <span className={styles.badge}>New</span>}
          <div className={styles.shape}>
            <ProductShape kind={product.kind} />
          </div>
          <p className={styles.caption}>Illustration — product photography to follow.</p>
        </div>

        <div className={styles.info}>
          <p className={styles.cat}>{category.name}</p>
          <h1 className={styles.title}>{product.name}</h1>
          {packSummary(product) && <p className={styles.meta}>{packSummary(product)}</p>}
          <p className={styles.summary}>{product.summary}</p>
          <ProductPurchase slug={product.slug} />
        </div>
      </div>

      <section className={styles.specs} aria-labelledby="specs-h">
        <h2 id="specs-h" className={styles.h2}>
          Specifications
        </h2>
        <dl className={styles.dl}>
          {product.specs.map(([label, value]) => (
            <div key={label} className={styles.row}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.note}>
          Need dimensions, material or usage details? <Link href="/contact">Ask us</Link> and we’ll confirm them for you.
        </p>
      </section>

      <section aria-labelledby="related-h">
        <div className={styles.relatedHead}>
          <h2 id="related-h" className={styles.h2}>
            You might also need
          </h2>
          <Link className={styles.all} href="/shop">
            View all products <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ul className={styles.related}>
          {related.map((p) => (
            <li key={p.slug}>
              <ProductCard
                name={p.name}
                kind={p.kind}
                href={`/product/${p.slug}`}
                meta={packSummary(p)}
                price={priceLabel(p)}
                action={
                  isDirectBuy(p) ? (
                    <AddToCartButton slug={p.slug} className="btn btn-primary btn-block" />
                  ) : (
                    <Link className="btn btn-secondary btn-block" href={`/product/${p.slug}`}>
                      {hasVariants(p) ? "Choose options" : "View product"}
                    </Link>
                  )
                }
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
