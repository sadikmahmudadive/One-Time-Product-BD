import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ProductCard } from "@/components/commerce/ProductCard";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import { ProductPurchase } from "@/components/commerce/ProductPurchase";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CheckIcon } from "@/components/ui/Icons";
import { ProductShape } from "@/components/ui/ProductShape";
import { buildCloudinaryUrl } from "@/lib/cloudinary/client";
import { PRODUCTS, getCategory, getProduct, hasVariants, isDirectBuy, packSummary, priceLabel } from "@/lib/catalog";
import type { Product } from "@/lib/catalog";
import { getProductFromFirestore, getProductsFromFirestore } from "@/lib/firebase/firestore";
import styles from "./page.module.css";

type Params = { slug: string };

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getProductFromFirestore(slug)) || getProduct(slug);
  if (!product) return {};
  return { title: `${product.name} — One Time Product BD`, description: product.summary };
}

/** schema.org Product data. Only confirmed prices are included; availability is omitted (no stock data). */
function structuredData(p: Product, category: string) {
  const prices = [p.price, ...(p.variants?.map((v) => v.price) ?? [])].filter((n): n is number => n !== null);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.summary,
    category,
    brand: { "@type": "Brand", name: "One Time Product BD" },
  };
  if (prices.length === 1) {
    data.offers = { "@type": "Offer", priceCurrency: "BDT", price: prices[0] };
  } else if (prices.length > 1) {
    data.offers = { "@type": "AggregateOffer", priceCurrency: "BDT", lowPrice: Math.min(...prices), highPrice: Math.max(...prices), offerCount: prices.length };
  }
  return JSON.stringify(data);
}

const REASSURANCE = ["Retail packs and bulk quantities", "Pack sizes and prices shown up front", "Need a different size? Ask for a quote"];

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = (await getProductFromFirestore(slug)) || getProduct(slug);
  if (!product) notFound();
  const category = getCategory(product.category) || {
    id: product.category,
    name: product.category.replace("-", " "),
    short: product.category,
    description: "",
    kind: product.kind,
  };
  const material = product.specs?.find(([label]) => label.toLowerCase() === "material")?.[1];

  const allProducts = await getProductsFromFirestore();
  // Same category first, topped up from the rest so the row is never thin.
  const related = [
    ...allProducts.filter((p) => p.category === product.category && p.slug !== product.slug),
    ...allProducts.filter((p) => p.category !== product.category && p.slug !== product.slug),
  ].slice(0, 4);

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  return (
    <div className={`wrap ${styles.page}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData(product, category.name) }} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
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
          <h1 className={styles.title}>{product.name}</h1>
          <ul className={styles.facts} aria-label="Key details">
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
            {REASSURANCE.map((t) => (
              <li key={t}>
                <CheckIcon size={18} />
                {t}
              </li>
            ))}
          </ul>

          <div className={styles.details}>
            <details className={styles.item} open>
              <summary className={styles.summaryRow}>
                <span>Specifications</span>
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
                <span>Materials and sustainability</span>
                <span className={styles.plus} aria-hidden="true" />
              </summary>
              <div className={styles.body}>
                {material ? <p>Listed material: {material}.</p> : <p>We haven’t published a material for this product.</p>}
                <p>
                  Recycling guidance, reuse and food-contact documentation aren’t listed on this page. <Link href="/contact">Ask us</Link> and we’ll confirm
                  what applies to this product.
                </p>
              </div>
            </details>

            <details className={styles.item}>
              <summary className={styles.summaryRow}>
                <span>Ordering and delivery</span>
                <span className={styles.plus} aria-hidden="true" />
              </summary>
              <div className={styles.body}>
                <p>Add items to your cart, then send the cart as an order enquiry. Delivery charges and timing are confirmed with your order.</p>
                <p>
                  Buying a large quantity? <Link href={`/quote?product=${product.slug}`}>Request a bulk quote</Link>.
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>

      <section aria-labelledby="related-h" className={styles.relatedWrap}>
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
                image={p.image}
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
