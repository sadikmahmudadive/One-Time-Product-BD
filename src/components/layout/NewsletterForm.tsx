"use client";

import { useState } from "react";
import styles from "./SiteFooter.module.css";

export function NewsletterForm() {
  const [subscribed, setSubscribed] = useState(false);

  if (subscribed) {
    return (
      <p role="status" className={styles.thanks}>
        You&apos;re on the list. Thank you!
      </p>
    );
  }

  return (
    <form
      className={styles.newsletter}
      onSubmit={(e) => {
        e.preventDefault();
        setSubscribed(true);
      }}
    >
      <label htmlFor="nl-email" className="sr-only">
        Email address
      </label>
      <input className={`field field-dark ${styles.email}`} id="nl-email" type="email" autoComplete="email" placeholder="Your email address" />
      <button type="submit" className="btn btn-lime" style={{ minHeight: 52 }}>
        Subscribe
      </button>
    </form>
  );
}
