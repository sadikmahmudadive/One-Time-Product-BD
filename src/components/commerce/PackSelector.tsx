"use client";

import { useLanguage } from "@/lib/i18n/context";
import styles from "./PackSelector.module.css";

interface PackSelectorProps {
  packs: string[];
  selected: string | undefined;
  onSelect: (pack: string) => void;
}

/** Pack-size pills for variable products (pieces per pack). */
export function PackSelector({ packs, selected, onSelect }: PackSelectorProps) {
  const { pick } = useLanguage();

  return (
    <div>
      <p className={styles.label}>{pick("Pack size (pcs)", "প্যাক সাইজ (পিস)")}</p>
      <div className={styles.pills}>
        {packs.map((p) => (
          <button
            key={p}
            type="button"
            className={`${styles.pill} ${selected === p ? styles.on : ""}`}
            aria-pressed={selected === p}
            onClick={() => onSelect(p)}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
