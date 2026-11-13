"use client";

import { useMemo, useState } from "react";
import type { SalesChartPoint, SalesTimeframe } from "@/lib/admin-utils";
import { formatPrice } from "@/lib/format";
import styles from "./charts.module.css";

export interface RevenueChartProps {
  points: SalesChartPoint[];
  totalRevenue: number;
  totalOrders: number;
  avgOrder: number;
  peakPoint?: SalesChartPoint | null;
  timeframe: SalesTimeframe;
  onTimeframeChange: (tf: SalesTimeframe) => void;
  periodTitle?: string;
  periodSubtitle?: string;
}

const TIMEFRAMES: { key: SalesTimeframe; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

export function RevenueChart({
  points,
  totalRevenue,
  totalOrders,
  avgOrder,
  peakPoint,
  timeframe,
  onTimeframeChange,
  periodSubtitle,
}: RevenueChartProps) {
  const [active, setActive] = useState<number | null>(null);

  const max = useMemo(() => Math.max(...points.map((p) => p.revenue), 1), [points]);
  const activePoint = active !== null ? points[active] : null;

  return (
    <div className={styles.revenue}>
      <div className={styles.chartHead}>
        <div>
          <p className={styles.revenueTotal}>
            {formatPrice(activePoint ? activePoint.revenue : totalRevenue)}
          </p>
          <div className={styles.metaRow}>
            <span className={styles.revenueSub}>
              {activePoint
                ? `${activePoint.fullLabel} · ${activePoint.orders} ${activePoint.orders === 1 ? "order" : "orders"}`
                : periodSubtitle || "Excludes cancelled orders"}
            </span>

            {!activePoint && (
              <>
                <span className={styles.metaPill}>
                  {totalOrders} {totalOrders === 1 ? "order" : "orders"}
                </span>
                {totalOrders > 0 && (
                  <span className={styles.metaPill}>
                    Avg. {formatPrice(avgOrder)}
                  </span>
                )}
                {peakPoint && peakPoint.revenue > 0 && (
                  <span className={styles.peakBadge}>
                    ★ Peak: {peakPoint.label} ({formatPrice(peakPoint.revenue)})
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Dynamic Timeframe Segmented Control */}
        <div className={styles.chartTimeframeGroup} role="group" aria-label="Select sales timeframe">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.key}
              type="button"
              className={`${styles.timeframeBtn} ${timeframe === tf.key ? styles.timeframeBtnActive : ""}`}
              onClick={() => {
                setActive(null);
                onTimeframeChange(tf.key);
              }}
              aria-pressed={timeframe === tf.key}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {points.length === 0 || totalRevenue === 0 ? (
        <div className={styles.emptyBars}>
          <span>No sales recorded for this period yet</span>
          <span style={{ fontSize: 11, color: "var(--ink-400)" }}>New checkout orders will show up here</span>
        </div>
      ) : (
        <div className={styles.bars} onMouseLeave={() => setActive(null)}>
          {points.map((p, i) => {
            const h = p.revenue > 0 ? Math.max(8, (p.revenue / max) * 100) : 0;
            const isPeak = peakPoint && p.revenue === peakPoint.revenue && p.revenue > 0;
            const showLabel =
              timeframe === "monthly"
                ? i === 0 || i === points.length - 1 || i % 5 === 0
                : true;

            return (
              <button
                key={p.key || p.label}
                type="button"
                className={`${styles.barCol} ${active === i ? styles.barActive : ""} ${isPeak ? styles.barPeak : ""}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-label={`${p.fullLabel}: ${formatPrice(p.revenue)} from ${p.orders} orders`}
              >
                <span className={styles.barTrack}>
                  <span className={styles.bar} style={{ height: `${h}%` }} />
                </span>
                <span className={styles.barLabel}>{showLabel ? p.label : ""}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
