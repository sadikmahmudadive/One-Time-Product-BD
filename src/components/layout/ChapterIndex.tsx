"use client";

import { useEffect, useState } from "react";
import { CHAPTERS } from "@/lib/content";
import { useLanguage } from "@/lib/i18n/context";
import styles from "./ChapterIndex.module.css";

function isDarkAtPoint(x: number, y: number): boolean {
  const els = document.elementsFromPoint(x, y);
  for (const el of els) {
    if (el.closest("nav")) continue;
    const bg = window.getComputedStyle(el).backgroundColor;
    const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!m) continue;
    const alpha = m[4] !== undefined ? parseFloat(m[4]) : 1;
    if (alpha < 0.3) continue;
    const lum = (0.299 * Number(m[1]) + 0.587 * Number(m[2]) + 0.114 * Number(m[3])) / 255;
    return lum < 0.45;
  }
  return true;
}

/** Minimal fixed side section numbers (>=1200px). */
export function ChapterIndex() {
  const { lang, pick } = useLanguage();
  const [active, setActive] = useState(CHAPTERS[0].id);
  const [overDark, setOverDark] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      const triggerY = window.innerHeight * 0.45;
      const present = CHAPTERS.map(({ id }) => {
        const el = document.getElementById(id);
        return el ? { id, top: el.getBoundingClientRect().top } : null;
      }).filter((item): item is { id: string; top: number } => item !== null);

      present.sort((a, b) => a.top - b.top);
      let current = present[0]?.id ?? CHAPTERS[0].id;
      for (const item of present) {
        if (item.top < triggerY) current = item.id;
      }
      setActive(current);
      setOverDark(isDarkAtPoint(window.innerWidth - 28, window.innerHeight * 0.5));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <nav
      className={`${styles.index} ${overDark ? styles.onDark : styles.onLight}`}
      aria-label={pick("Page sections", "পৃষ্ঠার সেকশন")}
    >
      {CHAPTERS.map((c) => {
        const label = lang === "bn" ? c.labelBn : c.label;
        const isActive = active === c.id;
        return (
          <a
            key={c.id}
            className={`${styles.item} ${isActive ? styles.on : ""}`}
            href={`#${c.id}`}
            aria-label={`${c.n} ${label}`}
            aria-current={isActive ? "location" : undefined}
          >
            <span className={styles.num}>{c.n}</span>
            <span className={styles.label} aria-hidden="true">
              {label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
