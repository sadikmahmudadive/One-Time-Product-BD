import type { ShapeKind } from "./content";
import { formatPrice } from "./format";

/**
 * Catalogue data. Only facts that appear in design.md or the home-page design are recorded here.
 * A price of `null` means the price has not been confirmed — the UI shows "Price on request" and
 * routes the visitor to the quote form instead of guessing.
 */

export type CategoryId = "square" | "round" | "dessert-cups" | "crates";

export interface Category {
  id: CategoryId;
  name: string;
  short: string;
  description: string;
  kind: ShapeKind;
}

export const CATEGORIES: Category[] = [
  {
    id: "square",
    name: "Square & rectangular boxes",
    short: "Square boxes",
    description: "Sleek, minimalist boxes with a crystal-clear finish, in square and rectangular formats.",
    kind: "square",
  },
  {
    id: "round",
    name: "Round containers",
    short: "Round boxes",
    description: "Round containers for sweets, biscuits and snacks.",
    kind: "round",
  },
  {
    id: "dessert-cups",
    name: "Dessert cups",
    short: "Dessert cups",
    description: "Heart-shaped and semi-square acrylic dessert cups, sold in packs.",
    kind: "heart",
  },
  {
    id: "crates",
    name: "Crates & bulk storage",
    short: "Crates",
    description: "Durable plastic crates for moving and storing stock, sold in packs.",
    kind: "crate",
  },
];

export interface Variant {
  id: string;
  /** Pieces in the pack, e.g. "100". */
  pieces: string;
  price: number | null;
}

export interface Product {
  slug: string;
  name: string;
  category: CategoryId;
  kind: ShapeKind;
  /** Primary cover image (Cloudinary public ID or image URL). Falls back to isometric ProductShape when omitted. */
  image?: string;
  /** Complete gallery of image URLs or Cloudinary public IDs for this product. */
  images?: string[];
  /** Capacity in ml, where the product name states one. */
  capacityMl?: number;
  summary: string;
  /** Single-price products. */
  price: number | null;
  /** Pack-size products; each pack has its own price. */
  variants?: Variant[];
  tags: ("new" | "popular")[];
  specs: [label: string, value: string][];
  /** Warehouse stock counts & alert levels. */
  available?: number;
  lowStockAt?: number;
}

const pack = (slug: string, pieces: string, price: number | null): Variant => ({
  id: `${slug}-${pieces}`,
  pieces,
  price,
});

export const PRODUCTS: Product[] = [
  {
    slug: "heart-shape-dessert-cup-acrylic",
    name: "Heart Shape Dessert Cup (Acrylic)",
    category: "dessert-cups",
    kind: "heart",
    summary: "A heart-shaped acrylic dessert cup, sold in packs of 100 to 1000.",
    price: null,
    variants: [
      pack("heart", "100", 1500),
      pack("heart", "300", null),
      pack("heart", "500", null),
      pack("heart", "1000", 10000),
    ],
    tags: ["new"],
    specs: [
      ["Shape", "Heart"],
      ["Material", "Acrylic"],
      ["Pack sizes", "100, 300, 500 or 1000 pieces"],
    ],
  },
  {
    slug: "semi-square-dessert-cup-acrylic",
    name: "Semi Square Dessert Cup (Acrylic)",
    category: "dessert-cups",
    kind: "cup",
    summary: "A semi-square acrylic dessert cup, sold in packs of 100 to 1000.",
    price: null,
    variants: [
      pack("semi", "100", 1500),
      pack("semi", "300", null),
      pack("semi", "500", null),
      pack("semi", "1000", 10000),
    ],
    tags: ["new"],
    specs: [
      ["Shape", "Semi square"],
      ["Material", "Acrylic"],
      ["Pack sizes", "100, 300, 500 or 1000 pieces"],
    ],
  },
  {
    slug: "foodsafe-durable-plastic-crate",
    name: "FoodSafe Durable Plastic Crate",
    category: "crates",
    kind: "crate",
    summary: "A durable plastic crate for moving and storing stock, sold in packs of 5 to 500.",
    price: null,
    variants: [pack("crate", "5", 2250), pack("crate", "50", null), pack("crate", "100", null), pack("crate", "500", 190000)],
    tags: ["new"],
    specs: [
      ["Type", "Crate"],
      ["Pack sizes", "5, 50, 100 or 500 pieces"],
    ],
  },
  {
    slug: "250-ml-square-box",
    name: "250 ml Square Box",
    category: "square",
    kind: "square",
    capacityMl: 250,
    summary: "A sleek, minimalist square box with a crystal-clear finish.",
    price: 10,
    tags: ["new"],
    specs: [
      ["Capacity", "250 ml"],
      ["Shape", "Square"],
      ["Finish", "Crystal clear"],
    ],
  },
  {
    slug: "500-ml-square-box",
    name: "500 ml Square Box",
    category: "square",
    kind: "square",
    capacityMl: 500,
    summary: "A sleek, minimalist square box with a crystal-clear finish.",
    price: null,
    tags: [],
    specs: [
      ["Capacity", "500 ml"],
      ["Shape", "Square"],
      ["Finish", "Crystal clear"],
    ],
  },
  {
    slug: "900-ml-square-box",
    name: "900 ml Square Box",
    category: "square",
    kind: "square",
    capacityMl: 900,
    summary: "A sleek, minimalist square box with a crystal-clear finish.",
    price: null,
    tags: [],
    specs: [
      ["Capacity", "900 ml"],
      ["Shape", "Square"],
      ["Finish", "Crystal clear"],
    ],
  },
  {
    slug: "1000-ml-square-box",
    name: "1000 ml Square Box",
    category: "square",
    kind: "square",
    capacityMl: 1000,
    summary: "A sleek, minimalist square box with a crystal-clear finish.",
    price: 25,
    tags: ["popular"],
    specs: [
      ["Capacity", "1000 ml"],
      ["Shape", "Square"],
      ["Finish", "Crystal clear"],
    ],
  },
  {
    slug: "1000-ml-transparent-premium-box",
    name: "1000 ml Transparent Premium Box",
    category: "square",
    kind: "rectClear",
    capacityMl: 1000,
    summary: "A rectangular box with a transparent finish, so the contents show.",
    price: 17,
    tags: ["popular"],
    specs: [
      ["Capacity", "1000 ml"],
      ["Shape", "Rectangular"],
      ["Colour", "Transparent"],
    ],
  },
  {
    slug: "1000-ml-black-premium-box",
    name: "1000 ml Black Premium Box",
    category: "square",
    kind: "rectBlack",
    capacityMl: 1000,
    summary: "A rectangular box with a glossy black base and a clear lid.",
    price: 18,
    tags: ["popular"],
    specs: [
      ["Capacity", "1000 ml"],
      ["Shape", "Rectangular"],
      ["Base", "Glossy black"],
      ["Lid", "Clear"],
    ],
  },
  {
    slug: "1000-ml-classic-biscuit-container",
    name: "1000 ml Classic Biscuit Container",
    category: "round",
    kind: "round",
    capacityMl: 1000,
    summary: "A round container for biscuits, sweets and snacks.",
    price: 20,
    tags: ["popular"],
    specs: [
      ["Capacity", "1000 ml"],
      ["Shape", "Round"],
      ["Intended use", "Biscuits, sweets and snacks"],
    ],
  },
];

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);
export const productsIn = (id: CategoryId) => PRODUCTS.filter((p) => p.category === id);
export const withTag = (tag: "new" | "popular") => PRODUCTS.filter((p) => p.tags.includes(tag));

/** Lowest confirmed price across a product's own price and its packs. */
export function lowestPrice(p: Product): number | null {
  const prices = [p.price, ...(p.variants?.map((v) => v.price) ?? [])].filter((n): n is number => n !== null);
  return prices.length ? Math.min(...prices) : null;
}

export function hasVariants(p: Product): p is Product & { variants: Variant[] } {
  return !!p.variants?.length;
}

/** True when the product can go straight into the cart without choosing a pack. */
export function isDirectBuy(p: Product) {
  return !hasVariants(p) && p.price !== null;
}

/** Price line for a card or page: a range for packs, the price for singles, "on request" when unconfirmed. */
export function priceLabel(p: Product): string {
  if (hasVariants(p)) {
    const prices = p.variants.map((v) => v.price).filter((n): n is number => n !== null);
    if (prices.length === 0) return "Price on request";
    return prices.length > 1 ? `${formatPrice(Math.min(...prices))} – ${formatPrice(Math.max(...prices))}` : `From ${formatPrice(prices[0])}`;
  }
  return p.price === null ? "Price on request" : formatPrice(p.price);
}

export function packSummary(p: Product): string | undefined {
  if (!hasVariants(p)) return p.capacityMl ? `${p.capacityMl} ml` : undefined;
  return `Packs of ${p.variants.map((v) => v.pieces).join(" · ")}`;
}
