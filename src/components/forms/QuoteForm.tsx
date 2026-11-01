"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { getProduct } from "@/lib/catalog";
import { submitEnquiry } from "@/lib/submit";
import { FormSuccess } from "./FormSuccess";
import styles from "./forms.module.css";

type Status = "idle" | "sending" | "sent" | "error";

export function QuoteForm() {
  const params = useSearchParams();
  const { ready, lines } = useCart();
  const [products, setProducts] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const edited = useRef(false);

  // Prefill the product box from a product page ("?product=slug&pack=100") or from the cart.
  const productParam = params.get("product");
  const packParam = params.get("pack");
  const fromCart = params.get("from") === "cart";
  useEffect(() => {
    if (edited.current) return;
    if (fromCart) {
      if (!ready) return;
      setProducts(lines.map((l) => `${l.qty} × ${l.name}${l.variantLabel ? ` (${l.variantLabel.toLowerCase()})` : ""}`).join("\n"));
    } else if (productParam) {
      const p = getProduct(productParam);
      if (p) setProducts(`${p.name}${packParam ? ` — pack of ${packParam}` : ""}`);
    }
  }, [fromCart, ready, lines, productParam, packParam]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setStatus("sending");
    try {
      await submitEnquiry("quote", data);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className={styles.card}>
        <FormSuccess
          title="Enquiry received"
          message="Thanks — we’ll get back to you with pricing."
          actionLabel="Send another enquiry"
          onAction={() => {
            edited.current = true;
            setProducts("");
            setStatus("idle");
          }}
        />
      </div>
    );
  }

  return (
    <form className={`${styles.card} ${styles.form}`} onSubmit={onSubmit}>
      <div>
        <label className="lbl" htmlFor="qf-name">
          Your name <span className={styles.req}>*</span>
        </label>
        <input className="field" id="qf-name" name="name" type="text" autoComplete="name" required />
      </div>
      <div>
        <label className="lbl" htmlFor="qf-biz">
          Business name
        </label>
        <input className="field" id="qf-biz" name="business" type="text" autoComplete="organization" />
      </div>
      <div>
        <label className="lbl" htmlFor="qf-phone">
          Phone / WhatsApp <span className={styles.req}>*</span>
        </label>
        <input className="field" id="qf-phone" name="phone" type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" required />
      </div>
      <div>
        <label className="lbl" htmlFor="qf-email">
          Email
        </label>
        <input className="field" id="qf-email" name="email" type="email" autoComplete="email" />
      </div>
      <div className={styles.full}>
        <label className="lbl" htmlFor="qf-products">
          Product(s) <span className={styles.req}>*</span>
        </label>
        <textarea
          className="field"
          id="qf-products"
          name="products"
          rows={4}
          required
          value={products}
          onChange={(e) => {
            edited.current = true;
            setProducts(e.target.value);
          }}
          placeholder="e.g. 1000 ml Black Premium Box"
          style={{ resize: "vertical" }}
        />
      </div>
      <div>
        <label className="lbl" htmlFor="qf-qty">
          Required quantity <span className={styles.req}>*</span>
        </label>
        <input className="field" id="qf-qty" name="quantity" type="text" required placeholder="e.g. 500 pieces" />
      </div>
      <div>
        <label className="lbl" htmlFor="qf-district">
          Delivery district <span className={styles.req}>*</span>
        </label>
        <input className="field" id="qf-district" name="district" type="text" autoComplete="address-level1" required placeholder="e.g. Dhaka" />
      </div>
      <div>
        <label className="lbl" htmlFor="qf-date">
          Target delivery date
        </label>
        <input className="field" id="qf-date" name="date" type="date" />
        <p className={styles.hint}>Optional.</p>
      </div>
      <div className={styles.full}>
        <label className="lbl" htmlFor="qf-notes">
          Additional requirements
        </label>
        <textarea className="field" id="qf-notes" name="notes" rows={3} style={{ resize: "vertical" }} />
      </div>
      {status === "error" && (
        <p className={`${styles.error} ${styles.full}`} role="alert">
          Something went wrong and your enquiry wasn’t sent. Please try again.
        </p>
      )}
      <div className={styles.full}>
        <button type="submit" className="btn btn-primary btn-block" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Request a quote"}
        </button>
      </div>
    </form>
  );
}
