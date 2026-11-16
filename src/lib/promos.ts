import { formatCouponOffer, type Coupon } from "./coupons";
import { formatPrice } from "./format";

export interface PromoBannerItem {
  id: string;
  badge?: string;
  text: string;
  textBn?: string;
  code?: string;
  href?: string;
  active: boolean;
}

export function normalizePromoItem(raw: Partial<PromoBannerItem>, fallbackIndex = 0): PromoBannerItem | null {
  const text = typeof raw.text === "string" ? raw.text.trim() : "";
  if (!text) return null;

  const cleanCode =
    typeof raw.code === "string" && raw.code.trim()
      ? raw.code.trim().toUpperCase().replace(/\s+/g, "")
      : undefined;

  return {
    id: typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : `promo-${Date.now()}-${fallbackIndex}`,
    badge: typeof raw.badge === "string" && raw.badge.trim() ? raw.badge.trim() : undefined,
    text,
    textBn: typeof raw.textBn === "string" && raw.textBn.trim() ? raw.textBn.trim() : undefined,
    code: cleanCode,
    href: typeof raw.href === "string" && raw.href.trim() ? raw.href.trim() : undefined,
    active: raw.active !== false,
  };
}

export function normalizePromos(rawList: unknown): PromoBannerItem[] {
  if (!Array.isArray(rawList)) return [];
  const items: PromoBannerItem[] = [];
  rawList.forEach((item, idx) => {
    if (!item || typeof item !== "object") return;
    const norm = normalizePromoItem(item as Partial<PromoBannerItem>, idx);
    if (norm) items.push(norm);
  });
  return items;
}

export function couponToPromoBanner(coupon: Coupon): PromoBannerItem {
  const offerEn = formatCouponOffer(coupon);
  const minEn = coupon.minOrder ? ` on orders over ${formatPrice(coupon.minOrder)}` : "";

  const offerBn =
    coupon.type === "percent"
      ? `${coupon.value}% ছাড়`
      : `${formatPrice(coupon.value)} ছাড়`;
  const minBn = coupon.minOrder ? ` (${formatPrice(coupon.minOrder)}+ অর্ডারে)` : "";

  return {
    id: `coupon-${coupon.code}`,
    badge: "OFFER",
    text: `${offerEn}${minEn}`,
    textBn: `${offerBn}${minBn}`,
    code: coupon.code,
    href: "/shop",
    active: true,
  };
}
