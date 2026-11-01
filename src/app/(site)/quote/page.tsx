import type { Metadata } from "next";
import { Suspense } from "react";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { PageHero } from "@/components/ui/PageHero";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Request a bulk quote — One Time Product BD",
  description: "Tell us the products and quantities you need and we’ll reply with bulk pricing.",
};

const INCLUDE = [
  ["The products", "Name and capacity, or the pack size you need."],
  ["The quantity", "How many pieces or packs."],
  ["Where it’s going", "Your delivery district."],
  ["How to reach you", "A phone or WhatsApp number we can call back on."],
];

export default function QuotePage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Bulk quote" }]}
        title="Buying in bulk?"
        accent="Tell us what you need."
        lede="For bakeries, sweet shops, caterers, restaurants and events. Tell us the products and quantities and we’ll reply with bulk pricing."
      />
      <div className={`wrap ${styles.layout}`}>
        <Suspense fallback={<div style={{ minHeight: 520 }} aria-busy="true" />}>
          <QuoteForm />
        </Suspense>
        <aside className={styles.aside} aria-labelledby="include-h">
          <h2 id="include-h">What to include</h2>
          <ul>
            {INCLUDE.map(([title, text]) => (
              <li key={title}>
                <strong>{title}</strong>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
