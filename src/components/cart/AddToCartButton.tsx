"use client";

import { useLanguage } from "@/lib/i18n/context";
import { useCart } from "./CartProvider";

interface AddToCartButtonProps {
  slug: string;
  variantId?: string;
  qty?: number;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function AddToCartButton({
  slug,
  variantId,
  qty = 1,
  className = "btn btn-primary",
  disabled,
  children,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const { t } = useLanguage();
  return (
    <button type="button" className={className} disabled={disabled} onClick={() => addItem(slug, variantId, qty)}>
      {children ?? t.common.addToCart}
    </button>
  );
}
