"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { buildCloudinaryUrl } from "@/lib/cloudinary/client";
import { PRODUCTS as STATIC_PRODUCTS, priceLabel, type Product } from "@/lib/catalog";
import { useLanguage } from "@/lib/i18n/context";
import { useProducts } from "@/lib/products-context";
import styles from "./Hero.module.css";

interface HeroSlide {
  slug: string;
  name: string;
  shortLabel: string;
  shortLabelBn: string;
  caption: string;
  captionBn: string;
  eyebrow: string;
  eyebrowBn: string;
  price: string;
  imageSrc: string;
  thumbSrc: string;
  fallbackSrc: string;
  href: string;
}

interface BaseSlot {
  slug: string;
  shortLabel: string;
  shortLabelBn: string;
  caption: string;
  captionBn: string;
  eyebrow: string;
  eyebrowBn: string;
  fallbackSrc: string;
}

const HERO_SLOTS: BaseSlot[] = [
  {
    slug: "1000-ml-black-premium-box",
    shortLabel: "Black Premium",
    shortLabelBn: "ব্ল্যাক প্রিমিয়াম",
    caption: "Glossy base · Clear lid",
    captionBn: "গ্লসি ব্ল্যাক · স্বচ্ছ ঢাকনা",
    eyebrow: "Signature takeaway",
    eyebrowBn: "সিগনেচার টেকঅ্যাওয়ে",
    fallbackSrc: "/images/hero/black-premium-box.jpg",
  },
  {
    slug: "1000-ml-square-box",
    shortLabel: "Clear Square",
    shortLabelBn: "স্কয়ার বক্স",
    caption: "250 – 1000 ml formats",
    captionBn: "২৫০ – ১০০০ মিলি মাপ",
    eyebrow: "Crystal clear series",
    eyebrowBn: "ক্রিস্টাল ক্লিয়ার সিরিজ",
    fallbackSrc: "/images/hero/square-clear-boxes.jpg",
  },
  {
    slug: "heart-shape-dessert-cup-acrylic",
    shortLabel: "Dessert Cups",
    shortLabelBn: "ডেজার্ট কাপ",
    caption: "Heart & semi-square",
    captionBn: "হার্ট ও সেমি-স্কয়ার",
    eyebrow: "Display & pastry",
    eyebrowBn: "ডিসপ্লে ও ডেজার্ট",
    fallbackSrc: "/images/hero/acrylic-dessert-cup.jpg",
  },
  {
    slug: "foodsafe-durable-plastic-crate",
    shortLabel: "Bulk Crates",
    shortLabelBn: "বাল্ক ক্রেট",
    caption: "5 – 500 piece packs",
    captionBn: "৫ – ৫০০ পিসের প্যাক",
    eyebrow: "Warehouse logistics",
    eyebrowBn: "স্টোরেজ ও পরিবহন",
    fallbackSrc: "/images/hero/plastic-storage-crate.jpg",
  },
];

const SLIDE_INTERVAL_MS = 5600;

const HEADLINE_EN: { word: string; delay: number; accent?: boolean }[] = [
  { word: "Packaging", delay: 0.08 },
  { word: "that", delay: 0.14 },
  { word: "lets", delay: 0.2 },
  { word: "your", delay: 0.26 },
  { word: "food", delay: 0.32 },
  { word: "do", delay: 0.42, accent: true },
  { word: "the", delay: 0.48, accent: true },
  { word: "talking.", delay: 0.54, accent: true },
];

const HEADLINE_BN: { word: string; delay: number; accent?: boolean }[] = [
  { word: "প্যাকেজিং", delay: 0.08 },
  { word: "যা", delay: 0.14 },
  { word: "আপনার", delay: 0.2 },
  { word: "খাবারের", delay: 0.26 },
  { word: "মান", delay: 0.32 },
  { word: "তুলে", delay: 0.42, accent: true },
  { word: "ধরে।", delay: 0.48, accent: true },
];

function resolveSlideImages(rawImage: string | undefined, fallbackSrc: string) {
  if (!rawImage) {
    return { imageSrc: fallbackSrc, thumbSrc: fallbackSrc };
  }
  return {
    imageSrc: buildCloudinaryUrl(rawImage, {
      width: 1080,
      height: 1080,
      crop: "fit",
      quality: "auto",
      format: "auto",
    }),
    thumbSrc: buildCloudinaryUrl(rawImage, {
      width: 240,
      height: 240,
      crop: "fit",
      quality: "auto",
      format: "auto",
    }),
  };
}

export function Hero() {
  const { products } = useProducts();
  const { lang, pick } = useLanguage();
  const headline = lang === "bn" ? HEADLINE_BN : HEADLINE_EN;

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});

  const stageRef = useRef<HTMLDivElement | null>(null);
  const tiltTarget = useRef({ rx: 0, ry: 0, px: 0, py: 0 });
  const tiltCurrent = useRef({ rx: 0, ry: 0, px: 0, py: 0 });
  const tiltRaf = useRef<number | null>(null);

  const slides = useMemo<HeroSlide[]>(() => {
    const bySlug = new Map<string, Product>();
    for (const p of STATIC_PRODUCTS) bySlug.set(p.slug, p);
    for (const p of products) bySlug.set(p.slug, p);

    return HERO_SLOTS.map((slot) => {
      const prod = bySlug.get(slot.slug);
      const rawImage = prod?.image || prod?.images?.[0];
      const { imageSrc, thumbSrc } = resolveSlideImages(rawImage, slot.fallbackSrc);
      return {
        slug: slot.slug,
        name: prod?.name ?? slot.shortLabel,
        shortLabel: slot.shortLabel,
        shortLabelBn: slot.shortLabelBn,
        caption: slot.caption,
        captionBn: slot.captionBn,
        eyebrow: slot.eyebrow,
        eyebrowBn: slot.eyebrowBn,
        price: prod ? priceLabel(prod) : "Price on request",
        imageSrc,
        thumbSrc,
        fallbackSrc: slot.fallbackSrc,
        href: `/product/${slot.slug}`,
      };
    });
  }, [products]);

  const safeActive = slides.length > 0 ? activeIndex % slides.length : 0;
  const activeSlide = slides[safeActive];

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, slides.length]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || reducedMotion) return;
    const isCoarse = window.matchMedia?.("(pointer: coarse)").matches;
    if (isCoarse) return;

    const animate = () => {
      const t = tiltTarget.current;
      const c = tiltCurrent.current;
      c.rx += (t.rx - c.rx) * 0.07;
      c.ry += (t.ry - c.ry) * 0.07;
      c.px += (t.px - c.px) * 0.07;
      c.py += (t.py - c.py) * 0.07;

      el.style.setProperty("--rx", `${c.rx.toFixed(2)}deg`);
      el.style.setProperty("--ry", `${c.ry.toFixed(2)}deg`);
      el.style.setProperty("--px", `${c.px.toFixed(2)}px`);
      el.style.setProperty("--py", `${c.py.toFixed(2)}px`);

      const settled =
        Math.abs(t.rx - c.rx) < 0.02 &&
        Math.abs(t.ry - c.ry) < 0.02 &&
        Math.abs(t.px - c.px) < 0.05 &&
        Math.abs(t.py - c.py) < 0.05;

      if (!settled) {
        tiltRaf.current = window.requestAnimationFrame(animate);
      } else {
        tiltRaf.current = null;
      }
    };

    const kick = () => {
      if (tiltRaf.current === null) {
        tiltRaf.current = window.requestAnimationFrame(animate);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      tiltTarget.current = {
        rx: -ny * 4,
        ry: nx * 4.5,
        px: nx * 12,
        py: ny * 10,
      };
      kick();
    };

    const onPointerLeave = () => {
      tiltTarget.current = { rx: 0, ry: 0, px: 0, py: 0 };
      kick();
    };

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onPointerLeave);
    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
      if (tiltRaf.current !== null) {
        window.cancelAnimationFrame(tiltRaf.current);
      }
    };
  }, [reducedMotion]);

  const markBroken = useCallback((url: string) => {
    setFailedUrls((prev) => (prev[url] ? prev : { ...prev, [url]: true }));
  }, []);

  const stepSlide = useCallback(
    (delta: number) => {
      if (slides.length <= 1) return;
      setActiveIndex((prev) => (prev + delta + slides.length) % slides.length);
    },
    [slides.length]
  );

  const chapterLinks = [
    { n: "01", label: pick("The collection", "পণ্যের সম্ভার"), href: "#range" },
    { n: "02", label: pick("Made for business", "আপনার ব্যবসার জন্য"), href: "#madefor" },
    { n: "03", label: pick("Signature Black Box", "সিগনেচার বক্স"), href: "#signature" },
  ];

  // Quietly cycle the next two sibling products as subtle satellite references
  const satellites = useMemo(() => {
    if (slides.length <= 1) return [];
    const count = Math.min(2, slides.length - 1);
    return Array.from({ length: count }, (_, idx) => {
      const slideIdx = (safeActive + idx + 1) % slides.length;
      return { slideIdx, slide: slides[slideIdx], idx };
    });
  }, [slides, safeActive]);

  const getSrc = (url: string, fallback: string) => (failedUrls[url] ? fallback : url);

  return (
    <section
      id="top"
      aria-label={pick("Introduction", "পরিচিতি")}
      className={`section grid-backdrop ${styles.hero}`}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") stepSlide(1);
        if (e.key === "ArrowLeft") stepSlide(-1);
      }}
    >
      {/* Top editorial rule anchored like Hozon */}
      <div className={`wrap fade-in ${styles.topMeta}`} style={{ animationDelay: "0.02s" }}>
        <span className={styles.topMetaLeft}>
          {pick("THE ART OF FOOD PACKAGING.", "খাবার প্যাকেজিংয়ের শিল্পকলা।")}
        </span>
        <span className={styles.topMetaRight}>
          {pick("Retail packs & bulk cartons.", "খুচরা ও পাইকারি সরবরাহ।")}
          <br />
          {pick("Dhaka to all 64 districts.", "ঢাকা থেকে ৬৪ জেলা।")}
        </span>
      </div>

      <div className={`wrap ${styles.grid}`}>
        <div className={styles.copyCol} data-hero-copy>
          <p className={`fade-in ${styles.eyebrowText}`} style={{ animationDelay: "0.05s" }}>
            {pick("Food-grade polymer · Ready stock", "ফুড-গ্রেড পলিমার · রেডি স্টক")}
          </p>

          <h1 className={styles.title}>
            {headline.map((h) => (
              <Fragment key={`${lang}-${h.word}`}>
                <span
                  className={`w ${h.accent ? "it" : ""}`}
                  style={{
                    animationDelay: `${h.delay}s`,
                    color: h.accent ? "var(--accent-500)" : undefined,
                  }}
                >
                  {h.word}
                </span>{" "}
              </Fragment>
            ))}
          </h1>

          <p className={`fade-in ${styles.lede}`} style={{ animationDelay: "0.68s" }}>
            {pick(
              "Square boxes, round containers, dessert cups and crates — engineered for sweet shops, bakeries, caterers and everyday service.",
              "স্কয়ার বক্স, রাউন্ড কনটেইনার, ডেজার্ট কাপ এবং ক্রেট — মিষ্টির দোকান, বেকারি, ক্যাটারিং ও নিত্যদিনের পরিবেশনের জন্য।"
            )}
          </p>

          <div className={`fade-in ${styles.ctas}`} style={{ animationDelay: "0.8s" }}>
            <a className={styles.orderCta} href="#shop">
              <span className={styles.orderIcon} aria-hidden="true">
                <ArrowRightIcon size={15} />
              </span>
              <span>{pick("Explore catalogue", "পণ্য দেখুন")}</span>
            </a>
            <Link className={styles.textAction} href="/quote">
              {pick("Request a bulk quote", "বাল্ক কোটেশন চান")} <span aria-hidden="true">↘</span>
            </Link>
          </div>

          {/* Minimal unboxed index tabs */}
          <div
            className={`fade-in ${styles.indexRail}`}
            style={{ animationDelay: "0.95s" }}
            role="tablist"
            aria-label={pick("Featured packaging showcase", "ফিচার্ড প্যাকেজিং")}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {slides.map((s, idx) => {
              const isActive = idx === safeActive;
              return (
                <button
                  key={s.slug}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.indexItem} ${isActive ? styles.indexItemOn : ""}`}
                  onClick={() => setActiveIndex(idx)}
                >
                  <span className={styles.indexNum}>0{idx + 1}</span>
                  <span className={styles.indexName}>
                    {lang === "bn" ? s.shortLabelBn : s.shortLabel}
                  </span>
                  {isActive && !paused && !reducedMotion && (
                    <span
                      key={`${safeActive}-${paused}`}
                      aria-hidden="true"
                      className={styles.indexBar}
                      style={{ animationDuration: `${SLIDE_INTERVAL_MS}ms` }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Seamless dark-feathered real studio stage */}
        <div
          className={styles.stageCol}
          data-hero-stage
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div ref={stageRef} className={`fade-in ${styles.stage}`} style={{ animationDelay: "0.24s" }}>
            <span aria-hidden="true" className={styles.verticalSpecimen}>
              {pick("FOOD-GRADE PET & PP · 250 – 1000 ML", "ফুড-গ্রেড পিইটি ও পিপি · ২৫০ – ১০০০ মিলি")}
            </span>

            <div className={styles.stageTilt}>
              <Link href={activeSlide.href} className={styles.photoCanvas} aria-label={activeSlide.name}>
                <div className={styles.photoMask}>
                  {slides.map((s, idx) => {
                    const isActive = idx === safeActive;
                    const src = getSrc(s.imageSrc, s.fallbackSrc);
                    return (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={s.slug}
                        src={src}
                        alt={s.name}
                        loading={idx === 0 ? "eager" : "lazy"}
                        decoding="async"
                        onError={() => markBroken(s.imageSrc)}
                        className={`${styles.mainPhoto} ${isActive ? styles.mainPhotoActive : ""}`}
                      />
                    );
                  })}
                </div>
              </Link>
            </div>

            {/* Quiet understated floating glass tags */}
            {satellites.map(({ slideIdx, slide, idx }) => {
              const thumb = getSrc(slide.thumbSrc, slide.fallbackSrc);
              return (
                <div
                  key={idx}
                  data-hero-floater={idx === 0 ? "1.05" : "-0.85"}
                  className={`${styles.floaterWrap} ${idx === 0 ? styles.floaterTopLeft : styles.floaterTopRight}`}
                >
                  <div className={styles.floaterParallax}>
                    <button
                      type="button"
                      className={styles.glassTag}
                      onClick={() => setActiveIndex(slideIdx)}
                      aria-label={pick(`Preview ${slide.name}`, `${slide.name} দেখুন`)}
                    >
                      <span className={styles.glassThumb}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumb}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          onError={() => markBroken(slide.thumbSrc)}
                          className={styles.glassThumbImg}
                        />
                      </span>
                      <span className={styles.glassText}>
                        <span className={styles.glassTitle}>
                          {lang === "bn" ? slide.shortLabelBn : slide.shortLabel}
                        </span>
                        <span className={styles.glassSub}>
                          {lang === "bn" ? slide.captionBn : slide.caption}
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Clean editorial caption footer beneath container */}
            <div data-hero-chip className={styles.captionBar}>
              <Link href={activeSlide.href} className={styles.captionLink}>
                <span className={styles.captionEyebrow}>
                  0{safeActive + 1} · {lang === "bn" ? activeSlide.eyebrowBn : activeSlide.eyebrow}
                </span>
                <span key={activeSlide.slug} className={styles.captionRow}>
                  <span className={styles.captionName}>{activeSlide.name}</span>
                  <span className={styles.captionPrice}>
                    {activeSlide.price === "Price on request"
                      ? pick("Price on request", "আলোচনা সাপেক্ষে")
                      : activeSlide.price}
                  </span>
                </span>
              </Link>
              <div className={styles.stageArrows}>
                <button
                  type="button"
                  className={styles.stageArrowBtn}
                  onClick={() => stepSlide(-1)}
                  aria-label={pick("Previous product", "আগের পণ্য")}
                >
                  ←
                </button>
                <button
                  type="button"
                  className={styles.stageArrowBtn}
                  onClick={() => stepSlide(1)}
                  aria-label={pick("Next product", "পরের পণ্য")}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`wrap ${styles.chapters}`} data-hero-chapters>
        <div className={`fade-in ${styles.chapterRow}`} style={{ animationDelay: "1.05s" }}>
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
          <a href="#range" className={`hide-sm ${styles.scrollCircle}`} aria-label={pick("Scroll down", "নিচে স্ক্রল করুন")}>
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>

      {/* Subtle flush bottom-right corner quote tab */}
      <Link href="/quote" className={styles.cornerNotch}>
        <span aria-hidden="true">↗</span>
        <span>{pick("Bulk quote", "বাল্ক কোটেশন")}</span>
      </Link>
    </section>
  );
}
