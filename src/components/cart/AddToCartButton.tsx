"use client";

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
  children = "Add to cart",
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  return (
    <button type="button" className={className} disabled={disabled} onClick={() => addItem(slug, variantId, qty)}>
      {children}
    </button>
  );
}
