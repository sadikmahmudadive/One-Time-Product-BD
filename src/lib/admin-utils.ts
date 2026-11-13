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

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
}

/** Percentage change, or null when there is no previous period to compare with. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/* ==============================================================================
   DYNAMIC SALES TIMEFRAMES & METRICS
   ============================================================================== */
export type SalesTimeframe = "today" | "weekly" | "monthly" | "yearly";

export interface SalesMetric {
  key: SalesTimeframe;
  label: string;
  badge: string;
  revenue: number;
  ordersCount: number;
  avgOrderValue: number;
  prevRevenue: number;
  prevOrdersCount: number;
  revenueDelta: number | null;
  ordersDelta: number | null;
  deltaLabel: string;
}

export function calculateSalesMetrics(orders: OrderRecord[]): Record<SalesTimeframe, SalesMetric> {
  const now = new Date();
  const todayStart = startOfDay(now);

  // Time windows (inclusive of start, exclusive of upper bound where appropriate)
  const todayFrom = todayStart;
  const yesterdayFrom = todayStart - DAY;

  const weekFrom = todayStart - 6 * DAY;
  const prevWeekFrom = weekFrom - 7 * DAY;

  const monthFrom = todayStart - 29 * DAY;
  const prevMonthFrom = monthFrom - 30 * DAY;

  const yearFrom = todayStart - 364 * DAY;
  const prevYearFrom = yearFrom - 365 * DAY;

  const buckets = {
    today: { curRev: 0, curCount: 0, prevRev: 0, prevCount: 0 },
    weekly: { curRev: 0, curCount: 0, prevRev: 0, prevCount: 0 },
    monthly: { curRev: 0, curCount: 0, prevRev: 0, prevCount: 0 },
    yearly: { curRev: 0, curCount: 0, prevRev: 0, prevCount: 0 },
  };

  for (const o of orders) {
    const d = toDate(o.createdAt);
    if (!d || !isLive(o)) continue;
    const t = d.getTime();
    const price = o.totalPrice ?? 0;

    // Today vs Yesterday
    if (t >= todayFrom) {
      buckets.today.curRev += price;
      buckets.today.curCount += 1;
    } else if (t >= yesterdayFrom && t < todayFrom) {
      buckets.today.prevRev += price;
      buckets.today.prevCount += 1;
    }

    // Weekly (7 days vs previous 7 days)
    if (t >= weekFrom) {
      buckets.weekly.curRev += price;
      buckets.weekly.curCount += 1;
    } else if (t >= prevWeekFrom && t < weekFrom) {
      buckets.weekly.prevRev += price;
      buckets.weekly.prevCount += 1;
    }

    // Monthly (30 days vs previous 30 days)
    if (t >= monthFrom) {
      buckets.monthly.curRev += price;
      buckets.monthly.curCount += 1;
    } else if (t >= prevMonthFrom && t < monthFrom) {
      buckets.monthly.prevRev += price;
      buckets.monthly.prevCount += 1;
    }

    // Yearly (365 days vs previous 365 days)
    if (t >= yearFrom) {
      buckets.yearly.curRev += price;
      buckets.yearly.curCount += 1;
    } else if (t >= prevYearFrom && t < yearFrom) {
      buckets.yearly.prevRev += price;
      buckets.yearly.prevCount += 1;
    }
  }

  const buildMetric = (
    key: SalesTimeframe,
    label: string,
    badge: string,
    deltaLabel: string,
    data: { curRev: number; curCount: number; prevRev: number; prevCount: number }
  ): SalesMetric => ({
    key,
    label,
    badge,
    deltaLabel,
    revenue: data.curRev,
    ordersCount: data.curCount,
    avgOrderValue: data.curCount > 0 ? Math.round(data.curRev / data.curCount) : 0,
    prevRevenue: data.prevRev,
    prevOrdersCount: data.prevCount,
    revenueDelta: percentChange(data.curRev, data.prevRev),
    ordersDelta: percentChange(data.curCount, data.prevCount),
  });

  return {
    today: buildMetric("today", "Today’s Sales", "Today", "vs yesterday", buckets.today),
    weekly: buildMetric("weekly", "Weekly Sales", "7 Days", "vs previous 7 days", buckets.weekly),
    monthly: buildMetric("monthly", "Monthly Sales", "30 Days", "vs previous 30 days", buckets.monthly),
    yearly: buildMetric("yearly", "Yearly Sales", "12 Months", "vs previous year", buckets.yearly),
  };
}

export interface SalesChartPoint {
  key: string;
  label: string;
  fullLabel: string;
  revenue: number;
  orders: number;
  date?: Date;
}

export interface SalesChartData {
  timeframe: SalesTimeframe;
  periodTitle: string;
  periodSubtitle: string;
  totalRevenue: number;
  totalOrders: number;
  avgOrder: number;
  peakPoint: SalesChartPoint | null;
  points: SalesChartPoint[];
}

export function getTimeframeChartData(orders: OrderRecord[], timeframe: SalesTimeframe): SalesChartData {
  const now = new Date();
  const todayStart = startOfDay(now);
  let points: SalesChartPoint[] = [];
  let periodTitle = "";
  let periodSubtitle = "";

  if (timeframe === "today") {
    periodTitle = "Today’s Sales Velocity";
    periodSubtitle = "Hourly order distribution across today (00:00 – 24:00)";

    // 8 blocks of 3 hours
    const blocks = [
      { startH: 0, label: "00:00", range: "00:00 – 03:00" },
      { startH: 3, label: "03:00", range: "03:00 – 06:00" },
      { startH: 6, label: "06:00", range: "06:00 – 09:00" },
      { startH: 9, label: "09:00", range: "09:00 – 12:00" },
      { startH: 12, label: "12:00", range: "12:00 – 15:00" },
      { startH: 15, label: "15:00", range: "15:00 – 18:00" },
      { startH: 18, label: "18:00", range: "18:00 – 21:00" },
      { startH: 21, label: "21:00", range: "21:00 – 24:00" },
    ];

    points = blocks.map((b) => ({
      key: b.label,
      label: b.label,
      fullLabel: `Today ${b.range}`,
      revenue: 0,
      orders: 0,
    }));

    for (const o of orders) {
      const d = toDate(o.createdAt);
      if (!d || !isLive(o)) continue;
      if (d.getTime() >= todayStart && d.getTime() <= now.getTime()) {
        const hour = d.getHours();
        const blockIdx = Math.min(7, Math.floor(hour / 3));
        points[blockIdx].revenue += o.totalPrice ?? 0;
        points[blockIdx].orders += 1;
      }
    }
  } else if (timeframe === "weekly") {
    periodTitle = "Weekly Sales Trajectory";
    periodSubtitle = "Daily revenue breakdown for the last 7 days";

    const daysCount = 7;
    points = Array.from({ length: daysCount }, (_, i) => {
      const date = new Date(todayStart - (daysCount - 1 - i) * DAY);
      const isToday = i === daysCount - 1;
      return {
        key: `day-${i}`,
        date,
        label: isToday ? "Today" : date.toLocaleDateString("en-GB", { weekday: "short" }),
        fullLabel: date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", year: "numeric" }),
        revenue: 0,
        orders: 0,
      };
    });

    const weekFrom = todayStart - (daysCount - 1) * DAY;
    for (const o of orders) {
      const d = toDate(o.createdAt);
      if (!d || !isLive(o)) continue;
      const t = startOfDay(d);
      const idx = Math.round((t - weekFrom) / DAY);
      if (idx >= 0 && idx < daysCount) {
        points[idx].revenue += o.totalPrice ?? 0;
        points[idx].orders += 1;
      }
    }
  } else if (timeframe === "monthly") {
    periodTitle = "Monthly Sales Trajectory";
    periodSubtitle = "Day-by-day revenue over the last 30 days";

    const daysCount = 30;
    points = Array.from({ length: daysCount }, (_, i) => {
      const date = new Date(todayStart - (daysCount - 1 - i) * DAY);
      return {
        key: `month-day-${i}`,
        date,
        label: date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        fullLabel: date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
        revenue: 0,
        orders: 0,
      };
    });

    const monthFrom = todayStart - (daysCount - 1) * DAY;
    for (const o of orders) {
      const d = toDate(o.createdAt);
      if (!d || !isLive(o)) continue;
      const t = startOfDay(d);
      const idx = Math.round((t - monthFrom) / DAY);
      if (idx >= 0 && idx < daysCount) {
        points[idx].revenue += o.totalPrice ?? 0;
        points[idx].orders += 1;
      }
    }
  } else {
    // Yearly: 12 months rolling
    periodTitle = "Yearly Sales Performance";
    periodSubtitle = "Month-by-month revenue performance across the last 12 months";

    const monthsCount = 12;
    points = Array.from({ length: monthsCount }, (_, i) => {
      const mDate = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1 - i), 1);
      return {
        key: `year-month-${i}`,
        date: mDate,
        label: mDate.toLocaleDateString("en-GB", { month: "short" }),
        fullLabel: mDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
        revenue: 0,
        orders: 0,
      };
    });

    for (const o of orders) {
      const d = toDate(o.createdAt);
      if (!d || !isLive(o)) continue;
      const diffMonths = (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth()) + 11;
      if (diffMonths >= 0 && diffMonths < monthsCount) {
        points[diffMonths].revenue += o.totalPrice ?? 0;
        points[diffMonths].orders += 1;
      }
    }
  }

  const totalRevenue = points.reduce((s, p) => s + p.revenue, 0);
  const totalOrders = points.reduce((s, p) => s + p.orders, 0);
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const peakPoint = points.reduce<SalesChartPoint | null>(
    (max, p) => (p.revenue > 0 && (!max || p.revenue > max.revenue) ? p : max),
    null
  );

  return {
    timeframe,
    periodTitle,
    periodSubtitle,
    totalRevenue,
    totalOrders,
    avgOrder,
    peakPoint,
    points,
  };
}

/** Legacy window totals kept for compatibility. */
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

