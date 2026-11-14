"use client";

import { Fragment } from "react";
import { ProductShape } from "@/components/ui/ProductShape";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { useLanguage } from "@/lib/i18n/context";
import styles from "./Hero.module.css";

const HEADLINE_EN: { word: string; delay: number; accent?: boolean }[] = [
  { word: "Packaging", delay: 0.1 },
  { word: "that", delay: 0.18 },
  { word: "lets", delay: 0.26 },
  { word: "your", delay: 0.34 },
  { word: "food", delay: 0.42 },
  { word: "do", delay: 0.54, accent: true },
  { word: "the", delay: 0.62, accent: true },
  { word: "talking.", delay: 0.7, accent: true },
];

const HEADLINE_BN: { word: string; delay: number; accent?: boolean }[] = [
  { word: "প্যাকেজিং", delay: 0.1 },
  { word: "যা", delay: 0.18 },
  { word: "আপনার", delay: 0.26 },
  { word: "খাবারের", delay: 0.34 },
  { word: "মান", delay: 0.42 },
  { word: "তুলে", delay: 0.54, accent: true },
  { word: "ধরে।", delay: 0.62, accent: true },
];

export function Hero() {
  const { lang, pick } = useLanguage();
  const headline = lang === "bn" ? HEADLINE_BN : HEADLINE_EN;

  const chapterLinks = [
    { n: "02", label: pick("The range", "পণ্যের সম্ভার"), href: "#range" },
    { n: "03", label: pick("Made for your business", "আপনার ব্যবসার জন্য"), href: "#madefor" },
    { n: "05", label: pick("Inside the Signature box", "সিগনেচার বক্স"), href: "#signature" },
  ];

  const floaters = [
    { kind: "square", caption: pick("Clear lids.", "স্বচ্ছ ঢাকনা।"), pos: { left: "2%", top: "4%", width: "26%" }, float: "float-b", delay: 1.2 },
    { kind: "heart", caption: pick("Dessert cups.", "ডেজার্ট কাপ।"), pos: { right: "2%", top: "8%", width: "24%" }, float: "float-c", delay: 1.35 },
    { kind: "crate", caption: pick("Bulk crates.", "বাল্ক ক্রেট।"), pos: { right: "8%", bottom: 0, width: "24%" }, float: "float-b", delay: 1.5 },
  ] as const;

  return (
    <section id="top" aria-label="Introduction" className={`section ${styles.hero}`}>
      <div aria-hidden="true" className={styles.dots} />
      <div aria-hidden="true" className={`orbit ${styles.ring}`} />

      <div className={`wrap ${styles.grid}`}>
        <div className="hero-out">
          <p className="eyebrow fade-in" style={{ color: "var(--accent-500)", animationDelay: "0.05s" }}>
            {pick("01 — The first look", "০১ — প্রথম ঝলক")}
          </p>
          <h1 className={styles.title}>
            {headline.map((h) => (
              <Fragment key={`${lang}-${h.word}`}>
                <span className={`w ${h.accent ? "it" : ""}`} style={{ animationDelay: `${h.delay}s`, color: h.accent ? "var(--accent-500)" : undefined }}>
                  {h.word}
                </span>{" "}
              </Fragment>
            ))}
          </h1>
          <p className={`fade-in ${styles.lede}`} style={{ animationDelay: "0.85s" }}>
            {pick(
              "Square boxes, round containers, dessert cups and crates — made for sweet shops, bakeries, caterers and homes across Bangladesh.",
              "স্কয়ার বক্স, রাউন্ড কনটেইনার, ডেজার্ট কাপ এবং ক্রেট — সারা বাংলাদেশের মিষ্টির দোকান, বেকারি, ক্যাটারিং ও ঘরোয়া ব্যবহারের জন্য।"
            )}
          </p>
          <div className={`fade-in ${styles.ctas}`} style={{ animationDelay: "1s" }}>
            <a className="btn btn-lime" href="#shop">
              {pick("Order now", "অর্ডার করুন")}
              <ArrowRightIcon />
            </a>
            <a className="btn btn-ghost" href="#bulk">
              {pick("Request a bulk quote", "বাল্ক কোটেশন চান")}
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
            {floaters.map((f) => (
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
                {pick("Black Premium Box", "ব্ল্যাক প্রিমিয়াম বক্স")} <span className={styles.chipPrice}>· ৳18.00</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={`wrap fade-in ${styles.chapters}`} style={{ animationDelay: "1.2s" }}>
        <div className={styles.chapterRow}>
          {chapterLinks.map((c) => (
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
