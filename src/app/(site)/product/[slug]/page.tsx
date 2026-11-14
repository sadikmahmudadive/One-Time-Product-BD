import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/commerce/ProductDetailView";
import { PRODUCTS, getCategory, getProduct } from "@/lib/catalog";
import type { Product } from "@/lib/catalog";
import { getProductFromFirestore, getProductsFromFirestore } from "@/lib/firebase/firestore";

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

  const allProducts = await getProductsFromFirestore();
  // Same category first, topped up from the rest so the row is never thin.
  const related = [
    ...allProducts.filter((p) => p.category === product.category && p.slug !== product.slug),
    ...allProducts.filter((p) => p.category !== product.category && p.slug !== product.slug),
  ].slice(0, 4);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData(product, category.name) }} />
      <ProductDetailView initialProduct={product} category={category} initialRelated={related} />
    </>
  );
}
