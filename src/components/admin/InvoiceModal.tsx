"use client";

import { useRef } from "react";
import type { OrderRecord } from "@/lib/firebase/firestore";
import { formatPrice } from "@/lib/format";
import styles from "./admin.module.css";

interface InvoiceModalProps {
  order: OrderRecord | null;
  onClose: () => void;
}

export function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const dateStr =
    order.createdAt && typeof order.createdAt === "object" && "toDate" in order.createdAt
      ? (order.createdAt as { toDate: () => Date }).toDate().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

  function handlePrint() {
    window.print();
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalSheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.invoiceHeader}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, color: "#fff" }}>
              Order #{order.id?.slice(-7).toUpperCase()}
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--accent-500)" }}>
              Commercial Delivery Invoice
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              className={`${styles.pillBtn} ${styles.primaryPill}`}
              onClick={handlePrint}
            >
              🖨️ Print Slip
            </button>
            <button
              type="button"
              className={styles.pillBtn}
              onClick={onClose}
              style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)", background: "transparent" }}
            >
              Close
            </button>
          </div>
        </div>

        <div className={`${styles.invoiceBody} printableInvoice`} ref={printRef}>
          {/* Company & Header info */}
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #102D25", paddingBottom: 16, marginBottom: 20 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, color: "var(--brand-950)", letterSpacing: "-0.02em" }}>
                One Time Product BD
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ink-700)" }}>
                Manufacturer & Supplier of Food Packaging
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--ink-700)" }}>
                Dhaka, Bangladesh · WhatsApp: Available
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className={`${styles.statusPill} ${styles["status" + (order.status[0].toUpperCase() + order.status.slice(1))]}`}>
                Status: {order.status.toUpperCase()}
              </span>
              <p style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 700 }}>
                Invoice: #{order.id?.slice(-7).toUpperCase()}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--ink-500)" }}>
                Date: {dateStr}
              </p>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, background: "#f8faf8", padding: 16, borderRadius: 10, marginBottom: 20, border: "1px solid var(--line-200)" }}>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--brand-700)" }}>
                Bill To & Deliver To:
              </p>
              <h4 style={{ margin: "0 0 4px", fontSize: 16 }}>{order.customer.name}</h4>
              <p style={{ margin: 0, fontSize: 13, color: "var(--ink-700)" }}>
                Phone: <strong>{order.customer.phone}</strong>
              </p>
              {order.customer.email && (
                <p style={{ margin: 0, fontSize: 13, color: "var(--ink-700)" }}>
                  Email: {order.customer.email}
                </p>
              )}
            </div>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--brand-700)" }}>
                Delivery Destination:
              </p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                District: {order.customer.district}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ink-700)" }}>
                Address: {order.customer.address || "As confirmed over phone"}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
            <thead>
              <tr style={{ background: "#edf3ee", textAlign: "left", fontSize: 12, textTransform: "uppercase", color: "var(--brand-950)" }}>
                <th style={{ padding: "10px 12px", borderBottom: "1px solid var(--line-300)" }}>Item</th>
                <th style={{ padding: "10px 12px", borderBottom: "1px solid var(--line-300)", textAlign: "center" }}>Pack / Variant</th>
                <th style={{ padding: "10px 12px", borderBottom: "1px solid var(--line-300)", textAlign: "center" }}>Qty</th>
                <th style={{ padding: "10px 12px", borderBottom: "1px solid var(--line-300)", textAlign: "right" }}>Unit Price</th>
                <th style={{ padding: "10px 12px", borderBottom: "1px solid var(--line-300)", textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={`${item.slug}-${idx}`} style={{ borderBottom: "1px solid var(--line-200)", fontSize: 13 }}>
                  <td style={{ padding: "12px" }}>
                    <strong>{item.name}</strong>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center", color: "var(--ink-700)" }}>
                    {item.variantLabel || "Standard"}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center", fontWeight: 700 }}>
                    {item.qty}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right", color: "var(--ink-700)" }}>
                    {item.unitPrice ? formatPrice(item.unitPrice) : "On request"}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right", fontWeight: 700 }}>
                    {item.subtotal ? formatPrice(item.subtotal) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total & Summary */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ maxWidth: 320, fontSize: 12, color: "var(--ink-500)" }}>
              <p style={{ margin: 0 }}>
                Thank you for choosing One Time Product BD. Delivery charges are handled directly with courier partners across Bangladesh.
              </p>
            </div>
            <div style={{ width: 240, background: "#fbfcfb", padding: 14, borderRadius: 8, border: "1px solid var(--line-200)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span>Subtotal:</span>
                <strong>{order.totalPrice ? formatPrice(order.totalPrice) : "On request"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, color: "var(--ink-700)" }}>
                <span>Delivery:</span>
                <span>To be confirmed</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, borderTop: "2px solid var(--brand-950)", paddingTop: 8, marginTop: 6, color: "var(--brand-950)" }}>
                <span>Total Due:</span>
                <span>{order.totalPrice ? formatPrice(order.totalPrice) : "On request"}</span>
              </div>
            </div>
          </div>

          {/* Signature area for delivery */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, paddingTop: 20, borderTop: "1px dashed var(--line-300)" }}>
            <div style={{ width: 180, textAlign: "center" }}>
              <div style={{ borderTop: "1px solid var(--ink-500)", marginTop: 30, paddingTop: 4, fontSize: 11, color: "var(--ink-700)" }}>
                Customer Signature
              </div>
            </div>
            <div style={{ width: 180, textAlign: "center" }}>
              <div style={{ borderTop: "1px solid var(--ink-500)", marginTop: 30, paddingTop: 4, fontSize: 11, color: "var(--ink-700)" }}>
                Authorised Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

