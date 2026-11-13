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
  { href: "/shop", label: "Shop" },
  { href: "/shop/square", label: "Square boxes" },
  { href: "/shop/round", label: "Round boxes" },
  { href: "/shop/dessert-cups", label: "Dessert cups" },
  { href: "/shop/crates", label: "Crates" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
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
    href: "/shop/round",
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
    href: "/shop/dessert-cups",
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
    href: "/shop/crates",
  },
];

export interface Persona {
  n: string;
  kind: ShapeKind;
  bg: string;
  title: string;
  desc: string;
  picks: string;
  href: string;
}

export const PERSONAS: Persona[] = [
  {
    n: "01",
    kind: "rectClear",
    bg: "var(--surface-100)",
    title: "Sweet shops",
    desc: "Let mishti and sweets shine through a clear lid.",
    picks: "1000 ml Transparent Premium Box, 1000 ml Square Box",
    href: "/shop/square",
  },
  {
    n: "02",
    kind: "round",
    bg: "var(--brand-100)",
    title: "Bakeries",
    desc: "Biscuits, cakes and bakes, boxed neatly for the counter.",
    picks: "1000 ml Classic Biscuit Container, Black Premium Box",
    href: "/shop/round",
  },
  {
    n: "03",
    kind: "heart",
    bg: "var(--accent-100)",
    title: "Caterers and events",
    desc: "Single-serve desserts by the hundred.",
    picks: "Heart Shape Dessert Cup, Semi Square Dessert Cup",
    href: "/shop/dessert-cups",
  },
  {
    n: "04",
    kind: "square",
    bg: "var(--surface-100)",
    title: "Households",
    desc: "Store, gift and share food at home.",
    picks: "250 ml Square Box, round boxes",
    href: "/shop/square",
  },
];

export interface SquareSize {
  v: string;
  slug: string;
  scale: number;
  fill: number;
  price: string;
  priced: boolean;
}

export const SQUARE_SIZES: SquareSize[] = [
  { v: "250", slug: "250-ml-square-box", scale: 0.56, fill: 25, price: "৳10.00", priced: true },
  { v: "500", slug: "500-ml-square-box", scale: 0.7, fill: 50, price: "Price on product page", priced: false },
  { v: "900", slug: "900-ml-square-box", scale: 0.88, fill: 90, price: "Price on product page", priced: false },
  { v: "1000", slug: "1000-ml-square-box", scale: 1, fill: 100, price: "৳25.00", priced: true },
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

export interface MarqueeSlide {
  label: string;
  /** Short factual line under the label. */
  sub?: string;
  /** Product illustration for product slides… */
  kind?: ShapeKind;
  /** …or a drawn icon for service slides. */
  icon?: "pack" | "bulk" | "truck";
  /** Omit for slides that are statements rather than destinations. */
  href?: string;
}

export const MARQUEE_SLIDES: MarqueeSlide[] = [
  { label: "Square boxes", sub: "250 – 1000 ml", kind: "square", href: "/shop/square" },
  { label: "Round containers", sub: "Incl. biscuit containers", kind: "round", href: "/shop/round" },
  { label: "Dessert cups", sub: "Packs of 100 – 1000", kind: "heart", href: "/shop/dessert-cups" },
  { label: "Plastic crates", sub: "Packs of 5 – 500", kind: "crate", href: "/shop/crates" },
  { label: "Retail packs", sub: "From 5 to 1000 pieces", icon: "pack", href: "/shop" },
  { label: "Bulk orders", sub: "Request a quote", icon: "bulk", href: "/quote" },
  { label: "Delivery across Bangladesh", icon: "truck" },
];

export const BULK_POINTS = [
  "Square boxes, round containers, dessert cups and crates",
  "Pack sizes from 5 to 1000 pieces",
  "Delivery across Bangladesh",
];

export const BUSINESS_TYPES = ["Sweet shop", "Bakery", "Catering", "Restaurant", "Event", "Household"];
export const QUOTE_PRODUCTS = ["Square boxes", "Round boxes", "Dessert cups", "Plastic crates", "Mixed order"];

export const FOOTER_LINKS = {
  Shop: [
    { href: "/shop", label: "All products" },
    { href: "/shop/square", label: "Square & rectangular" },
    { href: "/shop/round", label: "Round containers" },
    { href: "/shop/dessert-cups", label: "Dessert cups" },
    { href: "/shop/crates", label: "Crates" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/track-order", label: "Track order" },
    { href: "/quote", label: "Bulk quote" },
    { href: "/faq", label: "FAQs" },
  ],
} as const;
