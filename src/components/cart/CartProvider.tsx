"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

interface CartContextValue {
  count: number;
  toast: string | null;
  addItem: (label: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const TOAST_MS = 2600;

export function CartProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const addItem = useCallback((label: string) => {
    clearTimeout(timer.current);
    setCount((c) => c + 1);
    setToast(label);
    timer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const value = useMemo(() => ({ count, toast, addItem }), [count, toast, addItem]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
