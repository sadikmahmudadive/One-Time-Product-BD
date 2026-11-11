"use client";

import { CATEGORIES } from "@/lib/catalog";
import { DonutChart, type DonutSegment } from "./DonutChart";

interface CategoryPieChartProps {
  orders: import("@/lib/firebase/firestore").OrderRecord[];
}

export function CategoryPieChart({ orders }: CategoryPieChartProps) {
  // Compute item counts by category from orders
  const counts: Record<string, number> = {
    square: 0,
    round: 0,
    "dessert-cups": 0,
    crates: 0,
  };

  orders.forEach((o) => {
    o.items.forEach((item) => {
      // Find category or guess by slug
      if (item.slug.includes("square") || item.slug.includes("box")) counts.square += item.qty;
      else if (item.slug.includes("round") || item.slug.includes("biscuit")) counts.round += item.qty;
      else if (item.slug.includes("cup") || item.slug.includes("heart") || item.slug.includes("semi")) counts["dessert-cups"] += item.qty;
      else if (item.slug.includes("crate")) counts.crates += item.qty;
      else counts.square += item.qty;
    });
  });

  const colors: Record<string, string> = {
    square: "#173C31",
    round: "#347A5D",
    "dessert-cups": "#B7D957",
    crates: "#0284C7",
  };

  const segments: DonutSegment[] = CATEGORIES.map((cat) => ({
    label: cat.short,
    value: counts[cat.id] || 0,
    color: colors[cat.id] || "#77827B",
    formattedValue: `${(counts[cat.id] || 0).toLocaleString()} pcs`,
  }));

  const totalUnits = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <DonutChart
      data={segments}
      centerValue={totalUnits > 0 ? `${totalUnits}` : "0"}
      centerLabel="Units Ordered"
      size={160}
    />
  );
}

