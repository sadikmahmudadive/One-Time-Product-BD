"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/auth/UserMenu";
import { useCart } from "@/components/cart/CartProvider";
import { MenuIcon, SearchIcon } from "@/components/ui/Icons";
import { Logo } from "@/components/ui/Logo";
import { useLanguage } from "@/lib/i18n/context";
import styles from "./SiteHeader.module.css";

/** A category link is current on its own page; "Shop" only on the all-products page and product pages. */
function isCurrent(pathname: string, href: string) {
  if (href === "/shop") return pathname === "/shop" || pathname.startsWith("/product/");
  return pathname === href;
}

export function SiteHeader() {
  const { count } = useCart();
  const { lang, setLang, t } = useLanguage();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/shop", label: t.nav.shop },
    { href: "/shop/square", label: t.nav.square },
    { href: "/shop/round", label: t.nav.round },
    { href: "/shop/dessert-cups", label: t.nav.dessertCups },
    { href: "/shop/crates", label: t.nav.crates },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  // Close the drawer whenever the route changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.bar}`}>
        <Link href="/" className={styles.logo} aria-label={t.nav.homeAria}>
          <Logo tone="dark" knockout="var(--brand-950)" size={25} />
        </Link>
        <nav aria-label="Main" className={styles.links}>
          {navLinks.map((l) => (
            <Link
              key={l.href}
              className={styles.link}
              href={l.href}
              aria-current={isCurrent(pathname, l.href) ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className={styles.actions}>
          <div className={styles.langSwitch} role="group" aria-label="Language">
            <button
              type="button"
              className={`${styles.langBtn} ${lang === "en" ? styles.langBtnActive : ""}`}
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
            <button
              type="button"
              className={`${styles.langBtn} ${lang === "bn" ? styles.langBtnActive : ""}`}
              onClick={() => setLang("bn")}
              aria-pressed={lang === "bn"}
            >
              বাং
            </button>
          </div>
          <Link href="/quote" className={`btn btn-ghost ${styles.quote}`}>
            {t.nav.bulkQuote}
          </Link>
          <Link className={`${styles.iconBtn} hide-sm`} href="/shop#search" aria-label={t.nav.searchProducts}>
            <SearchIcon />
          </Link>
          <Link className={styles.cartBtn} href="/cart" aria-label={`${t.nav.cart}, ${count}`}>
            <span>{t.nav.cart}</span>
            <span className={styles.cartCount}>{count}</span>
          </Link>
          <UserMenu />
          <button
            className={`${styles.iconBtn} ${styles.menuBtn}`}
            type="button"
            aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>
      <span className={`progress ${styles.progress}`} aria-hidden="true" />
      {menuOpen && (
        <nav aria-label="Mobile" className={`wrap ${styles.mobileNav}`}>
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} aria-current={isCurrent(pathname, l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
          <Link href="/track-order">{t.nav.trackYourOrder}</Link>
          <Link href="/quote">{t.nav.requestBulkQuote}</Link>
          <div className={styles.mobileLangRow}>
            <span>{lang === "bn" ? "ভাষা / Language" : "Language / ভাষা"}</span>
            <div className={styles.langSwitch} role="group" aria-label="Mobile language">
              <button
                type="button"
                className={`${styles.langBtn} ${lang === "en" ? styles.langBtnActive : ""}`}
                onClick={() => setLang("en")}
                aria-pressed={lang === "en"}
              >
                English
              </button>
              <button
                type="button"
                className={`${styles.langBtn} ${lang === "bn" ? styles.langBtnActive : ""}`}
                onClick={() => setLang("bn")}
                aria-pressed={lang === "bn"}
              >
                বাংলা
              </button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
