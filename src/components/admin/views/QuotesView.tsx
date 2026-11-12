"use client";

import { useState } from "react";
import { ENQUIRY_STATUSES, formatDate, whatsappLink } from "@/lib/admin-utils";
import type { EnquiryStatus } from "@/lib/admin-utils";
import type { EnquiryRecord } from "@/lib/firebase/firestore";
import { EmptyState, Icon, PageHeader, Panel, Segmented, SkeletonRows, StatusBadge } from "../ui";
import styles from "../admin.module.css";

type Filter = "all" | EnquiryStatus;

interface QuotesViewProps {
  enquiries: EnquiryRecord[];
  loading: boolean;
  onStatusChange: (id: string, status: EnquiryStatus) => void;
  onExport: () => void;
}

export function QuotesView({ enquiries, loading, onStatusChange, onExport }: QuotesViewProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const counts: Record<string, number> = { all: enquiries.length };
  for (const e of enquiries) counts[e.status] = (counts[e.status] ?? 0) + 1;
  const visible = enquiries.filter((e) => filter === "all" || e.status === filter);

  return (
    <div className={styles.stack}>
      <PageHeader
        title="Quotes & messages"
        description="Wholesale quote requests and contact messages from the storefront."
        actions={
          <button type="button" className={styles.btn} onClick={onExport} disabled={!enquiries.length}>
            <Icon name="download" size={16} /> Export CSV
          </button>
        }
      />

      <Panel flush>
        <div className={styles.toolbar}>
          <Segmented<Filter>
            label="Filter by status"
            value={filter}
            onChange={setFilter}
            options={[{ value: "all", label: "All", count: counts.all }, ...ENQUIRY_STATUSES.map((s) => ({ value: s.value, label: s.label, count: counts[s.value] ?? 0 }))]}
          />
        </div>

        {loading && !enquiries.length ? (
          <SkeletonRows />
        ) : visible.length === 0 ? (
          <EmptyState title="Nothing here" text={enquiries.length ? "No requests with this status." : "Quote requests and contact messages appear here."} />
        ) : (
          <ul className={styles.cards}>
            {visible.map((e) => {
              const d = e.data;
              const text = d.products || d.message || "—";
              return (
                <li key={e.id} className={styles.enquiry}>
                  <div className={styles.enquiryTop}>
                    <div className={styles.enquiryWho}>
                      <StatusBadge status={e.kind} />
                      <strong>{d.name || "Unnamed"}</strong>
                      {d.business && <span className={styles.sub}>· {d.business}</span>}
                    </div>
                    <span className={styles.sub}>{formatDate(e.createdAt)}</span>
                  </div>

                  <p className={styles.enquiryText}>{text}</p>

                  <dl className={styles.facts}>
                    {d.quantity && (
                      <div>
                        <dt>Quantity</dt>
                        <dd>{d.quantity}</dd>
                      </div>
                    )}
                    {d.district && (
                      <div>
                        <dt>District</dt>
                        <dd>{d.district}</dd>
                      </div>
                    )}
                    {d.phone && (
                      <div>
                        <dt>Phone</dt>
                        <dd>
                          <a href={`tel:${d.phone.replace(/\s/g, "")}`}>{d.phone}</a>
                        </dd>
                      </div>
                    )}
                    {d.email && (
                      <div>
                        <dt>Email</dt>
                        <dd>
                          <a href={`mailto:${d.email}`}>{d.email}</a>
                        </dd>
                      </div>
                    )}
                  </dl>
                  {d.notes && <p className={styles.note}>“{d.notes}”</p>}

                  <div className={styles.enquiryFoot}>
                    <label className={styles.statusSelect} data-status={e.status}>
                      <span className={styles.visuallyHidden}>Status</span>
                      <select value={e.status} onChange={(evt) => e.id && onStatusChange(e.id, evt.target.value as EnquiryStatus)}>
                        {ENQUIRY_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    {d.phone && (
                      <a
                        className={styles.btnSm}
                        href={whatsappLink(d.phone, `Hello ${d.name || ""}, regarding your One Time Product BD ${e.kind === "quote" ? "quote request" : "message"}…`)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Icon name="chat" size={14} /> Reply on WhatsApp
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
