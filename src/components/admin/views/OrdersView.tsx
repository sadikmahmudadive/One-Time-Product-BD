"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ORDER_STATUSES, formatDate, formatDateTime, shortId, whatsappLink } from "@/lib/admin-utils";
import type { OrderStatus } from "@/lib/admin-utils";
import type { OrderRecord } from "@/lib/firebase/firestore";
import { formatPrice } from "@/lib/format";
import { EmptyState, Icon, PageHeader, Panel, SearchField, Segmented, SkeletonRows, StatusBadge } from "../ui";
import styles from "../admin.module.css";

export type OrderFilter = "all" | OrderStatus;
type Layout = "table" | "board";

interface OrdersViewProps {
  orders: OrderRecord[];
  loading: boolean;
  filter: OrderFilter;
  setFilter: (f: OrderFilter) => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onSlip: (order: OrderRecord) => void;
  onExport: () => void;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}

const pieces = (o: OrderRecord) => o.items.reduce((sum, i) => sum + i.qty, 0);
const totalText = (o: OrderRecord) => (o.totalPrice ? formatPrice(o.totalPrice) : "On request");

export function OrdersView({ orders, loading, filter, setFilter, onStatusChange, onSlip, onExport, openId, setOpenId }: OrdersViewProps) {
  const [search, setSearch] = useState("");
  const [layout, setLayout] = useState<Layout>("table");

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!q) return true;
      return (
        o.id?.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        o.customer.district.toLowerCase().includes(q)
      );
    });
  }, [orders, filter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  const opened = orders.find((o) => o.id === openId) ?? null;

  return (
    <div className={styles.stack}>
      <PageHeader
        title="Orders"
        description="Confirm, dispatch and track every order."
        actions={
          <button type="button" className={styles.btn} onClick={onExport} disabled={!orders.length}>
            <Icon name="download" size={16} /> Export CSV
          </button>
        }
      />

      <Panel flush>
        <div className={styles.toolbar}>
          <SearchField label="Search orders" placeholder="Search order, customer, phone or district" value={search} onChange={setSearch} />
          <Segmented<OrderFilter>
            label="Filter by status"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All", count: counts.all },
              ...ORDER_STATUSES.map((s) => ({ value: s.value, label: s.label, count: counts[s.value] ?? 0 })),
            ]}
          />
          <div className={styles.viewToggle} role="group" aria-label="Layout">
            <button type="button" className={`${styles.iconToggle} ${layout === "table" ? styles.iconToggleOn : ""}`} aria-pressed={layout === "table"} aria-label="Table view" onClick={() => setLayout("table")}>
              <Icon name="table" size={17} />
            </button>
            <button type="button" className={`${styles.iconToggle} ${layout === "board" ? styles.iconToggleOn : ""}`} aria-pressed={layout === "board"} aria-label="Board view" onClick={() => setLayout("board")}>
              <Icon name="board" size={17} />
            </button>
          </div>
        </div>

        {loading && !orders.length ? (
          <SkeletonRows />
        ) : visible.length === 0 ? (
          <EmptyState
            title={orders.length ? "No orders match" : "No orders yet"}
            text={orders.length ? "Try a different search or status." : "Orders placed from the storefront checkout appear here."}
            action={
              orders.length ? (
                <button type="button" className={styles.btn} onClick={() => (setSearch(""), setFilter("all"))}>
                  Clear filters
                </button>
              ) : undefined
            }
          />
        ) : layout === "table" ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Destination</th>
                  <th scope="col" className={styles.num}>
                    Items
                  </th>
                  <th scope="col" className={styles.num}>
                    Total
                  </th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className={styles.visuallyHidden}>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((o) => (
                  <tr key={o.id} className={styles.rowClickable}>
                    <td>
                      <button type="button" className={styles.rowLink} onClick={() => o.id && setOpenId(o.id)}>
                        #{shortId(o.id)}
                      </button>
                      <div className={styles.sub}>{formatDate(o.createdAt)}</div>
                    </td>
                    <td>
                      <div className={styles.cellStrong}>{o.customer.name}</div>
                      <div className={styles.sub}>{o.customer.phone}</div>
                    </td>
                    <td>
                      <div>{o.customer.district}</div>
                      {o.customer.address && <div className={`${styles.sub} ${styles.clamp}`}>{o.customer.address}</div>}
                    </td>
                    <td className={styles.num}>
                      {pieces(o)} <span className={styles.sub}>pcs</span>
                    </td>
                    <td className={`${styles.num} ${styles.cellStrong}`}>{totalText(o)}</td>
                    <td>
                      <StatusSelect order={o} onChange={onStatusChange} />
                    </td>
                    <td className={styles.rowActions}>
                      <button type="button" className={styles.iconBtn} aria-label={`Print slip for order ${shortId(o.id)}`} onClick={() => onSlip(o)}>
                        <Icon name="print" size={17} />
                      </button>
                      <button type="button" className={styles.iconBtn} aria-label={`Open order ${shortId(o.id)}`} onClick={() => o.id && setOpenId(o.id)}>
                        <Icon name="chevron" size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Board orders={visible} onOpen={setOpenId} onStatusChange={onStatusChange} />
        )}
      </Panel>

      {opened && <OrderDrawer order={opened} onClose={() => setOpenId(null)} onStatusChange={onStatusChange} onSlip={onSlip} />}
    </div>
  );
}

function StatusSelect({ order, onChange }: { order: OrderRecord; onChange: (id: string, s: OrderStatus) => void }) {
  return (
    <label className={styles.statusSelect} data-status={order.status}>
      <span className={styles.visuallyHidden}>Status for order {shortId(order.id)}</span>
      <select value={order.status} onChange={(e) => order.id && onChange(order.id, e.target.value as OrderStatus)}>
        {ORDER_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ---------- Board ---------- */

const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  pending: { to: "confirmed", label: "Confirm" },
  confirmed: { to: "shipped", label: "Mark shipped" },
  cancelled: { to: "pending", label: "Reopen" },
};

function Board({ orders, onOpen, onStatusChange }: { orders: OrderRecord[]; onOpen: (id: string) => void; onStatusChange: (id: string, s: OrderStatus) => void }) {
  return (
    <div className={styles.board}>
      {ORDER_STATUSES.map((col) => {
        const items = orders.filter((o) => o.status === col.value);
        return (
          <section key={col.value} className={styles.boardCol} aria-label={`${col.label} orders`}>
            <header className={styles.boardHead}>
              <StatusBadge status={col.value} />
              <span className={styles.boardCount}>{items.length}</span>
            </header>
            <div className={styles.boardList}>
              {items.length === 0 && <p className={styles.boardEmpty}>Nothing here</p>}
              {items.map((o) => {
                const next = NEXT[o.status];
                return (
                  <article key={o.id} className={styles.boardCard}>
                    <button type="button" className={styles.rowLink} onClick={() => o.id && onOpen(o.id)}>
                      #{shortId(o.id)}
                    </button>
                    <p className={styles.cellStrong}>{o.customer.name}</p>
                    <p className={styles.sub}>
                      {o.customer.district} · {pieces(o)} pcs
                    </p>
                    <p className={styles.boardTotal}>{totalText(o)}</p>
                    <div className={styles.boardActions}>
                      {next && (
                        <button type="button" className={styles.btnSm} onClick={() => o.id && onStatusChange(o.id, next.to)}>
                          {next.label}
                        </button>
                      )}
                      {(o.status === "pending" || o.status === "confirmed") && (
                        <button type="button" className={`${styles.btnSm} ${styles.btnDanger}`} onClick={() => o.id && onStatusChange(o.id, "cancelled")}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ---------- Detail drawer ---------- */

function OrderDrawer({
  order,
  onClose,
  onStatusChange,
  onSlip,
}: {
  order: OrderRecord;
  onClose: () => void;
  onStatusChange: (id: string, s: OrderStatus) => void;
  onSlip: (o: OrderRecord) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const message = `Hello ${order.customer.name}, regarding your One Time Product BD order #${shortId(order.id)}…`;

  return (
    <div className={styles.drawerRoot}>
      <button type="button" className={styles.scrim} aria-label="Close order details" onClick={onClose} tabIndex={-1} />
      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="order-drawer-title">
        <header className={styles.drawerHead}>
          <div>
            <h3 id="order-drawer-title" className={styles.drawerTitle}>
              Order #{shortId(order.id)}
            </h3>
            <p className={styles.sub}>{formatDateTime(order.createdAt)}</p>
          </div>
          <button ref={closeRef} type="button" className={styles.iconBtn} aria-label="Close" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className={styles.drawerBody}>
          <section>
            <h4 className={styles.drawerH}>Status</h4>
            <div className={styles.stepper} role="group" aria-label="Order status">
              {ORDER_STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className={`${styles.step} ${order.status === s.value ? styles.stepOn : ""}`}
                  data-status={s.value}
                  aria-pressed={order.status === s.value}
                  onClick={() => order.id && order.status !== s.value && onStatusChange(order.id, s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h4 className={styles.drawerH}>Customer</h4>
            <p className={styles.cellStrong}>{order.customer.name}</p>
            <ul className={styles.contactList}>
              <li>
                <Icon name="phone" size={15} />
                <a href={`tel:${order.customer.phone.replace(/\s/g, "")}`}>{order.customer.phone}</a>
              </li>
              {order.customer.email && (
                <li>
                  <Icon name="quotes" size={15} />
                  <a href={`mailto:${order.customer.email}`}>{order.customer.email}</a>
                </li>
              )}
            </ul>
            <div className={styles.addressBox}>
              <strong>{order.customer.district}</strong>
              <span>{order.customer.address || "Address to be confirmed by phone"}</span>
            </div>
          </section>

          <section>
            <h4 className={styles.drawerH}>Items · {pieces(order)} pcs</h4>
            <ul className={styles.lineItems}>
              {order.items.map((item, i) => (
                <li key={`${item.slug}-${i}`}>
                  <span>
                    <strong>{item.qty} ×</strong> {item.name}
                    {item.variantLabel && <span className={styles.sub}> · {item.variantLabel}</span>}
                  </span>
                  <span className={styles.cellStrong}>{item.subtotal ? formatPrice(item.subtotal) : "—"}</span>
                </li>
              ))}
            </ul>
            <dl className={styles.totals}>
              <div>
                <dt>Subtotal</dt>
                <dd>{totalText(order)}</dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd className={styles.sub}>To be confirmed</dd>
              </div>
            </dl>
          </section>
        </div>

        <footer className={styles.drawerFoot}>
          <a className={styles.btn} href={whatsappLink(order.customer.phone, message)} target="_blank" rel="noreferrer">
            <Icon name="chat" size={16} /> WhatsApp
          </a>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => onSlip(order)}>
            <Icon name="print" size={16} /> Print slip
          </button>
        </footer>
      </aside>
    </div>
  );
}
