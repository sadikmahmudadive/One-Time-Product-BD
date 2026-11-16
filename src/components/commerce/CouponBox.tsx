"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { formatCouponOffer } from "@/lib/coupons";
import { formatPrice } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/context";
import styles from "./CouponBox.module.css";

export function CouponBox() {
  const { subtotal, coupon, discountAmount, couponMinOrderNeeded, applyCoupon, removeCoupon } = useCart();
  const { pick } = useLanguage();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    if (busy) return;
    setError(null);
    setBusy(true);
    const res = await applyCoupon(input);
    setBusy(false);

    if (res.ok) {
      setInput("");
      return;
    }

    if (res.reason === "empty") {
      setError(pick("Enter a promo code first.", "প্রথমে একটি প্রোমো কোড লিখুন।"));
    } else if (res.reason === "not_found") {
      setError(pick("This promo code does not exist.", "এই প্রোমো কোডটি সঠিক নয়।"));
    } else if (res.reason === "inactive") {
      setError(pick("This promo code is currently paused.", "এই প্রোমো কোডটি বর্তমানে বন্ধ আছে।"));
    } else if (res.reason === "expired") {
      setError(pick("This promo code has expired.", "এই প্রোমো কোডটির মেয়াদ শেষ হয়ে গেছে।"));
    } else if (res.reason === "min_order" && res.minOrder) {
      setError(
        pick(
          `Minimum subtotal of ${formatPrice(res.minOrder)} required for this code.`,
          `এই কোডটি ব্যবহার করতে ন্যূনতম ${formatPrice(res.minOrder)} টাকার অর্ডার প্রয়োজন।`
        )
      );
    } else {
      setError(pick("Could not verify code right now. Please try again.", "কোড যাচাই করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।"));
    }
  }

  if (coupon) {
    const needsMore = couponMinOrderNeeded !== null && couponMinOrderNeeded > subtotal;
    return (
      <div className={styles.wrap}>
        <div className={`${styles.applied} ${needsMore ? styles.appliedWarn : ""}`}>
          <div className={styles.appliedLeft}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.tagIcon} aria-hidden="true">
              <path d="M12 2H2v10l9.3 9.3a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4L12 2Z" />
              <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
            </svg>
            <div className={styles.appliedText}>
              <span className={styles.codeName}>{coupon.code}</span>
              <span className={styles.codeNote}>
                {needsMore
                  ? pick(
                      `Add ${formatPrice(couponMinOrderNeeded - subtotal)} more to apply`,
                      `ছাড় পেতে আরও ${formatPrice(couponMinOrderNeeded - subtotal)} যোগ করুন`
                    )
                  : pick(
                      `${formatCouponOffer(coupon)} (-${formatPrice(discountAmount)})`,
                      `${formatPrice(discountAmount)} ছাড় (${formatCouponOffer(coupon)})`
                    )}
              </span>
            </div>
          </div>
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => {
              setError(null);
              removeCoupon();
            }}
          >
            {pick("Remove", "মুছুন")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>{pick("Have a promo code?", "প্রোমো কোড আছে?")}</span>
      <div className={styles.row}>
        <input
          type="text"
          className={styles.input}
          placeholder={pick("Enter code", "কোড লিখুন")}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleApply();
            }
          }}
          aria-label={pick("Promo code", "প্রোমো কোড")}
          disabled={busy}
        />
        <button
          type="button"
          className={styles.applyBtn}
          onClick={() => void handleApply()}
          disabled={busy || !input.trim()}
        >
          {busy ? pick("Checking…", "যাচাই…") : pick("Apply", "প্রয়োগ")}
        </button>
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
