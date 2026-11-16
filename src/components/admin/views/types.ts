export type Tab = "overview" | "orders" | "quotes" | "coupons" | "products" | "inventory" | "customers" | "media" | "settings";

export const TABS: Tab[] = ["overview", "orders", "quotes", "coupons", "products", "inventory", "customers", "media", "settings"];

export interface StockSummary {
  /** Products with an inventory record. */
  tracked: number;
  total: number;
  /** Available is zero. */
  out: number;
  /** Above zero but at or below the alert level. */
  low: number;
  healthy: number;
}
