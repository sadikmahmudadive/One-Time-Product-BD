"use client";

import { useState } from "react";
import { CheckIcon } from "@/components/ui/Icons";
import { BULK_POINTS, BUSINESS_TYPES, QUOTE_PRODUCTS } from "@/lib/content";
import { useLanguage } from "@/lib/i18n/context";
import styles from "./BulkSection.module.css";

const BULK_POINTS_BN = [
  "স্কয়ার বক্স, রাউন্ড কনটেইনার, ডেজার্ট কাপ ও ক্রেট",
  "৫ থেকে ১০০০ পিসের প্যাক সাইজ",
  "সারা বাংলাদেশে ডেলিভারি",
];

export function BulkSection() {
  const { lang, pick } = useLanguage();
  const [sent, setSent] = useState(false);
  const points = lang === "bn" ? BULK_POINTS_BN : BULK_POINTS;

  return (
    <section id="bulk" className={`section ${styles.section}`}>
      <div className={`wrap ${styles.inner}`}>
        <div className="editorial-rule">
          <span>{pick("06 / WHOLESALE & BULK", "০৬ / পাইকারি ও বাল্ক অর্ডার")}</span>
          <span>{pick("DHAKA DISPATCH · CUSTOM PRICING.", "ঢাকা থেকে সারা দেশে ডেলিভারি।")}</span>
        </div>
        <div className={`reveal ${styles.panel}`}>
          <div>
            <h2 className={styles.title}>
              {pick("Buying for a bakery, sweet shop", "বেকারি, মিষ্টির দোকান")}{" "}
              <span className="it" style={{ color: "var(--brand-700)" }}>
                {pick("or a big event?", "বা বড় কোনো অনুষ্ঠানের জন্য?")}
              </span>
            </h2>
            <p className={styles.lede}>
              {pick(
                "Tell us the products and quantities you need and we'll reply with bulk pricing.",
                "আপনার প্রয়োজনীয় পণ্য ও পরিমাণ জানান, আমরা পাইকারি দর জানিয়ে দেবো।"
              )}
            </p>
            <ul className={styles.points}>
              {points.map((point) => (
                <li key={point}>
                  <CheckIcon stroke="var(--brand-700)" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.formCard}>
            {sent ? (
              <div role="status" className={styles.done}>
                <div className={styles.doneIcon}>
                  <CheckIcon size={30} strokeWidth={2.4} stroke="var(--success-700)" />
                </div>
                <h3>{pick("Enquiry received", "তথ্য পাওয়া গেছে")}</h3>
                <p>{pick("Thanks — we'll get back to you with bulk pricing.", "ধন্যবাদ — শীঘ্রই পাইকারি মূল্য জানিয়ে যোগাযোগ করবো।")}</p>
                <button type="button" className="btn btn-secondary" onClick={() => setSent(false)}>
                  {pick("Send another enquiry", "আরেকটি অনুরোধ পাঠান")}
                </button>
              </div>
            ) : (
              <form
                className={styles.form}
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <div>
                  <label className="lbl" htmlFor="q-name">
                    {pick("Your name", "আপনার নাম")}
                  </label>
                  <input className="field" id="q-name" type="text" autoComplete="name" />
                </div>
                <div>
                  <label className="lbl" htmlFor="q-phone">
                    {pick("Phone", "মোবাইল নম্বর")}
                  </label>
                  <input className="field" id="q-phone" type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" />
                </div>
                <div>
                  <label className="lbl" htmlFor="q-biz">
                    {pick("Business type", "ব্যবসার ধরন")}
                  </label>
                  <select className="field" id="q-biz">
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="lbl" htmlFor="q-prod">
                    {pick("Product", "পণ্য")}
                  </label>
                  <select className="field" id="q-prod">
                    {QUOTE_PRODUCTS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.full}>
                  <label className="lbl" htmlFor="q-notes">
                    {pick("Quantities and notes", "পরিমাণ ও মন্তব্য")}
                  </label>
                  <textarea
                    className="field"
                    id="q-notes"
                    rows={3}
                    style={{ resize: "vertical" }}
                    placeholder={pick("e.g. 1000 ml Black Premium Box × 500", "যেমন: ১০০০ মিলি ব্ল্যাক প্রিমিয়াম বক্স × ৫০০ পিস")}
                  />
                </div>
                <div className={styles.full}>
                  <button type="submit" className="btn btn-primary btn-block">
                    {pick("Request a quote", "কোটেশন চান")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
