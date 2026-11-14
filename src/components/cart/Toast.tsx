"use client";

import { CheckIcon } from "@/components/ui/Icons";
import { useLanguage } from "@/lib/i18n/context";
import { useCart } from "./CartProvider";
import styles from "./Toast.module.css";

export function Toast() {
  const { toast, openDrawer } = useCart();
  const { pick } = useLanguage();
  if (!toast) return null;
  return (
    <div className={styles.toast} role="status">
      <span className={styles.badge}>
        <CheckIcon size={14} strokeWidth={3} />
      </span>
      <span className={styles.text}>
        {pick("Added to cart:", "কার্টে যোগ হয়েছে:")} <strong>{toast}</strong>
      </span>
      <button type="button" className={styles.viewBtn} onClick={openDrawer}>
        {pick("View cart", "কার্ট দেখুন")}
      </button>
    </div>
  );
}
