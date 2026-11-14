"use client";

import Link from "next/link";
import { ProductShape } from "@/components/ui/ProductShape";
import { RANGE_ROWS } from "@/lib/content";
import { useLanguage } from "@/lib/i18n/context";
import styles from "./RangeSection.module.css";

const RANGE_BN = [
  {
    tag: "২৫০ · ৫০০ · ৯০০ · ১০০০ মিলি",
    title: "স্কয়ার বক্স,",
    titleIt: "স্বচ্ছ ও ঝকঝকে।",
    desc: "চারটি মাপে আকর্ষণীয় মিনিমালিস্ট স্কয়ার বক্স — ২৫০ মিলি শুরু মাত্র ৳১০.০০ থেকে।",
    cta: "সাইজ তুলনা করুন",
  },
  {
    tag: "রাউন্ড · বিস্কুট",
    title: "রাউন্ড বক্স,",
    titleIt: "নিত্যদিনের ক্লাসিক।",
    desc: "মিষ্টি, বিস্কুট ও স্ন্যাকসের জন্য রাউন্ড কনটেইনার — ১০০০ মিলি ক্লাসিক বিস্কুট কনটেইনার ৳২০.০০।",
    cta: "রাউন্ড বক্স দেখুন",
  },
  {
    tag: "এক্রাইলিক · নতুন",
    title: "ডেজার্ট কাপ,",
    titleIt: "নজরকাড়া ডিজাইন।",
    desc: "হার্ট-শেপ এবং সেমি-স্কয়ার এক্রাইলিক ডেজার্ট কাপ — ১০০, ৩০০, ৫০০ বা ১০০০ পিসের প্যাকে।",
    cta: "ডেজার্ট কাপ দেখুন",
  },
  {
    tag: "৫ – ৫০০ পিসের প্যাক",
    title: "প্লাস্টিক ক্রেট,",
    titleIt: "বড় স্টকের জন্য।",
    desc: "পণ্য পরিবহন ও সংরক্ষণের জন্য টেকসই ফুড-সেফ প্লাস্টিক ক্রেট — ৫ থেকে ৫০০ পিসের প্যাকে।",
    cta: "ক্রেট দেখুন",
  },
];

export function RangeSection() {
  const { lang, pick } = useLanguage();

  return (
    <section id="range" className={`section ${styles.section}`}>
      <div className={`wrap ${styles.inner}`}>
        <div className={`reveal section-head ${styles.head}`}>
          <div>
            <p className="eyebrow" style={{ color: "var(--brand-700)" }}>
              {pick("02 — The range", "০২ — পণ্যের সম্ভার")}
            </p>
            <h2 className="section-title">
              {pick("Four families of packaging,", "চার ধরনের প্যাকেজিং,")}{" "}
              <span className="it" style={{ color: "var(--brand-700)" }}>
                {pick("one supplier.", "একই নির্ভরযোগ্য উৎস।")}
              </span>
            </h2>
          </div>
          <p className="section-lede" style={{ color: "var(--ink-700)" }}>
            {pick(
              "From a single 250 ml box to crates by the hundred — buy a retail pack or a full bulk order.",
              "একটি ২৫০ মিলি বক্স থেকে শত শত ক্রেট — খুচরা প্যাক অথবা পূর্ণ বাল্ক অর্ডার করুন সহজেই।"
            )}
          </p>
        </div>

        <div className={styles.rows}>
          {RANGE_ROWS.map((r, i) => {
            const bn = RANGE_BN[i];
            const tag = lang === "bn" && bn ? bn.tag : r.tag;
            const title = lang === "bn" && bn ? bn.title : r.title;
            const titleIt = lang === "bn" && bn ? bn.titleIt : r.titleIt;
            const desc = lang === "bn" && bn ? bn.desc : r.desc;
            const cta = lang === "bn" && bn ? bn.cta : r.cta;

            return (
              <div key={r.n} className={styles.row} style={{ flexDirection: i % 2 ? "row-reverse" : "row" }}>
                <div className={`clip-in ${styles.media}`} style={{ background: r.bg }}>
                  <p aria-hidden="true" className={`big-num ${styles.bigNum}`}>
                    {r.n}
                  </p>
                  <div className={styles.shapeBox}>
                    <div className="parallax" style={{ width: "100%" }}>
                      <div className={styles.img}>
                        <ProductShape kind={r.kind} />
                      </div>
                    </div>
                  </div>
                  <span className={styles.tag}>{tag}</span>
                </div>
                <div className={`reveal ${styles.copy}`}>
                  <p className={styles.count}>{r.n} / 04</p>
                  <h3 className={styles.rowTitle}>
                    {title}{" "}
                    <span className="it" style={{ color: "var(--brand-700)" }}>
                      {titleIt}
                    </span>
                  </h3>
                  <p className={styles.desc}>{desc}</p>
                  <Link className={styles.rowLink} href={r.href}>
                    {cta}{" "}
                    <span className={styles.arrow} aria-hidden="true">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div aria-hidden="true" className={styles.outlineBand}>
        <p className={`scroll-x ${styles.outline}`}>
          {lang === "bn" ? (
            <>
              প্যাকেজিং, <span>সুন্দর উপস্থাপনায়</span> — প্যাকেজিং, <span>সুন্দর উপস্থাপনায়</span> —
            </>
          ) : (
            <>
              Packaging, <span>presented beautifully</span> — Packaging, <span>presented beautifully</span> —
            </>
          )}
        </p>
      </div>
    </section>
  );
}
