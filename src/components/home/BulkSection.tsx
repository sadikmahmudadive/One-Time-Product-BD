"use client";

import { useState } from "react";
import { CheckIcon } from "@/components/ui/Icons";
import { BULK_POINTS, BUSINESS_TYPES, QUOTE_PRODUCTS } from "@/lib/content";
import styles from "./BulkSection.module.css";

export function BulkSection() {
  const [sent, setSent] = useState(false);

  return (
    <section id="bulk" className={`section ${styles.section}`}>
      <div className={`wrap ${styles.inner}`}>
        <div className={`reveal ${styles.panel}`}>
          <div>
            <p className="eyebrow" style={{ color: "var(--brand-700)" }}>
              07 — Bulk orders
            </p>
            <h2 className={styles.title}>
              Buying for a bakery, sweet shop{" "}
              <span className="it" style={{ color: "var(--brand-700)" }}>
                or a big event?
              </span>
            </h2>
            <p className={styles.lede}>Tell us the products and quantities you need and we&apos;ll reply with bulk pricing.</p>
            <ul className={styles.points}>
              {BULK_POINTS.map((point) => (
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
                <h3>Enquiry received</h3>
                <p>Thanks — we&apos;ll get back to you with bulk pricing.</p>
                <button type="button" className="btn btn-secondary" onClick={() => setSent(false)}>
                  Send another enquiry
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
                    Your name
                  </label>
                  <input className="field" id="q-name" type="text" autoComplete="name" />
                </div>
                <div>
                  <label className="lbl" htmlFor="q-phone">
                    Phone
                  </label>
                  <input className="field" id="q-phone" type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" />
                </div>
                <div>
                  <label className="lbl" htmlFor="q-biz">
                    Business type
                  </label>
                  <select className="field" id="q-biz">
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="lbl" htmlFor="q-prod">
                    Product
                  </label>
                  <select className="field" id="q-prod">
                    {QUOTE_PRODUCTS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.full}>
                  <label className="lbl" htmlFor="q-notes">
                    Quantities and notes
                  </label>
                  <textarea className="field" id="q-notes" rows={3} style={{ resize: "vertical" }} placeholder="e.g. 1000 ml Black Premium Box × 500" />
                </div>
                <div className={styles.full}>
                  <button type="submit" className="btn btn-primary btn-block">
                    Request a quote
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
