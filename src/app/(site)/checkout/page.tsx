import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = { title: "Checkout — One Time Product BD", robots: { index: false } };
export default function CheckoutPage() { return <><PageHero crumbs={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]} title="Confirm your" accent="order." /><CheckoutForm /></>; }
