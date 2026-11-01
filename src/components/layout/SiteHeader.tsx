"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { MenuIcon, SearchIcon } from "@/components/ui/Icons";
import { NAV_LINKS } from "@/lib/content";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.bar}`}>
        <a href="#top" className={styles.logo}>
          One Time Product BD
          <span className={`pulse ${styles.logoDot}`} />
        </a>
        <nav aria-label="Main" className={styles.links}>
          {NAV_LINKS.map((l) => (
            <a key={l.href + l.label} className={styles.link} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className={styles.actions}>
          <button className={`${styles.iconBtn} hide-sm`} type="button" aria-label="Search products">
            <SearchIcon />
          </button>
          <button className={styles.cartBtn} type="button" aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}>
            <span>Cart</span>
            <span className={styles.cartCount}>{count}</span>
          </button>
          <button
            className={`${styles.iconBtn} ${styles.menuBtn}`}
            type="button"
            aria-label="Open menu"
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
          {NAV_LINKS.map((l) => (
            <a key={l.href + l.label} href={l.href} onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
