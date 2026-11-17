"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { useLanguage } from "@/lib/i18n/context";
import styles from "./CtaBand.module.css";

export function CtaBand() {
  const { pick } = useLanguage();

  return (
    <section className={styles.band}>
      <div className={`wrap ${styles.wrap}`}>
        <div className={`editorial-rule ${styles.rule}`}>
          <span>{pick("07 / START YOUR ORDER", "০৭ / অর্ডার শুরু করুন")}</span>
          <span>{pick("RETAIL & WHOLESALE · DHAKA TO ALL 64 DISTRICTS.", "সারা বাংলাদেশে ডেলিভারি।")}</span>
        </div>

        <div className={styles.inner}>
          <div className={styles.copy}>
            <p className={`reveal ${styles.statusEyebrow}`}>
              <span className={styles.statusDot} aria-hidden="true" />
              {pick("In stock across all flagship packs", "সব ফ্ল্যাগশিপ প্যাক স্টকে রয়েছে")}
            </p>
            <h2 className={`reveal ${styles.title}`}>
              {pick("Make a little room for", "আপনার খাবারের জন্য বেছে নিন")}{" "}
              <span className="it">{pick("great presentation.", "সেরা উপস্থাপনা।")}</span>
            </h2>
            <p className={`reveal d2 ${styles.desc}`}>
              {pick(
                "Browse ready-to-ship packs in our catalogue or message our Dhaka team for wholesale pallet pricing.",
                "আমাদের রেডি স্টক থেকে কিনুন অথবা পাইকারি দরের জন্য ঢাকা টিমের সাথে যোগাযোগ করুন।"
              )}
            </p>
            <Link className={`reveal d3 ${styles.cta}`} href="/shop">
              <span>{pick("Explore catalogue", "সব পণ্য দেখুন")}</span>
              <ArrowRightIcon size={18} />
            </Link>
          </div>

          <div aria-hidden="true" className={styles.visualCrop}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero/black-premium-box.jpg"
              alt=""
              loading="lazy"
              className={styles.cropImg}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
