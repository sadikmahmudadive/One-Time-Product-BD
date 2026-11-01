export type ShapeKind =
  | "square"
  | "rectBlack"
  | "rectClear"
  | "round"
  | "heart"
  | "cup"
  | "crate";

export interface Chapter {
  id: string;
  n: string;
  label: string;
}

export const CHAPTERS: Chapter[] = [
  { id: "top", n: "01", label: "Intro" },
  { id: "range", n: "02", label: "The range" },
  { id: "madefor", n: "03", label: "Made for" },
  { id: "sizes", n: "04", label: "Sizes" },
  { id: "signature", n: "05", label: "Signature" },
  { id: "shop", n: "06", label: "Shop" },
  { id: "bulk", n: "07", label: "Bulk orders" },
];

export const NAV_LINKS = [
  { href: "#range", label: "The range" },
  { href: "#madefor", label: "Made for" },
  { href: "#sizes", label: "Sizes" },
  { href: "#shop", label: "Shop" },
  { href: "#bulk", label: "Bulk orders" },
  { href: "#footer", label: "Contact" },
];

export interface RangeRow {
  n: string;
  kind: ShapeKind;
  bg: string;
  tag: string;
  title: string;
  titleIt: string;
  desc: string;
  cta: string;
  href: string;
}

export const RANGE_ROWS: RangeRow[] = [
  {
    n: "01",
    kind: "square",
    bg: "var(--surface-100)",
    tag: "250 · 500 · 900 · 1000 ml",
    title: "Square boxes,",
    titleIt: "crystal clear.",
    desc: "Sleek, minimalist square boxes with a crystal-clear finish, in four capacities — from ৳10.00 for the 250 ml.",
    cta: "Compare sizes",
    href: "#sizes",
  },
  {
    n: "02",
    kind: "round",
    bg: "var(--brand-100)",
    tag: "Round · Biscuit",
    title: "Round boxes,",
    titleIt: "everyday classics.",
    desc: "Round containers for sweets, biscuits and snacks, including the 1000 ml Classic Biscuit Container at ৳20.00.",
    cta: "Shop round boxes",
    href: "#shop",
  },
  {
    n: "03",
    kind: "heart",
    bg: "var(--accent-100)",
    tag: "Acrylic · New",
    title: "Dessert cups,",
    titleIt: "made to be noticed.",
    desc: "Heart-shaped and semi-square acrylic dessert cups, in packs of 100, 300, 500 or 1000.",
    cta: "Shop dessert cups",
    href: "#shop",
  },
  {
    n: "04",
    kind: "crate",
    bg: "var(--surface-100)",
    tag: "Packs of 5 – 500",
    title: "Crates,",
    titleIt: "built for bulk.",
    desc: "The FoodSafe Durable Plastic Crate for moving and storing stock, in packs from 5 to 500.",
    cta: "Shop crates",
    href: "#shop",
  },
];

export interface Persona {
  n: string;
  kind: ShapeKind;
  bg: string;
  title: string;
  desc: string;
  picks: string;
}

export const PERSONAS: Persona[] = [
  {
    n: "01",
    kind: "rectClear",
    bg: "var(--surface-100)",
    title: "Sweet shops",
    desc: "Let mishti and sweets shine through a clear lid.",
    picks: "1000 ml Transparent Premium Box, 1000 ml Square Box",
  },
  {
    n: "02",
    kind: "round",
    bg: "var(--brand-100)",
    title: "Bakeries",
    desc: "Biscuits, cakes and bakes, boxed neatly for the counter.",
    picks: "1000 ml Classic Biscuit Container, Black Premium Box",
  },
  {
    n: "03",
    kind: "heart",
    bg: "var(--accent-100)",
    title: "Caterers and events",
    desc: "Single-serve desserts by the hundred.",
    picks: "Heart Shape Dessert Cup, Semi Square Dessert Cup",
  },
  {
    n: "04",
    kind: "square",
    bg: "var(--surface-100)",
    title: "Households",
    desc: "Store, gift and share food at home.",
    picks: "250 ml Square Box, round boxes",
  },
];

export interface SquareSize {
  v: string;
  scale: number;
  fill: number;
  price: string;
  priced: boolean;
}

export const SQUARE_SIZES: SquareSize[] = [
  { v: "250", scale: 0.56, fill: 25, price: "৳10.00", priced: true },
  { v: "500", scale: 0.7, fill: 50, price: "Price on product page", priced: false },
  { v: "900", scale: 0.88, fill: 90, price: "Price on product page", priced: false },
  { v: "1000", scale: 1, fill: 100, price: "৳25.00", priced: true },
];

export interface Spec {
  n: string;
  sym: string;
  val: string;
  l1: string;
  l2: string;
}

export const SIGNATURE_SPECS: Spec[] = [
  { n: "01", sym: "ml", val: "1000", l1: "Capacity", l2: "Rectangular format" },
  { n: "02", sym: "Li", val: "Clear", l1: "Lid", l2: "Shows what's inside" },
  { n: "03", sym: "Ba", val: "Black", l1: "Base", l2: "Glossy finish" },
  { n: "04", sym: "৳", val: "18.00", l1: "Price", l2: "1000 ml Black Premium Box" },
];

export const SIGNATURE_CALLOUTS = [
  { label: "Clear lid", side: "left", style: { left: "-6%", top: "16%" } },
  { label: "Rectangular format", side: "right", style: { right: "-15%", top: "34%" } },
  { label: "1000 ml capacity", side: "left", style: { left: "-10%", bottom: "26%" } },
  { label: "Glossy black base", side: "right", style: { right: "-13%", bottom: "14%" } },
] as const;

export const MARQUEE_ITEMS = [
  "Square boxes",
  "Round containers",
  "Dessert cups",
  "Biscuit containers",
  "Plastic crates",
  "Retail packs",
  "Bulk orders",
  "Delivery across Bangladesh",
];

export const BULK_POINTS = [
  "Square boxes, round containers, dessert cups and crates",
  "Pack sizes from 5 to 1000 pieces",
  "Delivery across Bangladesh",
];

export const BUSINESS_TYPES = ["Sweet shop", "Bakery", "Catering", "Restaurant", "Event", "Household"];
export const QUOTE_PRODUCTS = ["Square boxes", "Round boxes", "Dessert cups", "Plastic crates", "Mixed order"];

export interface Arrival {
  id: string;
  name: string;
  kind: ShapeKind;
  price: string;
  unit: string;
  packs: string[] | null;
}

export const ARRIVALS: Arrival[] = [
  {
    id: "heart",
    name: "Heart Shape Dessert Cup (Acrylic)",
    kind: "heart",
    price: "৳1,500 – ৳10,000",
    unit: "by pack size",
    packs: ["100", "300", "500", "1000"],
  },
  {
    id: "semi",
    name: "Semi Square Dessert Cup (Acrylic)",
    kind: "cup",
    price: "৳1,500 – ৳10,000",
    unit: "by pack size",
    packs: ["100", "300", "500", "1000"],
  },
  {
    id: "crate",
    name: "FoodSafe Durable Plastic Crate",
    kind: "crate",
    price: "৳2,250 – ৳190,000",
    unit: "by pack size",
    packs: ["5", "50", "100", "500"],
  },
  { id: "sq250", name: "250 ml Square Box", kind: "square", price: "৳10.00", unit: "", packs: null },
];

export interface PopularProduct {
  name: string;
  price: string;
  kind: ShapeKind;
}

export const POPULAR: PopularProduct[] = [
  { name: "1000 ml Classic Biscuit Container", price: "৳20.00", kind: "round" },
  { name: "1000 ml Transparent Premium Box", price: "৳17.00", kind: "rectClear" },
  { name: "1000 ml Black Premium Box", price: "৳18.00", kind: "rectBlack" },
  { name: "1000 ml Square Box", price: "৳25.00", kind: "square" },
];

export const FOOTER_LINKS = {
  "Quick links": [
    { href: "#top", label: "Home" },
    { href: "#range", label: "Round boxes" },
    { href: "#sizes", label: "Square boxes" },
    { href: "#footer", label: "About" },
    { href: "#footer", label: "Contact" },
  ],
  Explore: [
    { href: "#shop", label: "Bestsellers" },
    { href: "#shop", label: "New arrivals" },
    { href: "#signature", label: "Featured" },
    { href: "#footer", label: "Gift card" },
  ],
  Help: [
    { href: "#footer", label: "Track order" },
    { href: "#footer", label: "Delivery and returns" },
    { href: "#footer", label: "FAQs" },
  ],
} as const;
