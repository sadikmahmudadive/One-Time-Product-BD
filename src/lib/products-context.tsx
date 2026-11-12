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
  const [products, setProducts] = useState<Product[]>(STATIC_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const live = await getProductsFromFirestore();
      if (live && live.length > 0) {
        setProducts(live);
      }
    } catch (err) {
      console.warn("ProductsProvider failed to fetch live products:", err);
      setError((err as Error).message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getProduct = useCallback(
    (slug: string): Product | undefined => {
      return products.find((p) => p.slug === slug) ?? STATIC_PRODUCTS.find((p) => p.slug === slug);
    },
    [products]
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

