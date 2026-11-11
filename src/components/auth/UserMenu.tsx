"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { isAdminEmail } from "@/lib/admin";
import { useAuth } from "@/lib/firebase/auth-context";
import { AuthModal } from "./AuthModal";
import styles from "./UserMenu.module.css";

export function UserMenu() {
  const { user, loading, logOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return <div style={{ width: 68, height: 32 }} />;
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <button
          type="button"
          className={styles.signInBtn}
          onClick={() => setModalOpen(true)}
          aria-label="Sign in or register"
        >
          <span>Sign In</span>
        </button>
        <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    );
  }

  const initial = (user.displayName || user.email || "U")[0].toUpperCase();
  const isAdmin = isAdminEmail(user.email);

  return (
    <div className={styles.container} ref={menuRef}>
      <button
        type="button"
        className={styles.avatarBtn}
        onClick={() => setDropdownOpen((prev) => !prev)}
        aria-label="User account menu"
        aria-expanded={dropdownOpen}
      >
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoURL} alt={user.displayName || "User"} className={styles.avatar} />
        ) : (
          <span className={styles.avatar}>{initial}</span>
        )}
      </button>

      {dropdownOpen && (
        <div className={styles.menu} role="menu">
          <div className={styles.userInfo}>
            <p className={styles.userName}>{user.displayName || "Customer"}</p>
            <p className={styles.userEmail}>{user.email}</p>
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              className={styles.item}
              role="menuitem"
              onClick={() => setDropdownOpen(false)}
              style={{ color: "var(--brand-700)", fontWeight: 700 }}
            >
              Admin Dashboard
            </Link>
          )}

          <Link
            href="/cart"
            className={styles.item}
            role="menuitem"
            onClick={() => setDropdownOpen(false)}
          >
            My Cart
          </Link>
          <Link
            href="/quote"
            className={styles.item}
            role="menuitem"
            onClick={() => setDropdownOpen(false)}
          >
            Request Bulk Quote
          </Link>
          <Link
            href="/contact"
            className={styles.item}
            role="menuitem"
            onClick={() => setDropdownOpen(false)}
          >
            Support / Contact
          </Link>

          <button
            type="button"
            className={`${styles.item} ${styles.itemDanger}`}
            role="menuitem"
            onClick={async () => {
              setDropdownOpen(false);
              await logOut();
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
