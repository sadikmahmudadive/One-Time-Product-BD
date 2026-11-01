import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "FAQs — One Time Product BD",
  description: "Quantities, capacities, bulk orders and quotes.",
};

// Only answers that follow from the published catalogue. Delivery, returns and payment answers
// are left out until the business confirms them (design.md §5.9).
const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "What quantity options are available?",
    a: (
      <>
        Dessert cups come in packs of 100, 300, 500 or 1000, and crates in packs of 5, 50, 100 or 500. Boxes and containers are listed
        individually — set the quantity on the product page. See <Link href="/shop">all products</Link>.
      </>
    ),
  },
  {
    q: "How do I choose the right capacity?",
    a: (
      <>
        Square boxes come in 250, 500, 900 and 1000 ml. The size picker on the <Link href="/#sizes">home page</Link> shows how they compare, and each
        product page lists its capacity.
      </>
    ),
  },
  {
    q: "Do you accept bulk orders?",
    a: (
      <>
        Yes. Tell us the products and quantities you need and we’ll reply with bulk pricing — use the <Link href="/quote">bulk quote form</Link>.
      </>
    ),
  },
  {
    q: "How do I request a quotation?",
    a: (
      <>
        Fill in the <Link href="/quote">quote form</Link> with the products, quantity, delivery district and a phone or WhatsApp number. On a product
        page, “Request a bulk quote” fills in the product for you, and the cart can be sent as an enquiry.
      </>
    ),
  },
  {
    q: "Why does a product say “Price on request”?",
    a: <>We only show prices that are confirmed. For anything marked “Price on request”, ask through the quote form and we’ll confirm the price.</>,
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "FAQs" }]}
        title="Questions,"
        accent="answered."
        lede="Quick answers about sizes, packs and bulk orders."
      />
      <div className={`wrap ${styles.wrap}`}>
        <div className={styles.list}>
          {FAQS.map(({ q, a }) => (
            <details key={q} className={styles.item}>
              <summary className={styles.summary}>
                <span>{q}</span>
                <span className={styles.plus} aria-hidden="true" />
              </summary>
              <div className={styles.answer}>{a}</div>
            </details>
          ))}
        </div>
        <aside className={styles.more}>
          <h2>Still have a question?</h2>
          <p>We’re happy to help.</p>
          <Link className="btn btn-primary" href="/contact">
            Contact us
          </Link>
        </aside>
      </div>
    </>
  );
}
