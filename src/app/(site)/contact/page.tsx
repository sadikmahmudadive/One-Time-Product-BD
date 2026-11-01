import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/forms/ContactForm";
import { PageHero } from "@/components/ui/PageHero";
import { CONTACT, PLACEHOLDER } from "@/lib/contact";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Contact — One Time Product BD",
  description: "Reach One Time Product BD by WhatsApp, phone, email or the contact form.",
};

/** Renders a link when the detail is filled in, otherwise the visible bracketed placeholder. */
function Detail({ value, placeholder, href }: { value: string | null; placeholder: string; href?: (v: string) => string }) {
  if (!value) return <span className={styles.placeholder}>{placeholder}</span>;
  return href ? <a href={href(value)}>{value}</a> : <span>{value}</span>;
}

export default function ContactPage() {
  const digits = (v: string) => v.replace(/\D/g, "");
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        title="Get in"
        accent="touch."
        lede="Questions about a size, a pack or a bulk order? Reach us the way that suits you."
      />
      <div className={`wrap ${styles.layout}`}>
        <section aria-labelledby="ways-h" className={styles.ways}>
          <h2 id="ways-h" className={styles.h2}>
            Contact details
          </h2>
          <dl className={styles.list}>
            <div>
              <dt>WhatsApp</dt>
              <dd>
                <Detail value={CONTACT.whatsapp} placeholder={PLACEHOLDER.whatsapp} href={(v) => `https://wa.me/${digits(v)}`} />
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                <Detail value={CONTACT.phone} placeholder={PLACEHOLDER.phone} href={(v) => `tel:${v.replace(/\s/g, "")}`} />
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <Detail value={CONTACT.email} placeholder={PLACEHOLDER.email} href={(v) => `mailto:${v}`} />
              </dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>
                <Detail value={CONTACT.address} placeholder={PLACEHOLDER.address} />
              </dd>
            </div>
            <div>
              <dt>Instagram</dt>
              <dd>
                <a href={CONTACT.instagram}>@_otpb_</a>
              </dd>
            </div>
          </dl>
          <p className={styles.aside}>
            Buying in bulk? The <Link href="/quote">quote form</Link> collects everything we need to price it.
          </p>
        </section>
        <ContactForm />
      </div>
    </>
  );
}
