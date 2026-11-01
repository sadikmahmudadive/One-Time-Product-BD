"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { getProduct, hasVariants } from "@/lib/catalog";

export interface CartLine {
  /** Product slug + variant id — one line per distinct choice. */
  key: string;
  slug: string;
  variantId?: string;
  qty: number;
}

export interface ResolvedLine extends CartLine {
  name: string;
  /** e.g. "Pack of 100". */
  variantLabel?: string;
  unitPrice: number | null;
  kind: import("@/lib/content").ShapeKind;
}

interface CartContextValue {
  /** False until the saved cart has been read, so pages can avoid flashing an empty state. */
  ready: boolean;
  /** Total pieces-of-line quantity, for the header badge. */
  count: number;
  lines: ResolvedLine[];
  /** Sum of confirmed prices; lines without one are excluded. */
  subtotal: number;
  unpricedCount: number;
  toast: string | null;
  addItem: (slug: string, variantId?: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "otpb-cart-v1";
const TOAST_MS = 2600;
const MAX_QTY = 9999;

function resolve(line: CartLine): ResolvedLine | null {
  const product = getProduct(line.slug);
  if (!product) return null;
  if (line.variantId && hasVariants(product)) {
    const v = product.variants.find((x) => x.id === line.variantId);
    if (!v) return null;
    return { ...line, name: product.name, variantLabel: `Pack of ${v.pieces}`, unitPrice: v.price, kind: product.kind };
  }
  return { ...line, name: product.name, unitPrice: product.price, kind: product.kind };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<CartLine[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Restore after mount so server and first client render agree.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved)) setRaw(saved.filter((l): l is CartLine => !!l && typeof l.key === "string" && typeof l.qty === "number"));
    } catch {
      /* corrupt or unavailable storage: start empty */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
    } catch {
      /* storage full or blocked: the cart still works for this visit */
    }
  }, [raw, hydrated]);

  // Keep several open tabs in step.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        setRaw(JSON.parse(e.newValue ?? "[]"));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const addItem = useCallback((slug: string, variantId?: string, qty = 1) => {
    const product = getProduct(slug);
    if (!product) return;
    const key = variantId ?? slug;
    setRaw((lines) => {
      const found = lines.find((l) => l.key === key);
      if (found) return lines.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l));
      return [...lines, { key, slug, variantId, qty }];
    });
    const v = variantId && hasVariants(product) ? product.variants.find((x) => x.id === variantId) : undefined;
    clearTimeout(timer.current);
    setToast(v ? `${product.name} — pack of ${v.pieces}` : product.name);
    timer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    const next = Math.max(1, Math.min(MAX_QTY, Math.floor(qty) || 1));
    setRaw((lines) => lines.map((l) => (l.key === key ? { ...l, qty: next } : l)));
  }, []);

  const removeItem = useCallback((key: string) => setRaw((lines) => lines.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => setRaw([]), []);

  const value = useMemo<CartContextValue>(() => {
    const lines = raw.map(resolve).filter((l): l is ResolvedLine => l !== null);
    return {
      ready: hydrated,
      count: lines.reduce((n, l) => n + l.qty, 0),
      lines,
      subtotal: lines.reduce((sum, l) => sum + (l.unitPrice ?? 0) * l.qty, 0),
      unpricedCount: lines.filter((l) => l.unitPrice === null).length,
      toast,
      addItem,
      setQty,
      removeItem,
      clear,
    };
  }, [raw, hydrated, toast, addItem, setQty, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
