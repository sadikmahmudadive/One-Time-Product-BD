"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { getProduct, hasVariants } from "@/lib/catalog";
import type { Product } from "@/lib/catalog";
import {
  normalizeCouponCode,
  validateCouponForSubtotal,
  type Coupon,
  type CouponValidationReason,
} from "@/lib/coupons";
import { getCouponFromFirestore } from "@/lib/firebase/firestore";
import { useProducts } from "@/lib/products-context";

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
  image?: string;
}

export type ApplyCouponResult =
  | { ok: true; coupon: Coupon; discount: number }
  | { ok: false; reason: CouponValidationReason | "error"; minOrder?: number };

interface CartContextValue {
  /** False until the saved cart has been read, so pages can avoid flashing an empty state. */
  ready: boolean;
  /** Total pieces-of-line quantity, for the header badge. */
  count: number;
  lines: ResolvedLine[];
  /** Sum of confirmed prices; lines without one are excluded. */
  subtotal: number;
  coupon: Coupon | null;
  discountAmount: number;
  couponMinOrderNeeded: number | null;
  finalTotal: number;
  unpricedCount: number;
  toast: string | null;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (slug: string, variantId?: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  applyCoupon: (code: string) => Promise<ApplyCouponResult>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "otpb-cart-v1";
const COUPON_STORAGE_KEY = "otpb-coupon-v1";
const TOAST_MS = 2600;
const MAX_QTY = 9999;

function resolve(line: CartLine, findProduct: (slug: string) => Product | undefined): ResolvedLine | null {
  const product = findProduct(line.slug) ?? getProduct(line.slug);
  if (!product) return null;
  const img = product.image || product.images?.[0];
  if (line.variantId && hasVariants(product)) {
    const v = product.variants.find((x) => x.id === line.variantId);
    if (!v) return null;
    return { ...line, name: product.name, variantLabel: `Pack of ${v.pieces}`, unitPrice: v.price, kind: product.kind, image: img };
  }
  return { ...line, name: product.name, unitPrice: product.price, kind: product.kind, image: img };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { getProduct: getLiveProduct } = useProducts();
  const [raw, setRaw] = useState<CartLine[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Restore cart & previously applied promo code after mount.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved)) setRaw(saved.filter((l): l is CartLine => !!l && typeof l.key === "string" && typeof l.qty === "number"));
    } catch {
      /* corrupt or unavailable storage: start empty */
    }

    try {
      const savedCode = localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedCode) {
        void getCouponFromFirestore(savedCode)
          .then((found) => {
            if (found && found.active) {
              setCoupon(found);
            } else {
              localStorage.removeItem(COUPON_STORAGE_KEY);
            }
          })
          .catch(() => {
            /* ignore network error during restore */
          });
      }
    } catch {
      /* ignore storage errors */
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
      if (e.key === STORAGE_KEY) {
        try {
          setRaw(JSON.parse(e.newValue ?? "[]"));
        } catch {
          /* ignore */
        }
      } else if (e.key === COUPON_STORAGE_KEY) {
        if (!e.newValue) {
          setCoupon(null);
        } else {
          void getCouponFromFirestore(e.newValue).then((found) => setCoupon(found && found.active ? found : null)).catch(() => {});
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const addItem = useCallback((slug: string, variantId?: string, qty = 1) => {
    const product = getLiveProduct(slug) ?? getProduct(slug);
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
  }, [getLiveProduct]);

  const setQty = useCallback((key: string, qty: number) => {
    const next = Math.max(1, Math.min(MAX_QTY, Math.floor(qty) || 1));
    setRaw((lines) => lines.map((l) => (l.key === key ? { ...l, qty: next } : l)));
  }, []);

  const removeItem = useCallback((key: string) => setRaw((lines) => lines.filter((l) => l.key !== key)), []);

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    try {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const clear = useCallback(() => {
    setRaw([]);
    removeCoupon();
  }, [removeCoupon]);

  const lines = useMemo(
    () => raw.map((l) => resolve(l, getLiveProduct)).filter((l): l is ResolvedLine => l !== null),
    [raw, getLiveProduct]
  );

  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + (l.unitPrice ?? 0) * l.qty, 0), [lines]);

  const applyCoupon = useCallback(
    async (rawCode: string): Promise<ApplyCouponResult> => {
      const code = normalizeCouponCode(rawCode);
      if (!code) return { ok: false, reason: "empty" };
      try {
        const found = await getCouponFromFirestore(code);
        const res = validateCouponForSubtotal(found, subtotal);
        if (!res.valid) {
          return { ok: false, reason: res.reason, minOrder: res.minOrder };
        }
        setCoupon(res.coupon);
        try {
          localStorage.setItem(COUPON_STORAGE_KEY, res.coupon.code);
        } catch {
          /* ignore */
        }
        return { ok: true, coupon: res.coupon, discount: res.discount };
      } catch {
        return { ok: false, reason: "error" };
      }
    },
    [subtotal]
  );

  const value = useMemo<CartContextValue>(() => {
    const check = coupon ? validateCouponForSubtotal(coupon, subtotal) : null;
    const discountAmount = check && check.valid ? check.discount : 0;
    const couponMinOrderNeeded =
      check && !check.valid && check.reason === "min_order" ? check.minOrder ?? null : null;

    return {
      ready: hydrated,
      count: lines.reduce((n, l) => n + l.qty, 0),
      lines,
      subtotal,
      coupon,
      discountAmount,
      couponMinOrderNeeded,
      finalTotal: Math.max(0, subtotal - discountAmount),
      unpricedCount: lines.filter((l) => l.unitPrice === null).length,
      toast,
      drawerOpen,
      openDrawer,
      closeDrawer,
      addItem,
      setQty,
      removeItem,
      clear,
      applyCoupon,
      removeCoupon,
    };
  }, [
    hydrated,
    lines,
    subtotal,
    coupon,
    toast,
    drawerOpen,
    openDrawer,
    closeDrawer,
    addItem,
    setQty,
    removeItem,
    clear,
    applyCoupon,
    removeCoupon,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
