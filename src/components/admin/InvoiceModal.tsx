"use client";

import { useEffect, useRef } from "react";
import { formatDate, shortId } from "@/lib/admin-utils";
import type { OrderRecord } from "@/lib/firebase/firestore";
import { formatPrice } from "@/lib/format";
import { Logo } from "@/components/ui/Logo";
import { Icon, StatusBadge } from "./ui";
import styles from "./admin.module.css";

interface InvoiceModalProps {
  order: OrderRecord | null;
  onClose: () => void;
}

/** Printable courier / delivery slip. Only the sheet itself is printed (see @media print in admin.module.css). */
export function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!order) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [order, onClose]);

  if (!order) return null;
  const total = order.totalPrice ? formatPrice(order.totalPrice) : "On request";

  return (
    <div className={styles.modalRoot} role="dialog" aria-modal="true" aria-labelledby="slip-title">
      <button type="button" className={styles.scrim} aria-label="Close slip" onClick={onClose} tabIndex={-1} />
      <div className={styles.modal}>
        <header className={styles.modalBar}>
          <h3 id="slip-title">Delivery slip · #{shortId(order.id)}</h3>
          <div className={styles.modalActions}>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => window.print()}>
              <Icon name="print" size={16} /> Print
            </button>
            <button ref={closeRef} type="button" className={styles.iconBtn} aria-label="Close" onClick={onClose}>
              <Icon name="close" size={18} />
            </button>
          </div>
        </header>

        <div className={styles.modalScroll}>
          <div className={`${styles.slip} admin-slip`}>
            <div className={styles.slipHead}>
              <div>
                <Logo tone="light" size={22} />
                <p className={styles.slipMuted}>Manufacturer &amp; supplier of food packaging · Dhaka, Bangladesh</p>
              </div>
              <div className={styles.slipMeta}>
                <StatusBadge status={order.status} />
                <p>
                  <strong>#{shortId(order.id)}</strong>
                </p>
                <p className={styles.slipMuted}>{formatDate(order.createdAt)}</p>
              </div>
            </div>

            <div className={styles.slipParties}>
              <div>
                <p className={styles.slipLabel}>Deliver to</p>
                <p className={styles.slipName}>{order.customer.name}</p>
                <p>{order.customer.phone}</p>
                {order.customer.email && <p className={styles.slipMuted}>{order.customer.email}</p>}
              </div>
              <div>
                <p className={styles.slipLabel}>Destination</p>
                <p className={styles.slipName}>{order.customer.district}</p>
                <p>{order.customer.address || "Address to be confirmed by phone"}</p>
              </div>
            </div>

            <table className={styles.slipTable}>
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">Pack</th>
                  <th scope="col" className={styles.num}>
                    Qty
                  </th>
                  <th scope="col" className={styles.num}>
                    Unit
                  </th>
                  <th scope="col" className={styles.num}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={`${item.slug}-${i}`}>
                    <td>{item.name}</td>
                    <td>{item.variantLabel || "—"}</td>
                    <td className={styles.num}>{item.qty}</td>
                    <td className={styles.num}>{item.unitPrice ? formatPrice(item.unitPrice) : "On request"}</td>
                    <td className={styles.num}>{item.subtotal ? formatPrice(item.subtotal) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <dl className={styles.slipTotals}>
              <div>
                <dt>Subtotal</dt>
                <dd>{total}</dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd>To be confirmed</dd>
              </div>
              <div className={styles.slipGrand}>
                <dt>Total</dt>
                <dd>{total}</dd>
              </div>
            </dl>

            <div className={styles.slipSign}>
              <span>Customer signature</span>
              <span>Authorised signatory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
