"use client";

import { useMemo, useState } from "react";
import { formatDate, isLive, toDate } from "@/lib/admin-utils";
import type { NewsletterSubscription, OrderRecord } from "@/lib/firebase/firestore";
import { formatPrice } from "@/lib/format";
import { Avatar, EmptyState, Icon, PageHeader, Panel, SearchField, StatCard, Tone } from "../ui";
import styles from "../admin.module.css";

/** Lifetime spend at which a customer is flagged as a top buyer. */
const TOP_BUYER_SPEND = 5000;

interface Customer {
  key: string;
  name: string;
  contact: string;
  district: string;
  orders: number;
  spend: number;
  last: Date | null;
}

interface CustomersViewProps {
  orders: OrderRecord[];
  subscribers: NewsletterSubscription[];
  onExport: (customers: Customer[]) => void;
}

export function CustomersView({ orders, subscribers, onExport }: CustomersViewProps) {
  const [search, setSearch] = useState("");

  const customers = useMemo(() => {
    const map = new Map<string, Customer>();
    for (const o of orders.filter(isLive)) {
      const key = (o.customer.phone || o.customer.email || o.customer.name).trim();
      const when = toDate(o.createdAt);
      const c = map.get(key) ?? { key, name: o.customer.name, contact: o.customer.phone || o.customer.email || "—", district: o.customer.district, orders: 0, spend: 0, last: null };
      c.orders += 1;
      c.spend += o.totalPrice ?? 0;
      if (when && (!c.last || when > c.last)) c.last = when;
      map.set(key, c);
    }
    return [...map.values()].sort((a, b) => b.spend - a.spend);
  }, [orders]);

  const q = search.trim().toLowerCase();
  const visible = customers.filter((c) => !q || c.name.toLowerCase().includes(q) || c.contact.toLowerCase().includes(q) || c.district.toLowerCase().includes(q));
  const repeat = customers.filter((c) => c.orders > 1).length;

  return (
    <div className={styles.stack}>
      <PageHeader
        title="Customers"
        description="Everyone who has ordered, grouped by phone number."
        actions={
          <button type="button" className={styles.btn} onClick={() => onExport(customers)} disabled={!customers.length}>
            <Icon name="download" size={16} /> Export CSV
          </button>
        }
      />

      <div className={`${styles.statGrid} ${styles.stat3}`}>
        <StatCard label="Customers" value={String(customers.length)} icon="customers" hint={<span className={styles.deltaNone}>With at least one live order</span>} />
        <StatCard label="Repeat buyers" value={String(repeat)} icon="refresh" hint={<span className={styles.deltaNone}>{customers.length ? `${Math.round((repeat / customers.length) * 100)}% of customers` : "No orders yet"}</span>} />
        <StatCard label="Newsletter" value={String(subscribers.length)} icon="quotes" hint={<span className={styles.deltaNone}>Subscribed in the footer</span>} />
      </div>

      <Panel flush>
        <div className={styles.toolbar}>
          <SearchField label="Search customers" placeholder="Search name, contact or district" value={search} onChange={setSearch} />
          <span className={styles.toolbarNote}>
            {visible.length} {visible.length === 1 ? "customer" : "customers"}
          </span>
        </div>

        {visible.length === 0 ? (
          <EmptyState icon="customers" title={customers.length ? "No customers match" : "No customers yet"} text={customers.length ? "Try a different search." : "Customer records are built from orders as they come in."} />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Customer</th>
                  <th scope="col">Location</th>
                  <th scope="col" className={styles.num}>
                    Orders
                  </th>
                  <th scope="col" className={styles.num}>
                    Lifetime spend
                  </th>
                  <th scope="col">Last order</th>
                  <th scope="col">Segment</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => (
                  <tr key={c.key}>
                    <td>
                      <div className={styles.productCell}>
                        <Avatar name={c.name} />
                        <div>
                          <div className={styles.cellStrong}>{c.name}</div>
                          <div className={styles.sub}>{c.contact}</div>
                        </div>
                      </div>
                    </td>
                    <td>{c.district}</td>
                    <td className={styles.num}>{c.orders}</td>
                    <td className={`${styles.num} ${styles.cellStrong}`}>{formatPrice(c.spend)}</td>
                    <td>{formatDate(c.last)}</td>
                    <td>
                      {c.spend >= TOP_BUYER_SPEND ? (
                        <Tone tone="success">Top buyer</Tone>
                      ) : c.orders > 1 ? (
                        <Tone tone="info">Repeat</Tone>
                      ) : (
                        <Tone tone="neutral">New</Tone>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

export type { Customer };
