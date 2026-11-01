"use client";

import { useState } from "react";
import { submitEnquiry } from "@/lib/submit";
import { FormSuccess } from "./FormSuccess";
import styles from "./forms.module.css";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setStatus("sending");
    try {
      await submitEnquiry("contact", data);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className={styles.card}>
        <FormSuccess title="Message received" message="Thanks — we’ll get back to you soon." actionLabel="Send another message" onAction={() => setStatus("idle")} />
      </div>
    );
  }

  return (
    <form className={`${styles.card} ${styles.form}`} onSubmit={onSubmit}>
      <div>
        <label className="lbl" htmlFor="cf-name">
          Your name <span className={styles.req}>*</span>
        </label>
        <input className="field" id="cf-name" name="name" type="text" autoComplete="name" required />
      </div>
      <div>
        <label className="lbl" htmlFor="cf-phone">
          Phone / WhatsApp <span className={styles.req}>*</span>
        </label>
        <input className="field" id="cf-phone" name="phone" type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" required />
      </div>
      <div className={styles.full}>
        <label className="lbl" htmlFor="cf-email">
          Email
        </label>
        <input className="field" id="cf-email" name="email" type="email" autoComplete="email" />
      </div>
      <div className={styles.full}>
        <label className="lbl" htmlFor="cf-msg">
          Message <span className={styles.req}>*</span>
        </label>
        <textarea className="field" id="cf-msg" name="message" rows={5} required style={{ resize: "vertical" }} />
      </div>
      {status === "error" && (
        <p className={`${styles.error} ${styles.full}`} role="alert">
          Something went wrong and your message wasn’t sent. Please try again.
        </p>
      )}
      <div className={styles.full}>
        <button type="submit" className="btn btn-primary btn-block" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
