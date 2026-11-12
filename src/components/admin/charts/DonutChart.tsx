"use client";

import { useState } from "react";
import styles from "./charts.module.css";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  formattedValue?: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  centerValue?: string;
  centerLabel?: string;
  size?: number;
}

export function DonutChart({ data, centerValue, centerLabel = "Total", size = 150 }: DonutChartProps) {
  const [active, setActive] = useState<string | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 58;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  let accumulated = 0;
  const segments = data.map((seg) => {
    const fraction = total > 0 ? seg.value / total : 0;
    const dash = `${fraction * circumference} ${circumference * (1 - fraction)}`;
    const offset = -accumulated * circumference;
    accumulated += fraction;
    return { ...seg, pct: Math.round(fraction * 100), dash, offset };
  });

  const activeItem = data.find((d) => d.label === active);
  const displayVal = activeItem ? (activeItem.formattedValue ?? activeItem.value) : (centerValue ?? total);
  const displayLbl = activeItem ? activeItem.label : centerLabel;

  return (
    <div className={styles.donutWrap}>
      <div className={styles.chartContainer} style={{ width: size, height: size }} onMouseLeave={() => setActive(null)}>
        <svg viewBox="0 0 160 160" className={styles.donutSvg} role="img" aria-label={data.map((d) => `${d.label}: ${d.value}`).join(", ")}>
          <circle cx="80" cy="80" r={radius} className={styles.trackCircle} strokeWidth={strokeWidth} />
          {total > 0 &&
            segments.map((seg) => (
              <circle
                key={seg.label}
                cx="80"
                cy="80"
                r={radius}
                className={styles.segmentCircle}
                stroke={seg.color}
                strokeWidth={active === seg.label ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={seg.dash}
                strokeDashoffset={seg.offset}
                style={{ opacity: active && active !== seg.label ? 0.4 : 1 }}
                onMouseEnter={() => setActive(seg.label)}
              />
            ))}
        </svg>
        <div className={styles.centerInfo}>
          <p className={styles.centerVal}>{displayVal}</p>
          <span className={styles.centerLabel}>{displayLbl}</span>
        </div>
      </div>

      <ul className={styles.legendList}>
        {segments.map((seg) => (
          <li key={seg.label}>
            <button
              type="button"
              className={`${styles.legendItem} ${active === seg.label ? styles.legendActive : ""}`}
              onMouseEnter={() => setActive(seg.label)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(seg.label)}
              onBlur={() => setActive(null)}
            >
              <span className={styles.legendLeft}>
                <span className={styles.legendDot} style={{ background: seg.color }} />
                <span className={styles.legendName}>{seg.label}</span>
              </span>
              <span className={styles.legendRight}>
                <span className={styles.legendValue}>{seg.formattedValue ?? seg.value}</span>
                <span className={styles.legendPct}>{seg.pct}%</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
