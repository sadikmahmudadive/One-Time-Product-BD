"use client";

import styles from "./QuantityStepper.module.css";

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  /** Used for the accessible names, e.g. the product name. */
  label: string;
  min?: number;
  max?: number;
}

export function QuantityStepper({ value, onChange, label, min = 1, max = 9999 }: QuantityStepperProps) {
  const clamp = (n: number) => Math.max(min, Math.min(max, Math.floor(n) || min));
  return (
    <div className={styles.stepper} role="group" aria-label={`Quantity for ${label}`}>
      <button type="button" className={styles.btn} aria-label="Decrease quantity" disabled={value <= min} onClick={() => onChange(clamp(value - 1))}>
        −
      </button>
      <input
        className={styles.input}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        aria-label="Quantity"
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
      />
      <button type="button" className={styles.btn} aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(clamp(value + 1))}>
        +
      </button>
    </div>
  );
}
