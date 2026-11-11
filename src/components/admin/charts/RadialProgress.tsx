"use client";

import styles from "./charts.module.css";

interface RadialProgressProps {
  percentage: number;
  label: string;
  sublabel?: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
}

export function RadialProgress({
  percentage,
  label,
  sublabel,
  color = "var(--brand-700)",
  size = 80,
  strokeWidth = 8,
}: RadialProgressProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className={styles.radialWrap}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className={styles.radialSvg}
          style={{ width: size, height: size }}
          role="img"
          aria-label={`${label}: ${clamped}%`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={styles.radialTrack}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={styles.radialProgress}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 800,
            color: "var(--ink-950)",
          }}
        >
          {clamped}%
        </div>
      </div>

      <div className={styles.radialContent}>
        <h4 className={styles.radialTitle}>{label}</h4>
        {sublabel && <p className={styles.radialSubtitle}>{sublabel}</p>}
      </div>
    </div>
  );
}

