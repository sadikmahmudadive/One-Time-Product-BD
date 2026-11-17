"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { DEFAULT_CONTACT, PLACEHOLDER } from "@/lib/contact";
import { useContact } from "@/lib/contact-context";
import { useLanguage } from "@/lib/i18n/context";
import { NewsletterForm } from "./NewsletterForm";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  const { lang, t, pick } = useLanguage();
  const { contact, loading: contactLoading } = useContact();
  const displayAddress = (lang === "bn" && contact.addressBn) || contact.address;

  const footerGroups = [
    {
      heading: t.footer.shopHeading,
      links: [
        { href: "/shop", label: t.footer.allProducts },
        { href: "/shop/square", label: t.footer.squareRect },
        { href: "/shop/round", label: t.footer.roundContainers },
        { href: "/shop/dessert-cups", label: t.footer.dessertCups },
        { href: "/shop/crates", label: t.footer.crates },
      ],
    },
    {
      heading: t.footer.companyHeading,
      links: [
        { href: "/about", label: t.footer.about },
        { href: "/contact", label: t.footer.contact },
        { href: "/track-order", label: t.footer.trackOrder },
        { href: "/quote", label: t.footer.bulkQuote },
        { href: "/faq", label: t.footer.faqs },
      ],
    },
  ];

  return (
    <footer id="footer" className={styles.footer}>
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.top}>
          <div className="reveal">
            <p className="eyebrow" style={{ color: "var(--accent-500)" }}>
              {t.footer.eyebrow}
            </p>
            <h2 className={styles.title}>
              {t.footer.titleStart}{" "}
              <span className="it" style={{ color: "var(--accent-500)" }}>
                {t.footer.titleAccent}
              </span>
            </h2>
          </div>
          <div className="reveal d2" style={{ alignSelf: "end" }}>
            <NewsletterForm />
            <p className={styles.follow}>
              {t.footer.followPre}{" "}
              <a
                className={styles.link}
                href={contact.instagram || DEFAULT_CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontWeight: 600, textDecoration: "underline" }}
              >
                {contact.instagramHandle || DEFAULT_CONTACT.instagramHandle}
              </a>{" "}
              {t.footer.followPost}
            </p>
          </div>
        </div>

        <div className={styles.columns}>
          <div className={styles.brand}>
            <Link href="/" aria-label={t.nav.homeAria} className={styles.brandLink}>
              <Logo tone="dark" knockout="var(--brand-950)" size={32} />
            </Link>
            <p>{t.footer.brandDesc}</p>
          </div>
          {footerGroups.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <p className={styles.heading}>{group.heading}</p>
              <div className={styles.list}>
                {group.links.map((l) => (
                  <Link key={l.href} className={styles.link} href={l.href}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </nav>
          ))}
          <div>
            <p className={styles.heading}>{t.footer.contactHeading}</p>
            <div className={`${styles.list} ${styles.contact}`}>
              {contactLoading ? (
                <span style={{ opacity: 0.65 }}>{pick("Loading contact details…", "যোগাযোগের তথ্য লোড হচ্ছে…")}</span>
              ) : (
                <>
                  {contact.phone ? (
                    <a className={styles.link} href={`tel:${contact.phone.replace(/\s+/g, "")}`}>
                      {contact.phone}
                    </a>
                  ) : (
                    <span>{PLACEHOLDER.phone}</span>
                  )}
                  {contact.email ? (
                    <a className={styles.link} href={`mailto:${contact.email}`}>
                      {contact.email}
                    </a>
                  ) : (
                    <span>{PLACEHOLDER.email}</span>
                  )}
                  <span>{displayAddress ?? PLACEHOLDER.address}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.wordmarkRow}>
          <p aria-hidden="true" className={`reveal-zoom ${styles.wordmark}`}>
            onetime <span>product</span>
          </p>
          <a
            href="#top"
            className={styles.topCircle}
            aria-label={t.footer.backToTop}
            title={t.footer.backToTop}
          >
            <span aria-hidden="true">↑</span>
          </a>
        </div>

        <div className={styles.legal}>
          <span>{t.footer.legal}</span>
          <a className={`${styles.link} ${styles.top2}`} href="#top">
            {t.footer.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
