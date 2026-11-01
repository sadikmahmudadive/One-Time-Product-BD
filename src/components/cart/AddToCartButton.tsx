"use client";

import { useCart } from "./CartProvider";

interface AddToCartButtonProps {
  /** Name shown in the confirmation toast. */
  label: string;
  className?: string;
  children?: React.ReactNode;
}

export function AddToCartButton({ label, className = "btn btn-primary", children = "Add to cart" }: AddToCartButtonProps) {
  const { addItem } = useCart();
  return (
    <button type="button" className={className} onClick={() => addItem(label)}>
      {children}
    </button>
  );
}
