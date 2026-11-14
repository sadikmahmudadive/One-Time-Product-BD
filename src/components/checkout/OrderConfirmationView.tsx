"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import styles from "./CheckoutForm.module.css";

export function OrderConfirmationView({ id }: { id?: string }) {
  const { t, pick } = useLanguage();

  return (
    <div className={`wrap ${styles.page}`}>
      <div className={styles.empty}>
        <p className="eyebrow eyebrow-center">{t.confirmation.eyebrow}</p>
        <h1>{t.confirmation.title}</h1>
        <p>
          {id ? (
            <>
              {pick("Your order reference is", "আপনার অর্ডার রেফারেন্স আইডি:")} <strong>{id}</strong>.{" "}
              {t.confirmation.desc}
            </>
          ) : (
            t.confirmation.desc
          )}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
          {id && (
            <Link className="btn btn-primary" href={`/track-order?order=${encodeURIComponent(id)}`}>
              {t.confirmation.trackThisOrder}
            </Link>
          )}
          <Link className={id ? "btn btn-secondary" : "btn btn-primary"} href="/shop">
            {t.confirmation.continueShopping}
          </Link>
        </div>
      </div>
    </div>
  );
}

