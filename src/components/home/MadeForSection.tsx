"use client";

import Link from "next/link";
import { PERSONAS } from "@/lib/content";
import { useLanguage } from "@/lib/i18n/context";
import styles from "./MadeForSection.module.css";

const DELAYS = ["", "d2", "d3", "d4"];

const PERSONAS_BN = [
  {
    title: "মিষ্টির দোকান",
    desc: "স্বচ্ছ ঢাকনার ভেতর দিয়ে আপনার মিষ্টি ও সন্দেশকে উজ্জ্বলভাবে উপস্থাপন করুন।",
    picks: "১০০০ মিলি ট্রান্সপারেন্ট প্রিমিয়াম বক্স, ১০০০ মিলি স্কয়ার বক্স",
  },
  {
    title: "বেকারি",
    desc: "বিস্কুট, কেক ও বেকারি আইটেম কাউন্টারের জন্য সুন্দরভাবে প্যাক করুন।",
    picks: "১০০০ মিলি ক্লাসিক বিস্কুট কনটেইনার, ব্ল্যাক প্রিমিয়াম বক্স",
  },
  {
    title: "ক্যাটারিং ও ইভেন্ট",
    desc: "শত শত অতিথির জন্য সিঙ্গেল-সার্ভ ডেজার্ট পরিবেশন।",
    picks: "হার্ট শেপ ডেজার্ট কাপ, সেমি স্কয়ার ডেজার্ট কাপ",
  },
  {
    title: "ঘরোয়া ব্যবহার",
    desc: "বাসায় খাবার সংরক্ষণ, উপহার দেওয়া ও শেয়ার করার জন্য আদর্শ।",
    picks: "২৫০ মিলি স্কয়ার বক্স, রাউন্ড বক্স",
  },
];

const PERSONA_PHOTOS: Record<string, string> = {
  "01": "/images/hero/black-premium-box.jpg",
  "02": "/images/hero/square-clear-boxes.jpg",
  "03": "/images/hero/acrylic-dessert-cup.jpg",
  "04": "/images/hero/square-clear-boxes.jpg",
};

export function MadeForSection() {
  const { lang, pick } = useLanguage();

  return (
    <section id="madefor" className={`section ${styles.section}`}>
      <div className={`wrap ${styles.inner}`}>
        <div className={`editorial-rule ${styles.rule}`}>
          <span>{pick("03 / BUILT BY SECTOR", "০৩ / ব্যবসার ধরন অনুযায়ী")}</span>
          <span>{pick("RETAIL, BAKERY, CATERING & HOME.", "রিটেইল, বেকারি, ক্যাটারিং ও ঘরোয়া।")}</span>
        </div>

        <div className={`reveal section-head ${styles.head}`}>
          <div>
            <h2 className="section-title" style={{ color: "var(--ink-950)" }}>
              {pick("Packaging for", "আপনার")}{" "}
              <span className="it" style={{ color: "var(--brand-700)" }}>
                {pick("your", "ব্যবসার")}
              </span>{" "}
              {pick("kind of business.", "উপযোগী প্যাকেজিং।")}
            </h2>
          </div>
          <p className="section-lede" style={{ color: "var(--ink-700)" }}>
            {pick("Not sure where to start? Pick the format tailored to your counter.", "কোথা থেকে শুরু করবেন বুঝতে পারছেন না? আপনার ধরন অনুযায়ী বেছে নিন।")}
          </p>
        </div>

        <div className={styles.grid}>
          {PERSONAS.map((p, i) => {
            const bn = PERSONAS_BN[i];
            const title = lang === "bn" && bn ? bn.title : p.title;
            const desc = lang === "bn" && bn ? bn.desc : p.desc;
            const picks = lang === "bn" && bn ? bn.picks : p.picks;
            const photo = PERSONA_PHOTOS[p.n] ?? "/images/hero/square-clear-boxes.jpg";

            return (
              <div key={p.n} className={`reveal ${DELAYS[i % 4]}`} style={{ height: "100%" }}>
                <Link className={styles.persona} href={p.href}>
                  <div className={styles.media}>
                    <span className={styles.num}>{p.n}</span>
                    <span className={styles.specimenLine} aria-hidden="true" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt={title} loading="lazy" className={styles.img} />
                  </div>
                  <div className={styles.body}>
                    <h3 className={styles.title}>{title}</h3>
                    <p className={styles.desc}>{desc}</p>
                    <p className={styles.picks}>
                      <span>{pick("Try · ", "পছন্দ · ")}</span>
                      {picks}
                    </p>
                    <span className={styles.cta}>
                      {pick("View packaging", "প্যাকেজিং দেখুন")}{" "}
                      <span className={styles.arrow} aria-hidden="true">
                        ↗
                      </span>
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
