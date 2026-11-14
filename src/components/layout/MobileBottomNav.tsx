"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { SearchModal } from "@/components/commerce/SearchModal";
import { useLanguage } from "@/lib/i18n/context";
import styles from "./MobileBottomNav.module.css";

export function MobileBottomNav() {
  const pathname = usePathname() || "/";
  const { count, openDrawer } = useCart();
  const { pick } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);

  // Avoid competing with the product page's sticky mobile buy bar or admin tables.
  if (pathname.startsWith("/product/") || pathname.startsWith("/admin")) {
    return null;
  }

  const isHome = pathname === "/";
  const isShop = pathname.startsWith("/shop");
  const isTrack = pathname.startsWith("/track-order");

  return (
    <>
      <nav aria-label={pick("Quick mobile navigation", "মোবাইল নেভিগেশন")} className={styles.dock}>
        <Link href="/" className={`${styles.item} ${isHome ? styles.itemActive : ""}`} aria-current={isHome ? "page" : undefined}>
          <span className={styles.iconWrap} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
            </svg>
          </span>
          <span className={styles.label}>{pick("Home", "হোম")}</span>
        </Link>

        <Link href="/shop" className={`${styles.item} ${isShop ? styles.itemActive : ""}`} aria-current={isShop ? "page" : undefined}>
          <span className={styles.iconWrap} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7.5" height="7.5" rx="1.8" />
              <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8" />
              <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8" />
              <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8" />
            </svg>
          </span>
          <span className={styles.label}>{pick("Shop", "শপ")}</span>
        </Link>

        <button type="button" className={styles.item} onClick={() => setSearchOpen(true)} aria-label={pick("Search products", "পণ্য খুঁজুন")}>
          <span className={styles.iconWrap} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <span className={styles.label}>{pick("Search", "খুঁজুন")}</span>
        </button>

        <Link href="/track-order" className={`${styles.item} ${isTrack ? styles.itemActive : ""}`} aria-current={isTrack ? "page" : undefined}>
          <span className={styles.iconWrap} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-6-5.2-6-10.5a6 6 0 1 1 12 0C18 15.8 12 21 12 21Z" />
              <circle cx="12" cy="10.5" r="2.2" />
            </svg>
          </span>
          <span className={styles.label}>{pick("Track", "ট্র্যাক")}</span>
        </Link>

        <button
          type="button"
          className={styles.item}
          onClick={openDrawer}
          aria-label={pick(`Open cart${count > 0 ? `, ${count} items` : ""}`, "কার্ট দেখুন")}
        >
          <span className={styles.iconWrap}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 7h12l-1 13H7L6 7Z" />
              <path d="M9 7V5a3 3 0 0 1 6 0v2" />
            </svg>
            {count > 0 && <span className={styles.badge}>{count > 99 ? "99+" : count}</span>}
          </span>
          <span className={styles.label}>{pick("Cart", "কার্ট")}</span>
        </button>
      </nav>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
