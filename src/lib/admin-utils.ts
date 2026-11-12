import type { EnquiryRecord, OrderRecord } from "@/lib/firebase/firestore";

export type OrderStatus = OrderRecord["status"];
export type EnquiryStatus = EnquiryRecord["status"];

export const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "cancelled", label: "Cancelled" },
];

export const ENQUIRY_STATUSES: { value: EnquiryStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

/** Firestore Timestamps arrive as objects with toDate(); a just-written serverTimestamp is still null. */
export function toDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && "toDate" in value) return (value as { toDate: () => Date }).toDate();
  return null;
}

export function formatDate(value: unknown) {
  const d = toDate(value);
  return d ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Just now";
}

export function formatDateTime(value: unknown) {
  const d = toDate(value);
  return d
    ? d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Just now";
}

export const shortId = (id?: string) => (id ?? "").slice(-7).toUpperCase();

/** Bangladeshi mobile numbers: 01XXXXXXXXX → +8801XXXXXXXXX. */
function waNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("880")) return digits;
  return digits.startsWith("0") ? `88${digits}` : `880${digits}`;
}

export function whatsappLink(phone: string, text: string) {
  return `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(text)}`;
}

export function exportCsv(name: string, rows: Record<string, string | number | null | undefined>[]) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const quote = (val: unknown) => `"${String(val ?? "").replaceAll('"', '""')}"`;
  const csv = [keys.join(","), ...rows.map((row) => keys.map((key) => quote(row[key])).join(","))].join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/** Orders still counting toward revenue. */
export const isLive = (o: OrderRecord) => o.status !== "cancelled";

const DAY = 86_400_000;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Revenue and order count for the last `days` days and the `days` before that. */
export function windowTotals(orders: OrderRecord[], days = 7) {
  const today = startOfDay(new Date());
  const from = today - (days - 1) * DAY;
  const prevFrom = from - days * DAY;
  const out = { current: { revenue: 0, count: 0 }, previous: { revenue: 0, count: 0 } };
  for (const o of orders) {
    const d = toDate(o.createdAt);
    if (!d || !isLive(o)) continue;
    const t = startOfDay(d);
    const bucket = t >= from ? out.current : t >= prevFrom ? out.previous : null;
    if (!bucket) continue;
    bucket.revenue += o.totalPrice ?? 0;
    bucket.count += 1;
  }
  return out;
}

/** Percentage change, or null when there is no previous period to compare with. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export interface DailyPoint {
  date: Date;
  label: string;
  revenue: number;
  orders: number;
}

export function dailyRevenue(orders: OrderRecord[], days = 14): DailyPoint[] {
  const today = startOfDay(new Date());
  const points: DailyPoint[] = Array.from({ length: days }, (_, i) => {
    const date = new Date(today - (days - 1 - i) * DAY);
    return { date, label: date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), revenue: 0, orders: 0 };
  });
  for (const o of orders) {
    const d = toDate(o.createdAt);
    if (!d || !isLive(o)) continue;
    const idx = Math.round((startOfDay(d) - (today - (days - 1) * DAY)) / DAY);
    if (idx >= 0 && idx < days) {
      points[idx].revenue += o.totalPrice ?? 0;
      points[idx].orders += 1;
    }
  }
  return points;
}
