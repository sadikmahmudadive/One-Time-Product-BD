import { Fragment } from "react";
import { ProductShape } from "@/components/ui/ProductShape";
import { ArrowRightIcon } from "@/components/ui/Icons";
import styles from "./Hero.module.css";

const HEADLINE: { word: string; delay: number; accent?: boolean }[] = [
  { word: "Packaging", delay: 0.1 },
  { word: "that", delay: 0.18 },
  { word: "lets", delay: 0.26 },
  { word: "your", delay: 0.34 },
  { word: "food", delay: 0.42 },
  { word: "do", delay: 0.54, accent: true },
  { word: "the", delay: 0.62, accent: true },
  { word: "talking.", delay: 0.7, accent: true },
];

const CHAPTER_LINKS = [
  { n: "02", label: "The range", href: "#range" },
  { n: "03", label: "Made for your business", href: "#madefor" },
  { n: "05", label: "Inside the Signature box", href: "#signature" },
];

const FLOATERS = [
  { kind: "square", caption: "Clear lids.", pos: { left: "2%", top: "4%", width: "26%" }, float: "float-b", delay: 1.2 },
  { kind: "heart", caption: "Dessert cups.", pos: { right: "2%", top: "8%", width: "24%" }, float: "float-c", delay: 1.35 },
  { kind: "crate", caption: "Bulk crates.", pos: { right: "8%", bottom: 0, width: "24%" }, float: "float-b", delay: 1.5 },
] as const;

export function Hero() {
  return (
    <section id="top" aria-label="Introduction" className={`section ${styles.hero}`}>
      <div aria-hidden="true" className={styles.dots} />
      <div aria-hidden="true" className={`orbit ${styles.ring}`} />

      <div className={`wrap ${styles.grid}`}>
        <div className="hero-out">
          <p className="eyebrow fade-in" style={{ color: "var(--accent-500)", animationDelay: "0.05s" }}>
            01 — The first look
          </p>
          <h1 className={styles.title}>
            {HEADLINE.map((h) => (
              <Fragment key={h.word}>
                <span className={`w ${h.accent ? "it" : ""}`} style={{ animationDelay: `${h.delay}s`, color: h.accent ? "var(--accent-500)" : undefined }}>
                  {h.word}
                </span>{" "}
              </Fragment>
            ))}
          </h1>
          <p className={`fade-in ${styles.lede}`} style={{ animationDelay: "0.85s" }}>
            Square boxes, round containers, dessert cups and crates — made for sweet shops, bakeries, caterers and homes across Bangladesh.
          </p>
          <div className={`fade-in ${styles.ctas}`} style={{ animationDelay: "1s" }}>
            <a className="btn btn-lime" href="#shop">
              Order now
              <ArrowRightIcon />
            </a>
            <a className="btn btn-ghost" href="#bulk">
              Request a bulk quote
            </a>
          </div>
        </div>

        <div className="hero-out">
          <div className={`fade-in ${styles.stage}`} style={{ animationDelay: "0.3s" }}>
            <div aria-hidden="true" className={`orbit-rev ${styles.innerRing}`}>
              <span className={styles.satellite} />
            </div>
            <div className={styles.disc} />
            <div className={styles.mainShape}>
              <div className="float-a">
                <ProductShape kind="rectBlack" />
              </div>
            </div>
            {FLOATERS.map((f) => (
              <div key={f.kind} className={`${f.float} ${styles.floater}`} style={f.pos}>
                <div className={styles.card}>
                  <ProductShape kind={f.kind} />
                </div>
                <p className={`chip-pop ${styles.caption}`} style={{ animationDelay: `${f.delay}s` }}>
                  {f.caption}
                </p>
              </div>
            ))}
            <div className={`chip-pop ${styles.priceChip}`} style={{ animationDelay: "1.65s" }}>
              <span className={styles.stockDot} />
              <span className={styles.chipText}>
                Black Premium Box <span className={styles.chipPrice}>· ৳18.00</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={`wrap fade-in ${styles.chapters}`} style={{ animationDelay: "1.2s" }}>
        <div className={styles.chapterRow}>
          {CHAPTER_LINKS.map((c) => (
            <a key={c.n} className={styles.chapter} href={c.href}>
              <span className={styles.chapterNum}>{c.n}</span>
              <span className={styles.chapterLabel}>
                {c.label}
                <span className={styles.arrow} aria-hidden="true">
                  →
                </span>
              </span>
            </a>
          ))}
          <a href="#range" className={`hide-sm ${styles.scrollCue}`}>
            <span className={styles.mouse}>
              <span className={styles.cueDot} />
            </span>
            Scroll
          </a>
        </div>
      </div>
    </section>
  );
}
