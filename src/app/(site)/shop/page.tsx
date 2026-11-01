import type { Metadata } from "next";
import { Catalog } from "@/components/commerce/Catalog";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "All products — One Time Product BD",
  description: "Square boxes, round containers, dessert cups and crates for food businesses in Bangladesh.",
};

export default function ShopPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]}
        title="Every box, cup and crate,"
        accent="in one place."
        lede="Browse the full range, or open a category to narrow it down."
      />
      <Catalog />
    </>
  );
}
