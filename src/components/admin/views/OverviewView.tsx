"use client";

import { dailyRevenue, formatDate, isLive, percentChange, shortId, windowTotals } from "@/lib/admin-utils";
import type { OrderRecord } from "@/lib/firebase/firestore";
import { formatPrice } from "@/lib/format";
import { CategoryPieChart } from "../charts/CategoryPieChart";
import { DonutChart, type DonutSegment } from "../charts/DonutChart";
import { RevenueChart } from "../charts/RevenueChart";
import { EmptyState, Icon, Panel, SkeletonRows, StatCard, StatusBadge } from "../ui";
import type { IconName } from "../ui";
import styles from "../admin.module.css";
import type { StockSummary, Tab } from "./types";

interface AttentionItem {
  icon: IconName;
  title: string;
  text: string;
  count: number;
  tab: Tab;
  filter?: OrderRecord["status"];
  cta: string;
}

interface OverviewViewProps {
  orders: OrderRecord[];
  newQuotes: number;
  stock: StockSummary;
  loading: boolean;
  go: (tab: Tab, filter?: OrderRecord["status"]) => void;
  onOpenOrder: (id: string) => void;
}

export function OverviewView({ orders, newQuotes, stock, loading, go, onOpenOrder }: OverviewViewProps) {
  // Until the first response arrives, show placeholders rather than misleading zeros.
  const initial = loading && orders.length === 0;
  const live = orders.filter(isLive);
  const totals = windowTotals(orders, 7);
  const revenueDelta = percentChange(totals.current.revenue, totals.previous.revenue);
  const countDelta = percentChange(totals.current.count, totals.previous.count);
  const avgOrder = live.length ? live.reduce((sum, o) => sum + (o.totalPrice ?? 0), 0) / live.length : 0;
  const pending = orders.filter((o) => o.status === "pending").length;

  const statusSegments: DonutSegment[] = [
    { label: "Pending", color: "#E0A030", status: "pending" },
    { label: "Confirmed", color: "#3B7DD8", status: "confirmed" },
    { label: "Shipped", color: "#23734B", status: "shipped" },
    { label: "Cancelled", color: "#B53A36", status: "cancelled" },
  ].map(({ label, color, status }) => {
    const value = orders.filter((o) => o.status === status).length;
    return { label, color, value, formattedValue: `${value}` };
  });

  const attention = ([
    { icon: "orders", title: "Orders to confirm", text: "Call the customer to confirm delivery and charges.", count: pending, tab: "orders", filter: "pending", cta: "Review" },
    { icon: "quotes", title: "New quote requests", text: "Wholesale and custom pricing requests.", count: newQuotes, tab: "quotes", cta: "Reply" },
    { icon: "inventory", title: "Out of stock", text: "Products with no units available.", count: stock.out, tab: "inventory", cta: "Restock" },
    { icon: "alert", title: "Running low", text: "At or below the alert level.", count: stock.low, tab: "inventory", cta: "Check" },
  ] as AttentionItem[]).filter((a) => a.count > 0);

  return (
    <div className={styles.stack}>
      <div className={styles.statGrid}>
        <StatCard
          label="Revenue · 7 days"
          value={initial ? "—" : formatPrice(totals.current.revenue)}
          icon="orders"
          delta={initial ? undefined : revenueDelta}
          deltaLabel="vs previous 7 days"
        />
        <StatCard
          label="Orders · 7 days"
          value={initial ? "—" : String(totals.current.count)}
          icon="inventory"
          delta={initial ? undefined : countDelta}
          deltaLabel="vs previous 7 days"
        />
        <StatCard label="Average order" value={initial ? "—" : formatPrice(avgOrder)} icon="customers" hint={<span className={styles.deltaNone}>{initial ? "Loading…" : `Across ${live.length} orders`}</span>} />
        <StatCard label="Open quotes" value={initial ? "—" : String(newQuotes)} icon="quotes" hint={<span className={styles.deltaNone}>New requests awaiting a reply</span>} />
      </div>

      <div className={styles.grid21}>
        <Panel title="Revenue" description="Daily order value, last 14 days">
          {loading && !orders.length ? <SkeletonRows rows={4} /> : <RevenueChart points={dailyRevenue(orders, 14)} />}
        </Panel>

        <Panel title="Needs attention" description="What to do next">
          {initial ? (
            <SkeletonRows rows={4} />
          ) : attention.length === 0 ? (
            <EmptyState icon="check" title="You’re all caught up" text="No pending orders, new quotes or stock alerts." />
          ) : (
            <ul className={styles.todo}>
              {attention.map((a) => (
                <li key={a.title}>
                  <button type="button" className={styles.todoItem} onClick={() => go(a.tab, a.filter)}>
                    <span className={styles.todoIcon}>
                      <Icon name={a.icon} size={18} />
                    </span>
                    <span className={styles.todoText}>
                      <strong>{a.title}</strong>
                      <span>{a.text}</span>
                    </span>
                    <span className={styles.todoCount}>{a.count}</span>
                    <span className={styles.todoCta}>
                      {a.cta}
                      <Icon name="chevron" size={14} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className={styles.grid21}>
        <Panel
          title="Recent orders"
          flush
          actions={
            <button type="button" className={styles.btnGhost} onClick={() => go("orders")}>
              View all <Icon name="chevron" size={14} />
            </button>
          }
        >
          {orders.length === 0 ? (
            <EmptyState title={loading ? "Loading orders…" : "No orders yet"} text="Orders placed from the storefront checkout appear here." />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Order</th>
                    <th scope="col">Customer</th>
                    <th scope="col" className={styles.num}>
                      Total
                    </th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 6).map((o) => (
                    <tr key={o.id} className={styles.rowClickable}>
                      <td>
                        <button type="button" className={styles.rowLink} onClick={() => o.id && onOpenOrder(o.id)}>
                          #{shortId(o.id)}
                        </button>
                        <div className={styles.sub}>{formatDate(o.createdAt)}</div>
                      </td>
                      <td>
                        <div className={styles.cellStrong}>{o.customer.name}</div>
                        <div className={styles.sub}>{o.customer.district}</div>
                      </td>
                      <td className={styles.num}>{o.totalPrice ? formatPrice(o.totalPrice) : "On request"}</td>
                      <td>
                        <StatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <div className={styles.stack}>
          <Panel title="Order status" description="All orders by stage">
            <DonutChart data={statusSegments} centerValue={String(orders.length)} centerLabel="Orders" />
          </Panel>
          <Panel title="Demand by family" description="Units ordered, excluding cancelled">
            <CategoryPieChart orders={orders} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
