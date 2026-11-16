import { formatPrice } from "./format";

export type CouponType = "percent" | "fixed";

export interface Coupon {
  code: string;
  type: CouponType;
  value: number;
  minOrder?: number | null;
  maxDiscount?: number | null;
  expiresAt?: string | null;
  active: boolean;
  description?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type CouponValidationReason = "empty" | "not_found" | "inactive" | "expired" | "min_order";

export type CouponValidationResult =
  | {
      valid: true;
      coupon: Coupon;
      discount: number;
      finalTotal: number;
    }
  | {
      valid: false;
      reason: CouponValidationReason;
      minOrder?: number;
    };

export function normalizeCouponCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

function positiveOrNull(n: unknown): number | null {
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

export function normalizeCoupon(raw: Partial<Coupon> & { code: string }): Coupon {
  const type: CouponType = raw.type === "fixed" ? "fixed" : "percent";
  const valueNum = Number(raw.value);
  const clampedValue = Number.isFinite(valueNum)
    ? type === "percent"
      ? Math.min(100, Math.max(1, Math.round(valueNum)))
      : Math.max(1, Math.round(valueNum))
    : 10;

  return {
    code: normalizeCouponCode(raw.code),
    type,
    value: clampedValue,
    minOrder: positiveOrNull(raw.minOrder),
    maxDiscount: type === "percent" ? positiveOrNull(raw.maxDiscount) : null,
    expiresAt: typeof raw.expiresAt === "string" && raw.expiresAt.trim() ? raw.expiresAt.trim() : null,
    active: raw.active !== false,
    description: typeof raw.description === "string" ? raw.description.trim() : "",
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function localIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isCouponExpired(coupon: Pick<Coupon, "expiresAt">): boolean {
  if (!coupon.expiresAt) return false;
  return localIsoDate() > coupon.expiresAt;
}

export function validateCouponForSubtotal(
  coupon: Coupon | null,
  subtotal: number
): CouponValidationResult {
  if (!coupon) return { valid: false, reason: "not_found" };
  if (!coupon.active) return { valid: false, reason: "inactive" };
  if (isCouponExpired(coupon)) return { valid: false, reason: "expired" };

  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return { valid: false, reason: "min_order", minOrder: coupon.minOrder };
  }

  let rawDiscount =
    coupon.type === "percent"
      ? Math.round((subtotal * Math.min(100, Math.max(0, coupon.value))) / 100)
      : Math.round(Math.max(0, coupon.value));

  if (coupon.type === "percent" && coupon.maxDiscount) {
    rawDiscount = Math.min(rawDiscount, coupon.maxDiscount);
  }

  const discount = Math.min(Math.max(0, subtotal), rawDiscount);
  return {
    valid: true,
    coupon,
    discount,
    finalTotal: Math.max(0, subtotal - discount),
  };
}

export function formatCouponOffer(coupon: Pick<Coupon, "type" | "value" | "maxDiscount">): string {
  if (coupon.type === "percent") {
    return coupon.maxDiscount
      ? `${coupon.value}% off (max ${formatPrice(coupon.maxDiscount)})`
      : `${coupon.value}% off`;
  }
  return `${formatPrice(coupon.value)} off`;
}
