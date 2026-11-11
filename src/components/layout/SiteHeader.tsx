"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/auth/UserMenu";
import { useCart } from "@/components/cart/CartProvider";
import { MenuIcon, SearchIcon } from "@/components/ui/Icons";
import { Logo } from "@/components/ui/Logo";
import { NAV_LINKS } from "@/lib/content";
import styles from "./SiteHeader.module.css";

/** A category link is current on its own page; "Shop" only on the all-products page and product pages. */
function isCurrent(pathname: string, href: string) {
  if (href === "/shop") return pathname === "/shop" || pathname.startsWith("/product/");
  return pathname === href;
}

export function SiteHeader() {
  const { count } = useCart();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the drawer whenever the route changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.bar}`}>
        <Link href="/" className={styles.logo} aria-label="One Time Product BD — home">
          <Logo tone="dark" knockout="var(--brand-950)" size={25} />
        </Link>
        <nav aria-label="Main" className={styles.links}>
          {NAV_LINKS.map((l) => (
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
          <Link href="/quote" className={`btn btn-ghost ${styles.quote}`}>
            Bulk quote
          </Link>
          <Link className={`${styles.iconBtn} hide-sm`} href="/shop#search" aria-label="Search products">
            <SearchIcon />
          </Link>
          <Link className={styles.cartBtn} href="/cart" aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}>
            <span>Cart</span>
            <span className={styles.cartCount}>{count}</span>
          </Link>
          <UserMenu />
          <button
            className={`${styles.iconBtn} ${styles.menuBtn}`}
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
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
            <Link key={l.href} href={l.href} aria-current={isCurrent(pathname, l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
          <Link href="/quote">Request a bulk quote</Link>
        </nav>
      )}
    </header>
  );
}
