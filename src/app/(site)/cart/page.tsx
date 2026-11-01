import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Your cart — One Time Product BD",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]} title="Your" accent="cart." />
      <CartView />
    </>
  );
}
