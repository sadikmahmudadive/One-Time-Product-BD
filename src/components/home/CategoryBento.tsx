"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { CATEGORIES, lowestPrice, type CategoryId } from "@/lib/catalog";
import { buildCloudinaryUrl } from "@/lib/cloudinary/client";
import { formatPrice } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/context";
import { useProducts } from "@/lib/products-context";
import styles from "./CategoryBento.module.css";

const CAT_BN: Record<CategoryId, { name: string; description: string }> = {
  square: {
    name: "স্কয়ার ও আয়তাকার বক্স",
    description: "খাবার প্যাক ও ডেলিভারির জন্য ক্রিস্টাল-ক্লিয়ার ফিনিশ বক্স।",
  },
  round: {
    name: "গোল কন্টেইনার",
    description: "মিষ্টি, বিস্কুট ও স্ন্যাকস সংরক্ষণের জন্য টেকসই গোল বক্স।",
  },
  "dessert-cups": {
    name: "ডেজার্ট কাপ",
    description: "হার্ট ও সেমি-স্কয়ার অ্যাক্রিলিক কাপ, পাইকারি ও খুচরা প্যাকে।",
  },
  crates: {
    name: "ক্রেট ও বাল্ক স্টোরেজ",
    description: "পণ্য পরিবহন ও স্টোরেজের জন্য মজবুত প্লাস্টিক ক্রেট।",
  },
};

const FALLBACK_BY_CAT: Record<CategoryId, string> = {
  square: "/images/hero/square-clear-boxes.jpg",
  round: "/images/hero/black-premium-box.jpg",
  "dessert-cups": "/images/hero/acrylic-dessert-cup.jpg",
  crates: "/images/hero/plastic-storage-crate.jpg",
};

const SPAN_CLASS: Record<CategoryId, string> = {
  square: `${styles.cardSquare} ${styles.cardLead}`,
  round: styles.cardRound,
  "dessert-cups": styles.cardCups,
  crates: `${styles.cardCrates} ${styles.cardDark}`,
};

export function CategoryBento() {
  const { products, loading } = useProducts();
  const { lang, pick } = useLanguage();
  const isLoading = loading && products.length === 0;

  return (
    <section id="categories" className={styles.section} aria-labelledby="bento-categories-heading">
      <div className="wrap">
        <div className="editorial-rule">
          <span>{pick("01 / FORMAT DIRECTORY", "০১ / প্যাকেজিং ক্যাটাগরি")}</span>
          <span>{pick("RETAIL PACKS & WHOLESALE.", "খুচরা ও পাইকারি প্যাক।")}</span>
        </div>
        <div className={`reveal ${styles.head}`}>
          <div>
            <p className="eyebrow" style={{ color: "var(--brand-700)" }}>
              {pick("Shop by category", "ক্যাটাগরি অনুযায়ী কিনুন")}
            </p>
            <h2 id="bento-categories-heading" className="section-title" style={{ maxWidth: "none" }}>
              {pick("Pick your format,", "সঠিক প্যাক বেছে নিন,")}{" "}
              <span className="it" style={{ color: "var(--brand-700)" }}>
                {pick("order in seconds.", "অর্ডার করুন সহজে।")}
              </span>
            </h2>
          </div>

          <Link href="/shop" className={styles.allLink}>
            {pick("Full catalogue", "সব পণ্য দেখুন")}
            <ArrowRightIcon size={15} />
          </Link>
        </div>

        <div className={styles.grid}>
          {CATEGORIES.map((cat) => {
            const inCategory = products.filter((p) => p.category === cat.id);
            const featuredImage = inCategory.find((p) => p.image)?.image;
            const prices = inCategory.map(lowestPrice).filter((n): n is number => n !== null);
            const minPrice = prices.length ? Math.min(...prices) : null;

            const title = lang === "bn" ? CAT_BN[cat.id].name : cat.name;
            const description = lang === "bn" ? CAT_BN[cat.id].description : cat.description;

            return (
              <Link
                key={cat.id}
                href={`/shop/${cat.id}`}
                className={`${styles.card} ${SPAN_CLASS[cat.id]}`}
              >
                <div className={styles.body}>
                  <div className={styles.topMeta}>
                    {isLoading ? (
                      <span className={styles.skelPill} aria-hidden="true" />
                    ) : (
                      <>
                        <span className={styles.countPill}>
                          {inCategory.length} {pick(inCategory.length === 1 ? "item" : "items", "টি পণ্য")}
                        </span>
                        {minPrice !== null && (
                          <span className={styles.priceBadge}>
                            {pick(`From ${formatPrice(minPrice)}`, `শুরু ${formatPrice(minPrice)}`)}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <h3 className={styles.title}>{title}</h3>
                  <p className={styles.desc}>{description}</p>

                  <span className={styles.ctaRow}>
                    {pick("Browse", "দেখুন")}
                    <ArrowRightIcon size={15} />
                  </span>
                </div>

                <div className={styles.visual}>
                  {isLoading ? (
                    <div className={styles.skelVisual} aria-hidden="true" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        featuredImage
                          ? buildCloudinaryUrl(featuredImage, { width: 480, height: 480, crop: "fit", quality: "auto", format: "auto" })
                          : FALLBACK_BY_CAT[cat.id]
                      }
                      alt={title}
                      loading="lazy"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.src !== window.location.origin + FALLBACK_BY_CAT[cat.id]) {
                          img.src = FALLBACK_BY_CAT[cat.id];
                        }
                      }}
                      className={styles.photo}
                      style={featuredImage ? { objectFit: "contain", padding: "10px" } : undefined}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
