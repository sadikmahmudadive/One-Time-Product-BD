"use client";

import { useMemo, useState } from "react";
import {
  calculateSalesMetrics,
  formatDate,
  getTimeframeChartData,
  isLive,
  shortId,
  type SalesTimeframe,
} from "@/lib/admin-utils";
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
  const [selectedTimeframe, setSelectedTimeframe] = useState<SalesTimeframe>("weekly");

  // Until the first response arrives, show placeholders rather than misleading zeros.
  const initial = loading && orders.length === 0;
  const live = useMemo(() => orders.filter(isLive), [orders]);

  // Dynamic Sales Metrics for Today, Weekly, Monthly, and Yearly
  const sales = useMemo(() => calculateSalesMetrics(orders), [orders]);

  // Dynamic Chart Points for the active timeframe
  const chartData = useMemo(
    () => getTimeframeChartData(orders, selectedTimeframe),
    [orders, selectedTimeframe]
  );

  const avgOrder = live.length ? live.reduce((sum, o) => sum + (o.totalPrice ?? 0), 0) / live.length : 0;
  const pending = orders.filter((o) => o.status === "pending").length;

  const statusSegments: DonutSegment[] = useMemo(
    () =>
      [
        { label: "Pending", color: "#E0A030", status: "pending" },
        { label: "Confirmed", color: "#3B7DD8", status: "confirmed" },
        { label: "Shipped", color: "#23734B", status: "shipped" },
        { label: "Cancelled", color: "#B53A36", status: "cancelled" },
      ].map(({ label, color, status }) => {
        const value = orders.filter((o) => o.status === status).length;
        return { label, color, value, formattedValue: `${value}` };
      }),
    [orders]
  );

  const attention = useMemo(
    () =>
      ([
        {
          icon: "orders",
          title: "Orders to confirm",
          text: "Call the customer to confirm delivery and charges.",
          count: pending,
          tab: "orders",
          filter: "pending",
          cta: "Review",
        },
        {
          icon: "quotes",
          title: "New quote requests",
          text: "Wholesale and custom pricing requests.",
          count: newQuotes,
          tab: "quotes",
          cta: "Reply",
        },
        {
          icon: "inventory",
          title: "Out of stock",
          text: "Products with no units available.",
          count: stock.out,
          tab: "inventory",
          cta: "Restock",
        },
        {
          icon: "alert",
          title: "Running low",
          text: "At or below the alert level.",
          count: stock.low,
          tab: "inventory",
          cta: "Check",
        },
      ] as AttentionItem[]).filter((a) => a.count > 0),
    [pending, newQuotes, stock]
  );

  return (
    <div className={styles.stack}>
      {/* 1. Dynamic Sales KPI Cards (Today, Weekly, Monthly, Yearly) */}
      <div className={styles.statGrid}>
        <StatCard
          label={sales.today.label}
          badge={sales.today.badge}
          value={initial ? "—" : formatPrice(sales.today.revenue)}
          icon="orders"
          delta={initial ? undefined : sales.today.revenueDelta}
          deltaLabel={sales.today.deltaLabel}
          hint={
            <span className={styles.deltaLabel}>
              {initial ? "Loading…" : `${sales.today.ordersCount} ${sales.today.ordersCount === 1 ? "order" : "orders"}`}
            </span>
          }
          active={selectedTimeframe === "today"}
          onClick={() => setSelectedTimeframe("today")}
        />

        <StatCard
          label={sales.weekly.label}
          badge={sales.weekly.badge}
          value={initial ? "—" : formatPrice(sales.weekly.revenue)}
          icon="overview"
          delta={initial ? undefined : sales.weekly.revenueDelta}
          deltaLabel={sales.weekly.deltaLabel}
          hint={
            <span className={styles.deltaLabel}>
              {initial ? "Loading…" : `${sales.weekly.ordersCount} ${sales.weekly.ordersCount === 1 ? "order" : "orders"}`}
            </span>
          }
          active={selectedTimeframe === "weekly"}
          onClick={() => setSelectedTimeframe("weekly")}
        />

        <StatCard
          label={sales.monthly.label}
          badge={sales.monthly.badge}
          value={initial ? "—" : formatPrice(sales.monthly.revenue)}
          icon="table"
          delta={initial ? undefined : sales.monthly.revenueDelta}
          deltaLabel={sales.monthly.deltaLabel}
          hint={
            <span className={styles.deltaLabel}>
              {initial ? "Loading…" : `${sales.monthly.ordersCount} ${sales.monthly.ordersCount === 1 ? "order" : "orders"}`}
            </span>
          }
          active={selectedTimeframe === "monthly"}
          onClick={() => setSelectedTimeframe("monthly")}
        />

        <StatCard
          label={sales.yearly.label}
          badge={sales.yearly.badge}
          value={initial ? "—" : formatPrice(sales.yearly.revenue)}
          icon="board"
          delta={initial ? undefined : sales.yearly.revenueDelta}
          deltaLabel={sales.yearly.deltaLabel}
          hint={
            <span className={styles.deltaLabel}>
              {initial ? "Loading…" : `${sales.yearly.ordersCount} ${sales.yearly.ordersCount === 1 ? "order" : "orders"}`}
            </span>
          }
          active={selectedTimeframe === "yearly"}
          onClick={() => setSelectedTimeframe("yearly")}
        />
      </div>

      {/* 2. Main Sales Analytics Chart with Dynamic Timeframe Switching */}
      <div className={styles.grid21}>
        <Panel title={chartData.periodTitle} description={chartData.periodSubtitle}>
          {loading && !orders.length ? (
            <SkeletonRows rows={4} />
          ) : (
            <RevenueChart
              points={chartData.points}
              totalRevenue={chartData.totalRevenue}
              totalOrders={chartData.totalOrders}
              avgOrder={chartData.avgOrder}
              peakPoint={chartData.peakPoint}
              timeframe={selectedTimeframe}
              onTimeframeChange={setSelectedTimeframe}
              periodSubtitle={chartData.periodSubtitle}
            />
          )}
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

      {/* 3. Secondary Operational KPIs */}
      <div className={styles.statGrid}>
        <StatCard
          label="Average Order"
          value={initial ? "—" : formatPrice(avgOrder)}
          icon="customers"
          hint={<span className={styles.deltaNone}>{initial ? "Loading…" : `Across ${live.length} live orders`}</span>}
        />
        <StatCard
          label="Open Quotes"
          value={initial ? "—" : String(newQuotes)}
          icon="quotes"
          hint={<span className={styles.deltaNone}>B2B wholesale inquiries</span>}
        />
        <StatCard
          label="Stock Health"
          value={initial ? "—" : `${stock.healthy} / ${stock.total}`}
          icon="inventory"
          hint={
            <span className={styles.deltaNone}>
              {stock.out > 0 ? `${stock.out} out of stock` : stock.low > 0 ? `${stock.low} running low` : "All tracked in stock"}
            </span>
          }
        />
        <StatCard
          label="Total Orders"
          value={initial ? "—" : String(orders.length)}
          icon="orders"
          hint={<span className={styles.deltaNone}>{pending} pending confirmation</span>}
        />
      </div>

      {/* 4. Recent Orders Table & Charts */}
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
