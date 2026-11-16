"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PRODUCTS as STATIC_PRODUCTS } from "./catalog";
import type { CategoryId, Product } from "./catalog";
import { isFirebaseConfigured } from "./firebase/config";
import { getProductsFromFirestore } from "./firebase/firestore";

interface ProductsContextValue {
  products: Product[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getProduct: (slug: string) => Product | undefined;
  productsIn: (category: CategoryId) => Product[];
  withTag: (tag: "new" | "popular") => Product[];
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() =>
    isFirebaseConfigured ? [] : STATIC_PRODUCTS
  );
  const [loading, setLoading] = useState<boolean>(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setProducts(STATIC_PRODUCTS);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const live = await getProductsFromFirestore();
      setProducts(live && live.length > 0 ? live : STATIC_PRODUCTS);
    } catch (err) {
      console.warn("ProductsProvider failed to fetch live products:", err);
      setError((err as Error).message || "Failed to load products");
      setProducts((prev) => (prev.length > 0 ? prev : STATIC_PRODUCTS));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const getProduct = useCallback(
    (slug: string): Product | undefined => {
      const liveMatch = products.find((p) => p.slug === slug);
      if (liveMatch) return liveMatch;
      if (!isFirebaseConfigured || (!loading && products.length === 0)) {
        return STATIC_PRODUCTS.find((p) => p.slug === slug);
      }
      return undefined;
    },
    [products, loading]
  );

  const productsIn = useCallback(
    (category: CategoryId): Product[] => {
      return products.filter((p) => p.category === category);
    },
    [products]
  );

  const withTag = useCallback(
    (tag: "new" | "popular"): Product[] => {
      return products.filter((p) => p.tags.includes(tag));
    },
    [products]
  );

  const value = useMemo<ProductsContextValue>(
    () => ({
      products,
      loading,
      error,
      refresh,
      getProduct,
      productsIn,
      withTag,
    }),
    [products, loading, error, refresh, getProduct, productsIn, withTag]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts(): ProductsContextValue {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    // Fallback if rendered outside of provider (e.g. isolated test or preview)
    return {
      products: STATIC_PRODUCTS,
      loading: false,
      error: null,
      refresh: async () => {},
      getProduct: (slug: string) => STATIC_PRODUCTS.find((p) => p.slug === slug),
      productsIn: (category: CategoryId) => STATIC_PRODUCTS.filter((p) => p.category === category),
      withTag: (tag: "new" | "popular") => STATIC_PRODUCTS.filter((p) => p.tags.includes(tag)),
    };
  }
  return ctx;
}
