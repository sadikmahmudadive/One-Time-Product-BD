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

export function DonutChart({
  data,
  centerValue,
  centerLabel = "Total",
  size = 170,
}: DonutChartProps) {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 58;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  // Compute stroke offsets
  let accumulated = 0;
  const segments = data.map((seg) => {
    const fraction = total > 0 ? seg.value / total : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference * (1 - fraction)}`;
    const strokeDashoffset = -accumulated * circumference;
    accumulated += fraction;
    const pct = total > 0 ? Math.round(fraction * 100) : 0;

    return {
      ...seg,
      pct,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeItem = data.find((d) => d.label === activeSegment);
  const displayVal = activeItem ? (activeItem.formattedValue ?? activeItem.value) : (centerValue ?? total);
  const displayLbl = activeItem ? activeItem.label : centerLabel;

  return (
    <div className={styles.donutWrap}>
      <div
        className={styles.chartContainer}
        style={{ width: size, height: size }}
        onMouseLeave={() => setActiveSegment(null)}
      >
        <svg
          viewBox="0 0 160 160"
          className={styles.donutSvg}
          role="img"
          aria-label={`Donut chart showing ${data.map((d) => `${d.label}: ${d.value}`).join(", ")}`}
        >
          {/* Base track */}
          <circle cx="80" cy="80" r={radius} className={styles.trackCircle} strokeWidth={strokeWidth} />

          {/* Slices */}
          {total > 0 &&
            segments.map((seg) => {
              const isActive = activeSegment === seg.label;
              return (
                <circle
                  key={seg.label}
                  cx="80"
                  cy="80"
                  r={radius}
                  className={styles.segmentCircle}
                  stroke={seg.color}
                  strokeWidth={isActive ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  onMouseEnter={() => setActiveSegment(seg.label)}
                  style={{
                    opacity: activeSegment && !isActive ? 0.45 : 1,
                  }}
                />
              );
            })}
        </svg>

        {/* Center label */}
        <div className={styles.centerInfo}>
          <p className={styles.centerVal}>{displayVal}</p>
          <span className={styles.centerLabel}>{displayLbl}</span>
        </div>
      </div>

      {/* Legend list */}
      <div className={styles.legendList}>
        {segments.map((seg) => (
          <button
            type="button"
            key={seg.label}
            className={styles.legendItem}
            onMouseEnter={() => setActiveSegment(seg.label)}
            onMouseLeave={() => setActiveSegment(null)}
            style={{
              background: activeSegment === seg.label ? "#f0f4f1" : undefined,
              borderColor: activeSegment === seg.label ? "var(--line-300)" : undefined,
            }}
          >
            <div className={styles.legendLeft}>
              <span className={styles.legendDot} style={{ background: seg.color }} />
              <span className={styles.legendName}>{seg.label}</span>
            </div>
            <div className={styles.legendRight}>
              <span className={styles.legendValue}>{seg.formattedValue ?? seg.value}</span>
              <span className={styles.legendPct}>({seg.pct}%)</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

