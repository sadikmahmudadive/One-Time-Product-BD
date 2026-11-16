"use client";

import Link from "next/link";
import { DEFAULT_CONTACT, PLACEHOLDER } from "@/lib/contact";
import { useContact } from "@/lib/contact-context";
import { useLanguage } from "@/lib/i18n/context";
import styles from "./ContactDetailsCard.module.css";

function Detail({
  value,
  placeholder,
  loading,
  href,
}: {
  value: string | null;
  placeholder: string;
  loading?: boolean;
  href?: (v: string) => string;
}) {
  if (loading && !value) return <span className={styles.placeholder} style={{ opacity: 0.55 }}>…</span>;
  if (!value) return <span className={styles.placeholder}>{placeholder}</span>;
  return href ? <a href={href(value)}>{value}</a> : <span>{value}</span>;
}

export function ContactDetailsCard() {
  const { contact, loading } = useContact();
  const { lang, pick } = useLanguage();
  const digits = (v: string) => v.replace(/\D/g, "");
  const address = (lang === "bn" && contact.addressBn) || contact.address;

  return (
    <section aria-labelledby="ways-h">
      <h2 id="ways-h" className={styles.h2}>
        {pick("Contact details", "যোগাযোগের তথ্য")}
      </h2>
      <dl className={styles.list}>
        <div>
          <dt>{pick("WhatsApp", "হোয়াটসঅ্যাপ")}</dt>
          <dd>
            <Detail
              value={contact.whatsapp}
              placeholder={PLACEHOLDER.whatsapp}
              loading={loading}
              href={(v) => `https://wa.me/${digits(v)}`}
            />
          </dd>
        </div>
        <div>
          <dt>{pick("Phone", "ফোন")}</dt>
          <dd>
            <Detail
              value={contact.phone}
              placeholder={PLACEHOLDER.phone}
              loading={loading}
              href={(v) => `tel:${v.replace(/\s/g, "")}`}
            />
          </dd>
        </div>
        <div>
          <dt>{pick("Email", "ইমেইল")}</dt>
          <dd>
            <Detail
              value={contact.email}
              placeholder={PLACEHOLDER.email}
              loading={loading}
              href={(v) => `mailto:${v}`}
            />
          </dd>
        </div>
        <div>
          <dt>{pick("Address", "ঠিকানা")}</dt>
          <dd>
            <Detail value={address} placeholder={PLACEHOLDER.address} loading={loading} />
          </dd>
        </div>
        <div>
          <dt>{pick("Instagram", "ইনস্টাগ্রাম")}</dt>
          <dd>
            <a
              href={contact.instagram || DEFAULT_CONTACT.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              {contact.instagramHandle || DEFAULT_CONTACT.instagramHandle}
            </a>
          </dd>
        </div>
      </dl>
      <p className={styles.aside}>
        {pick("Buying in bulk? The ", "পাইকারি অর্ডার করতে চাইলে ")}
        <Link href="/quote">{pick("quote form", "কোটেশন ফর্ম")}</Link>
        {pick(
          " collects everything we need to price it.",
          " পূরণ করুন — আমরা দ্রুত মূল্য জানিয়ে দেব।"
        )}
      </p>
    </section>
  );
}
