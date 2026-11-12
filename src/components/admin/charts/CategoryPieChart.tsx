"use client";

import { CATEGORIES, getProduct } from "@/lib/catalog";
import type { OrderRecord } from "@/lib/firebase/firestore";
import { DonutChart, type DonutSegment } from "./DonutChart";

const COLORS: Record<string, string> = {
  square: "#173C31",
  round: "#347A5D",
  "dessert-cups": "#B7D957",
  crates: "#E0A030",
};

/** Units ordered per product family, using each product's catalogue category. */
export function CategoryPieChart({ orders }: { orders: OrderRecord[] }) {
  const counts: Record<string, number> = {};
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    for (const item of o.items) {
      const category = getProduct(item.slug)?.category;
      if (category) counts[category] = (counts[category] ?? 0) + item.qty;
    }
  }

  const segments: DonutSegment[] = CATEGORIES.map((cat) => ({
    label: cat.short,
    value: counts[cat.id] ?? 0,
    color: COLORS[cat.id] ?? "#77827B",
    formattedValue: `${(counts[cat.id] ?? 0).toLocaleString()} units`,
  }));
  const totalUnits = segments.reduce((sum, s) => sum + s.value, 0);

  return <DonutChart data={segments} centerValue={totalUnits.toLocaleString()} centerLabel="Units ordered" />;
}
