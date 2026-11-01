import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Catalog } from "@/components/commerce/Catalog";
import { PageHero } from "@/components/ui/PageHero";
import { CATEGORIES, getCategory } from "@/lib/catalog";

type Params = { category: string };

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const category = getCategory((await params).category);
  if (!category) return {};
  return { title: `${category.name} — One Time Product BD`, description: category.description };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const category = getCategory((await params).category);
  if (!category) notFound();

  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: category.name }]}
        title={category.name}
        lede={category.description}
      />
      <Catalog category={category.id} />
    </>
  );
}
