"use client";

import { useState } from "react";
import type { DailyPoint } from "@/lib/admin-utils";
import { formatPrice } from "@/lib/format";
import styles from "./charts.module.css";

/** Daily revenue bars. Every bar is also keyboard-focusable and described in the table fallback. */
export function RevenueChart({ points }: { points: DailyPoint[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...points.map((p) => p.revenue), 1);
  const total = points.reduce((s, p) => s + p.revenue, 0);
  const shown = active !== null ? points[active] : null;

  return (
    <div className={styles.revenue}>
      <div className={styles.revenueHead} aria-live="polite">
        <div>
          <p className={styles.revenueTotal}>{formatPrice(shown ? shown.revenue : total)}</p>
          <p className={styles.revenueSub}>
            {shown ? `${shown.label} · ${shown.orders} ${shown.orders === 1 ? "order" : "orders"}` : `Last ${points.length} days · excludes cancelled`}
          </p>
        </div>
      </div>

      <div className={styles.bars} onMouseLeave={() => setActive(null)}>
        {points.map((p, i) => {
          const h = p.revenue > 0 ? Math.max(6, (p.revenue / max) * 100) : 0;
          return (
            <button
              key={p.label}
              type="button"
              className={`${styles.barCol} ${active === i ? styles.barActive : ""}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              aria-label={`${p.label}: ${formatPrice(p.revenue)} from ${p.orders} ${p.orders === 1 ? "order" : "orders"}`}
            >
              <span className={styles.barTrack}>
                <span className={styles.bar} style={{ height: `${h}%` }} />
              </span>
              <span className={styles.barLabel}>{i % 2 === 0 || points.length <= 7 ? p.label.split(" ")[0] : ""}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
