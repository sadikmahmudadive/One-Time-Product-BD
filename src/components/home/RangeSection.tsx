"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { buildCloudinaryUrl } from "@/lib/cloudinary/client";
import { RANGE_ROWS } from "@/lib/content";
import { useLanguage } from "@/lib/i18n/context";
import { useProducts } from "@/lib/products-context";
import styles from "./RangeSection.module.css";

const RANGE_BN = [
  {
    tag: "২৫০ · ৫০০ · ৯০০ · ১০০০ মিলি",
    title: "স্কয়ার বক্স,",
    titleIt: "স্বচ্ছ ও ঝকঝকে।",
    desc: "চারটি মাপে আকর্ষণীয় মিনিমালিস্ট স্কয়ার বক্স — ২৫০ মিলি শুরু মাত্র ৳১০.০০ থেকে।",
    cta: "সাইজ তুলনা করুন",
    specimen: "SPECIMEN 01 · CRYSTAL-CLEAR PET",
  },
  {
    tag: "রাউন্ড · বিস্কুট",
    title: "রাউন্ড বক্স,",
    titleIt: "নিত্যদিনের ক্লাসিক।",
    desc: "মিষ্টি, বিস্কুট ও স্ন্যাকসের জন্য রাউন্ড কনটেইনার — ১০০০ মিলি ক্লাসিক বিস্কুট কনটেইনার ৳২০.০০।",
    cta: "রাউন্ড বক্স দেখুন",
    specimen: "SPECIMEN 02 · SEAL-TIGHT ROUND",
  },
  {
    tag: "এক্রাইলিক · নতুন",
    title: "ডেজার্ট কাপ,",
    titleIt: "নজরকাড়া ডিজাইন।",
    desc: "হার্ট-শেপ এবং সেমি-স্কয়ার এক্রাইলিক ডেজার্ট কাপ — ১০০, ৩০০, ৫০০ বা ১০০০ পিসের প্যাকে।",
    cta: "ডেজার্ট কাপ দেখুন",
    specimen: "SPECIMEN 03 · FACETED ACRYLIC",
  },
  {
    tag: "৫ – ৫০০ পিসের প্যাক",
    title: "প্লাস্টিক ক্রেট,",
    titleIt: "বড় স্টকের জন্য।",
    desc: "পণ্য পরিবহন ও সংরক্ষণের জন্য টেকসই ফুড-সেফ প্লাস্টিক ক্রেট — ৫ থেকে ৫০০ পিসের প্যাকে।",
    cta: "ক্রেট দেখুন",
    specimen: "SPECIMEN 04 · STACKABLE LOGISTICS",
  },
];

const FALLBACK_IMAGES: Record<string, string> = {
  "01": "/images/hero/square-clear-boxes.jpg",
  "02": "/images/hero/black-premium-box.jpg",
  "03": "/images/hero/acrylic-dessert-cup.jpg",
  "04": "/images/hero/plastic-storage-crate.jpg",
};

const ROW_CATEGORY: Record<string, string> = {
  "01": "square",
  "02": "round",
  "03": "dessert-cups",
  "04": "crates",
};

const SPECIMEN_EN: Record<string, string> = {
  "01": "SPECIMEN 01 · CRYSTAL-CLEAR SQUARE SERIES",
  "02": "SPECIMEN 02 · AIRTIGHT ROUND & RECTANGULAR",
  "03": "SPECIMEN 03 · FACETED ACRYLIC DESSERT CUPS",
  "04": "SPECIMEN 04 · FOOD-SAFE VENTILATED CRATES",
};

export function RangeSection() {
  const { lang, pick } = useLanguage();
  const { products } = useProducts();
  const [active, setActive] = useState(0);

  const items = useMemo(() => {
    return RANGE_ROWS.map((r, i) => {
      const cat = ROW_CATEGORY[r.n];
      const livePhoto = products.find((p) => p.category === cat && (p.image || p.images?.[0]));
      const raw = livePhoto?.image || livePhoto?.images?.[0];
      const hasCustom = Boolean(raw);
      const photo = raw
        ? buildCloudinaryUrl(raw, { width: 920, height: 920, crop: "fit", quality: "auto", format: "auto" })
        : FALLBACK_IMAGES[r.n];
      const bn = RANGE_BN[i];
      return {
        ...r,
        photo,
        hasCustom,
        fallbackPhoto: FALLBACK_IMAGES[r.n],
        tag: lang === "bn" && bn ? bn.tag : r.tag,
        title: lang === "bn" && bn ? bn.title : r.title,
        titleIt: lang === "bn" && bn ? bn.titleIt : r.titleIt,
        desc: lang === "bn" && bn ? bn.desc : r.desc,
        cta: lang === "bn" && bn ? bn.cta : r.cta,
        specimen: lang === "bn" && bn ? bn.specimen : SPECIMEN_EN[r.n],
      };
    });
  }, [products, lang]);

  const current = items[active] ?? items[0];

  function handleTabKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((idx + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((idx - 1 + items.length) % items.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(items.length - 1);
    }
  }

  return (
    <section id="range" className={`section ${styles.section}`}>
      <div className={`wrap ${styles.inner}`}>
        {/* Hozon-style split hairline top meta */}
        <div className="editorial-rule">
          <span>{pick("02 / THE COLLECTION", "০২ / পণ্যের সম্ভার")}</span>
          <span>{pick("MADE FOR FOOD SERVICE.", "হোটেল, বেকারি ও মিষ্টির দোকানের জন্য।")}</span>
        </div>

        <div className={styles.layout}>
          {/* Left Column — Editorial Display & Vertical Interactive Chapter Accordion */}
          <div className={`reveal ${styles.left}`}>
            <h2 className={styles.display}>
              {pick("Four families of packaging,", "চার ধরনের প্যাকেজিং,")}{" "}
              <span className="it" style={{ color: "var(--brand-700)" }}>
                {pick("one supplier.", "একই নির্ভরযোগ্য উৎস।")}
              </span>
            </h2>
            <p className={styles.lede}>
              {pick(
                "From a single 250 ml square box to commercial crates by the hundred — choose a line below to inspect the format.",
                "একটি ২৫০ মিলি বক্স থেকে শত শত ক্রেট — নিচে থেকে যেকোনো ধরন বেছে বিস্তারিত দেখুন।"
              )}
            </p>

            <div
              className={styles.chapters}
              role="tablist"
              aria-label={pick("Packaging lines", "প্যাকেজিংয়ের ধরন")}
            >
              {items.map((item, i) => {
                const isOn = i === active;
                return (
                  <div
                    key={item.n}
                    className={`${styles.chapterItem} ${isOn ? styles.chapterOn : ""}`}
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isOn}
                      className={styles.chapterBtn}
                      onClick={() => setActive(i)}
                      onKeyDown={(e) => handleTabKeyDown(e, i)}
                    >
                      <span className={styles.chapterNum}>{item.n}</span>
                      <span className={styles.chapterTitle}>
                        {item.title}{" "}
                        <span className="it">{item.titleIt}</span>
                      </span>
                      <span className={styles.chapterArrow} aria-hidden="true">
                        ↗
                      </span>
                    </button>

                    {isOn && (
                      <div className={styles.chapterPanel} role="tabpanel">
                        <span className={styles.chapterTag}>{item.tag}</span>
                        <p className={styles.chapterDesc}>{item.desc}</p>
                        <Link href={item.href} className={styles.chapterLink}>
                          {item.cta} <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className={styles.hint}>
              {pick("Select a numbered line to preview photography →", "ছবি দেখতে উপরের যেকোনো ধরন বেছে নিন →")}
            </p>
          </div>

          {/* Right Column — Hozon #f0f1e9 Architectural Oat-Sage Stage */}
          <div className={`reveal d2 ${styles.stagePanel}`}>
            <span aria-hidden="true" className={styles.specimenVertical}>
              {current.specimen}
            </span>
            <span aria-hidden="true" className={styles.diagonalRule} />

            <div key={current.n} className={`${styles.photoCard} ${current.hasCustom ? styles.photoCardTransparent : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.photo}
                alt={`${current.title} ${current.titleIt}`}
                loading="lazy"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.src !== window.location.origin + current.fallbackPhoto) {
                    img.src = current.fallbackPhoto;
                  }
                }}
                className={`${styles.photoImg} ${current.hasCustom ? styles.photoImgContain : ""}`}
              />
            </div>

            <div className={styles.stageFooter}>
              <span className={styles.stageCaption}>
                {current.n} / 04 · {current.tag}
              </span>
              <Link href={current.href} className={styles.stageCta}>
                {current.cta} <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden="true" className={styles.outlineBand}>
        <p className={`scroll-x ${styles.outline}`}>
          {lang === "bn" ? (
            <>
              প্যাকেজিং, <span className="it">সুন্দর উপস্থাপনায়</span> — প্যাকেজিং,{" "}
              <span className="it">সুন্দর উপস্থাপনায়</span> —
            </>
          ) : (
            <>
              Packaging, <span className="it">presented beautifully</span> — Packaging,{" "}
              <span className="it">presented beautifully</span> —
            </>
          )}
        </p>
      </div>
    </section>
  );
}
