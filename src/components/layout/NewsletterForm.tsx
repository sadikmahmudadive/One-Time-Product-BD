"use client";

import { useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { saveNewsletterSubscription } from "@/lib/firebase/firestore";
import styles from "./SiteFooter.module.css";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  if (subscribed) {
    return (
      <p role="status" className={styles.thanks}>
        You&apos;re on the list. Thank you!
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      if (isFirebaseConfigured) {
        await saveNewsletterSubscription(email);
      }
    } catch (err) {
      console.error("Failed to save newsletter subscription:", err);
    } finally {
      setSubmitting(false);
      setSubscribed(true);
    }
  }

  return (
    <form className={styles.newsletter} onSubmit={handleSubmit}>
      <label htmlFor="nl-email" className="sr-only">
        Email address
      </label>
      <input
        className={`field field-dark ${styles.email}`}
        id="nl-email"
        type="email"
        autoComplete="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-lime" style={{ minHeight: 52 }} disabled={submitting}>
        {submitting ? "Joining…" : "Subscribe"}
      </button>
    </form>
  );
}
