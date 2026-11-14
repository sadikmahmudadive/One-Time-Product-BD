"use client";

import { useLanguage } from "@/lib/i18n/context";
import styles from "./TrustStrip.module.css";

function TrustIcon({ kind }: { kind: "grade" | "tier" | "delivery" | "track" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === "grade" && (
        <>
          <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" />
          <path d="M9 12l2 2 4-4" />
        </>
      )}
      {kind === "tier" && (
        <>
          <path d="M4 8l8-4 8 4-8 4-8-4z" />
          <path d="M4 12l8 4 8-4" />
          <path d="M4 16l8 4 8-4" />
        </>
      )}
      {kind === "delivery" && (
        <>
          <path d="M3 6h11v10H3z" />
          <path d="M14 10h4l3 3v3h-7" />
          <circle cx="7.5" cy="17.5" r="1.8" />
          <circle cx="17.5" cy="17.5" r="1.8" />
        </>
      )}
      {kind === "track" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      )}
    </svg>
  );
}

export function TrustStrip() {
  const { pick } = useLanguage();

  const items = [
    {
      kind: "grade" as const,
      title: pick("Food-grade virgin resin", "ফুড-গ্রেড ভার্জিন প্লাস্টিক"),
      desc: pick("Crystal-clear finish safe for sweets, cakes, and takeaway.", "মিষ্টি, কেক ও টেকঅ্যাওয়ে খাবারের জন্য নিরাপদ ও স্বচ্ছ মান।"),
    },
    {
      kind: "tier" as const,
      title: pick("Retail & wholesale packs", "খুচরা ও পাইকারি প্যাক"),
      desc: pick("Order small trial packs or bulk cartons of 5 to 1000 pcs.", "৫ থেকে ১০০০ পিস পর্যন্ত খুচরা বা কার্টন অর্ডার সুবিধা।"),
    },
    {
      kind: "delivery" as const,
      title: pick("Nationwide BD delivery", "সারা বাংলাদেশে ডেলিভারি"),
      desc: pick("Reliable dispatch from Dhaka to all 64 districts.", "ঢাকা থেকে দেশের ৬৪ জেলায় নির্ভরযোগ্য ডেলিভারি।"),
    },
    {
      kind: "track" as const,
      title: pick("Live order tracking", "লাইভ অর্ডার ট্র্যাকিং"),
      desc: pick("Follow confirmation and dispatch steps anytime online.", "যেকোনো সময় আপনার অর্ডারের লাইভ অবস্থা দেখুন।"),
    },
  ];

  return (
    <section aria-label={pick("Why shop with us", "আমাদের সুবিধাসমূহ")} className={styles.strip}>
      <div className="wrap">
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.kind} className={styles.item}>
              <span className={styles.icon}>
                <TrustIcon kind={item.kind} />
              </span>
              <div>
                <h2 className={styles.title}>{item.title}</h2>
                <p className={styles.desc}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
