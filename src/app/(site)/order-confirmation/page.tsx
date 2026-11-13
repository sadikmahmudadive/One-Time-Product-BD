import Link from "next/link";
import styles from "@/components/checkout/CheckoutForm.module.css";

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const id = (await searchParams).order;

  return (
    <div className={`wrap ${styles.page}`}>
      <div className={styles.empty}>
        <p className="eyebrow eyebrow-center">Order received</p>
        <h1>Thank you for your order.</h1>
        <p>
          {id ? (
            <>
              Your order reference is <strong>{id}</strong>. Save this ID to track your delivery status anytime. We’ll review your items, delivery address, and final delivery charge before contacting you.
            </>
          ) : (
            "We’ll review your order and contact you shortly."
          )}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
          {id && (
            <Link className="btn btn-primary" href={`/track-order?order=${encodeURIComponent(id)}`}>
              Track this order
            </Link>
          )}
          <Link className={id ? "btn btn-secondary" : "btn btn-primary"} href="/shop">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
