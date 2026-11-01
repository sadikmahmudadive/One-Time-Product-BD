"use client";

import { CheckIcon } from "@/components/ui/Icons";
import { useCart } from "./CartProvider";
import styles from "./Toast.module.css";

export function Toast() {
  const { toast } = useCart();
  if (!toast) return null;
  return (
    <div className={styles.toast} role="status">
      <span className={styles.badge}>
        <CheckIcon size={14} strokeWidth={3} />
      </span>
      <span>
        Added to cart: <strong>{toast}</strong>
      </span>
    </div>
  );
}
