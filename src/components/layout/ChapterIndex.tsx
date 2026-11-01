"use client";

import { useEffect, useState } from "react";
import { CHAPTERS } from "@/lib/content";
import styles from "./ChapterIndex.module.css";

/** Fixed side index (≥1200px) that tracks which chapter is in view. */
export function ChapterIndex() {
  const [active, setActive] = useState(CHAPTERS[0].id);

  useEffect(() => {
    const onScroll = () => {
      let current = CHAPTERS[0].id;
      for (const { id } of CHAPTERS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={styles.index} aria-label="Page sections">
      {CHAPTERS.map((c) => (
        <a
          key={c.id}
          className={`${styles.item} ${active === c.id ? styles.on : ""}`}
          href={`#${c.id}`}
          aria-label={`${c.n} ${c.label}`}
          aria-current={active === c.id ? "location" : undefined}
        >
          <span>{c.n}</span>
          <span className={styles.bar} />
        </a>
      ))}
    </nav>
  );
}
